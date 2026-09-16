const { successResponse, errorResponse } = require("../utils/response");
const {
  createPhonePePaymentRequest,
  verifyPhonePeCallback,
  checkPhonePePaymentStatus,
} = require("../services/payment.service");
const { createPaidOrder, validateAndCalculateOrderItems } = require("../services/order.service");
const { supabaseAdmin } = require("../config/supabase");

/**
 * Step 1: Initiate PhonePe Payment.
 * Creates a PhonePe payment request and returns the redirect URL to the frontend.
 * SECURITY: Server recalculates total price from DB to prevent client-side price tampering.
 */
const initiatePayment = async (req, res) => {
  try {
    const { vendorId, items } = req.body;

    if (!vendorId || !items || !items.length) {
      return errorResponse(res, "Invalid payment request parameters", 400);
    }

    // Server-side price recalculation from database
    const { verifiedItems, totalAmount } = await validateAndCalculateOrderItems(vendorId, items);

    if (totalAmount <= 0) {
      return errorResponse(res, "Total amount must be greater than zero", 400);
    }

    // Generate unique merchant transaction ID
    const merchantTransactionId = `UEM${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const backendBase = process.env.BACKEND_URL || "https://uem-foodyy.vercel.app";
    const frontendBase = process.env.FRONTEND_URL || "https://uem-foodyy.vercel.app";

    const callbackUrl = `${backendBase}/api/payment/phonepe-callback`;
    const redirectUrl = `${frontendBase}/student/payment-success.html?txnId=${merchantTransactionId}`;

    const { redirectUrl: phonePeRedirectUrl } = await createPhonePePaymentRequest(
      totalAmount,
      merchantTransactionId,
      req.user.id,
      callbackUrl,
      redirectUrl
    );

    // Temporarily store pending transaction metadata in DB for callback verification
    await supabaseAdmin.from("payments").insert([
      {
        order_id: null,
        merchant_transaction_id: merchantTransactionId,
        transaction_id: "PENDING",
        amount: totalAmount,
        status: "PENDING",
      },
    ]).select();

    return successResponse(
      res,
      {
        redirectUrl: phonePeRedirectUrl,
        merchantTransactionId,
        verifiedTotal: totalAmount,
        verifiedItems,
      },
      "PhonePe payment initiated successfully"
    );
  } catch (err) {
    console.error("PhonePe payment initiation error:", err);
    return errorResponse(res, `Failed to initiate payment: ${err.message}`, 400);
  }
};

/**
 * Step 2: PhonePe Server-to-Server Callback (PUBLIC route — no auth).
 * PhonePe POSTs this after payment is completed.
 * Verifies signature, creates the order, and redirects user to success page.
 */
const phonePeCallback = async (req, res) => {
  try {
    const { response } = req.body;
    const receivedChecksum = req.headers["x-verify"];

    if (!response || !receivedChecksum) {
      return res.status(400).json({ success: false, message: "Invalid callback payload" });
    }

    // Verify PhonePe signature
    const isValid = verifyPhonePeCallback(response, receivedChecksum);
    if (!isValid) {
      console.error("PhonePe callback signature verification failed");
      return res.status(400).json({ success: false, message: "Signature verification failed" });
    }

    // Decode response
    const decoded = JSON.parse(Buffer.from(response, "base64").toString("utf-8"));
    const { merchantTransactionId, transactionId, code } = decoded.data || decoded;

    if (code !== "PAYMENT_SUCCESS") {
      console.warn(`PhonePe payment not successful: ${code} — txn: ${merchantTransactionId}`);
      return res.status(200).json({ success: false, message: `Payment status: ${code}` });
    }

    // Double-verify with PhonePe status API
    const statusResponse = await checkPhonePePaymentStatus(merchantTransactionId);
    if (!statusResponse.success || statusResponse.code !== "PAYMENT_SUCCESS") {
      return res.status(400).json({ success: false, message: "Payment status verification failed" });
    }

    // Acknowledge callback to PhonePe
    return res.status(200).json({ success: true, message: "Payment acknowledged" });
  } catch (err) {
    console.error("PhonePe callback error:", err);
    return res.status(500).json({ success: false, message: "Callback processing error" });
  }
};

/**
 * Step 3: Frontend polls this after redirect to confirm payment and create the DB order.
 * Called by the payment-success page with the merchantTransactionId.
 */
const confirmAndCreateOrder = async (req, res) => {
  try {
    const { merchantTransactionId, vendorId, items } = req.body;

    if (!merchantTransactionId || !vendorId || !items) {
      return errorResponse(res, "Missing confirmation parameters", 400);
    }

    // Idempotency: Check if order already created for this transaction
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("order_id, status")
      .eq("merchant_transaction_id", merchantTransactionId)
      .maybeSingle();

    if (existingPayment && existingPayment.order_id) {
      const { data: existingOrder } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", existingPayment.order_id)
        .single();
      if (existingOrder) {
        return successResponse(res, { orderId: existingOrder.id, status: "PAID" }, "Order already confirmed");
      }
    }

    // Verify payment status with PhonePe
    const statusResponse = await checkPhonePePaymentStatus(merchantTransactionId);
    if (!statusResponse.success || statusResponse.code !== "PAYMENT_SUCCESS") {
      return errorResponse(res, "Payment not confirmed by PhonePe. Please wait or contact support.", 400);
    }

    const phonePePaymentId = statusResponse.data?.transactionId || merchantTransactionId;

    // Recalculate prices from DB
    const { verifiedItems, totalAmount } = await validateAndCalculateOrderItems(vendorId, items);

    // Create the order
    const order = await createPaidOrder({
      userId: req.user.id,
      vendorId,
      totalAmount,
      merchantTransactionId,
      transactionId: phonePePaymentId,
      items: verifiedItems,
    });

    return successResponse(
      res,
      { orderId: order.id, status: order.status, totalAmount: order.total_amount },
      "Payment verified and order placed successfully",
      201
    );
  } catch (err) {
    console.error("Order confirmation error:", err);
    return errorResponse(res, `Order confirmation error: ${err.message}`, 400);
  }
};

module.exports = {
  initiatePayment,
  phonePeCallback,
  confirmAndCreateOrder,
};
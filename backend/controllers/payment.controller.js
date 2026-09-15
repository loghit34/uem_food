const { successResponse, errorResponse } = require("../utils/response");
const { createRazorpayOrder, verifyPaymentSignature } = require("../services/payment.service");
const { createPaidOrder, validateAndCalculateOrderItems } = require("../services/order.service");
const { key_id } = require("../config/razorpay");

/**
 * Create a Razorpay Order.
 * SECURITY: Recalculates total price on server from database menu_items
 * to prevent client-side price tampering.
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

    const razorpayOrder = await createRazorpayOrder(totalAmount, `ord_${Date.now()}`);

    return successResponse(
      res,
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // in paise
        currency: razorpayOrder.currency,
        keyId: key_id,
        verifiedTotal: totalAmount,
        verifiedItems,
      },
      "Razorpay order created with verified prices"
    );
  } catch (err) {
    console.error("Payment initiation error:", err);
    const errorMsg = err?.error?.description || err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
    return errorResponse(res, `Failed to create payment order: ${errorMsg}`, 400);
  }
};

/**
 * Verify Razorpay payment signature & record confirmed PAID order using DB verified prices
 */
const verifyAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      vendor_id,
      items,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !vendor_id || !items) {
      return errorResponse(res, "Missing required Razorpay payment attributes", 400);
    }

    // Step 1: Validate HMAC SHA256 Signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return errorResponse(res, "Payment signature verification failed. Security alert.", 400);
    }

    // Step 2: Recalculate true prices from Database to prevent post-payment tampering
    const { verifiedItems, totalAmount } = await validateAndCalculateOrderItems(vendor_id, items);

    // Step 3: Create verified order with status 'PAID'
    const order = await createPaidOrder({
      userId: req.user.id,
      vendorId: vendor_id,
      totalAmount: totalAmount,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      items: verifiedItems,
    });

    return successResponse(
      res,
      {
        orderId: order.id,
        status: order.status,
        totalAmount: order.total_amount,
      },
      "Payment verified and order placed successfully",
      201
    );
  } catch (err) {
    console.error("Order verification error:", err);
    const errorMsg = err?.error?.description || err?.message || (typeof err === "object" ? JSON.stringify(err) : String(err));
    return errorResponse(res, `Order verification error: ${errorMsg}`, 400);
  }
};

module.exports = {
  initiatePayment,
  verifyAndCreateOrder,
};
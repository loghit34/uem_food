const { successResponse, errorResponse } = require("../utils/response");
const { createRazorpayOrder, verifyPaymentSignature } = require("../services/payment.service");
const { createPaidOrder } = require("../services/order.service");
const { key_id } = require("../config/razorpay");

/**
 * Create a Razorpay Order
 */
const initiatePayment = async (req, res) => {
  try {
    const { amount, vendorId, items } = req.body;

    if (!amount || amount <= 0 || !vendorId || !items || !items.length) {
      return errorResponse(res, "Invalid payment request parameters", 400);
    }

    const razorpayOrder = await createRazorpayOrder(amount, `ord_${Date.now()}`);

    return successResponse(
      res,
      {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: key_id,
      },
      "Razorpay order created"
    );
  } catch (err) {
    return errorResponse(res, `Failed to create payment order: ${err.message}`, 500);
  }
};

/**
 * Verify Razorpay payment and write confirmed PAID order to DB
 */
const verifyAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      vendor_id,
      total_amount,
      items,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, "Missing required Razorpay payment attributes", 400);
    }

    // Step 1: Validate HMAC SHA256 Signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return errorResponse(res, "Payment signature verification failed. Fraud alert.", 400);
    }

    // Step 2: Create verified order with status 'PAID'
    const order = await createPaidOrder({
      userId: req.user.id,
      vendorId: vendor_id,
      totalAmount: total_amount,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      items,
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
    return errorResponse(res, `Order creation error: ${err.message}`, 500);
  }
};

module.exports = {
  initiatePayment,
  verifyAndCreateOrder,
};

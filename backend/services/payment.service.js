const crypto = require("crypto");
const { razorpay, key_secret } = require("../config/razorpay");

/**
 * Creates an order in Razorpay
 */
const createRazorpayOrder = async (amountInRupees, receiptId) => {
  const options = {
    amount: Math.round(amountInRupees * 100), // amount in paise
    currency: "INR",
    receipt: receiptId || `rcpt_${Date.now()}`,
    payment_capture: 1,
  };

  return await razorpay.orders.create(options);
};

/**
 * Validates Razorpay HMAC SHA256 Signature
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(body.toString())
    .digest("hex");

  return expectedSignature === razorpaySignature;
};

module.exports = {
  createRazorpayOrder,
  verifyPaymentSignature,
};

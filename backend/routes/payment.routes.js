const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Step 1: Initiate PhonePe payment — returns redirectUrl (authenticated)
router.post(
  "/create-order",
  authenticate,
  authorizeRoles("STUDENT", "FACULTY"),
  paymentController.initiatePayment
);

// Step 2: PhonePe server-to-server callback (PUBLIC — no auth, PhonePe posts here)
router.post("/phonepe-callback", paymentController.phonePeCallback);

// Step 3: Frontend confirms payment & creates DB order after redirect (authenticated)
router.post(
  "/confirm",
  authenticate,
  authorizeRoles("STUDENT", "FACULTY"),
  paymentController.confirmAndCreateOrder
);

module.exports = router;

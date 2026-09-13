const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.post(
  "/create-order",
  authenticate,
  authorizeRoles("STUDENT", "FACULTY"),
  paymentController.initiatePayment
);

router.post(
  "/verify",
  authenticate,
  authorizeRoles("STUDENT", "FACULTY"),
  paymentController.verifyAndCreateOrder
);

module.exports = router;

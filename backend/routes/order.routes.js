const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Student & Faculty view their order history
router.get("/my-orders", authenticate, authorizeRoles("STUDENT", "FACULTY"), orderController.getMyOrders);

// Vendor view incoming confirmed paid orders
router.get("/vendor-orders", authenticate, authorizeRoles("VENDOR"), orderController.getVendorIncomingOrders);

// Admin view all campus orders
router.get("/all", authenticate, authorizeRoles("ADMIN"), orderController.getAllAdminOrders);

module.exports = router;

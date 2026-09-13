const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public: active vendors list for customers
router.get("/", vendorController.listActiveVendors);

// Vendor: own shop and analytics
router.get("/shop/me", authenticate, authorizeRoles("VENDOR"), vendorController.getMyVendorShop);
router.get("/analytics/me", authenticate, authorizeRoles("VENDOR"), vendorController.getAnalytics);

// Admin: all vendors (active + inactive) and status toggle
router.get("/all", authenticate, authorizeRoles("ADMIN"), vendorController.listAllVendors);
router.patch("/:id/status", authenticate, authorizeRoles("ADMIN"), vendorController.toggleVendorStatus);

// Public: single vendor by ID
router.get("/:id", vendorController.getVendorById);

module.exports = router;
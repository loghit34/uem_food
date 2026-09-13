const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public listing of active vendors for customers
router.get("/", vendorController.listActiveVendors);
router.get("/shop/me", authenticate, authorizeRoles("VENDOR"), vendorController.getMyVendorShop);
router.get("/analytics/me", authenticate, authorizeRoles("VENDOR"), vendorController.getAnalytics);
router.get("/:id", vendorController.getVendorById);

module.exports = router;

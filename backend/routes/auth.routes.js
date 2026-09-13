const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public: sync profile on signup (STUDENT & FACULTY only - backend enforced)
router.post("/sync-profile", authController.syncProfile);

// Authenticated: get own profile
router.get("/me", authenticate, authController.getMe);

// Admin only: create a vendor account
router.post(
  "/create-vendor",
  authenticate,
  authorizeRoles("ADMIN"),
  authController.createVendorAccount
);

module.exports = router;
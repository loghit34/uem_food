const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { authLimiter } = require("../middleware/rateLimit.middleware");

// Public: sync profile on signup (STUDENT & FACULTY only - backend enforced & rate-limited)
router.post("/sync-profile", authLimiter, authController.syncProfile);

// Authenticated: get own profile
router.get("/me", authenticate, authController.getMe);

// Admin only: create a vendor account
router.post(
  "/create-vendor",
  authenticate,
  authorizeRoles("ADMIN"),
  authController.createVendorAccount
);

// Admin only: get all registered users
router.get(
  "/users",
  authenticate,
  authorizeRoles("ADMIN"),
  authController.getAllUsers
);

module.exports = router;
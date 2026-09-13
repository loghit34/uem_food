const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/sync-profile", authController.syncProfile);
router.get("/me", authenticate, authController.getMe);

module.exports = router;

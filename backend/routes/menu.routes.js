const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menu.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Customer view
router.get("/vendor/:vendorId", menuController.getMenuItemsByVendor);

// Vendor operations
router.post("/", authenticate, authorizeRoles("VENDOR"), menuController.createMenuItem);
router.put("/:id", authenticate, authorizeRoles("VENDOR"), menuController.updateMenuItem);
router.delete("/:id", authenticate, authorizeRoles("VENDOR"), menuController.deleteMenuItem);

module.exports = router;

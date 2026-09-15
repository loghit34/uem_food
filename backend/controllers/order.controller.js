const { successResponse, errorResponse } = require("../utils/response");
const { getUserOrders, getVendorOrders, getAllOrders } = require("../services/order.service");
const { supabaseAdmin } = require("../config/supabase");

/**
 * Get customer orders (for Student / Faculty)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await getUserOrders(req.user.id);
    return successResponse(res, orders, "Orders retrieved successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get vendor incoming paid orders
 */
const getVendorIncomingOrders = async (req, res) => {
  try {
    const { data: vendor, error } = await supabaseAdmin
      .from("vendors")
      .select("id")
      .eq("owner_id", req.user.id)
      .maybeSingle(); // returns null instead of error if not found

    if (error) return errorResponse(res, error.message, 400);

    // No vendor store yet - return empty array gracefully
    if (!vendor) {
      return successResponse(res, [], "No vendor store linked to this account yet");
    }

    const orders = await getVendorOrders(vendor.id);
    return successResponse(res, orders, "Vendor orders retrieved");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get all orders (Admin only)
 */
const getAllAdminOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    return successResponse(res, orders, "All campus orders retrieved");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getMyOrders,
  getVendorIncomingOrders,
  getAllAdminOrders,
};
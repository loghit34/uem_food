const { successResponse, errorResponse } = require("../utils/response");
const { getUserOrders, getVendorOrders } = require("../services/order.service");
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
      .single();

    if (error || !vendor) {
      return errorResponse(res, "Vendor profile not found", 404);
    }

    const orders = await getVendorOrders(vendor.id);
    return successResponse(res, orders, "Vendor orders retrieved");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getMyOrders,
  getVendorIncomingOrders,
};

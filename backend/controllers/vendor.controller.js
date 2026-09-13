const { supabaseAdmin } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/response");
const { getVendorAnalytics } = require("../services/vendor.service");

/**
 * List all active vendors for students/faculty
 */
const listActiveVendors = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("vendors")
      .select("id, vendor_name, description, location, image, is_active")
      .eq("is_active", true)
      .order("vendor_name", { ascending: true });

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, data, "Vendors retrieved successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get vendor details by ID
 */
const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from("vendors")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return errorResponse(res, "Vendor not found", 404);
    return successResponse(res, data, "Vendor details retrieved successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get the vendor shop for the logged-in vendor owner
 */
const getMyVendorShop = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("vendors")
      .select("*")
      .eq("owner_id", req.user.id)
      .maybeSingle();

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, data, "Vendor shop retrieved");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Vendor Analytics Endpoint
 */
const getAnalytics = async (req, res) => {
  try {
    const { data: vendor, error } = await supabaseAdmin
      .from("vendors")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (error || !vendor) {
      return errorResponse(res, "Vendor record not found for this account", 404);
    }

    const metrics = await getVendorAnalytics(vendor.id);
    return successResponse(res, metrics, "Vendor metrics calculated successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  listActiveVendors,
  getVendorById,
  getMyVendorShop,
  getAnalytics,
};

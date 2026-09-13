const { supabaseAdmin } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/response");
const { isValidEmail, isValidRole } = require("../utils/validation");

/**
 * Sync user profile upon signup
 */
const syncProfile = async (req, res) => {
  try {
    const { id, email, name, role } = req.body;

    if (!id || !email || !name || !role) {
      return errorResponse(res, "Missing required fields (id, email, name, role)", 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, "Invalid email address", 400);
    }

    if (!isValidRole(role)) {
      return errorResponse(res, "Invalid user role", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id, email, name, role })
      .select()
      .single();

    if (error) {
      return errorResponse(res, error.message, 400);
    }

    // If role is VENDOR, check/create default vendor record if vendor_name is provided
    if (role === "VENDOR" && req.body.vendor_name) {
      await supabaseAdmin.from("vendors").upsert({
        owner_id: id,
        vendor_name: req.body.vendor_name,
        location: req.body.location || "Campus Canteen",
        description: req.body.description || "Campus Food Outlet",
      });
    }

    return successResponse(res, data, "Profile synchronized successfully", 200);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Get currently authenticated user profile
 */
const getMe = async (req, res) => {
  return successResponse(res, req.user, "User details fetched successfully");
};

module.exports = {
  syncProfile,
  getMe,
};

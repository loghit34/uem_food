const { supabaseAdmin } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/response");
const { isValidEmail } = require("../utils/validation");

// Roles allowed via public self-registration
const SELF_REGISTER_ROLES = ["STUDENT", "FACULTY"];

/**
 * Sync user profile upon signup.
 * VENDOR and ADMIN roles are blocked here - they can only be created by Admin.
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

    // Block VENDOR and ADMIN from self-registering
    if (!SELF_REGISTER_ROLES.includes(role)) {
      return errorResponse(
        res,
        "Vendor and Admin accounts can only be created by the platform administrator.",
        403
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id, email, name, role })
      .select()
      .single();

    if (error) {
      return errorResponse(res, error.message, 400);
    }

    return successResponse(res, data, "Profile synchronized successfully", 200);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Admin-only: Create a vendor account
 */
const createVendorAccount = async (req, res) => {
  try {
    const { email, name, password, vendor_name, location, description } = req.body;

    if (!email || !name || !password || !vendor_name) {
      return errorResponse(res, "email, name, password, and vendor_name are required", 400);
    }

    // Create Supabase Auth user for the vendor
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "VENDOR" },
    });

    if (authError) return errorResponse(res, authError.message, 400);

    const userId = authData.user.id;

    // Create profile with VENDOR role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({ id: userId, email, name, role: "VENDOR" })
      .select()
      .single();

    if (profileError) return errorResponse(res, profileError.message, 400);

    // Create vendor store record
    const { data: vendor, error: vendorError } = await supabaseAdmin
      .from("vendors")
      .insert({
        owner_id: userId,
        vendor_name,
        location: location || "Campus",
        description: description || "Campus Food Outlet",
        is_active: true,
      })
      .select()
      .single();

    if (vendorError) return errorResponse(res, vendorError.message, 400);

    return successResponse(
      res,
      { profile, vendor },
      `Vendor account for "${vendor_name}" created successfully`,
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Admin only: Get all registered campus users
 */
const getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, role, created_at")
      .order("created_at", { ascending: false });

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, data, "All registered campus users retrieved");
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
  createVendorAccount,
  getMe,
  getAllUsers,
};
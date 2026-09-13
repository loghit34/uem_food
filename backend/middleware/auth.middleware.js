const { supabaseAdmin } = require("../config/supabase");
const { errorResponse } = require("../utils/response");

/**
 * Verifies Supabase Bearer token and attaches user profile to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Authorization token is missing", 401);
    }

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    // Fetch user profile to get their system role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse(res, "User profile not found", 404);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: profile.name,
      role: profile.role,
    };

    next();
  } catch (err) {
    return errorResponse(res, `Authentication error: ${err.message}`, 500);
  }
};

module.exports = {
  authenticate,
};

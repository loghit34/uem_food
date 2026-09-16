const { supabaseAdmin } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/response");

/**
 * Get all available menu items for a specific vendor (Public/Customer view)
 */
const getMenuItemsByVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("category", { ascending: true });

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, data, "Menu items retrieved");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const { isValidPrice, isValidString } = require("../utils/validation");

/**
 * Create a new menu item (Vendor only)
 */
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, is_available } = req.body;

    // Verify the vendor owns the store and is active
    const { data: vendor, error: vError } = await supabaseAdmin
      .from("vendors")
      .select("id, is_active")
      .eq("owner_id", req.user.id)
      .single();

    if (vError || !vendor) {
      return errorResponse(res, "Vendor record not found", 404);
    }

    if (!vendor.is_active) {
      return errorResponse(res, "Vendor store is currently inactive or deactivated by admin", 403);
    }

    if (!isValidString(name, 1, 200)) {
      return errorResponse(res, "Dish name must be between 1 and 200 characters", 400);
    }

    if (!isValidPrice(price)) {
      return errorResponse(res, "Price must be a valid positive number up to 50,000", 400);
    }

    if (description && typeof description === "string" && description.length > 2000) {
      return errorResponse(res, "Description cannot exceed 2000 characters", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .insert([
        {
          vendor_id: vendor.id, // Strictly server-assigned
          name: name.trim(),
          description: description ? String(description).slice(0, 2000) : "",
          price: parseFloat(price),
          image: image ? String(image).slice(0, 500) : "",
          category: category ? String(category).slice(0, 50) : "General",
          is_available: is_available !== undefined ? Boolean(is_available) : true,
        },
      ])
      .select()
      .single();

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, data, "Menu item added successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Update a menu item (e.g. toggle availability, price change)
 * Enforces that only the owning vendor can update their menu items.
 */
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, is_available } = req.body;

    // 1. Fetch vendor record for the authenticated user
    const { data: vendor, error: vError } = await supabaseAdmin
      .from("vendors")
      .select("id, is_active")
      .eq("owner_id", req.user.id)
      .single();

    if (vError || !vendor) {
      return errorResponse(res, "Vendor record not found", 404);
    }

    if (!vendor.is_active) {
      return errorResponse(res, "Vendor store is currently inactive or deactivated by admin", 403);
    }

    // 2. Fetch the target menu item to verify ownership
    const { data: existingItem, error: itemError } = await supabaseAdmin
      .from("menu_items")
      .select("id, vendor_id")
      .eq("id", id)
      .single();

    if (itemError || !existingItem) {
      return errorResponse(res, "Menu item not found", 404);
    }

    // 3. Prevent Vendor A from modifying Vendor B's menu item
    if (existingItem.vendor_id !== vendor.id) {
      return errorResponse(res, "Access denied: You cannot modify another vendor's menu item", 403);
    }

    const updates = {};
    if (name !== undefined) {
      if (!isValidString(name, 1, 200)) {
        return errorResponse(res, "Dish name must be between 1 and 200 characters", 400);
      }
      updates.name = name.trim();
    }
    if (description !== undefined) {
      updates.description = String(description).slice(0, 2000);
    }
    if (price !== undefined) {
      if (!isValidPrice(price)) {
        return errorResponse(res, "Price must be a valid positive number up to 50,000", 400);
      }
      updates.price = parseFloat(price);
    }
    if (image !== undefined) updates.image = String(image).slice(0, 500);
    if (category !== undefined) updates.category = String(category).slice(0, 50);
    if (is_available !== undefined) updates.is_available = Boolean(is_available);

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .eq("vendor_id", vendor.id)
      .select()
      .single();

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, data, "Menu item updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

/**
 * Delete a menu item
 * Enforces that only the owning vendor can delete their menu items.
 */
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch vendor record for the authenticated user
    const { data: vendor, error: vError } = await supabaseAdmin
      .from("vendors")
      .select("id, is_active")
      .eq("owner_id", req.user.id)
      .single();

    if (vError || !vendor) {
      return errorResponse(res, "Vendor record not found", 404);
    }

    if (!vendor.is_active) {
      return errorResponse(res, "Vendor store is currently inactive or deactivated by admin", 403);
    }

    // 2. Fetch the target menu item to verify ownership
    const { data: existingItem, error: itemError } = await supabaseAdmin
      .from("menu_items")
      .select("id, vendor_id")
      .eq("id", id)
      .single();

    if (itemError || !existingItem) {
      return errorResponse(res, "Menu item not found", 404);
    }

    // 3. Prevent Vendor A from deleting Vendor B's menu item
    if (existingItem.vendor_id !== vendor.id) {
      return errorResponse(res, "Access denied: You cannot delete another vendor's menu item", 403);
    }

    const { error } = await supabaseAdmin
      .from("menu_items")
      .delete()
      .eq("id", id)
      .eq("vendor_id", vendor.id);

    if (error) return errorResponse(res, error.message, 400);
    return successResponse(res, null, "Menu item deleted successfully");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  getMenuItemsByVendor,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};

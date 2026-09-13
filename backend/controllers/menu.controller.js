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

/**
 * Create a new menu item (Vendor only)
 */
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, image, category, is_available } = req.body;

    // Verify the vendor owns the store
    const { data: vendor, error: vError } = await supabaseAdmin
      .from("vendors")
      .select("id")
      .eq("owner_id", req.user.id)
      .single();

    if (vError || !vendor) {
      return errorResponse(res, "Vendor record not found", 404);
    }

    if (!name || price === undefined) {
      return errorResponse(res, "Name and price are required", 400);
    }

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .insert([
        {
          vendor_id: vendor.id,
          name,
          description: description || "",
          price: parseFloat(price),
          image: image || "",
          category: category || "General",
          is_available: is_available !== undefined ? is_available : true,
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
 */
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category, is_available } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = parseFloat(price);
    if (image !== undefined) updates.image = image;
    if (category !== undefined) updates.category = category;
    if (is_available !== undefined) updates.is_available = is_available;

    const { data, error } = await supabaseAdmin
      .from("menu_items")
      .update(updates)
      .eq("id", id)
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
 */
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from("menu_items")
      .delete()
      .eq("id", id);

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

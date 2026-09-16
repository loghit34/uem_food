const { supabaseAdmin } = require("../config/supabase");

/**
 * Server-Side Price Verification:
 * Fetches actual menu item prices from Database to prevent client price manipulation.
 */
const validateAndCalculateOrderItems = async (vendorId, clientItems) => {
  if (!vendorId) {
    throw new Error("Vendor ID is required");
  }

  // 1. Verify vendor exists and is active
  const { data: vendor, error: vError } = await supabaseAdmin
    .from("vendors")
    .select("id, is_active")
    .eq("id", vendorId)
    .single();

  if (vError || !vendor || !vendor.is_active) {
    throw new Error("This canteen is currently inactive or closed");
  }

  if (!clientItems || !clientItems.length) {
    throw new Error("Order items list cannot be empty");
  }

  const itemIds = clientItems.map((item) => item.id).filter(Boolean);
  if (itemIds.length !== clientItems.length) {
    throw new Error("Invalid items in cart");
  }

  // Fetch true items directly from Database
  const { data: dbItems, error } = await supabaseAdmin
    .from("menu_items")
    .select("id, vendor_id, name, price, is_available")
    .in("id", itemIds);

  if (error) {
    throw new Error(`Database price fetch failed: ${error.message}`);
  }

  const dbItemsMap = new Map();
  dbItems.forEach((item) => dbItemsMap.set(item.id, item));

  let verifiedTotal = 0;
  const verifiedItems = [];

  for (const clientItem of clientItems) {
    const dbItem = dbItemsMap.get(clientItem.id);

    if (!dbItem) {
      throw new Error(`Item "${clientItem.name || 'Unknown'}" not found in canteen menu`);
    }

    if (dbItem.vendor_id !== vendorId) {
      throw new Error(`Item "${dbItem.name}" does not belong to this canteen`);
    }

    if (!dbItem.is_available) {
      throw new Error(`Item "${dbItem.name}" is currently sold out`);
    }

    const quantity = parseInt(clientItem.quantity, 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > 50) {
      throw new Error(`Quantity for "${dbItem.name}" must be between 1 and 50`);
    }

    const itemPrice = parseFloat(dbItem.price);
    verifiedTotal += itemPrice * quantity;

    verifiedItems.push({
      id: dbItem.id,
      name: dbItem.name,
      price: itemPrice, // Official DB price
      quantity: quantity,
    });
  }

  return {
    verifiedItems,
    totalAmount: Math.round(verifiedTotal * 100) / 100,
  };
};

/**
 * Creates a verified PAID order and its associated order items & payment record
 * Includes idempotency check to prevent duplicate orders on double submissions.
 */
const createPaidOrder = async ({ userId, vendorId, totalAmount, paymentId, razorpayOrderId, razorpayPaymentId, items }) => {
  // Idempotency: Check if an order was already created for this payment ID
  if (razorpayPaymentId) {
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("order_id")
      .eq("razorpay_payment_id", razorpayPaymentId)
      .maybeSingle();

    if (existingPayment && existingPayment.order_id) {
      const { data: existingOrder } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", existingPayment.order_id)
        .single();
      if (existingOrder) return existingOrder;
    }
  }

  // 1. Insert Order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert([
      {
        user_id: userId,
        vendor_id: vendorId,
        total_amount: totalAmount,
        payment_id: paymentId,
        status: "PAID",
      },
    ])
    .select()
    .single();

  if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

  // 2. Insert Order Items using verified prices
  const orderItemsData = items.map((item) => ({
    order_id: order.id,
    menu_item_id: item.id || null,
    item_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabaseAdmin
    .from("order_items")
    .insert(orderItemsData);

  if (itemsError) throw new Error(`Failed to insert order items: ${itemsError.message}`);

  // 3. Insert Payment Log
  const { error: paymentError } = await supabaseAdmin
    .from("payments")
    .insert([
      {
        order_id: order.id,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        amount: totalAmount,
        status: "SUCCESS",
      },
    ]);

  if (paymentError) throw new Error(`Failed to record payment: ${paymentError.message}`);

  return order;
};

/**
 * Fetch orders for student/faculty user
 */
const getUserOrders = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      vendors (
        vendor_name,
        location
      ),
      order_items (
        id,
        item_name,
        price,
        quantity
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch confirmed paid orders for a vendor
 */
const getVendorOrders = async (vendorId) => {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      profiles (
        name,
        email,
        role
      ),
      order_items (
        id,
        item_name,
        price,
        quantity
      )
    `)
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * Fetch all campus orders for Admin
 */
const getAllOrders = async () => {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      payment_id,
      created_at,
      profiles (
        name,
        email,
        role
      ),
      vendors (
        vendor_name,
        location
      ),
      order_items (
        id,
        item_name,
        price,
        quantity
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

module.exports = {
  validateAndCalculateOrderItems,
  createPaidOrder,
  getUserOrders,
  getVendorOrders,
  getAllOrders,
};
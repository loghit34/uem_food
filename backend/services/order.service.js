const { supabaseAdmin } = require("../config/supabase");

/**
 * Creates a verified PAID order and its associated order items & payment record
 */
const createPaidOrder = async ({ userId, vendorId, totalAmount, paymentId, razorpayOrderId, razorpayPaymentId, items }) => {
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

  // 2. Insert Order Items
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

module.exports = {
  createPaidOrder,
  getUserOrders,
  getVendorOrders,
};

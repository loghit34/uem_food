const { supabaseAdmin } = require("../config/supabase");

/**
 * Calculate vendor dashboard metrics (Today's sales, Total sales, Total orders)
 */
const getVendorAnalytics = async (vendorId) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // All paid orders for vendor
  const { data: allOrders, error: allOrdersError } = await supabaseAdmin
    .from("orders")
    .select("id, total_amount, item_total, convenience_fee, created_at")
    .eq("vendor_id", vendorId);

  if (allOrdersError) throw new Error(allOrdersError.message);

  let totalSales = 0;
  let todaySales = 0;
  let todayOrdersCount = 0;

  allOrders.forEach((order) => {
    // Vendor earnings are based on item_total (food amount), excluding the platform convenience fee
    let amount = 0;
    if (order.item_total !== undefined && order.item_total !== null && parseFloat(order.item_total) > 0) {
      amount = parseFloat(order.item_total);
    } else {
      const fee = parseFloat(order.convenience_fee) || 0;
      amount = Math.max(0, (parseFloat(order.total_amount) || 0) - fee);
    }
    totalSales += amount;

    const orderDate = new Date(order.created_at);
    if (orderDate >= todayStart) {
      todaySales += amount;
      todayOrdersCount += 1;
    }
  });

  return {
    todayOrders: todayOrdersCount,
    todaySales: Math.round(todaySales * 100) / 100,
    totalOrders: allOrders.length,
    totalSales: Math.round(totalSales * 100) / 100,
  };
};

module.exports = {
  getVendorAnalytics,
};

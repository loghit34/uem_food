/**
 * Vendor Analytics Screen
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["VENDOR"])) return;
  
  try {
    const res = await UEM.apiFetch("/vendors/analytics/me");
    const m = res.data;
    document.getElementById("ana-today-sales").textContent = UEM.formatCurrency(m.todaySales);
    document.getElementById("ana-today-orders").textContent = m.todayOrders;
    document.getElementById("ana-total-sales").textContent = UEM.formatCurrency(m.totalSales);
    document.getElementById("ana-total-orders").textContent = m.totalOrders;
  } catch (err) {
    console.error("Analytics fetch error:", err);
  }
});

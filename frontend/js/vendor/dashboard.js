/**
 * Vendor Dashboard Logic
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["VENDOR"])) return;
  loadMetrics();
  loadRecentOrders();
});

async function loadMetrics() {
  try {
    const res = await UEM.apiFetch("/vendors/analytics/me");
    const m = res.data;
    document.getElementById("stat-today-orders").textContent = m.todayOrders;
    document.getElementById("stat-today-sales").textContent = UEM.formatCurrency(m.todaySales);
    document.getElementById("stat-total-orders").textContent = m.totalOrders;
    document.getElementById("stat-total-sales").textContent = UEM.formatCurrency(m.totalSales);
  } catch (err) {
    console.error("Metrics load failed:", err);
  }
}

async function loadRecentOrders() {
  const container = document.getElementById("recent-orders-list");
  if (!container) return;

  try {
    const res = await UEM.apiFetch("/orders/vendor-orders");
    const orders = (res.data || []).slice(0, 5);

    if (orders.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No orders received yet.</p>`;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-ticket">
        <div class="order-ticket-header">
          <div>
            <strong>Order #${order.id.slice(0, 8).toUpperCase()}</strong>
            <span style="color:var(--text-muted); font-size: 0.85rem; margin-left: 0.5rem;">${UEM.formatDate(order.created_at)}</span>
          </div>
          <div>
            <span class="badge badge-success">${order.status}</span>
            <strong style="margin-left: 0.5rem; color: var(--secondary);">${UEM.formatCurrency(order.total_amount)}</strong>
          </div>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Customer: ${order.profiles ? order.profiles.name : 'Student'} (${order.profiles ? order.profiles.role : ''})</p>
        <ul class="order-ticket-items">
          ${(order.order_items || []).map(i => `
            <li>${i.item_name} &times; ${i.quantity}</li>
          `).join("")}
        </ul>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading recent orders: ${err.message}</p>`;
  }
}

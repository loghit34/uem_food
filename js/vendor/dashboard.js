/**
 * Vendor Dashboard Logic
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["VENDOR"])) return;
  await checkVendorStore();
});

async function checkVendorStore() {
  try {
    const res = await UEM.apiFetch("/vendors/shop/me");
    const shop = res.data;

    if (!shop) {
      // Vendor is logged in but has no store yet — show setup notice
      showNoStoreWarning();
      return;
    }

    // Store exists — load everything
    loadMetrics();
    loadRecentOrders();
  } catch (err) {
    showNoStoreWarning();
  }
}

function showNoStoreWarning() {
  const main = document.querySelector(".vendor-main");
  if (!main) return;
  main.innerHTML = `
    <div class="card" style="max-width: 600px; margin: 3rem auto; padding: 2.5rem; text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🏪</div>
      <h2 style="color: var(--secondary); margin-bottom: 0.5rem;">Vendor Store Not Set Up</h2>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
        Your vendor account exists but no canteen store has been linked to it yet.
        Please ask the <strong>Admin</strong> to create your store from the Admin Panel.
      </p>
      <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.9rem;">
        <strong>Your Login Email:</strong> ${Auth.getUser()?.email || ""}
        <br>
        <strong>What to do:</strong> Share this email with the Admin so they can link your store.
      </div>
      <button onclick="Auth.logout()" class="btn btn-outline">Logout</button>
    </div>
  `;
}

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
      container.innerHTML = `<p style="color:var(--text-muted);">No orders received yet. Orders appear here immediately after a student pays.</p>`;
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
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          Customer: ${order.profiles ? order.profiles.name : "Student"}
          (${order.profiles ? order.profiles.role : ""})
        </p>
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
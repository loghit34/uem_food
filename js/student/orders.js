/**
 * Customer Order History
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;
  loadMyOrders();
});

async function loadMyOrders() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  try {
    container.innerHTML = `<p style="color:var(--text-muted);">Fetching your orders...</p>`;
    const response = await UEM.apiFetch("/orders/my-orders");
    const orders = response.data || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="card" style="padding: 2.5rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🍽️</div>
          <h3>No Orders Yet</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.25rem;">You haven't placed any food orders yet.</p>
          <a href="vendors.html" class="btn btn-primary">Order Now</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-history-card">
        <div class="order-history-header">
          <div>
            <div class="order-id">Order #${UEM.escapeHTML(order.id.slice(0, 8).toUpperCase())}</div>
            <div class="order-date">${UEM.formatDate(order.created_at)}</div>
            <div style="font-size: 0.9rem; font-weight: 600; color: var(--primary); margin-top: 0.25rem;">
              🏪 ${UEM.escapeHTML(order.vendors ? order.vendors.vendor_name : 'Canteen')} (${UEM.escapeHTML(order.vendors ? order.vendors.location : '')})
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge badge-success">${UEM.escapeHTML(order.status)}</span>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--secondary); margin-top: 0.25rem;">
              ${UEM.formatCurrency(order.total_amount)}
            </div>
          </div>
        </div>

        <div style="margin-top: 0.75rem;">
          <strong style="font-size: 0.9rem; color: var(--text-muted);">Items:</strong>
          <ul style="margin-top: 0.25rem; padding-left: 1.25rem; font-size: 0.95rem;">
            ${(order.order_items || []).map(i => `
              <li>${UEM.escapeHTML(i.item_name)} &times; ${parseInt(i.quantity, 10)} (${UEM.formatCurrency(i.price)})</li>
            `).join("")}
          </ul>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error fetching orders: ${err.message}</p>`;
  }
}

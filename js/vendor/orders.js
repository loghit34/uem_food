/**
 * Vendor Orders Queue
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["VENDOR"])) return;
  loadOrders();
});

async function loadOrders() {
  const container = document.getElementById("vendor-orders-queue");
  if (!container) return;

  try {
    container.innerHTML = `<p style="color:var(--text-muted);">Loading live orders...</p>`;
    const res = await UEM.apiFetch("/orders/vendor-orders");
    const orders = res.data || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="card" style="padding: 3rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
          <h3>No Live Orders</h3>
          <p style="color: var(--text-muted);">New confirmed paid orders will appear here in real time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="order-ticket">
        <div class="order-ticket-header">
          <div>
            <strong style="font-size: 1.15rem; color: var(--secondary);">Order #${UEM.escapeHTML(order.id.slice(0, 8).toUpperCase())}</strong>
            <span style="color:var(--text-muted); font-size: 0.9rem; margin-left: 0.75rem;">${UEM.formatDate(order.created_at)}</span>
          </div>
          <div>
            <span class="badge badge-success">${UEM.escapeHTML(order.status)}</span>
            <strong style="margin-left: 0.75rem; font-size: 1.2rem; color: var(--secondary);">${UEM.formatCurrency(order.total_amount)}</strong>
          </div>
        </div>

        <div style="font-size: 0.95rem; margin-bottom: 0.5rem;">
          <strong>Student/Faculty:</strong> ${UEM.escapeHTML(order.profiles ? order.profiles.name : 'Customer')} 
          <span style="color:var(--text-muted);">(${UEM.escapeHTML(order.profiles ? order.profiles.email : '')})</span>
        </div>

        <div style="background: #f8fafc; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <strong style="font-size: 0.85rem; color: var(--text-muted);">ITEMS TO PREPARE:</strong>
          <ul class="order-ticket-items" style="margin-top: 0.25rem;">
            ${(order.order_items || []).map(i => `
              <li style="font-size: 1rem; font-weight: 600;">${UEM.escapeHTML(i.item_name)} &times; ${parseInt(i.quantity, 10)}</li>
            `).join("")}
          </ul>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error loading orders: ${err.message}</p>`;
  }
}

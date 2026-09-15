/**
 * Admin - Global Orders Management
 */
let allOrders = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["ADMIN"])) return;

  const searchInput = document.getElementById("order-search");
  if (searchInput) {
    searchInput.addEventListener("input", renderOrdersTable);
  }

  loadAdminOrders();
});

async function loadAdminOrders() {
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;

  try {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">Fetching campus orders...</td></tr>`;
    const res = await UEM.apiFetch("/orders/all");
    allOrders = res.data || [];
    renderOrdersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger); padding:2rem;">Failed to load orders: ${err.message}</td></tr>`;
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById("orders-tbody");
  if (!tbody) return;

  const query = (document.getElementById("order-search")?.value || "").toLowerCase().trim();

  const filtered = allOrders.filter(o => {
    if (!query) return true;
    const vendorName = o.vendors?.vendor_name?.toLowerCase() || "";
    const customerName = o.profiles?.name?.toLowerCase() || "";
    const orderId = o.id?.toLowerCase() || "";
    const paymentId = o.payment_id?.toLowerCase() || "";
    return vendorName.includes(query) || customerName.includes(query) || orderId.includes(query) || paymentId.includes(query);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td>
        <strong style="color:var(--secondary);">#${o.id.slice(0, 8).toUpperCase()}</strong>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
          ${o.profiles?.name || 'Student'} (${o.profiles?.role || 'STUDENT'})
        </div>
      </td>
      <td>
        <strong style="color:var(--primary);">${o.vendors?.vendor_name || 'Campus Outlet'}</strong>
        <div style="font-size:0.8rem; color:var(--text-muted);">${o.vendors?.location || ''}</div>
      </td>
      <td>
        <strong style="color:var(--secondary); font-size:1rem;">${UEM.formatCurrency(o.total_amount)}</strong>
        <div style="font-size:0.8rem; color:var(--accent); font-weight:600;">${o.status || 'PAID'}</div>
      </td>
      <td>
        <code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:0.85rem; color:#475569;">
          ${o.payment_id || 'N/A'}
        </code>
      </td>
      <td style="color:var(--text-muted); font-size:0.88rem;">
        ${UEM.formatDate(o.created_at)}
      </td>
    </tr>
  `).join("");
}

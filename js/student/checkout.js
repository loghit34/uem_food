/**
 * Checkout Logic
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;
  renderCheckout();
});

function renderCheckout() {
  const container = document.getElementById("checkout-container");
  if (!container) return;

  const cart = UEM.getCart();
  const user = Auth.getUser();

  if (!cart.items || cart.items.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  const subtotal = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const CONVENIENCE_FEE = 4.00;
  const grandTotal = subtotal + CONVENIENCE_FEE;

  container.innerHTML = `
    <div class="card" style="padding: 2rem;">
      <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
        <h3 style="color: var(--secondary); margin-bottom: 0.25rem;">Customer Details</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">${user.name} (${user.email})</p>
        <p style="color: var(--text-muted); font-size: 0.95rem;"><strong>Role:</strong> ${user.role}</p>
      </div>

      <div style="margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
        <h3 style="color: var(--secondary); margin-bottom: 0.5rem;">Canteen Outlet</h3>
        <p style="font-weight: 600; color: var(--primary);">${cart.vendorName}</p>
      </div>

      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: var(--secondary); margin-bottom: 0.75rem;">Items in Order</h3>
        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
          ${cart.items.map(i => `
            <li style="display: flex; justify-content: space-between; font-size: 0.95rem;">
              <span>${i.name} &times; ${i.quantity}</span>
              <strong>${UEM.formatCurrency(i.price * i.quantity)}</strong>
            </li>
          `).join("")}
        </ul>
      </div>

      <div class="summary-row" style="margin-bottom: 0.5rem; font-size: 0.95rem; color: var(--text-muted);">
        <span>Item Total</span>
        <span>${UEM.formatCurrency(subtotal)}</span>
      </div>

      <div class="summary-row" style="margin-bottom: 0.75rem; font-size: 0.95rem; color: var(--text-muted);">
        <span>Platform Convenience Fee</span>
        <span style="font-weight: 600; color: var(--text-dark);">${UEM.formatCurrency(CONVENIENCE_FEE)}</span>
      </div>

      <div class="summary-row summary-total" style="margin-bottom: 1.5rem;">
        <span>Grand Total (Payable Online)</span>
        <span style="color: var(--primary);">${UEM.formatCurrency(grandTotal)}</span>
      </div>

      <button id="pay-btn" onclick="startPhonePePayment()" class="btn btn-primary btn-block" style="padding: 1rem; font-size: 1.1rem; background: #5f259f; border-color: #5f259f;">
        💜 Pay ${UEM.formatCurrency(grandTotal)} via PhonePe
      </button>
    </div>
  `;
}

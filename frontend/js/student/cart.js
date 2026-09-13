/**
 * Cart View & Operations
 */
document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;
  renderCart();
});

function renderCart() {
  const container = document.getElementById("cart-container");
  if (!container) return;

  const cart = UEM.getCart();

  if (!cart.items || cart.items.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding: 3rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🛒</div>
        <h3>Your Cart is Empty</h3>
        <p style="color: var(--text-muted); margin: 0.5rem 0 1.5rem 0;">Explore our canteens to add mouthwatering dishes!</p>
        <a href="vendors.html" class="btn btn-primary">Browse Canteens</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <strong>Ordering from:</strong> <span style="color: var(--primary); font-weight: 700;">${cart.vendorName}</span>
    </div>

    <div class="cart-layout">
      <div class="card" style="padding: 1.5rem;">
        <table class="cart-items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${cart.items.map(item => `
              <tr>
                <td><strong>${item.name}</strong></td>
                <td>${UEM.formatCurrency(item.price)}</td>
                <td>
                  <div class="qty-control">
                    <button class="qty-btn" onclick="updateItemQty('${item.id}', -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateItemQty('${item.id}', 1)">+</button>
                  </div>
                </td>
                <td><strong>${UEM.formatCurrency(item.price * item.quantity)}</strong></td>
                <td>
                  <button onclick="removeItem('${item.id}')" style="color: var(--danger); font-size: 1.1rem;">&times;</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div class="summary-card">
        <h3 style="margin-bottom: 1rem; color: var(--secondary);">Order Summary</h3>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${UEM.formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Convenience Fee</span>
          <span>₹0.00</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total Amount</span>
          <span>${UEM.formatCurrency(subtotal)}</span>
        </div>
        <button onclick="window.location.href='checkout.html'" class="btn btn-primary btn-block" style="margin-top: 1.5rem;">Proceed to Checkout</button>
      </div>
    </div>
  `;
}

function updateItemQty(itemId, change) {
  let cart = UEM.getCart();
  const index = cart.items.findIndex(i => i.id === itemId);
  if (index > -1) {
    cart.items[index].quantity += change;
    if (cart.items[index].quantity <= 0) {
      cart.items.splice(index, 1);
    }
    if (cart.items.length === 0) {
      cart.vendorId = null;
      cart.vendorName = "";
    }
    UEM.saveCart(cart);
    renderCart();
  }
}

function removeItem(itemId) {
  let cart = UEM.getCart();
  cart.items = cart.items.filter(i => i.id !== itemId);
  if (cart.items.length === 0) {
    cart.vendorId = null;
    cart.vendorName = "";
  }
  UEM.saveCart(cart);
  renderCart();
}

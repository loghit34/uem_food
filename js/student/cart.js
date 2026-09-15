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
    <div style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: #ffffff; padding: 0.85rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border);">
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Ordering from</span>
        <strong style="color: var(--primary); font-size: 1.05rem;">🍱 ${cart.vendorName}</strong>
      </div>
      <a href="menu.html?vendorId=${cart.vendorId}" class="btn btn-outline btn-sm">+ Add More</a>
    </div>

    <div class="cart-layout">
      <div>
        ${cart.items.map(item => `
          <div class="cart-item-card">
            <div class="cart-item-details">
              <h4 class="cart-item-name">${item.name}</h4>
              <div class="cart-item-price">
                ${UEM.formatCurrency(item.price)} &times; ${item.quantity} = <strong>${UEM.formatCurrency(item.price * item.quantity)}</strong>
              </div>
            </div>
            <div class="cart-item-actions">
              <div class="food-stepper">
                <button class="stepper-btn" onclick="updateItemQty('${item.id}', -1)">-</button>
                <span class="stepper-val">${item.quantity}</span>
                <button class="stepper-btn" onclick="updateItemQty('${item.id}', 1)">+</button>
              </div>
              <button class="delete-item-btn" onclick="removeItem('${item.id}')" title="Remove Item">&times;</button>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="summary-card">
        <h3 style="margin-bottom: 1rem; color: var(--secondary);">Order Summary</h3>
        <div class="summary-row">
          <span>Item Total</span>
          <span>${UEM.formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Convenience Fee</span>
          <span style="color: var(--accent); font-weight: 600;">FREE</span>
        </div>
        <div class="summary-row summary-total">
          <span>To Pay</span>
          <span style="color: var(--primary);">${UEM.formatCurrency(subtotal)}</span>
        </div>
        <button onclick="window.location.href='checkout.html'" class="btn btn-primary btn-block" style="margin-top: 1.5rem; padding: 0.9rem; font-size: 1.05rem;">
          Proceed to Checkout &rarr;
        </button>
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

/**
 * Canteen Menu Logic with In-Menu Stepper & Floating Cart Bar
 */
let currentVendor = null;
let allMenuItems = [];
let activeMenuCategory = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;

  const params = new URLSearchParams(window.location.search);
  const vendorId = params.get("vendorId");

  if (!vendorId) {
    window.location.href = "vendors.html";
    return;
  }

  await loadVendorHeader(vendorId);
  await loadMenuItems(vendorId);
  updateFloatingCartBar();
});

async function loadVendorHeader(vendorId) {
  try {
    const res = await UEM.apiFetch(`/vendors/${vendorId}`);
    currentVendor = res.data;
    document.getElementById("vendor-name-title").textContent = currentVendor.vendor_name;
    document.getElementById("vendor-location-title").textContent = `📍 ${currentVendor.location || 'Campus'}`;
  } catch (err) {
    document.getElementById("vendor-name-title").textContent = "Canteen Menu";
  }
}

async function loadMenuItems(vendorId) {
  const container = document.getElementById("menu-items-grid");
  if (!container) return;

  try {
    container.innerHTML = `<p style="color:var(--text-muted);">Loading delicious items...</p>`;
    const res = await UEM.apiFetch(`/menu/vendor/${vendorId}`);
    allMenuItems = res.data || [];
    renderMenuItems();
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load menu: ${err.message}</p>`;
  }
}

function filterMenuCategory(cat) {
  activeMenuCategory = cat;
  const chips = document.querySelectorAll("#menu-category-chips .category-chip");
  chips.forEach((c) => {
    c.classList.toggle("active", c.textContent.toUpperCase().includes(cat));
  });
  renderMenuItems();
}

function renderMenuItems() {
  const container = document.getElementById("menu-items-grid");
  if (!container) return;

  const cart = UEM.getCart();
  const isCurrentVendorCart = cart.vendorId === currentVendor?.id;

  const filtered = allMenuItems.filter(item => {
    if (activeMenuCategory === "ALL") return true;
    return (item.category && item.category.toUpperCase().includes(activeMenuCategory)) ||
           (item.name && item.name.toUpperCase().includes(activeMenuCategory));
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🍽️</p>
        <p>No items in this category.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const cartItem = isCurrentVendorCart ? cart.items.find(i => i.id === item.id) : null;
    const qty = cartItem ? cartItem.quantity : 0;

    let actionButton = "";
    if (!item.is_available) {
      actionButton = `<span class="badge badge-warning">Sold Out</span>`;
    } else if (qty > 0) {
      actionButton = `
        <div class="food-stepper">
          <button class="stepper-btn" onclick="stepItemQty('${item.id}', -1)">-</button>
          <span class="stepper-val">${qty}</span>
          <button class="stepper-btn" onclick="stepItemQty('${item.id}', 1)">+</button>
        </div>
      `;
    } else {
      actionButton = `
        <button onclick="addItem('${item.id}', '${escapeHtml(item.name)}', ${item.price}, '${item.image || ''}')" class="btn btn-primary btn-sm">
          + Add
        </button>
      `;
    }

    return `
      <div class="card food-card">
        <img src="${UEM.escapeHTML(item.image) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${UEM.escapeHTML(item.name)}" class="food-img">
        <div class="food-details">
          <span class="food-category">${UEM.escapeHTML(item.category || 'Special')}</span>
          <h3 class="food-title">${UEM.escapeHTML(item.name)}</h3>
          <p class="food-desc">${UEM.escapeHTML(item.description || '')}</p>
          <div class="food-price-action">
            <span class="food-price">${UEM.formatCurrency(item.price)}</span>
            ${actionButton}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function addItem(id, name, price, image) {
  if (!currentVendor) return;
  UEM.addToCart(
    { id, name, price, image },
    { id: currentVendor.id, name: currentVendor.vendor_name }
  );
  renderMenuItems();
  updateFloatingCartBar();
}

function stepItemQty(itemId, delta) {
  let cart = UEM.getCart();
  const index = cart.items.findIndex(i => i.id === itemId);
  if (index > -1) {
    cart.items[index].quantity += delta;
    if (cart.items[index].quantity <= 0) {
      cart.items.splice(index, 1);
    }
    if (cart.items.length === 0) {
      cart.vendorId = null;
      cart.vendorName = "";
    }
    UEM.saveCart(cart);
    renderMenuItems();
    updateFloatingCartBar();
  }
}

function updateFloatingCartBar() {
  const bar = document.getElementById("floating-cart-bar");
  if (!bar) return;

  const cart = UEM.getCart();
  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  if (totalItems > 0 && cart.vendorId === currentVendor?.id) {
    document.getElementById("floating-cart-count").textContent = `${totalItems} item${totalItems > 1 ? 's' : ''} in cart`;
    document.getElementById("floating-cart-total").textContent = UEM.formatCurrency(totalAmount);
    bar.style.display = "flex";
  } else {
    bar.style.display = "none";
  }
}

function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, '&quot;');
}


/**
 * Vendor Menu Management
 */
let vendorShop = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["VENDOR"])) return;
  await loadShopAndMenu();
  setupAddForm();
});

async function loadShopAndMenu() {
  try {
    const res = await UEM.apiFetch("/vendors/shop/me");
    vendorShop = res.data;
    if (vendorShop) {
      await loadMenuItems(vendorShop.id);
    } else {
      document.getElementById("vendor-menu-grid").innerHTML = `
        <p style="color:var(--danger);">No vendor stall associated with this account.</p>
      `;
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadMenuItems(vendorId) {
  const container = document.getElementById("vendor-menu-grid");
  try {
    const res = await UEM.apiFetch(`/menu/vendor/${vendorId}`);
    const items = res.data || [];

    if (items.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">You have no dishes on your menu. Click "+ Add New Dish" above.</p>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="card food-card">
        <img src="${UEM.escapeHTML(item.image) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${UEM.escapeHTML(item.name)}" class="food-img">
        <div class="food-details">
          <span class="food-category">${UEM.escapeHTML(item.category || 'General')}</span>
          <h3 class="food-title">${UEM.escapeHTML(item.name)}</h3>
          <p class="food-desc">${UEM.escapeHTML(item.description || '')}</p>
          <div class="food-price-action">
            <span class="food-price">${UEM.formatCurrency(item.price)}</span>
            <div style="display:flex; gap: 0.5rem; align-items: center;">
              <button onclick="toggleAvailability('${item.id}', ${!item.is_available})" class="btn btn-sm ${item.is_available ? 'btn-outline' : 'btn-secondary'}">
                ${item.is_available ? '🟢 In Stock' : '🔴 Sold Out'}
              </button>
              <button onclick="deleteDish('${item.id}')" class="btn btn-danger btn-sm">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error: ${err.message}</p>`;
  }
}

function showAddItemModal() {
  document.getElementById("add-item-card").style.display = "block";
}

function hideAddItemModal() {
  document.getElementById("add-item-card").style.display = "none";
}

function setupAddForm() {
  document.getElementById("add-item-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("item-name").value.trim();
    const price = document.getElementById("item-price").value;
    const category = document.getElementById("item-category").value.trim();
    const image = document.getElementById("item-image").value.trim();
    const description = document.getElementById("item-desc").value.trim();

    try {
      await UEM.apiFetch("/menu", {
        method: "POST",
        body: JSON.stringify({ name, price, category, image, description }),
      });

      UEM.showToast("Dish added successfully!", "success");
      hideAddItemModal();
      document.getElementById("add-item-form").reset();
      loadMenuItems(vendorShop.id);
    } catch (err) {
      UEM.showToast(`Failed to add dish: ${err.message}`, "error");
    }
  });
}

async function toggleAvailability(itemId, newStatus) {
  try {
    await UEM.apiFetch(`/menu/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ is_available: newStatus }),
    });
    UEM.showToast("Dish availability updated", "success");
    loadMenuItems(vendorShop.id);
  } catch (err) {
    UEM.showToast(err.message, "error");
  }
}

async function deleteDish(itemId) {
  if (!confirm("Are you sure you want to remove this dish from your menu?")) return;
  try {
    await UEM.apiFetch(`/menu/${itemId}`, {
      method: "DELETE",
    });
    UEM.showToast("Dish removed from menu", "success");
    loadMenuItems(vendorShop.id);
  } catch (err) {
    UEM.showToast(err.message, "error");
  }
}

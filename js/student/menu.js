/**
 * Canteen Menu Logic
 */
let currentVendor = null;

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
    const items = res.data || [];

    if (items.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No items available for this canteen yet.</p>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="card food-card">
        <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'}" alt="${item.name}" class="food-img">
        <div class="food-details">
          <span class="food-category">${item.category || 'Special'}</span>
          <h3 class="food-title">${item.name}</h3>
          <p class="food-desc">${item.description || ''}</p>
          <div class="food-price-action">
            <span class="food-price">${UEM.formatCurrency(item.price)}</span>
            ${item.is_available 
              ? `<button onclick="addItem('${item.id}', '${escapeHtml(item.name)}', ${item.price}, '${item.image || ''}')" class="btn btn-primary btn-sm">+ Add</button>`
              : `<span class="badge badge-warning">Sold Out</span>`
            }
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load menu: ${err.message}</p>`;
  }
}

function addItem(id, name, price, image) {
  if (!currentVendor) return;
  UEM.addToCart(
    { id, name, price, image },
    { id: currentVendor.id, name: currentVendor.vendor_name }
  );
}

function escapeHtml(str) {
  return (str || "").replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

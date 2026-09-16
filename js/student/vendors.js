let allVendors = [];
let vendorSearchInput = null;

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;
  vendorSearchInput = document.getElementById("vendor-search");
  if (vendorSearchInput) {
    vendorSearchInput.addEventListener("input", renderVendorList);
  }
  loadAllVendors();
});

async function loadAllVendors() {
  const container = document.getElementById("vendors-list");
  if (!container) return;

  try {
    container.innerHTML = `<p style="color:var(--text-muted);">Loading canteens...</p>`;
    const response = await UEM.apiFetch("/vendors");
    allVendors = response.data || [];
    renderVendorList();
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Error: ${err.message}</p>`;
  }
}

function renderVendorList() {
  const container = document.getElementById("vendors-list");
  if (!container) return;

  const query = (vendorSearchInput?.value || "").toLowerCase().trim();
  const filtered = allVendors.filter(v => 
    !query ||
    (v.vendor_name && v.vendor_name.toLowerCase().includes(query)) ||
    (v.location && v.location.toLowerCase().includes(query)) ||
    (v.description && v.description.toLowerCase().includes(query))
  );

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</p>
        <p>No canteens found matching your search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(v => `
    <div class="card vendor-card" onclick="window.location.href='menu.html?vendorId=${encodeURIComponent(v.id)}'">
      <img src="${UEM.escapeHTML(v.image) || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'}" alt="${UEM.escapeHTML(v.vendor_name)}" class="vendor-img">
      <div class="vendor-info">
        <h3 class="vendor-title">${UEM.escapeHTML(v.vendor_name)}</h3>
        <p class="vendor-location">📍 ${UEM.escapeHTML(v.location || 'Campus')}</p>
        <p class="vendor-desc">${UEM.escapeHTML(v.description || '')}</p>
        <button class="btn btn-primary btn-sm btn-block">View Menu &rarr;</button>
      </div>
    </div>
  `).join("");
}


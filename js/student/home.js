/**
 * Student Home Screen Logic
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;

  const user = Auth.getUser();
  const welcomeNameEl = document.getElementById("welcome-name");
  if (welcomeNameEl && user) {
    welcomeNameEl.textContent = user.name.split(" ")[0];
  }

  loadFeaturedVendors();
});

async function loadFeaturedVendors() {
  const container = document.getElementById("featured-vendors");
  if (!container) return;

  try {
    container.innerHTML = `<p style="color:var(--text-muted);">Loading canteens...</p>`;
    const response = await UEM.apiFetch("/vendors");
    const vendors = response.data || [];

    if (vendors.length === 0) {
      container.innerHTML = `<p style="color:var(--text-muted);">No active canteens available right now.</p>`;
      return;
    }

    container.innerHTML = vendors.map(v => `
      <div class="card vendor-card" onclick="window.location.href='menu.html?vendorId=${v.id}'">
        <img src="${v.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'}" alt="${v.vendor_name}" class="vendor-img">
        <div class="vendor-info">
          <h3 class="vendor-title">${v.vendor_name}</h3>
          <p class="vendor-location">📍 ${v.location || 'Campus'}</p>
          <p class="vendor-desc">${v.description || ''}</p>
          <button class="btn btn-primary btn-sm btn-block">View Menu</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load canteens: ${err.message}</p>`;
  }
}

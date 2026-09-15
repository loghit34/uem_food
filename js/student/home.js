let allVendors = [];
let activeCategory = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["STUDENT", "FACULTY"])) return;

  const user = Auth.getUser();
  const welcomeNameEl = document.getElementById("welcome-name");
  if (welcomeNameEl && user) {
    welcomeNameEl.textContent = user.name.split(" ")[0];
  }

  const searchInput = document.getElementById("home-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderVendorsList();
    });
  }

  loadFeaturedVendors();
});

async function loadFeaturedVendors() {
  const container = document.getElementById("featured-vendors");
  if (!container) return;

  try {
    container.innerHTML = `<p style="color:var(--text-muted);">Loading canteens...</p>`;
    const response = await UEM.apiFetch("/vendors");
    allVendors = response.data || [];
    renderVendorsList();
  } catch (err) {
    container.innerHTML = `<p style="color:var(--danger);">Failed to load canteens: ${err.message}</p>`;
  }
}

function filterCategory(cat) {
  activeCategory = cat;
  const chips = document.querySelectorAll(".category-chip");
  chips.forEach((c) => {
    c.classList.toggle("active", c.textContent.toUpperCase().includes(cat));
  });
  renderVendorsList();
}

function renderVendorsList() {
  const container = document.getElementById("featured-vendors");
  if (!container) return;

  const query = (document.getElementById("home-search")?.value || "").toLowerCase().trim();

  let filtered = allVendors.filter(v => {
    const matchesSearch = !query || 
      (v.vendor_name && v.vendor_name.toLowerCase().includes(query)) ||
      (v.description && v.description.toLowerCase().includes(query)) ||
      (v.location && v.location.toLowerCase().includes(query));

    const matchesCat = activeCategory === "ALL" || 
      (v.description && v.description.toUpperCase().includes(activeCategory)) ||
      (v.vendor_name && v.vendor_name.toUpperCase().includes(activeCategory));

    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted);">
        <p style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔍</p>
        <p>No canteens match your search or filter.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(v => `
    <div class="card vendor-card" onclick="window.location.href='menu.html?vendorId=${v.id}'">
      <img src="${v.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500'}" alt="${v.vendor_name}" class="vendor-img">
      <div class="vendor-info">
        <h3 class="vendor-title">${v.vendor_name}</h3>
        <p class="vendor-location">📍 ${v.location || 'Campus'}</p>
        <p class="vendor-desc">${v.description || ''}</p>
        <button class="btn btn-primary btn-sm btn-block">View Menu &rarr;</button>
      </div>
    </div>
  `).join("");
}


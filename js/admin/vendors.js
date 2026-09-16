/**
 * Admin - Vendor Management
 */
document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["ADMIN"])) return;
  loadVendors();
  setupCreateVendorForm();
});

async function loadVendors() {
  const tbody = document.getElementById("vendors-tbody");
  try {
    const res = await UEM.apiFetch("/vendors");
    const vendors = res.data || [];

    if (vendors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No vendors registered yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = vendors.map(v => `
      <tr>
        <td><strong>${UEM.escapeHTML(v.vendor_name)}</strong></td>
        <td>${UEM.escapeHTML(v.location || "—")}</td>
        <td>
          <span class="badge ${v.is_active ? 'badge-success' : 'badge-warning'}">
            ${v.is_active ? "Active" : "Inactive"}
          </span>
        </td>
        <td>
          <button onclick="toggleVendorStatus('${v.id}', ${!v.is_active})"
            class="btn btn-sm ${v.is_active ? 'btn-outline' : 'btn-primary'}">
            ${v.is_active ? "Deactivate" : "Activate"}
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:var(--danger);">Error: ${err.message}</td></tr>`;
  }
}

async function toggleVendorStatus(vendorId, newStatus) {
  try {
    await UEM.apiFetch(`/vendors/${vendorId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active: newStatus }),
    });
    UEM.showToast(`Vendor ${newStatus ? "activated" : "deactivated"}`, "success");
    loadVendors();
  } catch (err) {
    UEM.showToast(err.message, "error");
  }
}

function setupCreateVendorForm() {
  document.getElementById("create-vendor-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("create-vendor-btn");
    const result = document.getElementById("create-vendor-result");
    btn.disabled = true;
    btn.textContent = "Creating vendor...";
    result.innerHTML = "";

    try {
      const res = await UEM.apiFetch("/auth/create-vendor", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("v-name").value.trim(),
          email: document.getElementById("v-email").value.trim(),
          password: document.getElementById("v-password").value,
          vendor_name: document.getElementById("v-vendor-name").value.trim(),
          location: document.getElementById("v-location").value.trim(),
          description: document.getElementById("v-description").value.trim(),
        }),
      });

      result.innerHTML = `
        <div style="background:#dcfce7; color:#166534; padding:1rem; border-radius:8px; font-weight:600;">
          ✅ Vendor account created! Login: ${document.getElementById("v-email").value}
        </div>`;
      document.getElementById("create-vendor-form").reset();
      loadVendors();
    } catch (err) {
      result.innerHTML = `<div style="background:#fee2e2; color:#991b1b; padding:1rem; border-radius:8px;">❌ ${err.message}</div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = "Create Vendor Account";
    }
  });
}
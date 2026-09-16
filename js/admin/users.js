/**
 * Admin - User Management
 */
let allUsers = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!Auth.requireAuth(["ADMIN"])) return;

  const searchInput = document.getElementById("user-search");
  if (searchInput) {
    searchInput.addEventListener("input", renderUsersTable);
  }

  loadAdminUsers();
});

async function loadAdminUsers() {
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;

  try {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">Fetching campus users...</td></tr>`;
    const res = await UEM.apiFetch("/auth/users");
    allUsers = res.data || [];
    renderUsersTable();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--danger); padding:2rem;">Failed to load users: ${err.message}</td></tr>`;
  }
}

function renderUsersTable() {
  const tbody = document.getElementById("users-tbody");
  if (!tbody) return;

  const query = (document.getElementById("user-search")?.value || "").toLowerCase().trim();

  const filtered = allUsers.filter(u => {
    if (!query) return true;
    const name = u.name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const role = u.role?.toLowerCase() || "";
    return name.includes(query) || email.includes(query) || role.includes(query);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:2rem;">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    let roleBadgeClass = "badge-primary";
    if (u.role === "ADMIN") roleBadgeClass = "badge-danger";
    else if (u.role === "VENDOR") roleBadgeClass = "badge-warning";
    else if (u.role === "STUDENT" || u.role === "FACULTY") roleBadgeClass = "badge-success";

    return `
      <tr>
        <td>
          <strong style="color:var(--secondary); font-size:0.95rem;">${UEM.escapeHTML(u.name || 'Anonymous')}</strong>
        </td>
        <td>
          <span style="color:var(--text-muted); font-size:0.9rem;">${UEM.escapeHTML(u.email)}</span>
        </td>
        <td>
          <span class="badge ${roleBadgeClass}">${UEM.escapeHTML(u.role)}</span>
        </td>
        <td style="color:var(--text-muted); font-size:0.88rem;">
          ${UEM.formatDate(u.created_at)}
        </td>
      </tr>
    `;
  }).join("");
}

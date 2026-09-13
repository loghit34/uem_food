/**
 * UEM EATS V2 - Authentication & Session Manager
 */
const Auth = {
  getUser() {
    try {
      const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  isAuthenticated() {
    return !!Auth.getToken() && !!Auth.getUser();
  },

  setSession(token, userProfile) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  },

  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
    window.location.href = "/login.html";
  },

  // Role-based redirector
  redirectByRole(role) {
    switch (role) {
      case "STUDENT":
      case "FACULTY":
        window.location.href = "/student/home.html";
        break;
      case "VENDOR":
        window.location.href = "/vendor/dashboard.html";
        break;
      case "ADMIN":
        window.location.href = "/admin/dashboard.html";
        break;
      default:
        window.location.href = "/index.html";
    }
  },

  // Guard page for required roles
  requireAuth(allowedRoles = []) {
    const user = Auth.getUser();
    const token = Auth.getToken();

    if (!user || !token) {
      window.location.href = "/login.html";
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      alert(`Access restricted. Your role is '${user.role}'`);
      Auth.redirectByRole(user.role);
      return false;
    }

    // Update UI profile display if elements exist
    const userNameEl = document.getElementById("nav-user-name");
    const userRoleEl = document.getElementById("nav-user-role");
    if (userNameEl) userNameEl.textContent = user.name || user.email;
    if (userRoleEl) userRoleEl.textContent = user.role;

    return true;
  },
};

window.Auth = Auth;

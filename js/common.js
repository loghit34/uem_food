/**
 * UEM EATS V2 - Common Utilities & Helpers
 */
const UEM = {
  // Format Indian Rupee currency
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num);
  },

  // Format Date & Time
  formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  },

  // Show Toast Alert Notification
  showToast(message, type = "info") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // Cart Management
  getCart() {
    try {
      const cart = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
      return cart ? JSON.parse(cart) : { vendorId: null, vendorName: "", items: [] };
    } catch {
      return { vendorId: null, vendorName: "", items: [] };
    }
  },

  saveCart(cart) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
    UEM.updateCartBadge();
  },

  clearCart() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CART);
    UEM.updateCartBadge();
  },

  addToCart(item, vendor) {
    let cart = UEM.getCart();

    // Check if adding from a different vendor
    if (cart.vendorId && cart.vendorId !== vendor.id && cart.items.length > 0) {
      const proceed = confirm(
        `Your cart contains items from "${cart.vendorName}". Discard existing cart and add items from "${vendor.name}"?`
      );
      if (!proceed) return false;
      cart = { vendorId: vendor.id, vendorName: vendor.name, items: [] };
    } else if (!cart.vendorId || cart.items.length === 0) {
      cart.vendorId = vendor.id;
      cart.vendorName = vendor.name;
    }

    const existingIndex = cart.items.findIndex((i) => i.id === item.id);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += 1;
    } else {
      cart.items.push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        image: item.image,
        quantity: 1,
      });
    }

    UEM.saveCart(cart);
    UEM.showToast(`Added ${item.name} to cart!`, "success");
    return true;
  },

  updateCartBadge() {
    const cart = UEM.getCart();
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    const badges = document.querySelectorAll("#cart-count-badge, .mobile-nav-badge");
    badges.forEach((badge) => {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-block" : "none";
    });
  },

  // Authenticated API Fetch Wrapper
  async apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const rawText = await response.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { message: rawText || `Server returned status ${response.status}` };
      }

      if (!response.ok) {
        if (response.status === 401) {
          UEM.showToast("Your login session has expired. Please sign in again.", "warning");
          setTimeout(() => {
            if (window.Auth) Auth.logout();
          }, 1500);
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Fetch failed on ${endpoint}:`, err);
      throw err;
    }
  },
};

window.UEM = UEM;

// Initialize cart badge when page is ready
document.addEventListener("DOMContentLoaded", () => {
  UEM.updateCartBadge();
});

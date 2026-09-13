/**
 * UEM EATS V2 - Global Configuration
 */
const isLocalCustomPort = window.location.hostname === "localhost" && window.location.port !== "5000";

const CONFIG = {
  // Automatically points to local backend on port 5000 during local frontend dev,
  // or relative "/api" when served live in production.
  API_BASE_URL: isLocalCustomPort ? "http://localhost:5000/api" : "/api",
  
  // Replace these with your live Supabase credentials
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON_KEY: "your-supabase-anon-key",
  
  // Replace with your Razorpay Key ID (Test or Live)
  RAZORPAY_KEY_ID: "rzp_test_placeholder",
  
  STORAGE_KEYS: {
    AUTH_TOKEN: "uem_token",
    USER_PROFILE: "uem_user",
    CART: "uem_cart",
  },
};

// Expose globally
window.CONFIG = CONFIG;

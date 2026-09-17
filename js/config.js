/**
 * UEM EATS V2 - Global Configuration
 */
const isLocalCustomPort = window.location.hostname === "localhost" && window.location.port !== "5000";

const CONFIG = {
  // Automatically points to local backend on port 5000 during local frontend dev,
  // or relative "/api" when served live in production.
  API_BASE_URL: isLocalCustomPort ? "http://localhost:5000/api" : "/api",
  
  // Replace these with your live Supabase credentials
  SUPABASE_URL: "https://abuopjnbspnusijjtnuj.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFidW9wam5ic3BudXNpamp0bnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNzQxNDYsImV4cCI6MjEwNDg1MDE0Nn0.HWQexbBGPlWj5xHeG-Y9du57rtuJvGXYh7sAAKJLEjc",
  
  
  STORAGE_KEYS: {
    AUTH_TOKEN: "uem_token",
    USER_PROFILE: "uem_user",
    CART: "uem_cart",
  },

  FEES: {
    ORIGINAL_CONVENIENCE_FEE: 6.00,
    CURRENT_CONVENIENCE_FEE: 4.00,
  },
};

// Expose globally
window.CONFIG = CONFIG;

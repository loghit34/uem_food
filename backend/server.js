require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middleware/error.middleware");
const { generalLimiter } = require("./middleware/rateLimit.middleware");

const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const menuRoutes = require("./routes/menu.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware - Configurable CORS Origin Whitelist
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or in whitelist
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
  })
);
// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.phonepe.com https://api-preprod.phonepe.com; frame-src https://api.phonepe.com https://mercury.phonepe.com;"
  );
  if (process.env.NODE_ENV === "production" || req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  res.removeHeader("X-Powered-By");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "UEM EATS V2 API",
  });
});

// General API Rate Limiter
app.use("/api/", generalLimiter);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Catch-all for unmatched API routes (returns clean JSON 404, never leaks internals)
app.all("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    errors: null,
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Only listen directly if executed as standalone script (local dev / Render)
if (require.main === module) {
  // Block any access to dotfiles or sensitive backend/database source files
  app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
      p.includes("/.") ||
      p.startsWith("/backend") ||
      p.startsWith("/database") ||
      p.includes("node_modules") ||
      p.endsWith(".env") ||
      p.endsWith(".sql")
    ) {
      return res.status(404).send("Not Found");
    }
    next();
  });

  // Serve frontend files directly from project root in standalone mode
  app.use(express.static(path.join(__dirname, ".."), { dotfiles: "deny" }));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(__dirname, "../index.html"));
  });

  app.listen(PORT, () => {
    console.log(`🚀 UEM EATS V2 Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless Functions
module.exports = app;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const vendorRoutes = require("./routes/vendor.routes");
const menuRoutes = require("./routes/menu.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Only listen directly if executed as standalone script (local dev / Render)
if (require.main === module) {
  // Serve frontend files directly from project root in standalone mode
  app.use(express.static(path.join(__dirname, "..")));
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

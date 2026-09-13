const { errorResponse } = require("../utils/response");

/**
 * Global centralized error handler
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  const status = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return errorResponse(res, message, status);
};

module.exports = {
  errorHandler,
};

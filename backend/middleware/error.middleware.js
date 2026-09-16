const { errorResponse } = require("../utils/response");

/**
 * Global centralized error handler
 */
const errorHandler = (err, req, res, next) => {
  // Gracefully handle malformed JSON payload errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return errorResponse(res, "Invalid JSON payload in request body", 400);
  }

  // Handle PostgreSQL / UUID syntax errors gracefully
  if (err.code === "22P02" || (err.message && err.message.includes("invalid input syntax for type uuid"))) {
    return errorResponse(res, "Invalid identifier format", 400);
  }

  console.error("Internal Server Error:", err.message || err);

  const status = err.statusCode || err.status || 500;
  
  // In production, never expose internal error messages or stack details on 500
  const message = (process.env.NODE_ENV === "production" && status === 500)
    ? "Internal Server Error"
    : (err.message || "Internal Server Error");

  return errorResponse(res, message, status);
};

module.exports = {
  errorHandler,
};


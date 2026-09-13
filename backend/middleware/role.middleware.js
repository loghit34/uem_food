const { errorResponse } = require("../utils/response");

/**
 * Restricts route access to specified roles
 * @param  {...string} allowedRoles 
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]`,
        403
      );
    }
    next();
  };
};

module.exports = {
  authorizeRoles,
};

/**
 * Utility input validators
 */
const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const isValidRole = (role) => {
  const allowedRoles = ["STUDENT", "FACULTY", "VENDOR", "ADMIN"];
  return allowedRoles.includes(role);
};

module.exports = {
  isValidEmail,
  isValidRole,
};

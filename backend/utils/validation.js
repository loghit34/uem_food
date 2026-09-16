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

const isValidPrice = (price) => {
  if (price === undefined || price === null || typeof price === "boolean" || price === "") {
    return false;
  }
  const num = Number(price);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 50000;
};

const isValidString = (str, minLen = 1, maxLen = 200) => {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length >= minLen && trimmed.length <= maxLen;
};

module.exports = {
  isValidEmail,
  isValidRole,
  isValidPrice,
  isValidString,
};


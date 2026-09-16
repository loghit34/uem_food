require("dotenv").config();

const PHONEPE_MERCHANT_ID = (process.env.PHONEPE_MERCHANT_ID || "PLACEHOLDER_MERCHANT_ID").trim();
const PHONEPE_SALT_KEY = (process.env.PHONEPE_SALT_KEY || "PLACEHOLDER_SALT_KEY").trim();
const PHONEPE_SALT_INDEX = parseInt(process.env.PHONEPE_SALT_INDEX || "1", 10);
const PHONEPE_ENV = (process.env.PHONEPE_ENV || "UAT").trim().toUpperCase();

// PhonePe API base URLs
const PHONEPE_BASE_URL =
  PHONEPE_ENV === "PRODUCTION"
    ? "https://api.phonepe.com/apis/hermes"
    : "https://api-preprod.phonepe.com/apis/pg-sandbox";

module.exports = {
  PHONEPE_MERCHANT_ID,
  PHONEPE_SALT_KEY,
  PHONEPE_SALT_INDEX,
  PHONEPE_ENV,
  PHONEPE_BASE_URL,
};

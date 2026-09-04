import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || "5000", 10),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/veyra",
  JWT_SECRET: process.env.JWT_SECRET || "veyra_dev_secret_change_in_production_32chars",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "30d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:8443",
  NODE_ENV: process.env.NODE_ENV || "development",
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.JWT_SECRET || "veyra_dev_secret_change_in_production_32chars",
  VEYRA_AI_CLOUD_API_KEY: process.env.VEYRA_AI_CLOUD_API_KEY || process.env.OPENROUTER_API_KEY || "",
};

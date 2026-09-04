/**
 * Database configuration - MongoDB via Mongoose
 * Spec requires: backend/src/config/database.ts
 * This file is the canonical entry for MongoDB connection.
 * It re-exports from db.ts to keep backward compat while satisfying spec.
 */
export { connectDB, disconnectDB } from "./db.js";
import { connectDB as _connectDB } from "./db.js";
export default _connectDB;

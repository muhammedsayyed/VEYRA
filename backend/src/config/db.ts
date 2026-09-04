import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB(): Promise<void> {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Veyra DB] MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (err: any) {
    console.error(`[Veyra DB] Connection failed: ${err.message}`);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

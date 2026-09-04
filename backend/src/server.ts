import dotenv from "dotenv";
dotenv.config();

import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

async function start() {
  try {
    await connectDB();
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      console.log(`[Veyra API] Server running on http://localhost:${env.PORT}`);
      console.log(`[Veyra API] Health: http://localhost:${env.PORT}/api/health`);
      console.log(`[Veyra API] Client URL: ${env.CLIENT_URL}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => process.exit(0));
    });
    process.on("SIGINT", () => {
      server.close(() => process.exit(0));
    });
  } catch (err: any) {
    console.error("[Veyra API] Failed to start server:", err.message);
    if (env.NODE_ENV === "production") process.exit(1);
    else {
      console.warn("[Veyra API] Starting without DB connection (dev fallback) - API will return 500 for DB operations until MongoDB is available");
      const app = createApp();
      app.listen(env.PORT, () => {
        console.log(`[Veyra API] Server running (NO DB) on http://localhost:${env.PORT}`);
      });
    }
  }
}

start();

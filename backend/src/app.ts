import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pantryRoutes from "./routes/pantry.routes.js";
import shoppingRoutes from "./routes/shopping.routes.js";
import mealPlanRoutes from "./routes/mealPlan.routes.js";
import weightRoutes from "./routes/weight.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import nutritionRoutes from "./routes/nutrition.routes.js";
import workoutRoutes from "./routes/workout.routes.js";
import scanRoutes from "./routes/scan.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";
import aiRoutes from "./routes/ai.routes.js";

export function createApp() {
  const app = express();

  // CORS - strict per CLIENT_URL, dev allows localhost
  const allowedOrigins = [env.CLIENT_URL, "http://localhost:8443", "http://localhost:3000", "http://localhost:5173", "http://localhost:8080"].filter(Boolean);
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // allow curl, mobile, server-to-server
        if (allowedOrigins.includes(origin)) return cb(null, true);
        if (origin.includes("localhost") || origin.includes("127.0.0.1")) return cb(null, true); // dev
        if (origin.includes("vercel.app")) return cb(null, true); // preview
        // block other origins in production
        if (env.NODE_ENV === "production") return cb(new Error("CORS blocked for origin: " + origin));
        return cb(null, true);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Cookie"],
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health - per spec: GET /api/health => {success:true,message:"VEYRA API is running"}
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "VEYRA API is running", timestamp: new Date().toISOString(), env: env.NODE_ENV });
  });
  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "VEYRA API is running" });
  });

  // Auth (public)
  app.use("/api/auth", authRoutes);

  // Protected domain routes
  app.use("/api/users", userRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/pantry", pantryRoutes);
  app.use("/api/shopping-list", shoppingRoutes);
  app.use("/api/shopping", shoppingRoutes);
  app.use("/api/meal-plan", mealPlanRoutes);
  app.use("/api/meal-plans", mealPlanRoutes);
  app.use("/api/weight-history", weightRoutes);
  app.use("/api/weight", weightRoutes);
  app.use("/api/favorites", favoriteRoutes);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/workouts", workoutRoutes);
  app.use("/api/scans", scanRoutes);
  app.use("/api/scan-history", scanRoutes);
  app.use("/api/nutrition", nutritionRoutes);
  app.use("/api/food-log", nutritionRoutes);
  app.use("/api/water", nutritionRoutes); // compat: POST /api/water directly
  app.use("/api/daily-nutrition", nutritionRoutes);

  // Public content
  app.use("/api/recipes", recipeRoutes);
  // Countries & categories also available as standalone
  app.get("/api/countries", async (req, res, next) => {
    try { const { listCountries } = await import("./controllers/recipe.controller.js"); return listCountries(req as any, res as any, next); } catch(e){ next(e); }
  });
  app.get("/api/categories", async (req, res, next) => {
    try { const { listCategories } = await import("./controllers/recipe.controller.js"); return listCategories(req as any, res as any, next); } catch(e){ next(e); }
  });

  // AI
  app.use("/api/ai", aiRoutes);

  // 404 & error
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

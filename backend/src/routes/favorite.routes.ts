import { Router } from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favorite.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/", removeFavorite);
router.delete("/:id", removeFavorite);

export default router;

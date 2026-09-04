import { Router } from "express";
import { getReviews, addReview, updateReview, deleteReview } from "../controllers/review.controller.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();
// GET is public
router.get("/", optionalAuth, getReviews);
router.post("/", protect, addReview);
router.put("/:id", protect, updateReview);
router.put("/", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.delete("/", protect, deleteReview);

export default router;

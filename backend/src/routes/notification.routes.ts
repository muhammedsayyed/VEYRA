import { Router } from "express";
import { getNotifications, addNotification, markAsRead } from "../controllers/notification.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getNotifications);
router.post("/", addNotification);
router.put("/:id", markAsRead);
router.put("/", markAsRead);

export default router;

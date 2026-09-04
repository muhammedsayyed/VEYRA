import { Router } from "express";
import { getScans, addScan } from "../controllers/scan.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getScans);
router.post("/", addScan);

export default router;

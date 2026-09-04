import { Router } from "express";
import { getPantry, addPantryItem, updatePantryItem, deletePantryItem } from "../controllers/pantry.controller.js";
import { protect } from "../middleware/auth.js";
import { zodValidate } from "../middleware/validate.js";
import { createPantrySchema, updatePantrySchema } from "../validators/pantry.validator.js";

const router = Router();
router.use(protect);
router.get("/", getPantry);
router.post("/", zodValidate(createPantrySchema), addPantryItem);
router.put("/:id", zodValidate(updatePantrySchema), updatePantryItem);
router.put("/", zodValidate(updatePantrySchema), updatePantryItem);
router.delete("/:id", deletePantryItem);
router.delete("/", deletePantryItem);

export default router;

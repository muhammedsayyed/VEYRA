import { Router } from "express";
import { getShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem } from "../controllers/shopping.controller.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);
router.get("/", getShoppingList);
router.post("/", addShoppingItem);
router.put("/:id", updateShoppingItem);
router.put("/", updateShoppingItem);
router.delete("/:id", deleteShoppingItem);
router.delete("/", deleteShoppingItem);

export default router;

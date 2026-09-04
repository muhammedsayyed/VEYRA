import { Router } from "express";
import { listRecipes, getRecipeDetail, listCountries, listCategories, popularRecipes, searchRecipes } from "../controllers/recipe.controller.js";

const router = Router();
router.get("/", listRecipes);
router.get("/popular", popularRecipes);
router.get("/search", searchRecipes);
router.get("/countries", listCountries);
router.get("/categories", listCategories);
router.get("/:id", getRecipeDetail);

export default router;

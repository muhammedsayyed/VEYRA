import { Request, Response, NextFunction } from "express";
import { Recipe } from "../models/Recipe.js";
import { Country } from "../models/Country.js";
import { Category } from "../models/Category.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export async function listRecipes(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "20"), 10) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { published: true };
    const country = req.query.country as string;
    const category = req.query.category as string;
    const proteinType = req.query.proteinType as string;
    const dietType = req.query.dietType as string;
    const difficulty = req.query.difficulty as string;
    const q = req.query.q as string;
    const sort = req.query.sort as string;
    const onlyPopular = ["1","true"].includes(String(req.query.popular || req.query.onlyPopular || "").toLowerCase());
    const onlyTrending = ["1","true"].includes(String(req.query.trending || "").toLowerCase());
    const onlyFeatured = ["1","true"].includes(String(req.query.featured || "").toLowerCase());

    if (country) filter.countryCode = String(country).toLowerCase();
    if (proteinType) filter.proteinType = { $in: String(proteinType).split(",").map(s=>s.trim().toUpperCase()).filter(Boolean) };
    if (dietType) filter.dietType = { $in: String(dietType).split(",").map(s=>s.trim().toUpperCase()).filter(Boolean) };
    if (difficulty) filter.difficulty = { $in: String(difficulty).split(",").map(s=>s.trim().toUpperCase()).filter(Boolean) };
    if (category) {
      const cats = String(category).split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
      filter.categories = { $in: cats };
    }
    if (q) {
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ name: regex }, { description: regex }, { tags: regex }, { categories: regex }];
    }
    if (onlyPopular) filter.isPopular = true;
    if (onlyTrending) filter.isTrending = true;
    if (onlyFeatured) filter.isFeatured = true;

    let sortObj: any = { createdAt: -1 };
    if (sort === "popular") sortObj = { popularityScore: -1 };
    else if (sort === "newest") sortObj = { createdAt: -1 };
    else if (sort === "time") sortObj = { prepTimeMin: 1 };

    const [items, total] = await Promise.all([
      Recipe.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Recipe.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    return successResponse(res, items, 200, { pagination: { total, totalPages, currentPage: page, limit } });
  } catch (err) { next(err); }
}

export async function getRecipeDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = ((req.query.id as unknown as string) || (req.query.slug as unknown as string) || (req.params as any).id) as string | string[];
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || "");
    if (!id) return errorResponse(res, "Missing recipe id", 400);
    const orConditions: any[] = [{ slug: id }, { slug: String(id).toLowerCase() }];
    if (isValidObjectId(String(id))) orConditions.unshift({ _id: id });
    const recipe = await Recipe.findOne({ $or: orConditions }).lean();
    if (!recipe) return errorResponse(res, "Recipe not found", 404);
    return successResponse(res, recipe);
  } catch (err) { next(err); }
}

function isValidObjectId(id: string) { return /^[a-f\d]{24}$/i.test(id); }

export async function listCountries(_req: Request, res: Response, next: NextFunction) {
  try {
    const countries = await Country.find().sort({ name: 1 }).lean();
    return successResponse(res, countries);
  } catch (err) { next(err); }
}

export async function listCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const cats = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
    return successResponse(res, cats);
  } catch (err) { next(err); }
}

export async function popularRecipes(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(50, parseInt(String(req.query.limit || "10"), 10) || 10);
    const items = await Recipe.find({ isPopular: true, published: true }).sort({ popularityScore: -1 }).limit(limit).lean();
    return successResponse(res, items);
  } catch (err) { next(err); }
}

export async function searchRecipes(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q || req.query.query || "").trim();
    if (!q) return successResponse(res, []);
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const items = await Recipe.find({ published: true, $or: [{ name: regex }, { description: regex }, { tags: regex }] }).limit(20).lean();
    return successResponse(res, items);
  } catch (err) { next(err); }
}

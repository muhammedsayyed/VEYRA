# VEYRA Backend — Food System API (Phase 1)

Base URL: `/api` (Vercel serverless functions; local dev served by the Vite middleware plugin).

> **Phase 2 update:** dataset now spans 20 countries / 281+ recipes and grows toward
> 1,400. Countries expose `slug` + `region`; recipes expose computed `totalTimeMin`.
> See `docs/FOOD_DATA.md` for dataset structure, quotas and validation rules.


All responses use a consistent JSON envelope:

```jsonc
// Success
{ "success": true, "data": ..., "pagination"?: { "total": 0, "totalPages": 1, "currentPage": 1, "limit": 20 } }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Recipe not found." } }
```

Common status codes: `200` OK · `204` OPTIONS preflight · `400 INVALID_PARAM` · `404 NOT_FOUND` · `405 METHOD_NOT_ALLOWED` · `500 INTERNAL_ERROR`.

---

## Countries

### `GET /api/countries`
List all countries.

| Param | Type | Description |
|---|---|---|
| `withCounts` | `1\|true` | Include published recipe counts |

**Example:** `GET /api/countries?withCounts=1`

```json
{
  "success": true,
  "data": [
    { "id": 1, "code": "eg", "name": "Egypt", "cuisineLabel": "Egyptian", "currency": "EGP", "recipeCount": 2 }
  ]
}
```

### `GET /api/countries?code={code}` / `GET /api/countries?id={id}`
Single country lookup by code (`eg`) or numeric id. Returns `404 NOT_FOUND` when missing.

---

## Categories

### `GET /api/categories`
All recipe categories (slug catalog: `beef`, `chicken`, `vegetarian`, `seafood`, `desserts`, `breakfast`, `lunch`, `dinner`, `street-food`, `traditional`, `healthy`, `high-protein`, `budget-friendly`, `easy-recipes`) with recipe counts.

---

## Recipes

### `GET /api/recipes`
Server-side filtered + paginated recipe listing.

| Param | Type | Constraints | Description |
|---|---|---|---|
| `id` / `slug` | string | — | When present, returns a single full recipe detail instead of a list |
| `country` | string | alphanumeric | Country code filter (e.g. `eg`, `jp`) |
| `category` | csv of slugs | alphanumeric | Category filter — e.g. `beef`, `chicken`, `vegetarian`, `desserts`. Combinable |
| `proteinType` | csv enum | see below | `BEEF CHICKEN SEAFOOD PORK LAMB MIXED VEGETARIAN NONE` |
| `dietType` | csv enum | see below | `BALANCED HIGH_PROTEIN LOW_CARB KETO VEGETARIAN VEGAN GLUTEN_FREE HALAL` |
| `difficulty` | csv enum | `EASY MEDIUM HARD` | Difficulty filter |
| `popular` / `trending` / `featured` | `1\|true` | — | Flag filters |
| `q` | string | ≤80 chars | Search across name/description/country/cuisine/categories/ingredients |
| `sort` | enum | `popular` (default), `newest`, `time` | Ordering |
| `page` | int | ≥1 | Page number |
| `limit` | int | 1–50 (hard cap) | Page size |

**Combined filtering examples**

```
GET /api/recipes?country=eg&category=beef          → Egypt + Beef
GET /api/recipes?country=eg&category=vegetarian    → Egypt + Vegetarian
GET /api/recipes?country=jp&category=desserts      → Japan + Desserts
GET /api/recipes?country=it&category=chicken&q=tomato
GET /api/recipes?proteinType=beef,chicken&dietType=high_protein&page=2
```

**Example response** (list):

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "slug": "egyptian-koshari",
      "name": "Egyptian Koshari",
      "imageUrl": "...",
      "country": { "code": "eg", "name": "Egypt", "cuisineLabel": "Egyptian" },
      "difficulty": "MEDIUM",
      "prepTimeMin": 20,
      "cookTimeMin": 35,
      "servings": 4,
      "nutrition": { "calories": 540, "protein": 22, "carbohydrates": 88, "fat": 10, "fiber": 12, "sugar": 8, "sodium": 620, "saturatedFat": 1.5 },
      "homePrepCost": 45, "restaurantPrice": 130, "currency": "EGP",
      "isPopular": true, "isTrending": false, "isFeatured": true,
      "proteinType": "VEGETARIAN", "dietType": "VEGETARIAN",
      "tags": ["national-dish"],
      "categories": [ { "slug": "vegetarian", "name": "Vegetarian" } ]
    }
  ],
  "pagination": { "total": 6, "totalPages": 1, "currentPage": 1, "limit": 20 }
}
```

### `GET /api/recipes/:recipeId`
Full recipe detail by opaque id **or** slug. Includes ordered ingredients with exact quantities/units, preparation steps, nutrition, verified videos and categories.

```json
{
  "success": true,
  "data": {
    "...summary fields...": "",
    "description": "...",
    "servingSize": "1 bowl (400g)",
    "ingredients": [
      { "name": "Brown Lentils", "quantity": 200, "unit": "g", "note": null }
    ],
    "steps": [ { "position": 1, "instruction": "..." } ],
    "videos": [
      { "youtubeVideoId": "...", "youtubeUrl": "...", "videoTitle": "...", "channelName": "..." }
    ]
  }
}
```

> **Video policy:** `videos` is empty unless a *verified* cooking video for that exact recipe exists in the database. Video IDs are never fabricated; absent videos are represented as `[]`, never as placeholder links.

### `GET /api/recipes/popular`
Popular/trending/featured recipes ordered by popularity score.

| Param | Constraints | Description |
|---|---|---|
| `type` | `popular` (default) \| `trending` \| `featured` | Which flag to filter on |
| `country` | alphanumeric | Optional country scope (e.g. "Most Popular Egyptian Recipes") |
| `limit` | int 1–24 | Default 12 |

### `GET /api/recipes/search?q={term}`
Backend-side search. Requires `q`; supports optional `country`, `category`, `page`, `limit`. Same result shape as the list endpoint.

---

## Authentication & user-scoped data

Food catalog endpoints above are **public reads**. User-specific data remains strictly user-scoped through the existing session auth (`veyra_session` cookie or `Authorization: Bearer <token>` header → server-side user resolution). Existing authenticated endpoints are unchanged:

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/auth/login` `/signup`, `GET /me`, `POST /logout` | mixed | Session management |
| `GET/POST/PUT/DELETE /api/favorites` | required | Per-user favorites (never accepts client-supplied userId) |
| `GET /api/reviews?recipeId=` (public), mutations require auth | mixed | Recipe ratings/reviews |
| pantry / shopping-list / meal-plan / weight-history / water / workouts / notifications | required | Per-user data |

The client never dictates identity: userId is always derived from the verified session token server-side.

---

## Data model (Prisma)

```
Country 1─* Recipe *─* Category   (via RecipeCategory join)
Recipe  1─* RecipeIngredient *─1 Ingredient   (quantity/unit/note per line)
Recipe  1─* RecipeStep            (ordered instructions)
Recipe  1─1 RecipeNutrition       (calories, protein, carbs, fat, fiber, sugar, sodium, sat. fat)
Recipe  1─* RecipeVideo           (verified YouTube cooking videos only)
User    *─* Recipe                (existing FavoriteRecipe, RecipeReview models - unchanged)
```

Indexes cover country, category-join, protein type and popularity lookups; unique constraints protect slugs/codes/join rows.

## Seeding

```bash
npm run seed:food        # or: npx prisma db seed
```

Data source: `prisma/seed-data/` — `countries.json`, `categories.json`, `recipes/*.json` (one file per recipe). The structure scales unchanged to the full dataset (~20 countries × 70 recipes ≈ 1,400): just add files and re-run. Idempotent re-runs upsert by unique keys and rebuild per-recipe relations deterministically.

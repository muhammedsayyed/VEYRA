# VEYRA Food Data — Pipeline & Dataset Guide (Phase 2)

This document explains how the food dataset is structured, validated, seeded and extended.

## Directory layout

```
prisma/seed-data/
├── countries.json        # definitive 20-country manifest
├── categories.json       # category catalog (47 slugs, incl. required 14)
└── recipes/
    ├── egypt.json        # { "countryCode": "eg", "recipes": [ ... ] }
    ├── saudi-arabia.json
    └── ... (one file per country)
```

## The 20 countries

| Code | Country | Region | Currency |
|---|---|---|---|
| eg | Egypt | Middle East & North Africa | EGP |
| sa | Saudi Arabia | Middle East & North Africa | SAR |
| ae | United Arab Emirates | Middle East & North Africa | AED |
| tr | Turkey | Middle East & North Africa | TRY |
| ma | Morocco | Middle East & North Africa | MAD |
| it | Italy | Europe | EUR |
| fr | France | Europe | EUR |
| es | Spain | Europe | EUR |
| de | Germany | Europe | EUR |
| gb | United Kingdom | Europe | GBP |
| gr | Greece | Europe | EUR |
| us | United States | Americas | USD |
| mx | Mexico | Americas | MXN |
| br | Brazil | Americas | BRL |
| in | India | Asia | INR |
| cn | China | Asia | CNY |
| jp | Japan | Asia | JPY |
| kr | South Korea | Asia | KRW |
| th | Thailand | Asia | THB |
| ng | Nigeria | Africa | NGN |

## Recipe JSON structure

Each recipe file contains `{ "countryCode": "<code>", "recipes": [...] }`. Required fields per recipe:

```jsonc
{
  "slug": "chicken-kabsa",              // unique, URL-safe, stable id
  "name": "Chicken Kabsa",
  "description": "...",                 // >= 5 chars
  "categories": ["chicken", "traditional"], // must exist in categories.json
  "proteinType": "CHICKEN",             // BEEF|CHICKEN|SEAFOOD|PORK|LAMB|MIXED|VEGETARIAN|NONE
  "dietType": "HALAL",                  // optional enum
  "difficulty": "MEDIUM",               // EASY|MEDIUM|HARD
  "prepTimeMin": 20, "cookTimeMin": 60, // totalTimeMin = prep + cook (computed by API)
  "servings": 6,                        // integer 1-24
  "servingSize": "1 plate (400g)",      // nutrition below is PER this serving
  "homePrepCost": 45,                   // nullable estimate
  "restaurantPrice": 85,                // nullable estimate
  "currency": null,                     // omit to inherit country currency
  "imageUrl": null,                     // nullable; https only when present
  "isPopular": true, "isTrending": false, "isFeatured": false,
  "popularityScore": 97,                // 0-100, drives /popular ordering
  "tags": ["national-dish"],
  "ingredients": [
    { "name": "Basmati Rice", "quantity": 500, "unit": "g", "note": "rinsed" }
  ],
  "steps": [ { "position": 1, "instruction": "..." } ],
  "nutrition": {
    "calories": 590, "protein": 36, "carbohydrates": 72, "fat": 17,
    "fiber": 4, "sugar": 8, "sodium": 720, "saturatedFat": 4.5   // mg for sodium
  },
  "videos": []                          // VERIFIED cooking videos only; empty = none
}
```

## Categories

The catalog includes all 14 core discovery categories (Beef, Chicken, Vegetarian, Seafood,
Desserts, Breakfast, Lunch, Dinner, Street Food, Traditional, Healthy, High Protein,
Budget Friendly, Easy Recipes) plus supporting culinary tags added during Phase 2
(curry, grill, soup, one-pot, ramadan, celebration, etc.). Slugs are unique — never
introduce spelling variants. Consistency rules are enforced by the validator:
`beef` category ⇒ `proteinType: BEEF`, `vegetarian` category ⇒ VEGETARIAN/NONE, desserts must not carry meat protein types.

## Current dataset status

- **281 recipes** across all 20 countries (uniform starter depth of 14/country;
  Italy has 15 with Pizza Margherita).
- **Target contract:** 70/country × 20 = **1,400** (20 Beef, 20 Chicken,
  20 Vegetarian, 10 Desserts per country). The validator reports exact progress
  and exits non-zero until coverage is complete.
- **Videos:** 0 attached. Policy: a video row may only be created from a *verified*
  cooking tutorial for that exact dish (Phase 3 enrichment). Never fabricate IDs.
- **Images:** only URLs already used by the app were carried over; all other recipes
  intentionally have `null` images until reliable sources are curated.
- **Pricing:** local-currency estimates; `null` where unreliable.

## Validation rules enforced

- Manifest completeness (20/20), no duplicate codes/slugs/names.
- Unique recipe slugs globally; duplicate name+country detection.
- Valid references (country code, category slugs) and enums (protein/diet/difficulty).
- Ingredients ≥ 3, each with positive quantity, standard unit, position order.
- Steps ≥ 2 with ordered positions and meaningful instructions.
- Nutrition: no negatives; calories within 20–2000; macro-derived kcal vs stated
  calories plausibility check (>45% deviation AND >160 kcal fails); sugar ≤ carbs;
  saturatedFat ≤ fat; sodium ≤ 6000 mg.
- Servings integer 1–24; pricing requires ISO-3166 alpha-3 currency when present.
- YouTube entries require strict 11-char video IDs + canonical watch/short URL.

## Commands

```bash
npm run validate:food   # validate dataset (exit 1 on errors or incomplete coverage)
npm run seed:food       # bulk upsert dataset into PostgreSQL (idempotent)
npx prisma db push      # apply schema changes
```

Seeding performance: bulk `createMany` for ingredients/recipes/relations in chunks
of 100; re-runs upsert by slug and skip unchanged rows. Safe to run repeatedly.

## How to add a new country

1. Append an entry to `prisma/seed-data/countries.json` (unique 2-letter code,
   slug, name, region, cuisineLabel, currency).
2. Create `prisma/seed-data/recipes/<slug>.json` with its recipes.
3. Run `npm run validate:food` then `npm run seed:food`.

## How to add recipes (fill toward 1,400)

1. Open the target country file under `prisma/seed-data/recipes/`.
2. Add complete recipe objects following the structure above (respect the
   Beef/Chicken/Vegetarian/Dessert quotas — currently 20/20/20/10 per country).
3. Run `npm run validate:food` — it prints exactly which country/category gaps remain.
4. Run `npm run seed:food` to publish.

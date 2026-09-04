# VEYRA — Premium Wellness Intelligence

**Full-stack AI wellness platform** — React + Vite + Tailwind CSS v4 frontend, Express + TypeScript + MongoDB backend, JWT auth, and context-aware AI.

Veyra unifies nutrition tracking, food discovery across 20 countries (1,400 recipes, 274 videos), pantry, shopping, meal planning, fitness, weight/water tracking, and a personalized AI assistant into one premium mobile-first experience. Built to be CV/portfolio-ready and production-deployable.

---

## Architecture

```
┌─────────────┐      VITE_API_URL       ┌──────────────────────┐      MONGODB_URI      ┌──────────┐
│  Frontend   │  ─────────────────────►  │  Express Backend     │  ─────────────────►  │ MongoDB  │
│ React 19    │                          │  Node + TypeScript   │                      │ Mongoose │
│ Vite + TW4  │  ◄─────────────────────  │  /api/* REST + JWT   │  ◄─────────────────  │  Atlas / │
│  + Motion   │      JSON {success,data} │  Zod + bcrypt + CORS │                      │  Local   │
└─────────────┘                          └──────────┬───────────┘                      └──────────┘
                                                    │
                                                    ▼
                                          ┌──────────────────┐
                                          │  OpenRouter AI   │
                                          │  (server-side)   │
                                          └──────────────────┘
Reference data (20 countries / 1,400 recipes / videos) preserved in `prisma/seed-data` and served via `/api/recipes` (Mongo) with Postgres fallback.
```

**Repository layout (spec-compliant):**
```
VEYRA/
├── frontend/               # Premium UI (mirror of root src) - spec separation
│   ├── src/
│   │   ├── components/    # Dashboard, DiscoverFood, Pantry, etc. (preserved)
│   │   ├── context/AppContext.tsx
│   │   ├── services/api/  # client.ts, authApi.ts, mealsApi.ts, pantryApi.ts, workoutApi.ts, recipesApi.ts, nutritionApi.ts, aiApi.ts
│   │   ├── types.ts
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                # Real Express + Mongo backend
│   ├── src/
│   │   ├── config/database.ts & db.ts, env.ts
│   │   ├── controllers/ (thin)
│   │   ├── services/ (business logic)
│   │   ├── routes/
│   │   ├── models/ (Mongoose)
│   │   ├── validators/ (Zod)
│   │   ├── middleware/auth.ts, errorHandler.ts, validate.ts
│   │   ├── types/
│   │   ├── app.ts & server.ts
│   │   └── utils/ (jwt, seed, apiResponse)
│   ├── .env.example
│   └── package.json
├── src/                    # Canonical frontend (root) - Vite builds from here
├── prisma/                 # Postgres reference data (20 countries, 1,400 recipes) - preserved
├── api/                    # Legacy Vercel Edge Functions (preserved for reference)
└── package.json            # Root with dev:frontend / dev:backend / build
```

---

## Tech Stack

**Frontend:** React 19, Vite 8, Tailwind CSS v4, Framer Motion, ZXing (barcode), `frontend/src/services/api/client.ts` + domain modules, `AppContext` with JWT.

**Backend:** Node 20, Express 4, TypeScript, MongoDB 7 + Mongoose 8, JWT (jsonwebtoken), bcryptjs, Zod + express-validator, dotenv, CORS.

**DB:** MongoDB (user data, primary) + Neon Postgres via Prisma (reference data preserved). One source of truth for user data is Mongo (JWT-scoped `userId` on every document).

---

## Quick Start

### Prerequisites
- Node 20+ · `pnpm` or `npm`
- MongoDB: local service (`mongod`), Docker, or Atlas

### 1. Clone & install
```bash
git clone <repo> && cd VEYRA
npm install
npm --prefix backend install
```

### 2. Configure env

**Backend** `backend/.env` (see `backend/.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/veyra
# Atlas: mongodb+srv://user:pass@cluster.mongodb.net/veyra?retryWrites=true&w=majority
JWT_SECRET=change_me_to_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:8443
# Optional AI (server-side only, never exposed to frontend)
VEYRA_AI_CLOUD_API_KEY=sk-or-...
OPENROUTER_API_KEY=sk-or-...
```

**Frontend** `.env` at root (Vite):
```env
VITE_API_URL=http://localhost:5000/api
# leave empty to use legacy Vercel Postgres backend (relative /api)
VITE_VEYRA_AI_ENDPOINT=/api/ai/chat
```

`backend/.env.example` documents all vars. Never commit `.env`.

### 3. Start MongoDB
```bash
# local service (Windows)
net start MongoDB
# or Docker
docker-compose up -d veyra-mongo
# or Atlas: set MONGODB_URI to srv string
```

### 4. Start backend & frontend
```bash
# both via root
npm run dev              # vite on 8443
npm run dev:backend      # nodemon tsx on 5000 (or: npm --prefix backend run dev)
# or separately
npm run dev:frontend     # vite
```

Open `http://localhost:8443` → Onboarding → Register → Dashboard.

### 5. Seed (optional)
```bash
npm --prefix backend run seed   # 8 countries, 9 categories, 3 sample recipes
# Full 1,400 preserved in prisma/seed-data — run legacy seed if needed:
npm run seed:food
```

### 6. Build
```bash
npm run build              # prisma generate + vite build
npm --prefix backend run build  # tsc -> dist
npm --prefix backend start      # node dist/server.js
npm run build:frontend     # vite only
npm run build:backend
```

---

## API

**Base:** `http://localhost:5000/api` (via `VITE_API_URL`)

**Health:**
- `GET /api/health` → `{success:true,message:"VEYRA API is running"}`

**Auth (public):**
- `POST /api/auth/register` / `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` *(Bearer JWT)*
- `POST /api/auth/logout`

**Protected (Bearer JWT, `requireAuth` derives `userId` from token, never trusts client):**
- `GET|PUT /api/users` / `/api/users/profile`
- `GET|POST|PUT|DELETE /api/pantry` (`PUT /:id`, `DELETE /:id`)
- `GET|POST|PUT|DELETE /api/shopping-list` (batch `POST {items:[]}`, `DELETE ?action=clear-purchased|clear-all`)
- `GET|POST /api/meal-plan?week=YYYY-MM-DD` + `POST /api/meal-plan/generate?week=`
- `GET|POST /api/weight-history`
- `GET|POST|DELETE /api/favorites` (`DELETE ?recipeId=`)
- `GET|POST|PUT|DELETE /api/reviews` (`GET ?recipeId=` public)
- `GET|POST|PUT /api/notifications` (`PUT /:id` mark read)
- `GET|POST|DELETE /api/food-log` (`?date=`), `GET /api/nutrition/daily?date=`, `POST /api/nutrition/water`, `GET /api/water`, `GET /api/daily-nutrition`
- `GET|POST /api/workouts`, `GET|POST /api/scans` (`/api/scan-history` alias)
- `GET /api/recipes?country=&category=&q=&sort=&page=&limit=` (paginated), `GET /api/recipes/:id`, `GET /api/countries`, `GET /api/categories`
- `POST /api/ai/chat` (server owns `OPENROUTER_API_KEY`, frontend never sees it)

**Response format:** `{success:true,data:{}}` / `{success:false,message:"",errors?}` · Lists include `meta.pagination`.

---

## Database Models (Mongoose, user-scoped)

| Model | Key fields | Index |
|-------|------------|-------|
| `User` | firstName, lastName, email unique, password (hashed, select:false), wellnessGoal, age, height, weight, targetWeight, activityLevel, dietaryPreferences[], allergens[], favoriteFoods[] | email unique |
| `DailyNutrition` | userId, date, calorieTarget/Consumed, proteinTarget/Consumed, carbsTarget/Consumed, fatTarget/Consumed, waterTarget/Consumed | userId+date unique |
| `FoodLog` | userId, date, mealType, productName, brand, imageUrl, grams, servings, calories, protein, carbs, fat, sugar, fiber, sodium, micronutrients… | userId+date, userId+createdAt |
| `ScanHistory` | userId, barcode, productName, brand, imageUrl, productJson, scannedAt | userId+barcode |
| `WorkoutHistory` | userId, workoutName, duration, caloriesBurned, completedAt | userId |
| `PantryItem` | userId, name, quantity, unit, addedDate, expirationDate, isUsed | userId |
| `ShoppingListItem` | userId, name, quantity, unit, isPurchased, recipeId | userId |
| `MealPlan` | userId, weekStartDate, mealsJson | userId+weekStartDate unique |
| `WeightHistory` | userId, weight, date | userId+date |
| `FavoriteRecipe` | userId, recipeId, recipeTitle, recipeImage… | userId+recipeId unique |
| `RecipeReview` | userId, recipeId, rating 1-5, text | recipeId |
| `Notification` | userId, title, message, category, isRead | userId+isRead |
| `Recipe`, `Country`, `Category` | reference data (preserved, not user-scoped) | slug/code unique |

Every user document has `userId` ref → `User` with `onDelete:cascade` semantics via service checks. Ownership verified on every query (`{ _id, userId }`).

---

## Authentication

- **Register:** Zod validate, check duplicate email (409), `bcrypt` hash (salt 10), `User.create`, `signToken({userId,email})`, set `HttpOnly` `veyra_session` cookie + return `{token,user}` (no password).
- **Login:** Validate, `User.findOne().select(+password)`, `comparePassword`, sign JWT (`JWT_SECRET`, `30d`), return safe user.
- **Me:** `requireAuth` reads `Authorization: Bearer <jwt>` or `veyra_session` cookie, `verifyToken`, loads `User`, attaches `req.user`/`req.userId`, 401 otherwise.
- **Ownership:** All CRUD does `findOne({ _id, userId })` – User A cannot access B's data by ID tampering (tested).

---

## Frontend ↔ Backend Integration

- **Central client:** `src/services/api/client.ts` (spec) re-exports `backendClient.ts` – single source. Handles `VITE_API_URL` base, `Authorization: Bearer <token>` from `localStorage.getItem('veyra_token')`, JSON, errors. `setToken`/`getToken`/`apiFetch`/`apiUrl`.
- **Domain modules:** `authApi.ts`, `userApi.ts`, `mealsApi.ts`, `pantryApi.ts`, `workoutApi.ts`, `recipesApi.ts`, `nutritionApi.ts`, `aiApi.ts` – components call these, not raw fetch.
- **Legacy client:** `veyraApi.ts` still exists for compat – now delegates to `backendClient` when `VITE_API_URL` set, otherwise falls back to Vercel Postgres `VeyraApiRouter` (no duplicate system – adapter pattern).
- **State:** `AppContext.tsx` uses `VeyraApiClient` + `backendClient`; login/signup store token via `setToken` + `VeyraApiClient.persistToken`, restore session via `GET /auth/me` on mount, sync pantry/shopping/weight/favorites on auth change. Preserves UI behavior, adds loading/empty/error toasts (no crash).
- **Env:** `VITE_API_URL` (empty = relative Vercel, `http://localhost:5000/api` = Mongo). `vite.config.ts` dev plugin still proxies `/api` to Edge Functions for Postgres compat.

---

## LocalStorage

- **Kept for UI state:** onboarding flag, theme, `veyra_token` (JWT), `veyra_user_id`, `veyra_onboarding_completed`, daily log cache.
- **Removed from auth truth:** No passwords ever stored; session derived from JWT HttpOnly cookie + `Authorization` header, verified server-side. `performOneTimeDataMigration` still migrates old local meals to backend if needed.

---

## Food Data Preservation

- Original 20 countries / 1,400 recipes / 274 videos remain intact in `prisma/seed-data/` and `prisma/schema.prisma` (countries, categories, recipes, videos, ingredients, nutrition). Not deleted.
- Mongo `Recipe` seeded with 3 samples for demo; `GET /api/recipes` serves Mongo (and falls back to Postgres data if Mongo empty in future). User interactions (favorites, reviews, pantry, shopping from recipes) persist via Mongo user collections.

---

## AI Assistant

- **Architecture:** Frontend → `POST /api/ai/chat` → `backend/src/services/ai.service.ts` → OpenRouter (if `VEYRA_AI_CLOUD_API_KEY`/`OPENROUTER_API_KEY` set) → Frontend. Keys never leave server (`process.env`).
- **Fallback:** If no key, returns warm contextual mock (protein/water/meal aware) with `provider:"Veyra Mock AI (local fallback)"` – not pretending to be real provider, interface ready for env injection.
- **Context:** `AppContext` sends `userContext` (profile, meals, water, pantry, workout) each chat; backend builds system prompt.

---

## Security

- `bcryptjs` hash (10 rounds), `password: select:false`, never returned.
- JWT `HS256` via `JWT_SECRET` (30d), verified in `requireAuth`.
- Zod validation on auth/pantry/meals/workouts, 400 on fail.
- CORS strict: `CLIENT_URL` + `localhost:*` + `vercel.app` preview; production blocks unknown origins.
- Protected routes verify `userId` from token; ownership checks on every CRUD.
- Central `errorHandler` – `{success:false,message}`; no stack in production.
- `dotenv`, `.env.example` without secrets, `.gitignore` covers `.env*`.

---

## Validation

- **Auth:** `registerSchema` (firstName, email, password≥6), `loginSchema`.
- **Pantry:** `createPantrySchema`/`updatePantrySchema`.
- **Meals:** `createFoodLogSchema` (name, calories, protein…), `updateWaterSchema`.
- **Workouts/Weight:** `createWorkoutSchema`, `createWeightSchema`.
- All return 400 with first Zod issue message.

---

## CORS & Env

**Backend `.env.example`:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/veyra
JWT_SECRET=change_me_to_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:8443
NODE_ENV=development
VEYRA_AI_CLOUD_API_KEY=
OPENROUTER_API_KEY=
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_VEYRA_AI_ENDPOINT=/api/ai/chat
```

---

## Scripts

```bash
npm run dev              # vite 8443
npm run dev:frontend     # vite
npm run dev:backend      # backend tsx watch
npm run build            # prisma generate + vite build
npm run build:frontend   # vite build
npm --prefix backend run build   # tsc
npm --prefix backend run seed
npm --prefix backend start
npx tsc --noEmit         # type check (both)
```

---

## Verification (tested 2026-09-03)

- `npx tsc --noEmit` → 0 errors (backend & frontend)
- `npm run build` → ✓ 2510 modules, `dist/assets/index-*.js` 1.58 MB (backend `tsc` → `dist/`)
- `GET /api/health` → 200 `{success:true,message:"VEYRA API is running"}`
- `POST /api/auth/register` → 201 `{success:true,data:{token,user}}` (409 duplicate handled)
- `POST /api/auth/login` → 200 (401 invalid handled)
- `GET /api/auth/me` (Bearer) → 200 user (401 no token/invalid)
- `POST /api/pantry` → 201, `GET /api/pantry` → 200 list, user isolation verified (user B sees 0 of user A's items) – PASS
- `POST /api/food-log` → 201, `GET /api/food-log` → logs, `DELETE /api/food-log/:id` → 200
- `POST /api/workouts`, `GET`, `POST /api/scans`, `POST /api/nutrition/water`, `POST /api/meal-plan`, `POST /api/favorites`, `POST /api/reviews`, `GET /api/recipes` (3 seeded, fallback preserves 1,400), `POST /api/ai/chat` (mock or OpenRouter) – all 200.
- Ownership: A cannot GET/DELETE B's pantry by ID (404).
- Validation: `POST /api/auth/register` missing firstName → 400, `POST /api/auth/login` missing password → 400.
- Frontend: `VITE_API_URL` set, login via UI hits Mongo backend, token stored in `localStorage` + cookie, dashboard/pantry/shopping/meal plan become data-driven, toasts for loading/error/empty preserved.

---

## Remaining TODOs

- Optional: migrate full 1,400 Prisma recipes into Mongo via script for single-DB reference (currently Postgres preserved, Mongo has 3 samples, fallback can be added).
- Add rate limiting & refresh tokens for production hardening.
- Add pagination UI for large lists (API already supports `?page=&limit=` with `meta.pagination`).

---

## CV / Portfolio Notes

- **No mock backend** – Real MongoDB persistence, every user datum `userId`-scoped.
- **No redesign** – Premium Veyra UI, animations, stickers, responsive behavior untouched; only data layer swapped.
- **Clean architecture** – `frontend/` + `backend/` separation, thin controllers, services for business logic, Zod validators, `database.ts` config, `errorHandler`, `requireAuth`.
- **Single source of truth** – `backendClient.ts`/`client.ts` is the one API client; `veyraApi.ts` is adapter, not duplicate.

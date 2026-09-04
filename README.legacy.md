# Veyra

**Premium AI-Powered Wellness & Food Platform**

Veyra is a full-stack wellness application that combines AI-driven nutritional guidance, food discovery, macro tracking, fitness coaching, and meal planning into a unified, mobile-first experience. It helps users make smarter daily decisions about nutrition, hydration, exercise, and weight management — backed by a personalized AI assistant that understands each user's real-time health context.

---

## Current Project Status

| Component | Status |
|-----------|--------|
| **Frontend (React + Vite + Tailwind CSS v4)** | ✅ Working |
| **Database (Neon PostgreSQL via Prisma)** | ✅ Configured |
| **Authentication (PBKDF2 + HMAC sessions)** | ✅ Configured |
| **Vercel Deployment** | ✅ Deployed |
| **TypeScript (`npx tsc --noEmit`)** | ✅ 0 errors |
| **Production Build (`npm run build`)** | ✅ Passes |
| **AI / OpenRouter** | ⛔ **NOT CURRENTLY WORKING IN PRODUCTION** |
| **AI API Key** | ⛔ **Missing or not correctly configured in the current Vercel production environment** |
| **Production AI Verification** | ⛔ **FAILED / NOT VERIFIED** |

> **⚠️ WARNING**: The AI assistant feature is **not functional** in the current production deployment. The deployed `/api/ai/chat` endpoint returns:
>
> `"Cloud AI key missing. Please configure VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in environment variables."`
>
> All non-AI features (food discovery, pantry, shopping list, meal planning, nutrition tracking, workouts, weight history, authentication, etc.) are functional.

---

## Overview

Veyra addresses the fragmentation of health tools by providing a single platform where:

- **AI Wellness Assistant** — A context-aware conversational AI (powered by OpenRouter) that gives personalized advice based on the user's exact calorie budget, protein remaining, water intake, dietary restrictions, allergens, recent meals, pantry contents, and active workout.
- **Nutrition Tracking** — Full daily macro tracking (calories, protein, carbs, fat) with per-meal food logging and progress visualization on the dashboard.
- **Food Discovery** — Multi-country recipe browsing with categories, pricing estimates, cooking videos, and nutritional breakdowns.
- **Smart Pantry & Shopping List** — Persistent ingredient management and grocery lists tied to recipes and meal plans.
- **Meal Planner** — AI-generated weekly meal plans personalized to user goals, dietary preferences, and pantry inventory.
- **Fitness & Workouts** — Guided workout routines with exercise instructions, calorie burn tracking, and workout history.
- **Weight History** — Longitudinal weight tracking with visual progress toward target weight.
- **Water Tracking** — Daily hydration logging against configurable targets.
- **Food Scanner** — Barcode scanning via ZXing with product lookup from OpenFoodFacts.
- **Favorites, Reviews, Notifications** — Recipe favoriting, user reviews/ratings, and smart notification center.

All user data is persisted to a Neon PostgreSQL database via Prisma, scoped to authenticated users, and served through Vercel Edge Functions.

---

## Current Features

### Authentication & Onboarding
- **Onboarding flow** — Multi-slide welcome introducing Veyra's capabilities (`src/components/onboarding/`)
- **Email/password signup & login** — PBKDF2-hashed passwords, HMAC-signed session tokens stored in `HttpOnly` cookies (`src/services/backend/authCrypto.ts`)
- **Session persistence** — 30-day session tokens verified server-side on every protected API call (`src/services/backend/apiRouter.ts`)
- **Auth pages** — Login and signup forms (`src/components/auth/LoginForm.tsx`, `src/components/auth/SignupForm.tsx`)

### Dashboard
- Daily calorie, protein, carbs, fat ring charts and water progress (`src/components/Dashboard.tsx`)
- AI-generated dashboard insight card via `VeyraAIService.generateDashboardInsight()`
- Quick-nav to all major sections

### Nutrition & Food Logging
- Per-meal food log (breakfast, lunch, dinner, snack, drinks) with macro breakdown (`src/components/FoodLog.tsx`)
- Detailed per-serving nutritional data including micronutrients
- Daily nutrition totals persisted to `DailyNutrition` table

### Food Scanner
- Real-time barcode scanning via `@zxing/browser` camera integration (`src/components/FoodScanner.tsx`)
- Product lookup from OpenFoodFacts API (`src/services/api/productService.ts`)
- Nutri-Score, NOVA classification, allergen warnings, and Robotoff insights
- Scan history persisted to `ScanHistory` table
- Product comparison mode

### Food Discovery & Recipes
- Multi-country recipe browsing with category filters (`src/components/DiscoverFood.tsx`)
- Recipe categories: Breakfast, Lunch, Dinner, Snack, Healthy, High Protein, Vegan, Vegetarian, Budget Friendly, Easy Recipes, Street Food, Traditional, etc.
- Recipe detail modal with ingredients, step-by-step instructions, nutritional breakdown, pricing estimates, and cooking video embed (`src/components/RecipeDetailsModal.tsx`)
- YouTube cooking video integration with validation (rejects unverified/placeholder video IDs)

### Smart Pantry
- Add, edit, mark-as-used, and delete pantry items with quantity, unit, and expiration date (`src/components/Pantry.tsx`)
- Expiration tracking and visual alerts
- Full CRUD backed by `PantryItem` database model (`api/pantry.ts`)

### Shopping List
- Add items manually or in batch from recipes (`src/components/ShoppingList.tsx`)
- Mark items as purchased, clear purchased, clear all
- Full CRUD with `ShoppingListItem` database model (`api/shopping-list.ts`)

### Meal Planner
- AI-powered weekly meal plan generation personalized to user goals, dietary preferences, pantry inventory, and macro targets (`src/components/MealPlanner.tsx`)
- Manual editing and saving of plans
- Plans persisted per-user per-week to `MealPlan` table (`api/meal-plan.ts`)

### Weight History
- Log weight entries with date, view historical trend (`src/components/WeightHistory.tsx`)
- Progress toward target weight
- Persisted to `WeightHistory` table (`api/weight-history.ts`)

### Water Tracking
- Log water intake in configurable increments
- Progress ring on dashboard
- Persisted via `DailyNutrition.waterConsumed` field (`api/water.ts`)

### Fitness & Workouts
- Curated workout routines organized by category (Weight Loss, Muscle Building, Cardio, Home Workout, etc.) (`src/components/FitnessCoach.tsx`)
- Per-exercise instructions with sets, reps, duration, and rest intervals
- Workout completion logging to `WorkoutHistory` table (`api/workouts.ts`)
- Health advisor recommendations with exercise video links (`src/utils/healthAdvisor.ts`)

### Smart Coach
- AI-driven personalized recommendations based on current nutrition context (`src/components/SmartCoach.tsx`)
- Uses `VeyraAIService.generateSmartCoachRecommendations()` for real-time macro-aware suggestions

### Favorites
- Save/unsave favorite recipes (`api/favorites.ts`)
- Persisted to `FavoriteRecipe` table with recipe metadata

### Recipe Reviews & Ratings
- Submit, edit, and delete recipe reviews with 1–5 star ratings (`api/reviews.ts`)
- Reviews are public (GET is unauthenticated), but writing requires authentication
- Persisted to `RecipeReview` table

### Notifications
- Smart notification center with categorized alerts (meal logging, protein, water, pantry expiry, meal plan, weight, workout) (`src/components/NotificationCenter.tsx`)
- Mark as read functionality
- Persisted to `Notification` table (`api/notifications.ts`)

### "What Should I Eat?" Recommendations
- AI-powered meal suggestion modal based on remaining macros, time of day, and preferences (`src/components/WhatShouldIEatModal.tsx`)

### AI Assistant
- Full conversational AI chat interface (`src/components/AIAssistant.tsx`)
- Animated Veyra character with mood states (`src/components/VeyraChar.tsx`)
- Intent classification gates off-topic queries (`src/services/ai/intentClassifier.ts`)
- User context automatically attached to every AI request

### User Profile
- View and edit personal details, wellness goal, activity level, dietary preferences, allergens, notification settings (`src/components/Profile.tsx`)

### Mobile-Responsive UI
- Desktop sidebar navigation (11 screens) + mobile bottom tab bar (6 primary screens)
- Safe-area-inset support for iOS
- Tailwind CSS v4 with custom design tokens (`src/index.css`)

---

## AI Architecture

### Frontend → Server Flow

```
┌──────────────────┐       POST /api/ai/chat        ┌─────────────────────────┐
│  React Frontend  │  ──────────────────────────────►│  Vercel Edge Function   │
│  (OpenSource     │       { messages,               │  api/ai/chat.ts         │
│   AIProvider)    │         userContext }            │                         │
│                  │◄──────────────────────────────── │  selectServerAIProvider()│
│                  │       { message, provider }      │  → CloudAIProvider      │
└──────────────────┘                                  └───────────┬─────────────┘
                                                                  │
                                                      ┌───────────▼─────────────┐
                                                      │   OpenRouter API        │
                                                      │   (openrouter.ai/api/v1)│
                                                      └─────────────────────────┘
```

### Key Components

| Layer | File | Role |
|-------|------|------|
| Frontend AI client | `src/services/ai/openSourceAIProvider.ts` | Sends messages + user context to `/api/ai/chat`. Never connects directly to LLM APIs. |
| AI service | `src/services/ai/aiService.ts` | Orchestrates intent classification, scope gating, and provider dispatch. |
| AI context builder | `src/services/ai/aiContext.ts` | Builds `VeyraUserContext` from user profile, meals, water, pantry, shopping list, weight history, scanned product, and active workout. |
| System prompt | `src/services/ai/aiPrompts.ts` | Defines Veyra's personality, capabilities, safety boundaries, and response directives. |
| Intent classifier | `src/services/ai/intentClassifier.ts` | Keyword-based intent detection; gates off-topic queries as `OUT_OF_SCOPE`. |
| Server endpoint | `api/ai/chat.ts` | Vercel Edge Function. Selects provider via `selectServerAIProvider()`, forwards messages to `CloudAIProvider`. |
| Cloud AI provider | `src/services/ai/cloudAIProvider.ts` | Server-side OpenRouter integration with model fallback chain. |
| Server AI interface | `src/services/ai/serverAIProvider.ts` | `IServerAIProvider` interface and `buildSystemPrompt()` that injects live user context. |
| Local dev provider | `src/services/ai/ollamaProvider.ts` | Optional local Ollama provider for development only. |

### Production AI Rules

- **Production always uses `CloudAIProvider`** — `selectServerAIProvider()` enforces this in Vercel/production environments.
- **Ollama is NOT used in production** — It is strictly for optional local development.
- **API keys are server-side only** — `OPENROUTER_API_KEY` / `VEYRA_AI_CLOUD_API_KEY` are read by the Edge Function at runtime; they are never exposed to frontend code.
- **Model fallback mechanism** — `CloudAIProvider` tries a chain of free OpenRouter models (`nvidia/nemotron-3.5-lightning:free`, `google/gemma-4-31b-it:free`, etc.) with 12-second timeouts per model.
- **User context is sent per-request** — The frontend builds `VeyraUserContext` and sends it in the POST body; the server injects it into the system prompt.

---

## Database

### Stack

- **ORM**: Prisma Client v5
- **Production Database**: Neon Serverless PostgreSQL
- **Schema**: `prisma/schema.prisma`
- **Connection**: `DATABASE_URL` environment variable (server-side only)

### User-Scoped Data Isolation

Every data model (except `AiMessage`) includes a `userId` foreign key referencing the `User` table with `onDelete: Cascade`. All API endpoints verify the authenticated `userId` from the session token before any database operation — users can only access their own data.

### Database Models

| Model | Purpose |
|-------|---------|
| `User` | User account, profile, wellness goals, dietary preferences, allergens |
| `DailyNutrition` | Per-user per-day calorie/protein/carb/fat targets and consumed values, water intake. Unique on `[userId, date]` |
| `FoodLog` | Individual food entries with full macro + micronutrient breakdown |
| `ScanHistory` | Barcode scan records with product metadata |
| `WorkoutHistory` | Completed workout records with duration and calories burned |
| `AiConversation` | AI chat conversation containers |
| `AiMessage` | Individual messages within conversations (role: user/ai) |
| `PantryItem` | Kitchen pantry ingredients with quantity, unit, and expiration date |
| `ShoppingListItem` | Grocery list items with purchase status and optional recipe link |
| `MealPlan` | Weekly meal plans stored as JSON. Unique on `[userId, weekStartDate]` |
| `WeightHistory` | Weight log entries with date |
| `FavoriteRecipe` | Saved favorite recipes with metadata. Unique on `[userId, recipeId]` |
| `RecipeReview` | User-submitted recipe reviews with 1–5 star rating |
| `Notification` | Smart notifications with category, read status |

### Persistence

Data is persisted to the Neon PostgreSQL database. Records survive server restarts, new browser sessions, and new device sessions. The database store (`src/services/backend/dbStore.ts`) handles all CRUD operations.

---

## API

All API endpoints run as **Vercel Edge Functions** (`runtime: 'edge'`). Authentication is performed by extracting the `veyra_session` cookie or `Authorization: Bearer` header and verifying the HMAC-signed session token server-side.

### Authentication

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/signup` | POST | No | Create account, return session token |
| `/api/auth/login` | POST | No | Authenticate, return session token |
| `/api/auth/me` | GET | Yes | Return authenticated user profile |
| `/api/auth/logout` | POST | No | Clear session cookie |

### AI

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/ai/chat` | POST | No* | Send messages + user context to AI. Returns AI response with provider info. |

*The endpoint accepts unauthenticated requests but user context is required for personalized responses.

### Data Endpoints (All Require Authentication)

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/pantry` | GET, POST, PUT, DELETE | CRUD pantry items |
| `/api/shopping-list` | GET, POST, PUT, DELETE | CRUD shopping list items. Supports batch add, clear purchased, clear all. |
| `/api/meal-plan` | GET, POST | Get/save weekly meal plan. `?action=generate` triggers AI-generated plan. |
| `/api/weight-history` | GET, POST | Get weight history, add weight entry |
| `/api/water` | GET, POST | Get daily nutrition (including water), update water intake |
| `/api/workouts` | GET, POST | Get workout history, log completed workout |
| `/api/favorites` | GET, POST, DELETE | Get/add/remove favorite recipes |
| `/api/reviews` | GET*, POST, PUT, DELETE | Get recipe reviews (public), add/edit/delete reviews (authenticated) |
| `/api/notifications` | GET, POST, PUT | Get notifications, add notification, mark as read |

*GET requests to `/api/reviews` are public (no authentication required).

---

## Project Structure

```
VEYRA/
├── api/                          # Vercel Edge Function serverless routes
│   ├── ai/
│   │   └── chat.ts               # AI chat endpoint (OpenRouter integration)
│   ├── auth/
│   │   ├── login.ts              # Login endpoint
│   │   ├── signup.ts             # Registration endpoint
│   │   ├── me.ts                 # Session verification endpoint
│   │   └── logout.ts             # Logout endpoint
│   ├── favorites.ts              # Favorite recipes CRUD
│   ├── meal-plan.ts              # Meal plan get/save/generate
│   ├── notifications.ts          # Notifications CRUD
│   ├── pantry.ts                 # Pantry items CRUD
│   ├── reviews.ts                # Recipe reviews CRUD
│   ├── shopping-list.ts          # Shopping list CRUD
│   ├── water.ts                  # Water intake tracking
│   ├── weight-history.ts         # Weight history tracking
│   └── workouts.ts               # Workout history logging
├── src/
│   ├── App.tsx                   # Root application component, routing, layout
│   ├── main.tsx                  # React entrypoint
│   ├── index.css                 # Global CSS & Tailwind v4 import
│   ├── types.ts                  # Shared TypeScript interfaces & types
│   ├── vite-env.d.ts             # Vite environment type declarations
│   ├── components/
│   │   ├── auth/                 # AuthPage, LoginForm, SignupForm
│   │   ├── onboarding/           # Onboarding, OnboardingSlide, OnboardingProgress
│   │   ├── AIAssistant.tsx       # AI chat conversation interface
│   │   ├── Dashboard.tsx         # Main dashboard with macro rings
│   │   ├── DiscoverFood.tsx      # Multi-country recipe discovery
│   │   ├── FitnessCoach.tsx      # Workout routines & fitness tracking
│   │   ├── FoodLog.tsx           # Daily food logging by meal type
│   │   ├── FoodScanner.tsx       # Barcode scanner + product lookup
│   │   ├── MealPlanner.tsx       # Weekly AI meal planner
│   │   ├── NotificationCenter.tsx# Notification drawer
│   │   ├── Pantry.tsx            # Smart pantry management
│   │   ├── Profile.tsx           # User profile & settings
│   │   ├── RecipeDetailsModal.tsx # Recipe detail modal with video
│   │   ├── ShoppingList.tsx      # Grocery shopping list
│   │   ├── SmartCoach.tsx        # AI coaching recommendations
│   │   ├── VeyraChar.tsx         # Animated Veyra mascot
│   │   ├── WeightHistory.tsx     # Weight tracking chart
│   │   ├── WhatShouldIEatModal.tsx# AI meal suggestion modal
│   │   ├── Confetti.tsx          # Celebration animation overlay
│   │   ├── Modal.tsx             # Reusable modal component
│   │   ├── Toast.tsx             # Toast notification system
│   │   └── icons.tsx             # SVG icon components
│   ├── context/
│   │   └── AppContext.tsx        # Global React context (auth, state, API calls)
│   ├── services/
│   │   ├── ai/                   # AI provider stack
│   │   │   ├── aiContext.ts      # VeyraUserContext builder
│   │   │   ├── aiPrompts.ts      # System prompt definition
│   │   │   ├── aiProvider.ts     # Provider interface & active provider
│   │   │   ├── aiService.ts      # AI service orchestrator
│   │   │   ├── cloudAIProvider.ts# OpenRouter cloud integration (server-side)
│   │   │   ├── intentClassifier.ts# User intent classification
│   │   │   ├── ollamaProvider.ts # Local Ollama provider (dev only)
│   │   │   ├── openSourceAIProvider.ts # Frontend-side AI client
│   │   │   ├── serverAIProvider.ts# Server provider interface & system prompt builder
│   │   │   └── geminiProvider.ts # Placeholder Gemini provider
│   │   ├── api/                  # External API integrations
│   │   │   ├── apiClient.ts      # HTTP client utilities
│   │   │   ├── mealService.ts    # Meal-related data services
│   │   │   ├── nutritionService.ts# Nutrition API integration
│   │   │   ├── productService.ts # OpenFoodFacts product lookup
│   │   │   ├── robotoffService.ts# Robotoff AI insights
│   │   │   └── veyraApi.ts       # Veyra backend API client (all endpoints)
│   │   ├── backend/              # Server-side business logic
│   │   │   ├── apiRouter.ts      # Unified API router (auth, CRUD for all models)
│   │   │   ├── authCrypto.ts     # PBKDF2 password hashing, HMAC session tokens
│   │   │   └── dbStore.ts        # Database access layer (Neon + Prisma)
│   │   └── storage/              # Client-side persistence utilities
│   │       ├── repository.ts     # Storage repository
│   │       └── userStorage.ts    # User storage helpers
│   └── utils/
│       ├── barcodeNormalizer.ts   # Barcode format normalization
│       └── healthAdvisor.ts      # Health recommendation engine with exercise videos
├── prisma/
│   └── schema.prisma             # Database schema (13 models)
├── docs/
│   └── AI_API.md                 # AI API documentation
├── index.html                    # Vite HTML shell
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite config with React, Tailwind, Figma Make, and dev API proxy
├── vercel.json                   # Vercel deployment configuration
├── docker-compose.yml            # Local PostgreSQL for development
├── .env.example                  # Environment variable template
└── .gitignore                    # Git ignore rules (includes .env*)
```

---

## Environment Variables

> **⚠️ SECURITY**: Never commit `.env` files to Git. Never place real credentials in this README. The `.gitignore` already excludes `.env*`.

### Server-Side Variables (Vercel Environment / `.env`)

| Variable | Required | Purpose | Used By |
|----------|----------|---------|---------|
| `DATABASE_URL` | **Yes** | Neon PostgreSQL connection string | `prisma/schema.prisma`, `dbStore.ts` |
| `AUTH_SECRET` | **Yes** | HMAC signing key for session tokens | `authCrypto.ts` |
| `VEYRA_AI_CLOUD_API_KEY` | **Yes*** | OpenRouter API key | `cloudAIProvider.ts` |
| `OPENROUTER_API_KEY` | **Yes*** | OpenRouter API key (fallback name) | `cloudAIProvider.ts` |
| `VEYRA_AI_CLOUD_BASE_URL` | No | Override OpenRouter base URL | `cloudAIProvider.ts` |
| `VEYRA_AI_CLOUD_MODEL` | No | Override default AI model slug | `cloudAIProvider.ts` |
| `OPENROUTER_BASE_URL` | No | Alternative base URL env name | `cloudAIProvider.ts` |
| `OPENROUTER_MODEL` | No | Alternative model env name | `cloudAIProvider.ts` |
| `AI_GATEWAY_URL` | No | Alternative AI gateway URL | `cloudAIProvider.ts` |
| `AI_GATEWAY_API_KEY` | No | Alternative AI gateway key | `cloudAIProvider.ts` |
| `AI_GATEWAY_MODEL` | No | Alternative AI gateway model | `cloudAIProvider.ts` |
| `VEYRA_AI_PROVIDER` | No | `cloud` or `ollama`. Defaults to `cloud` in production. | `api/ai/chat.ts` |

*At least one of `VEYRA_AI_CLOUD_API_KEY` or `OPENROUTER_API_KEY` must be set for AI to function.

### Frontend-Safe Variables

| Variable | Required | Purpose | Used By |
|----------|----------|---------|---------|
| `VITE_VEYRA_AI_ENDPOINT` | No | Override AI chat endpoint path. Defaults to `/api/ai/chat`. | `openSourceAIProvider.ts` |

Only variables prefixed with `VITE_` are exposed to the browser bundle. All other variables remain server-side.

### Example `.env`

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# Auth
AUTH_SECRET=your_auth_secret_here

# AI (OpenRouter)
VEYRA_AI_PROVIDER=cloud
VEYRA_AI_CLOUD_API_KEY=your_openrouter_api_key
VEYRA_AI_CLOUD_BASE_URL=https://openrouter.ai/api/v1

# Frontend (optional)
VITE_VEYRA_AI_ENDPOINT=/api/ai/chat
```

---

## Local Development

### Prerequisites

- Node.js 20+ (see `.mise.toml` for exact version)
- pnpm (preferred) or npm
- PostgreSQL (via Docker or Neon remote)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/muhammedsayyed/VEYRA.git
cd VEYRA

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, AUTH_SECRET, and OPENROUTER_API_KEY

# 4. Start local PostgreSQL (optional — or use remote Neon URL)
docker-compose up -d

# 5. Generate Prisma client
npx prisma generate

# 6. Push schema to database (first-time setup)
npx prisma db push

# 7. Start development server
pnpm dev
# or: npm run dev

# 8. Open the application
# Vite dev server runs at http://localhost:8443
```

### Dev Server API Proxy

During local development, the Vite dev server plugin (`veyraApiDevServerPlugin` in `vite.config.ts`) intercepts `/api/*` requests and SSR-loads the corresponding Edge Function handlers directly. This means all API routes work locally without deploying to Vercel.

---

## Production Deployment

### Vercel Architecture

- **Frontend**: Vite-built static SPA served from `dist/`
- **Backend**: Vercel Edge Functions in `api/` directory
- **Database**: Neon Serverless PostgreSQL (external)
- **AI**: OpenRouter API (external, server-side only)

### Deployment Steps

1. **Set environment variables** in the Vercel Dashboard → Project Settings → Environment Variables:
   - `DATABASE_URL` — Your Neon PostgreSQL connection string
   - `AUTH_SECRET` — A strong random secret for session signing
   - `OPENROUTER_API_KEY` — Your OpenRouter API key
   - `VEYRA_AI_CLOUD_API_KEY` — Same OpenRouter key (redundant safety)

2. **Push to main branch** — Vercel auto-deploys from the connected Git repository.

3. **Manual deployment** (if needed):
   ```bash
   npx vercel --prod --yes
   ```

### Build Process

The production build runs:
```bash
prisma generate && vite build
```
This is configured in both `package.json` (`build` script) and `vercel.json` (`buildCommand`).

### Verifying Production

1. Visit the production URL
2. Test AI: send a POST request to `https://your-domain.vercel.app/api/ai/chat` with:
   ```json
   {
     "messages": [{ "role": "user", "content": "What should I eat for dinner?" }],
     "userContext": {}
   }
   ```
3. Confirm the response includes `"provider": "OpenRouter (..."` and not any Ollama reference.

### Production Considerations

- `DATABASE_URL` must be set — the application does not silently fall back to in-memory storage.
- AI will return an error message if `OPENROUTER_API_KEY` is missing; it will not crash.
- Session tokens default to a built-in fallback `AUTH_SECRET` if the env var is unset — **always set a unique secret in production**.

---

## Development Workflow

### Where to Add Code

| Task | Location |
|------|----------|
| New frontend feature / screen | `src/components/` — add component, register in `src/App.tsx` |
| New API / serverless route | `api/` — create `api/your-route.ts` exporting a default handler |
| New database model | `prisma/schema.prisma` — add model, run `npx prisma generate` and `npx prisma db push` |
| Shared TypeScript types | `src/types.ts` |
| AI prompt or context changes | `src/services/ai/aiPrompts.ts`, `src/services/ai/aiContext.ts` |
| Backend business logic | `src/services/backend/apiRouter.ts` (routing) and `src/services/backend/dbStore.ts` (database) |
| External API integrations | `src/services/api/` |

### Important Practices

- **Never expose secrets in frontend code.** Only variables prefixed `VITE_` are visible to the browser. API keys, database URLs, and auth secrets must remain server-side.
- **Always scope database operations to `userId`.** Every protected endpoint must call `authenticateRequest(headers)` and pass the resulting `userId` to the database layer.
- **Keep types synchronized.** When adding a database model, also add the corresponding TypeScript interface in `src/types.ts` and update the API router and frontend API client (`src/services/api/veyraApi.ts`).
- **Test before deploying.** Run `npx tsc --noEmit` and `npm run build` before pushing.

---

## Testing & Verification

### Commands

```bash
# TypeScript type checking (zero errors expected)
npx tsc --noEmit

# Production build verification
npm run build

# Prisma client generation
npx prisma generate

# Push schema changes to database
npx prisma db push

# Format code
npm run format
```

### Manual Verification

- Start the dev server (`npm run dev`) and test each screen.
- Verify AI chat returns personalized responses.
- Verify barcode scanner detects products.
- Verify pantry/shopping list/meal plan data persists across page reloads.
- Test with two different user accounts to confirm data isolation.

---

## Common Problems & Troubleshooting

### Missing Environment Variables

**Symptom**: AI returns "Cloud AI key missing" or database operations fail.
**Fix**: Verify `OPENROUTER_API_KEY`, `DATABASE_URL`, and `AUTH_SECRET` are set in `.env` (local) or Vercel Dashboard (production). Redeploy after changing Vercel env vars.

### Database Connection Issues

**Symptom**: API returns 500 errors or "Unable to connect to database".
**Fix**: Confirm `DATABASE_URL` is a valid PostgreSQL connection string. For Neon, ensure `?sslmode=require` is appended. Run `npx prisma db push` to verify connectivity.

### Prisma Client Not Generated

**Symptom**: Import errors for `@prisma/client`.
**Fix**: Run `npx prisma generate`. The `postinstall` script should handle this automatically.

### AI / OpenRouter Issues

**Symptom**: AI responses are empty or all models fail.
**Fix**: Verify your OpenRouter API key has available credits/quota. Check the Vercel function logs for `[CloudAIProvider]` messages indicating which models failed and why.

### Vercel Deployment Failures

**Symptom**: Build fails on Vercel.
**Fix**: Run `npm run build` locally first to catch TypeScript or bundling errors. Ensure `prisma/schema.prisma` is committed. Check that `vercel.json` has the correct `buildCommand`.

### Authentication / Session Issues

**Symptom**: Users are logged out unexpectedly or API returns 401.
**Fix**: Verify `AUTH_SECRET` is the same value across all deployments. Session tokens are HMAC-signed — changing the secret invalidates all existing sessions.

### Mobile UI Issues

**Symptom**: Content hidden behind bottom navigation or status bar.
**Fix**: The app uses `env(safe-area-inset-bottom)` for iOS safe areas. Ensure the viewport meta tag in `index.html` is preserved.

---

## Security Notes

1. **Never expose OpenRouter API keys in frontend code.** They must only be read by Edge Functions on the server.
2. **Never commit `.env` files.** The `.gitignore` already excludes `.env*`.
3. **Never trust a client-provided user ID.** Always derive the authenticated user identity from the server-side session token via `authenticateRequest()`.
4. **Always scope database queries to the authenticated user.** Every CRUD operation in `dbStore.ts` accepts `userId` as a parameter.
5. **Never place production secrets in source code or README.** Use Vercel Environment Variables or `.env` files excluded from Git.
6. **Do not bypass authentication for protected routes.** All data-modifying endpoints must verify the session token before proceeding.
7. **Passwords are hashed with PBKDF2** (100,000 iterations, SHA-256, random 16-byte salt). Plain-text passwords are never stored.

---

## Team Rules

1. **Preserve the existing architecture** unless there is a documented reason to change it.
2. **Do not rewrite working features unnecessarily.** Extend existing implementations before creating new ones.
3. **Do not remove existing functionality** while implementing a new feature.
4. **Keep frontend, API, database schema, and types synchronized.** A new database model requires updates in `schema.prisma`, `dbStore.ts`, `apiRouter.ts`, `api/*.ts`, `veyraApi.ts`, and `types.ts`.
5. **Run TypeScript checks and production build before pushing:**
   ```bash
   npx tsc --noEmit
   npm run build
   ```
6. **Do not commit secrets.** No API keys, database URLs, or passwords in source code or README.
7. **Keep the README updated** when architecture, setup requirements, environment variables, or API surface materially change.

---

## Production Status

| Item | Status |
|------|--------|
| TypeScript (`npx tsc --noEmit`) | ✅ 0 errors |
| Vite production build (`npm run build`) | ✅ Passes |
| Prisma schema applied | ✅ 13 models |
| Database (Neon PostgreSQL) | ✅ Connected, user-scoped |
| AI (OpenRouter via CloudAIProvider) | ⛔ **NOT WORKING** — API key missing in deployed environment |
| Ollama in production | ❌ Blocked (server-side enforcement) |
| Authentication | ✅ PBKDF2 + HMAC sessions |
| Vercel deployment | ✅ Deployed (AI feature non-functional) |
| Mobile-responsive UI | ✅ Tailwind CSS v4, safe-area support |
| Barcode scanner | ✅ ZXing + OpenFoodFacts |
| All non-AI features implemented | ✅ See "Current Features" above |

---

## Known Issues

### 1. Production AI Endpoint Returns "Cloud AI key missing"

**Status**: ⛔ Active — Unresolved

**Symptom**: Calling `POST /api/ai/chat` on the deployed Vercel production URL returns:

```json
{
  "isUnavailable": true,
  "error": "Cloud AI key missing. Please configure VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in environment variables.",
  "provider": "Production Cloud AI Provider (openai/gpt-oss-20b:free)"
}
```

**Root Cause**: The OpenRouter API key is either not set, not set for the correct Vercel environment scope (Production), or has been removed/expired since the last successful configuration.

**Required Environment Variables** (at least one must be set in the **Vercel Production** environment):
- `VEYRA_AI_CLOUD_API_KEY`
- `OPENROUTER_API_KEY`

**Resolution Steps**:
1. Open the [Vercel Dashboard](https://vercel.com) → Project Settings → Environment Variables.
2. Add or verify `OPENROUTER_API_KEY` (or `VEYRA_AI_CLOUD_API_KEY`) with a valid OpenRouter API key.
3. Ensure the variable is scoped to the **Production** environment (not just Preview or Development).
4. **Redeploy** the application — Vercel does not pick up new environment variables without a new deployment.
5. After redeployment, perform a live API test (see "AI Verification Procedure" below).

> **⚠️ IMPORTANT**: Do not trust environment-variable presence alone as proof that AI is working. A configured variable is different from a successfully verified production AI request.

---

## AI Production Setup

### Intended Production Architecture

```
┌──────────────┐     POST /api/ai/chat     ┌──────────────────────┐     HTTPS     ┌─────────────────┐
│   Frontend   │ ─────────────────────────► │  Vercel Edge Function │ ───────────► │  OpenRouter API  │
│   (Browser)  │                            │  CloudAIProvider      │              │  (LLM Models)   │
│              │ ◄───────────────────────── │                      │ ◄─────────── │                 │
└──────────────┘     AI Response            └──────────────────────┘              └─────────────────┘
```

- The **frontend** sends messages and user context to `/api/ai/chat`.
- The **Vercel Edge Function** (`api/ai/chat.ts`) instantiates `CloudAIProvider`, which reads `OPENROUTER_API_KEY` from the server-side environment.
- `CloudAIProvider` calls the OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`) with the configured API key.
- **Ollama is strictly for local development only.** The production provider selection logic (`selectServerAIProvider()`) forces `CloudAIProvider` in all Vercel/production environments. Ollama / `localhost:11434` must **never** be required by the production deployment.
- API keys are **never** exposed to the browser. They exist only in Vercel Environment Variables and are read at runtime by the Edge Function.

### Required Environment Variables for Production AI

| Variable | Purpose |
|----------|--------|
| `OPENROUTER_API_KEY` **or** `VEYRA_AI_CLOUD_API_KEY` | OpenRouter API key (at least one required) |
| `VEYRA_AI_CLOUD_BASE_URL` | Override base URL (optional, defaults to `https://openrouter.ai/api/v1`) |
| `VEYRA_AI_CLOUD_MODEL` | Override default model (optional, defaults to `nvidia/nemotron-3.5-lightning:free`) |

---

## AI Verification Procedure

The AI should **only** be marked as WORKING after performing an actual live request against the deployed Vercel production URL. Do not rely on local testing, environment variable presence, or build success alone.

### Steps

1. **Send a real POST request** to the deployed production endpoint:

   ```bash
   curl -X POST https://YOUR_PRODUCTION_URL/api/ai/chat \
     -H "Content-Type: application/json" \
     -d '{"messages": [{"role": "user", "content": "What should I eat for dinner?"}], "userContext": {}}'
   ```

2. **Verify ALL of the following**:
   - HTTP status is `200` (not `503` or `500`)
   - Response contains a non-empty `message` field with actual AI-generated text
   - Response does **not** contain `"isUnavailable": true`
   - Response does **not** contain `"Cloud AI key missing"`
   - `provider` field shows an OpenRouter model (e.g., `"OpenRouter (nvidia/nemotron-3.5-lightning:free)"`)
   - No reference to Ollama or `localhost:11434`

3. **Verify from an external device** (phone, different network) to confirm the response does not depend on the development PC running.

### Example of a PASSING response:

```json
{
  "message": "For dinner tonight, I'd suggest...",
  "conversationId": "conv_cloud_1724...",
  "provider": "OpenRouter (nvidia/nemotron-3.5-lightning:free)",
  "usage": { "promptTokens": 320, "completionTokens": 180 },
  "latencyMs": 2400
}
```

### Example of a FAILING response (current state):

```json
{
  "isUnavailable": true,
  "error": "Cloud AI key missing. Please configure VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in environment variables.",
  "provider": "Production Cloud AI Provider (openai/gpt-oss-20b:free)"
}
```

---

## Last Verified Status

**Date**: 2026-08-22

| Check | Result |
|-------|--------|
| **AI Production Status** | ⛔ **NOT WORKING** |
| **Reason** | Cloud AI API key is missing / not available in the deployed Vercel production environment |
| **Error Message** | `"Cloud AI key missing. Please configure VEYRA_AI_CLOUD_API_KEY or OPENROUTER_API_KEY in environment variables."` |
| **Ollama Required for Production** | No — Ollama is blocked in production by `selectServerAIProvider()` |
| **Next Required Action** | 1. Configure `OPENROUTER_API_KEY` in Vercel Production Environment Variables. 2. Redeploy. 3. Perform a real live API test using the procedure above. |
| **All Non-AI Features** | ✅ Functional (database, auth, pantry, shopping list, meal plan, recipes, workouts, water, weight, favorites, reviews, notifications) |

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/muhammedsayyed/VEYRA.git && cd VEYRA

# 2. Install
pnpm install

# 3. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL, AUTH_SECRET, OPENROUTER_API_KEY

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database
npx prisma db push

# 6. Start dev server
pnpm dev

# 7. Open http://localhost:8443

# 8. Complete onboarding → Sign up → Start using Veyra
```

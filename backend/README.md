# Veyra Backend - Express + MongoDB

Professional REST API for Veyra Wellness AI.

## Stack
- Node.js + Express 4
- MongoDB + Mongoose 8
- TypeScript
- JWT (jsonwebtoken) + bcryptjs
- express-validator, cors, dotenv
- Centralized error handling

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
# Edit MONGODB_URI and JWT_SECRET
npm run dev   # http://localhost:5000
```

Requires MongoDB running locally or Atlas URI.

```bash
# Docker local Mongo
docker run -d -p 27017:27017 --name veyra-mongo mongo:7
```

Seed sample data:
```bash
npm run seed
```

## Env Vars

| Var | Required | Example |
|-----|----------|---------|
| PORT | no | 5000 |
| MONGODB_URI | yes | mongodb://localhost:27017/veyra |
| JWT_SECRET | yes | long random string |
| CLIENT_URL | no | http://localhost:8443 |

## API

All responses: `{ success: true, data: ... }` or `{ success: false, message: "..." }`

### Auth (public)
- POST /api/auth/register, /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me (protected)
- POST /api/auth/logout

### Domain (protected via Bearer JWT)
- GET/POST/PUT/DELETE /api/pantry
- GET/POST/PUT/DELETE /api/shopping-list
- GET/POST /api/meal-plan (?week=YYYY-MM-DD, ?action=generate)
- GET/POST /api/weight-history
- GET/POST/DELETE /api/favorites
- GET/POST/PUT/DELETE /api/reviews (GET public)
- GET/POST/PUT /api/notifications
- GET/POST/DELETE /api/nutrition/food-log, GET /api/nutrition/daily, POST /api/nutrition/water
- GET/POST /api/workouts
- GET/POST /api/scans
- GET /api/recipes, /api/countries, /api/categories
- POST /api/ai/chat

Health: GET /api/health

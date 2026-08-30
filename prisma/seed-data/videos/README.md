# VEYRA Verified YouTube Video Pipeline

Source of truth for verified cooking tutorial videos attached to the 1,400-recipe catalog.

**Production flow:** `prisma/seed-data/videos/*.json` → `scripts/attach-videos.mjs` → `prisma/seed-data/recipes/*.json` `videos[]` → `Prisma` → `Neon PostgreSQL` → `foodService` → `/api/recipes/:id` → `RecipeDetailsModal`

## Rules

- Every video MUST teach the SAME recipe (no music, vlog, review, compilation, reaction, travel-only, eating/challenge).
- `youtubeVideoId` = exactly 11 chars `[a-zA-Z0-9_-]`, never `dQw4w9WgXcQ`.
- `youtubeUrl` must be `https://www.youtube.com/watch?v=<ID>` or `https://youtu.be/<ID>` and must contain the ID.
- `videoTitle` and `channelName` must be the actual YouTube title/channel (never fabricated).
- One video per recipe max; duplicate `youtubeVideoId` / `youtubeUrl` across recipes is forbidden (single video may be reused only if it genuinely demonstrates that exact recipe and reuse is explicitly valid).
- `videos: []` = no verified video yet — acceptable. Incorrect video is NOT acceptable.
- Never expose API keys; YouTube API is build-time only, never runtime frontend.

## Pipeline

```bash
# 1. Author verified videos in prisma/seed-data/videos/<country>.json
#    { countryCode: "eg", videos: [ { recipeSlug, youtubeVideoId, youtubeUrl, videoTitle, channelName } ] }

# 2. Attach to recipes
npm run attach:videos        # or: node scripts/attach-videos.mjs
node scripts/attach-videos.mjs --dry-run   # preview without writing

# 3. Validate
npm run validate:food        # checks structure, counts, and video integrity (IDs, URLs, duplicates, titles)
npm run validate:videos      # alias

# 4. Seed to Neon
npm run seed:food
```

## Adding a new verified video

1. Verify candidate: URL valid, ID extractable, video exists, title/channel matches, content is actual cooking tutorial for that slug.
2. Add entry to `prisma/seed-data/videos/<code>.json` (create file if needed, use countryCode).
3. Run attach + validate. If verification fails, DO NOT attach.
4. Commit both `videos/*.json` and the updated `recipes/*.json` (recipes is the source the seed reads).

## Coverage

Current: 19 verified videos (1,381 recipes without video — acceptable). Accuracy > coverage.

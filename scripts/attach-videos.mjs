/**
 * VEYRA Video Attachment Pipeline
 *
 * Reads verified video metadata from prisma/seed-data/videos/*.json
 * and injects them into prisma/seed-data/recipes/*.json `videos` arrays.
 *
 * Idempotent: re-running produces identical state; existing videos are replaced
 * only if source metadata changed. Does not modify recipe counts or categories.
 *
 * Usage: node scripts/attach-videos.mjs [--dry-run]
 *
 * Video record schema (per prisma/seed-data/videos/*.json):
 * {
 *   countryCode: "eg",
 *   videos: [
 *     {
 *       recipeSlug: "egyptian-koshari",
 *       youtubeVideoId: "sfs8KikF96I",  // exactly 11 chars [a-zA-Z0-9_-]
 *       youtubeUrl: "https://www.youtube.com/watch?v=sfs8KikF96I",
 *       videoTitle: "Egyptian Koshari Recipe | Authentic...",
 *       channelName: "Middle Eats"
 *     }
 *   ]
 * }
 */

import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = join(__dirname, '..', 'prisma', 'seed-data', 'videos');
const RECIPES_DIR = join(__dirname, '..', 'prisma', 'seed-data', 'recipes');

const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const YT_URL_RE = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;

function loadVideos() {
  const files = existsSync(VIDEOS_DIR) ? readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.json')).sort() : [];
  const records = [];
  for (const f of files) {
    const raw = JSON.parse(readFileSync(join(VIDEOS_DIR, f), 'utf8'));
    const list = Array.isArray(raw) ? raw : (raw.videos || []);
    for (const v of list) {
      records.push({ ...v, __file: f });
    }
    // also support flat { countryCode, videos: [...] } wrapper — already handled
    if (raw.countryCode && Array.isArray(raw.videos) && raw.videos.length === 0 && files.length === 0) {
      // no-op
    }
  }
  return records;
}

function validateVideo(v) {
  const errs = [];
  if (!v.recipeSlug || typeof v.recipeSlug !== 'string') errs.push('missing recipeSlug');
  if (!YT_ID_RE.test(v.youtubeVideoId || '')) errs.push(`invalid youtubeVideoId "${v.youtubeVideoId}"`);
  if (!YT_URL_RE.test(v.youtubeUrl || '')) errs.push(`invalid youtubeUrl "${v.youtubeUrl}"`);
  // URL must contain ID
  if (v.youtubeVideoId && v.youtubeUrl && !v.youtubeUrl.includes(v.youtubeVideoId)) errs.push('youtubeUrl does not contain youtubeVideoId');
  if (!v.videoTitle || String(v.videoTitle).trim().length < 5) errs.push('videoTitle too short');
  if (!v.channelName || String(v.channelName).trim().length < 2) errs.push('channelName too short');
  // reject known music / dummy ids
  if ((v.youtubeVideoId || '') === 'dQw4w9WgXcQ') errs.push('rejected dummy video ID');
  return errs;
}

const dryRun = process.argv.includes('--dry-run');

const videoRecords = loadVideos();
console.log(`Found ${videoRecords.length} video records in ${VIDEOS_DIR}`);

// Validate all video records before touching recipes
let hasError = false;
const seenIds = new Map();
const seenSlugs = new Set();
for (const v of videoRecords) {
  const errs = validateVideo(v);
  if (errs.length) {
    console.error(`  x ${v.__file} -> ${v.recipeSlug}: ${errs.join('; ')}`);
    hasError = true;
  }
  if (seenIds.has(v.youtubeVideoId)) {
    console.error(`  x duplicate youtubeVideoId "${v.youtubeVideoId}" for slugs "${seenIds.get(v.youtubeVideoId)}" and "${v.recipeSlug}"`);
    hasError = true;
  } else seenIds.set(v.youtubeVideoId, v.recipeSlug);
  if (seenSlugs.has(v.recipeSlug)) {
    console.error(`  x duplicate video record for recipeSlug "${v.recipeSlug}"`);
    hasError = true;
  } else seenSlugs.add(v.recipeSlug);
  // duplicate URL
}
if (hasError) {
  console.error('Video validation failed - aborting attach.');
  process.exit(1);
}

// Build map recipeSlug -> video payload
const videoBySlug = new Map();
for (const v of videoRecords) {
  videoBySlug.set(v.recipeSlug, {
    youtubeVideoId: v.youtubeVideoId,
    youtubeUrl: v.youtubeUrl,
    videoTitle: v.videoTitle,
    channelName: v.channelName,
    isPrimary: true,
  });
}

// Load all recipe files
const recipeFiles = readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json')).sort();
let attached = 0;
let cleared = 0;
let untouched = 0;

for (const file of recipeFiles) {
  const fullPath = join(RECIPES_DIR, file);
  const data = JSON.parse(readFileSync(fullPath, 'utf8'));
  let changed = false;
  for (const recipe of data.recipes) {
    const expected = videoBySlug.get(recipe.slug);
    const current = Array.isArray(recipe.videos) ? recipe.videos : [];
    if (expected) {
      // Attach or update
      const needsUpdate = current.length !== 1 ||
        current[0].youtubeVideoId !== expected.youtubeVideoId ||
        current[0].youtubeUrl !== expected.youtubeUrl ||
        current[0].videoTitle !== expected.videoTitle ||
        current[0].channelName !== expected.channelName;
      if (needsUpdate) {
        recipe.videos = [expected];
        changed = true;
        attached++;
      } else {
        untouched++;
      }
    } else {
      // No verified video for this recipe - ensure empty array
      if (current.length !== 0) {
        recipe.videos = [];
        changed = true;
        cleared++;
      } else {
        untouched++;
      }
    }
  }
  if (changed && !dryRun) {
    writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n');
    console.log(`  + ${file}: updated`);
  }
}

console.log(`Attach complete: ${attached} attached/updated, ${cleared} cleared, ${untouched} untouched, total ${attached+cleared+untouched} recipes`);
if (dryRun) console.log('(dry run - no files written)');

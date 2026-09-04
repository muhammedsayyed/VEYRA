/**
 * Request validation helpers for VEYRA backend APIs.
 * Every external input (query params, path params, bodies) must pass
 * through these helpers before reaching the data layer.
 */

import { jsonError } from './apiResponse';

export const MAX_PAGE_LIMIT = 50;
export const DEFAULT_PAGE_LIMIT = 20;

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

/** Parses `page`/`limit` query params with hard caps. Returns null on invalid input. */
export function parsePagination(
  url: URL
): { ok: true; value: Pagination } | { ok: false; response: Response } {
  const pageRaw = url.searchParams.get('page') ?? '1';
  const limitRaw = url.searchParams.get('limit') ?? String(DEFAULT_PAGE_LIMIT);

  const page = Number.parseInt(pageRaw, 10);
  const limit = Number.parseInt(limitRaw, 10);

  if (!Number.isFinite(page) || !Number.isInteger(page) || page < 1) {
    return { ok: false, response: invalidParam('page', 'must be an integer >= 1') };
  }
  if (!Number.isFinite(limit) || !Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_LIMIT) {
    return {
      ok: false,
      response: invalidParam('limit', `must be an integer between 1 and ${MAX_PAGE_LIMIT}`),
    };
  }

  return { ok: true, value: { page, limit, skip: (page - 1) * limit } };
}

export function invalidParam(param: string, reason: string): Response {
  return jsonError('INVALID_PARAM', `Invalid '${param}': ${reason}`, 400);
}

export function notFound(resource: string): Response {
  return jsonError('NOT_FOUND', `${resource} not found.`, 404);
}

export function methodNotAllowed(): Response {
  return jsonError('METHOD_NOT_ALLOWED', 'Method not allowed.', 405);
}

/**
 * Sanitizes a free-text search term:
 * - trims and collapses whitespace
 * - strips characters that are meaningless in ILIKE patterns (% _ \0)
 * - enforces a maximum length
 */
export function sanitizeSearchQuery(raw: string | null, maxLength = 80): string {
  if (!raw) return '';
  return raw
    .replace(/[\\"%_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** Validates a comma-separated enum-ish param against an allowlist (case-insensitive). */
export function parseEnumList<T extends string>(
  raw: string | null,
  allowed: readonly T[]
): T[] | null {
  if (!raw) return [];
  const parts = raw
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  const out: T[] = [];
  for (const part of parts) {
    const match = allowed.find((a) => a.toLowerCase() === part);
    if (!match) return null;
    if (!out.includes(match)) out.push(match);
  }
  return out;
}

/** Validates a single enum-ish param against an allowlist (case-insensitive). */
export function parseEnum<T extends string>(
  raw: string | null,
  allowed: readonly T[]
): T | null | undefined {
  if (!raw) return undefined;
  const match = allowed.find((a) => a.toLowerCase() === raw.trim().toLowerCase());
  return match ?? null;
}

/** Basic slug/id format guard: letters, digits, hyphen, underscore only. */
export function isValidResourceId(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}

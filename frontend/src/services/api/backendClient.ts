/**
 * Centralized API client for Veyra frontend ↔ backend communication.
 * Uses VITE_API_URL env var; falls back to relative /api for Vercel/dev compatibility.
 * Handles JWT auth header, consistent JSON handling, and error normalization.
 */

export const API_BASE_URL: string = (() => {
  const env: any = (typeof import.meta !== "undefined" ? (import.meta as any).env : {}) || {};
  const raw = env.VITE_API_URL || env.VITE_BACKEND_URL || env.NEXT_PUBLIC_API_URL || "";
  const trimmed = String(raw).trim().replace(/\/+$/, "");
  // If set to e.g. "http://localhost:5000" append /api; if already contains /api keep as is
  if (!trimmed) return ""; // relative
  if (trimmed.endsWith("/api")) return trimmed;
  if (trimmed.includes("/api")) return trimmed;
  return `${trimmed}/api`;
})();

export const TOKEN_KEY = "veyra_token";
export const USER_KEY = "veyra_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
}
export function getAuthHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) return `/api${clean}`;
  // API_BASE_URL already ends with /api
  return `${API_BASE_URL}${clean}`;
}

export async function apiFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const url = apiUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...((opts.headers as Record<string, string>) || {}),
  };
  const res = await fetch(url, {
    ...opts,
    headers,
    credentials: "include",
  });
  return res;
}

export async function apiJson<T>(path: string, opts: RequestInit = {}): Promise<{ ok: boolean; status: number; data: any; raw: any }> {
  const res = await apiFetch(path, opts);
  let data: any = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: res.ok, status: res.status, data, raw: res };
}

// Parse success envelope: { success: true, data: ... } OR legacy flat
export function unwrap(data: any): any {
  if (data && typeof data === "object" && "success" in data && "data" in data) return data.data;
  return data;
}

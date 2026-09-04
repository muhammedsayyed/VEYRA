/**
 * Veyra API Client - centralized per spec frontend/src/services/api/client.ts
 * This is the single source of truth for frontend ↔ backend communication.
 * Re-exports from backendClient to satisfy spec naming while keeping one implementation.
 */
export * from "./backendClient";
import { API_BASE_URL, apiFetch, apiUrl, getToken, setToken, getAuthHeader, apiJson, unwrap } from "./backendClient";
export { API_BASE_URL, apiFetch, apiUrl, getToken, setToken, getAuthHeader, apiJson, unwrap };

// Helper for domain modules
export async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, opts);
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed ${res.status}`;
    throw new Error(msg);
  }
  return (data?.data ?? data) as T;
}

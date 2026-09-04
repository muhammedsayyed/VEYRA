export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_MEAL_API_URL || import.meta.env.NEXT_PUBLIC_MEAL_API_URL)) ||
  'https://nutriplan-api.vercel.app/api';

export const NUTRITION_API_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NUTRITION_API_KEY) ||
  'rMVu4aYBEzDZBvY5OHio1vk9tObxaIIxd0G4Ld0k';

export class ApiError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  params?: Record<string, string | number | boolean | undefined>;
  retries?: number;
}

export async function fetchWithTimeout(url: string, options: RequestOptions = {}): Promise<Response> {
  const { timeoutMs = 12000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeoutMs}ms`, undefined, true);
    }
    const message = error instanceof Error ? error.message : 'Network failure occurred';
    throw new ApiError(message, undefined, true);
  }
}

export function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  // If endpoint is a full URL (e.g. proxying or relative /api/...), parse accordingly
  let fullUrl: string;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    fullUrl = endpoint;
  } else {
    const baseUrl = API_BASE_URL.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    fullUrl = `${baseUrl}${cleanEndpoint}`;
  }

  if (!params) return fullUrl;

  const url = new URL(fullUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
}

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestOptions
): Promise<T> {
  const retries = options?.retries ?? 2;
  const url = buildUrl(endpoint, params);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
      }
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  const message = lastError instanceof Error ? lastError.message : 'An unexpected API error occurred';
  throw new ApiError(message);
}

export async function apiPost<T>(
  endpoint: string,
  body: unknown,
  headers?: Record<string, string>,
  options?: RequestOptions
): Promise<T> {
  const retries = options?.retries ?? 1;
  const url = buildUrl(endpoint);

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...headers,
          ...options?.headers,
        },
        body: JSON.stringify(body),
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
      }
    }
  }

  if (lastError instanceof ApiError) throw lastError;
  const message = lastError instanceof Error ? lastError.message : 'An unexpected API error occurred';
  throw new ApiError(message);
}


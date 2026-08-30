/**
 * Consistent JSON response envelope for VEYRA backend APIs.
 *
 * Success: { success: true, data: ... , pagination? }
 * Error:   { success: false, error: { code, message } }
 */

export interface ApiErrorShape {
  code: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

const BASE_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function jsonOk<T>(
  data: T,
  options: { status?: number; pagination?: PaginationMeta } = {}
): Response {
  const body: Record<string, unknown> = { success: true, data };
  if (options.pagination) body.pagination = options.pagination;
  return new Response(JSON.stringify(body), {
    status: options.status ?? 200,
    headers: BASE_HEADERS,
  });
}

export function jsonError(
  code: string,
  message: string,
  status = 400
): Response {
  const error: ApiErrorShape = { code, message };
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: BASE_HEADERS,
  });
}

export function preflightResponse(): Response {
  return new Response(null, { status: 204, headers: BASE_HEADERS });
}

/**
 * Wraps a handler with top-level error handling so unexpected failures
 * always produce the standard envelope instead of an HTML error page.
 */
export async function withApiErrors(
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch (err: any) {
    console.error('[VeyraAPI] Unhandled error:', err);
    return jsonError(
      'INTERNAL_ERROR',
      'An unexpected server error occurred.',
      500
    );
  }
}

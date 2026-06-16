const DEFAULT_API_BASE_URL = '/api/v1';

function normalizeApiBaseUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/$/, '');
  if (!trimmed) return DEFAULT_API_BASE_URL;
  if (trimmed.endsWith('/api/v1')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}

/** Set `VITE_API_URL` to domain only (e.g. https://sobat.nodeteam.site) or full /api/v1 URL. */
export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL);

/** Backend origin without API path — for public content links. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

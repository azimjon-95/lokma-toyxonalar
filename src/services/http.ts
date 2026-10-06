import { API_URL, REQUEST_TIMEOUT_MS } from '../config/env';
import { ApiError } from './errors';

export { ApiError };

let authToken: string | null = null;
/** Telegram initData yoki login'dan keyingi token shu yerga beriladi */
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query) {
  const qs = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${API_URL}${path}${qs ? `?${qs}` : ''}`;
}

export async function request<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  opts: { query?: Query; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  opts.signal?.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(buildUrl(path, opts.query), {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();
    const data = text ? safeJson(text) : null;

    if (!res.ok) {
      const err = (data ?? {}) as { message?: string; code?: string; details?: unknown };
      throw new ApiError(err.message || `Server xatosi (${res.status})`, res.status, err.code, err.details);
    }
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    if ((e as Error)?.name === 'AbortError') throw new ApiError('Server javob bermadi. Internetni tekshiring.', 0, 'timeout');
    throw new ApiError('Internetga ulanib bo‘lmadi.', 0, 'network');
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.slice(0, 200) };
  }
}

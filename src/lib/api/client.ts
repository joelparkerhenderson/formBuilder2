type ApiFetch = typeof fetch;

export type ApiClientOptions = {
  fetch?: ApiFetch;
  baseUrl?: string;
};

function defaultBaseUrl() {
  if (typeof window !== 'undefined' && window.location.port === '3210') return '/api';
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/formBuilder2/')) return '/formBuilder2/api';
  return '/api';
}

export function createApiClient(options: ApiClientOptions = {}) {
  const fetchImpl = options.fetch ?? fetch;
  const baseUrl = (options.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? defaultBaseUrl()).replace(/\/$/, '');

  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers
      }
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`The formBuilder2 API returned a non-JSON response. Response began: ${text.slice(0, 180)}`);
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || `Request failed with HTTP ${response.status}`);
    }
    return data as T;
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) })
  };
}

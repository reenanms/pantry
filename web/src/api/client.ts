const BASE = import.meta.env.API_URL || '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    } as Record<string, string>,
  });

  if (response.status === 204) return undefined as T;
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Route types
export interface RouteConfig {
  id: number;
  path: string;
  keyField: string;
  latency: number;
  staticCode: number | null;
  isStatic: boolean;
  staticPayload: string | null;
}

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  duration: number;
}

// Admin API
export const api = {
  routes: {
    list: () => request<RouteConfig[]>('/admin/routes'),
    get: (id: number) => request<RouteConfig>(`/admin/routes/${id}`),
    create: (data: Partial<RouteConfig>) => request<RouteConfig>('/admin/routes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<RouteConfig>) => request<RouteConfig>(`/admin/routes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => request<void>(`/admin/routes/${id}`, { method: 'DELETE' }),
  },
  system: {
    wipe: () => request<{ message: string }>('/admin/wipe', { method: 'POST' }),
  },
  logs: {
    list: () => request<LogEntry[]>('/admin/logs'),
  },
  // Dynamic data browser
  resources: {
    list: (routePath: string) => request<Record<string, unknown>[]>(`/api/${routePath}`),
  },
};

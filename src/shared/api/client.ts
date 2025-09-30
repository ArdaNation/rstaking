export interface ApiClientOptions {
  baseUrl: string;
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  private readonly baseUrl: string;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  private buildHeaders(init?: RequestInit): Headers {
    const headers = new Headers(init?.headers);
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    try {
      const token = localStorage.getItem((import.meta.env.VITE_AUTH_TOKEN_KEY as string) || 'auth_token');
      if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    } catch {
      // ignore
    }
    return headers;
  }

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(
      this.buildUrl(path), 
      { 
        ...init, 
        method: 'GET', 
        headers: this.buildHeaders(init), 
        // credentials: 'include' 
      });
    const text = await res.text();
    const hasBody = Boolean(text);
    try {
      const data = hasBody ? JSON.parse(text) : null;
      if (!res.ok) {
        if (data) return data as T;
        return ({ success: false, message: `GET ${path} failed: ${res.status}`, data: {} } as unknown) as T;
      }
      return (data ?? ({} as unknown)) as T;
    } catch {
      if (!res.ok) {
        return ({ success: false, message: `GET ${path} failed: ${res.status}`, data: {} } as unknown) as T;
      }
      return ({} as unknown) as T;
    }
  }

  async post<T, B = unknown>(path: string, body?: B, init?: RequestInit): Promise<T> {
    const res = await fetch(this.buildUrl(path), {
      ...init,
      method: 'POST',
      headers: this.buildHeaders(init),
      // credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    const hasBody = Boolean(text);
    try {
      const data = hasBody ? JSON.parse(text) : null;
      if (!res.ok) {
        // For 202 status, return the data instead of throwing error
        if (res.status === 202 && data) {
          return data as T;
        }
        if (data) return data as T;
        return ({ success: false, message: `POST ${path} failed: ${res.status}`, data: {} } as unknown) as T;
      }
      return (data ?? ({} as unknown)) as T;
    } catch {
      if (!res.ok) {
        return ({ success: false, message: `POST ${path} failed: ${res.status}`, data: {} } as unknown) as T;
      }
      return ({} as unknown) as T;
    }
  }
}

export const api = new ApiClient({ baseUrl: import.meta.env.VITE_API_URL ?? '/api' });



const TOKEN_KEY = (import.meta.env.VITE_AUTH_TOKEN_KEY as string) || 'auth_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event('auth-token-changed'));
  } catch {
    // ignore
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('auth-token-changed'));
  } catch {
    // ignore
  }
}



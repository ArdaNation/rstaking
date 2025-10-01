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
    
    // Clear auth-token cookie with various combinations
    const cookieNames = ['auth-token', 'auth_token', 'token', 'access_token'];
    const domains = [
      window.location.hostname,
      '.' + window.location.hostname,
      window.location.hostname.split('.').slice(-2).join('.'),
      '.' + window.location.hostname.split('.').slice(-2).join('.')
    ];
    const paths = ['/', '/api', '/private'];
    
    cookieNames.forEach(cookieName => {
      domains.forEach(domain => {
        paths.forEach(path => {
          // Try different combinations
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; secure;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; samesite=strict;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; samesite=lax;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}; samesite=none; secure;`;
        });
      });
    });
    
    console.log('Cleared auth token from localStorage and cookies');
    window.dispatchEvent(new Event('auth-token-changed'));
  } catch (error) {
    console.error('Error clearing token:', error);
  }
}



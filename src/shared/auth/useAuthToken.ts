import { useEffect, useState } from 'react';
import { getToken } from './tokenStorage';

export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(() => getToken());

  useEffect(() => {
    const handler = () => setToken(getToken());
    window.addEventListener('auth-token-changed', handler);
    return () => window.removeEventListener('auth-token-changed', handler);
  }, []);

  return token;
}



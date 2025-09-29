import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { accountApi, type ProfileResponse } from '../../../shared/api/modules/account';
import { useAuthToken } from '../../../shared/auth/useAuthToken';
import { useTranslation } from 'react-i18next';

export interface UserProfile {
  puid: string;
  name: string;
  surname: string;
  email: string;
  telegmarId: string;
  lang: string;
  isVerified: boolean;
  isDisabled: boolean;
  isDeleted: boolean;
}

interface UserContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthToken();
  const { i18n } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setProfile(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res: ProfileResponse = await accountApi.profileGet();
      if (res.success && res.data) {
        setProfile(res.data);
        if (res.data.lang && res.data.lang !== i18n.language) {
          void i18n.changeLanguage(res.data.lang);
        }
      } else {
        setError(res.message || 'Failed to load profile');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [token, i18n]);

  useEffect(() => {
    void load();
  }, [load]);

  const value = useMemo<UserContextValue>(() => ({ profile, isLoading, error, reload: load }), [profile, isLoading, error, load]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}



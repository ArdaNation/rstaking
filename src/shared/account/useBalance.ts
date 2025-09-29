import { useCallback, useEffect, useState } from 'react';
import { accountApi } from '../api/modules/account';
import { useAuthToken } from '../auth/useAuthToken';

export function useBalance() {
  const token = useAuthToken();
  const [balance, setBalance] = useState<string | number | null>(null);
  const [realBalance, setRealBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abbreveateBalance = useCallback((balance: number) => {
    if (balance < 1000) {
      return balance;
    }
    if (balance < 1000000) {
      return (balance / 1000)?.toFixed(2) + 'K';
    }
    if (balance < 1000000000) {
      return (balance / 1000000)?.toFixed(2) + 'M';
    }
    if (balance < 1000000000000) {
      return (balance / 1000000000)?.toFixed(2) + 'B';
    }
    if (balance < 1000000000000000) {
      return (balance / 1000000000000)?.toFixed(2) + 'T';
    }
    if (balance < 1000000000000000000) {
      return (balance / 1000000000000000)?.toFixed(2) + 'Q';
    }
    return (balance / 1000000000000000000)?.toFixed(2) + 'Q';

  }, []);

  const reload = useCallback(async () => {
    if (!token) {
      setBalance(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await accountApi.currentBalance();
      setRealBalance(res.data.balance);
      const abbreviatedBalance = abbreveateBalance(res.data.balance);
      setBalance(abbreviatedBalance);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  }, [token, abbreveateBalance]);

  useEffect(() => { void reload(); }, [reload]);

  return { balance, realBalance, loading, error, reload };
}



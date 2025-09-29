import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { systemApi } from '../../../shared/api/modules/system';
import { accountApi } from '../../../shared/api/modules/account';
import { useAuthToken } from '../../../shared/auth/useAuthToken';
import { useUser } from '../../providers/user/UserProvider';

function HomePage() {
  const { t } = useTranslation();
  const token = useAuthToken();
  const { profile, isLoading: isProfileLoading, error: profileError } = useUser();
  const [health, setHealth] = useState<string>('');
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const hc = await systemApi.healthcheck();
        setHealth(hc.message);
      } catch (e) {
        setHealth('offline');
      }
    })();
  }, []);

  useEffect(() => {
    if (!token) {
      setBalance(null);
      return;
    }
    void (async () => {
      try {
        const res = await accountApi.currentBalance();
        setBalance(res.data.balance);
      } catch {
        setBalance(null);
      }
    })();
  }, [token]);
  return (
    <section>
      <h1>{t('home.welcome')}</h1>
      <p>Health: {health || '...'}</p>
      <p>Balance: {balance ?? '-'}</p>
      {token && (
        <div>
          <h3>User</h3>
          {isProfileLoading && <p>Loading profile...</p>}
          {profileError && <p style={{ color: 'crimson' }}>{profileError}</p>}
          {profile && (
            <ul>
              <li>puid: {profile.puid}</li>
              <li>name: {profile.name}</li>
              <li>surname: {profile.surname}</li>
              <li>email: {profile.email}</li>
              <li>lang: {profile.lang}</li>
              <li>verified: {String(profile.isVerified)}</li>
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default HomePage;



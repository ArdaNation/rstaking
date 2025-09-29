import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { systemApi } from '../../../shared/api/modules/system';
import { accountApi } from '../../../shared/api/modules/account';
import { authApi } from '../../../shared/api/modules/auth';
import { useAuthToken } from '../../../shared/auth/useAuthToken';
import { clearToken } from '../../../shared/auth/tokenStorage';
import { useUser } from '../../providers/user/UserProvider';
import './withdraw.scss';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthToken();
  const { profile } = useUser();
  const [_health, setHealth] = useState<string>('');
  const [_balance, setBalance] = useState<number | null>(null);
  const initials = ((profile?.name?.[0] ?? '').toUpperCase() + (profile?.surname?.[0] ?? '').toUpperCase())
    || (profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'U');
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

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearToken();
      navigate('/login');
      toast.success('You have been logged out');
    } catch (err) {
      clearToken();
      navigate('/login');
      toast.success('You have been logged out');
    }
  };

  return (
    <section className="withdraw">
      <h1 className="section-title">{t('nav.profile')}</h1>

      <div className="table">
        <div className="table__head">
          <div className="profile__left" style={{ fontSize: 18, fontWeight: 600 }}>
            <span className="profile__avatar">{initials}</span>
            <span className="name">{profile ? `${profile.name} ${profile.surname}` : 'User'}</span>
          </div>
        </div>

        {/* Desktop table (hidden on mobile) */}
        <div className="table__body profile-desktop" style={{ paddingTop: 8 }}>
          <table className="profile-table">
            <tbody>
              <tr>
                <td className="meta__label">First name</td>
                <td className="meta__value">{profile?.name || '-'}</td>
              </tr>
              <tr>
                <td className="meta__label">Last name</td>
                <td className="meta__value">{profile?.surname || '-'}</td>
              </tr>
              <tr>
                <td className="meta__label">Language</td>
                <td className="meta__value">{profile?.lang || '-'}</td>
              </tr>
              <tr>
                <td className="meta__label">Email</td>
                <td className="meta__value">{profile?.email || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile grid (visible on mobile) */}
        <div className="profile-mobile">
          {/* <div className="profile-mobile__head">
            <span className="profile__avatar">{initials}</span>
            <span className="name">{profile ? `${profile.name} ${profile.surname}` : 'User'}</span>
          </div> */}
          <div className="profile-mobile__grid">
            <div className="profile-mobile__row">
              <div className="meta__label">First name</div>
              <div className="meta__value">{profile?.name || '-'}</div>
            </div>
            <div className="profile-mobile__row">
              <div className="meta__label">Last name</div>
              <div className="meta__value">{profile?.surname || '-'}</div>
            </div>
            <div className="profile-mobile__row">
              <div className="meta__label">Language</div>
              <div className="meta__value">{profile?.lang || '-'}</div>
            </div>
            <div className="profile-mobile__row">
              <div className="meta__label">Email</div>
              <div className="meta__value">{profile?.email || '-'}</div>
            </div>
          </div>
          <div className="profile-mobile__actions">
            <button className="btn btn--withdrawal logout" onClick={handleLogout}>
              {/* <img src={ShutIcon} alt="" aria-hidden style={{ width: 20, height: 20 }} /> */}
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}



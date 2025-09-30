import { type FormEvent, useMemo, useState } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import LittleXrp from '../../../../assets/little-xrp.svg';
import toast from 'react-hot-toast';
import './login.scss';
import { authApi } from '../../../../shared/api/modules/auth';

function PasswordRecoveryPage() {
  const [params] = useSearchParams();
  const email = useMemo(() => params.get('email') ?? '', [params]);
  const code = useMemo(() => params.get('code') ?? '', [params]);

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      toast.error('Invalid recovery link: email or code is missing');
      return;
    }
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== passwordRepeat) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await authApi.resetPasswordVerify({ email, code, password });
      if (res?.success) {
        toast.success('Password successfully updated. You can now log in.');
        setPassword('');
        setPasswordRepeat('');
      } else {
        toast.error(res?.message || 'Failed to update password');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth">
      <header className="auth__header">
        <div className="brand" onClick={() => window.open('https://rstaking.us/', '_blank')}>
          <img className="brand__xrp" src={LittleXrp} alt="XRP" />
          <span className="brand__name">RStaking</span>
        </div>
        <div></div>

      </header>

      <main className="auth__main">
        <div className="auth__card">
          <img className="auth__logo" src={LittleXrp} alt="XRP" />
          <h1 className="auth__title">Password recovery</h1>
          <p className="auth__subtitle">Enter new password twice. We will check the recovery code from the link.</p>

          <form onSubmit={onSubmit} className="auth__form">
            <div className="field" style={{ marginBottom: 8 }}>
              <span>Email</span>
              <input type="email" value={email} readOnly />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <span>Code</span>
              <input value={code} readOnly />
            </div>
            <label className="field">
              <span>New password</span>
              <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <label className="field">
              <span>Repeat new password</span>
              <input type="password" placeholder="Repeat new password" value={passwordRepeat} onChange={(e) => setPasswordRepeat(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>Update password</button>
          </form>
          <div className="auth__foot">
            <NavLink to="/login" className="auth__link">Log in?</NavLink>
            <div className="auth__signup">Don’t have an account? <NavLink to="/register">Sign up</NavLink></div>
          </div>
        </div>
      </main>

      <footer className="auth__footer">
        <div className="auth__copy">Copyright © 2023-2025 RStaking Finance Global LTD</div>
      </footer>
    </div>
  );
}

export default PasswordRecoveryPage;



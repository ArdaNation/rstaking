import { type FormEvent, useState } from 'react';
import { NavLink } from 'react-router-dom';
import LittleXrp from '../../../../assets/little-xrp.svg';
import toast from 'react-hot-toast';
import './login.scss';
import { authApi } from '../../../../shared/api/modules/auth';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.resetPasswordRequest({ email });
      if (res?.success) {
        toast.success('If this email exists, we have sent instructions to reset your password');
      } else {
        toast.error(res?.message || 'Failed to send email for password reset');
      }
      setEmail('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(message);
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
          <h1 className="auth__title">Forgot password?</h1>
          <p className="auth__subtitle">Enter the email address you used and we’ll send instructions to reset your password.</p>

          <form onSubmit={onSubmit} className="auth__form">
            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <button type="submit" className="btn btn--primary btn--block">Reset password</button>
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

export default ForgotPasswordPage;



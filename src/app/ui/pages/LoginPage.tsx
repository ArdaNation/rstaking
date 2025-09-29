import { type FormEvent, useState } from 'react';
import { authApi } from '../../../shared/api/modules/auth';
import { setToken } from '../../../shared/auth/tokenStorage';
import { HttpError } from '../../../shared/api/client';
import { NavLink, useNavigate } from 'react-router-dom';
import LittleXrp from '../../../assets/little-xrp.svg';
import toast from 'react-hot-toast';
import './login.scss';

const iconEyeOff = (
  <svg width="1em" height="1em" viewBox="0 0 24 24">
    <g
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M12 5c-6.307 0-9.367 5.683-9.91 6.808a.435.435 0 0 0 0 .384C2.632 13.317 5.692 19 12 19s9.367-5.683 9.91-6.808a.435.435 0 0 0 0-.384C21.368 10.683 18.308 5 12 5z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </g>
  </svg>
)

export const iconEyeEmpty = (
  <svg width="1em" height="1em" viewBox="0 0 24 24">
    <path
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M7 6.362A9.707 9.707 0 0 1 12 5c6.307 0 9.367 5.683 9.91 6.808c.06.123.06.261 0 .385c-.352.728-1.756 3.362-4.41 5.131M14 18.8a9.93 9.93 0 0 1-2 .2c-6.307 0-9.367-5.683-9.91-6.808a.44.44 0 0 1 0-.386c.219-.452.84-1.632 1.91-2.885m6 .843A3 3 0 0 1 14.236 14M3 3l18 18"
    ></path>
  </svg>
)

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.login({ email, password });
      if (!res.success || !res.data?.access) {
        if (res.message === 'Please verify your email address') {
          try {
            await authApi.requestEmailVerification({ email, password });
          } catch (e: any) {
            console.error(e);
          }
          toast.error(res.message || 'Please verify your email address');
        } else {
          toast.error(res.message || 'Login failed');
        }
        return;
      }
      setToken(res.data.access);
      navigate('/');
    } catch (err: any) {
      if (err instanceof HttpError && err.status === 417) {
        if (err.message === 'Please verify your email address') {
          try {
            await authApi.requestEmailVerification({ email, password });
          } catch (e: any) {
            console.error(e);
          }
          toast.error(err.message || 'Please verify your email address');
        } else {
          console.error(err);
        }
        return;
      }
      console.error(err);
    }
  };

  

  return (
    <div className="auth">
      <header className="auth__header">
        <div className="brand" onClick={() => window.open('https://rstaking.us/', '_blank')}>
          <img className="brand__xrp" src={LittleXrp} alt="XRP" />
          <span className="brand__name">RStaking</span>
        </div>
        {/* <nav className="auth__nav auth__nav--desktop">
          <NavLink to="/">Home</NavLink>
          <a href="#about">About</a>
          <a href="#partnership">Partnership</a>
          <a href="#legal">Legal</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#contacts">Contacts</a>
        </nav> */}
        {/* <div className="auth__actions auth__nav--desktop">
          <NavLink className="btn btn--ghost" to="/login">Log in</NavLink>
          <NavLink className="btn btn--primary" to="/register">Join Us</NavLink>
        </div> */}
                <div></div>

      </header>

      {/* <div className="auth__menu">
        <button className="auth__close" aria-label="Close" onClick={() => document.body.classList.remove('auth--menu-open')}>×</button>
        <NavLink to="/" onClick={() => document.body.classList.remove('auth--menu-open')}>Home</NavLink>
        <a href="#about" onClick={() => document.body.classList.remove('auth--menu-open')}>About</a>
        <a href="#partnership" onClick={() => document.body.classList.remove('auth--menu-open')}>Partnership</a>
        <a href="#legal" onClick={() => document.body.classList.remove('auth--menu-open')}>Legal</a>
        <a href="#roadmap" onClick={() => document.body.classList.remove('auth--menu-open')}>Roadmap</a>
        <a href="#contacts" onClick={() => document.body.classList.remove('auth--menu-open')}>Contacts</a>
        <NavLink className="btn btn--ghost" to="/login" onClick={() => document.body.classList.remove('auth--menu-open')}>Log in</NavLink>
        <NavLink className="btn btn--primary" to="/register" onClick={() => document.body.classList.remove('auth--menu-open')}>Join Us</NavLink>
        <div className="auth__social">
          <span>tg</span>
          <span>ig</span>
          <span>x</span>
        </div>
      </div> */}

      <main className="auth__main">
        <div className="auth__card">
        <img className="auth__logo" src={LittleXrp} alt="XRP" />

          <h1 className="auth__title">Log in to your account</h1>
          <p className="auth__subtitle">Welcome back! Please enter your details.</p>

          <form onSubmit={onSubmit} className="auth__form">
            <label className="field">
              <span>Email</span>
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="field field--password">
              <span>Password</span>
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="•••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="field__iconBtn"
                aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                onClick={() => setIsPasswordVisible((v) => !v)}
              >
                {isPasswordVisible ? iconEyeOff : iconEyeEmpty}
              </button>
            </label>
            <button type="submit" className="btn btn--primary btn--block">Log in</button>
          </form>
          <div className="auth__foot">
            <NavLink to="/forgot" className="auth__link">Forgot password</NavLink>
            <div className="auth__signup">Don't have an account? <NavLink to="/register">Sign up</NavLink></div>
          </div>
        </div>
      </main>

      <footer className="auth__footer">
        {/* <div className="auth__footer-brand">
          <img className="brand__xrp" src={LittleXrp} alt="XRP" />
          <span className="brand__name">RStaking Finance</span>
        </div>
        <div className="auth__cols">
          <div>
            <div className="auth__col-title">Company</div>
            <a>About</a>
            <a>Affiliate Program</a>
            <a>Roadmap</a>
            <a>Legal</a>
            <a>Contacts</a>
          </div>
          <div>
            <div className="auth__col-title">Security</div>
            <a>Terms of use</a>
            <a>Privacy Policy</a>
            <a>AML Policy</a>
          </div>
          <div>
            <div className="auth__col-title">Social media</div>
            <a>harvestfinance</a>
            <a>harvest_fin</a>
            <a>harvestfinancecan</a>
            <a>HarvestFinanceOfficial</a>
          </div>
        </div> */}
        <div className="auth__copy">Copyright © 2023-2025 RStaking Finance Global LTD</div>
      </footer>
    </div>
  );
}

export default LoginPage;



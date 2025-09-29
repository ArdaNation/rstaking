import { type FormEvent, useMemo, useState } from 'react';
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

const iconEyeEmpty = (
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

function RegisterPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const passwordsMismatch = useMemo(() => Boolean(password) && Boolean(confirmPassword) && password !== confirmPassword, [password, confirmPassword]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    try {
      const res = await authApi.register({ name, surname, email, password });
      if (!res.success) {
        toast.error(res.message);

        return;
      }
      toast.success("Account created successfully!");
      
      // Автоматический логин после успешной регистрации
      try {
        const loginRes = await authApi.login({ email, password });
        if (loginRes.success && loginRes.data?.access) {
          setToken(loginRes.data.access);
          navigate('/');
        } else {
          // Если автоматический логин не удался, перенаправляем на страницу логина
          navigate('/login');
        }
      } catch (loginErr) {
        // Если автоматический логин не удался, перенаправляем на страницу логина
        console.error('Auto-login failed:', loginErr);
        navigate('/login');
      }
    } catch (err: any) {
      if (err instanceof HttpError && err.status === 417) {
        toast.error(err.message);
        return;
      }
      toast.error(err?.message || 'An error occurred while registering');
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
          <h1 className="auth__title">Welcome to RStaking Finance</h1>
          <p className="auth__subtitle">Create an account.</p>

          <form onSubmit={onSubmit} className="auth__form">
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required />
            </label>
            <label className="field">
              <span>Surname</span>
              <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Enter your surname" required />
            </label>
            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required />
            </label>
            <label className="field field--password">
              <span>Password</span>
              <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="•••••••" required />
              <button type="button" className="field__iconBtn" aria-label={showPass ? 'Hide password' : 'Show password'} onClick={() => setShowPass((v) => !v)}>
                {showPass ? iconEyeOff : iconEyeEmpty}
              </button>
            </label>
            <label className="field field--password">
              <span>Confirm password</span>
              <input type={showPass2 ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="•••••••" required />
              <button type="button" className="field__iconBtn" aria-label={showPass2 ? 'Hide password' : 'Show password'} onClick={() => setShowPass2((v) => !v)}>
                {showPass2 ? iconEyeOff : iconEyeEmpty}
              </button>
            </label>
            {passwordsMismatch && <p className="auth__error">Passwords do not match</p>}
            <button type="submit" className="btn btn--primary btn--block" disabled={passwordsMismatch}>Get started</button>
          </form>
          <div className="auth__foot">
            <div className="auth__signup">Already have an account? <NavLink to="/login">Log in</NavLink></div>
          </div>
        </div>
      </main>

      <footer className="auth__footer">
        <div className="auth__copy">Copyright © 2023-2025 RStaking Finance Global LTD</div>
      </footer>
    </div>
  );
}

export default RegisterPage;



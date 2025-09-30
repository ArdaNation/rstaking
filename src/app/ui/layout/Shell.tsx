import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import './shell.scss';
import { useAuthToken } from '../../../shared/auth/useAuthToken';
import { useUser } from '../../providers/user/UserProvider';
import { useBalance } from '../../../shared/account/useBalance';
import LittleXrp from '../../../assets/little-xrp.svg';
import IconLogoff from '../../../assets/logoff.svg';
import ShutIcon from '../../../assets/shut.svg';
import { invoicesApi } from '../../../shared/api/modules/invoices';
import { savePendingInvoice } from '../../../shared/invoices/invoiceStorage';
import { authApi } from '../../../shared/api/modules/auth';
import { clearToken } from '../../../shared/auth/tokenStorage';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { DepositModalContext } from './DepositModalContext';
import { CLOSE_DEPOSIT_MODAL_EVENT, BALANCE_RELOAD_EVENT } from '../../../shared/events';

interface ShellProps {
  children?: React.ReactNode;
}

export default function Shell({  }: ShellProps) {
  const { t } = useTranslation();
  const token = useAuthToken();
  const { profile } = useUser();
  const { balance, reload: reloadBalance } = useBalance();
  const navigate = useNavigate();
  const location = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const balanceRef = useRef<HTMLDivElement>(null);
  // const [navHeight, setNavHeight] = useState<number>(() => {
  //   if (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) {
  //     return 134;
  //   }
  //   return 160;
  // });
  // const [topBlockH, setTopBlockH] = useState<number>(() => {
  //   const initialNav = (typeof window !== 'undefined' && window.matchMedia('(max-width: 960px)').matches) ? 134 : 160;
  //   const assumedBalance = 76;
  //   return initialNav + 24 + assumedBalance;
  // });
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [depositMemo, setDepositMemo] = useState<string>('');
  const [qrType, setQrType] = useState<'none' | 'address' | 'memo'>('address');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const requestedRef = useRef(false);

  const initials = ((profile?.name?.[0] ?? '').toUpperCase() + (profile?.surname?.[0] ?? '').toUpperCase())
    || (profile?.name ? profile.name.slice(0, 2).toUpperCase() : 'U');

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

  const closeMobileMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsClosing(false);
    }, 300);
  };

  const handleMobileMenuClick = (callback: () => void) => {
    return () => {
      callback();
      closeMobileMenu();
    };
  };

  // useLayoutEffect(() => {
  //   const measure = () => {
  //     const navH = Math.round(navRef.current?.getBoundingClientRect().height || 134);
  //     const balH = Math.round(balanceRef.current?.getBoundingClientRect().height || 76);
  //     setNavHeight(navH);
  //     setTopBlockH(navH + 24 + balH);
  //   };
  //   measure();
  //   const ro = new ResizeObserver(measure);
  //   if (navRef.current) ro.observe(navRef.current);
  //   if (balanceRef.current) ro.observe(balanceRef.current);
  //   window.addEventListener('resize', measure);
  //   return () => {
  //     window.removeEventListener('resize', measure);
  //     ro.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    if (balance !== null && Number(balance) > 0 && depositAmount === 0) {
      setDepositAmount(Number(balance));
    }
  }, [balance, depositAmount]);

  const closeDepositModal = () => {
    setIsDepositOpen(false);
    setQrType('address');
    setDepositAddress('');
    setDepositMemo('');
    requestedRef.current = false;
    void reloadBalance();
  };

  useEffect(() => {
    const onClose = () => closeDepositModal();
    const onReload = () => { void reloadBalance(); };
    window.addEventListener(CLOSE_DEPOSIT_MODAL_EVENT, onClose);
    window.addEventListener(BALANCE_RELOAD_EVENT, onReload);
    return () => {
      window.removeEventListener(CLOSE_DEPOSIT_MODAL_EVENT, onClose);
      window.removeEventListener(BALANCE_RELOAD_EVENT, onReload);
    };
  }, [closeDepositModal, reloadBalance]);

  const openDepositWithAmount = async (amt: number) => {
    setDepositAmount(Math.max(1, Number(amt) || 100));
    setDepositAddress('');
    setDepositMemo('');
    setQrType('address');
    setIsDepositOpen(true);
    try {
      requestedRef.current = true;
      const amount = Math.max(1, Number(amt) || 100);
      const res = await invoicesApi.request({ amount });
      setDepositAddress(res.data.address);
      setDepositMemo(res.data.memo);
      savePendingInvoice({
        puid: res.data.puid,
        address: res.data.address,
        memo: res.data.memo,
        amount,
        status: res.data.status,
      });
    } catch (e) {
      requestedRef.current = false;
      console.error('Deposit request failed:', e instanceof Error ? e.message : 'Failed');
    }
  };

  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register') || location.pathname.startsWith('/forgot') || location.pathname.startsWith('/password-recovery')) {
    return (
        <>
          <Outlet />
        </>
    );
  }

  return (
    <DepositModalContext.Provider value={{ openDepositWithAmount, closeDepositModal }}>
    <div className="shell" ref={shellRef} >
      <div className="shell__container">
      {/* Mobile top bar */}
      <div className="shell__top">
        <div className="brand" onClick={() => window.open('https://rstaking.us/', '_blank')}>
          <img className="brand__xrp" src={LittleXrp} alt="XRP" />
          <span className="brand__name">RStaking</span>
        </div>
        <button
          className="btn btn--burger"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <aside className="shell__sidebar">
        <div className="brand" onClick={() => window.open('https://rstaking.us/', '_blank')}>

          <img className="brand__xrp" src={LittleXrp} alt="XRP" />
          <span className="brand__name">RStaking</span>
        </div>
        <nav ref={navRef}>
          <NavLink to="/" end>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8M14 2L20 8M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Staking
          </NavLink>
          <NavLink to="/how-to-start">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            How to Start
          </NavLink>
          <NavLink to="/withdraw">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15L21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21L5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19L3 15M7 10L12 15M12 15L17 10M12 15L12 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('nav.withdraw')}
          </NavLink>
          <NavLink to="/history">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t('nav.history')}
          </NavLink>
          <NavLink to="/security">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="16" r="1" fill="currentColor"/>
              <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Security
          </NavLink>
        </nav>
        <div className="balance" ref={balanceRef}>
          <div className="balance__inner">

          <span>Balance: </span>
          <span> <strong className="balance__value">{token && balance !== null ? ` ${balance} XRP` : '-'}</strong></span>
          </div>
          <button className="btn btn--deposit" onClick={() => { void openDepositWithAmount(100); }}>Deposit</button>
        </div>
        <div className={`profile${location.pathname.startsWith('/profile') ? ' active' : ''}`}>
          <span className="profile__left" onClick={() => navigate('/profile')}>
            <span className="avatar">{initials}</span>
            <span className="name">{profile ? `${profile.name} ${profile.surname}` : 'User'}</span>
          </span>
          <img className="profile__logoff" src={IconLogoff} alt="log off" onClick={handleLogout} />
        </div>
      </aside>

      <main className="shell__content">
        {/* {children} */}
        <Outlet />
      </main>

      <nav className="shell__bottom">
        <button
          className="btn btn--deposit btn--deposit-mobile"
          onClick={() => { void openDepositWithAmount(100); }}
        >
          Deposit
        </button>
      </nav>

      {/* Mobile burger menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" onClick={closeMobileMenu}>
          <div className={`mobile-menu__content ${isClosing ? 'mobile-menu__content--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu__head">
              <div className="mobile-menu__title">Menu</div>
              <button className="mobile-menu__close" aria-label="Close" onClick={closeMobileMenu}>
                <img src={ShutIcon} alt="Close" />
              </button>
            </div>
            <div className="mobile-menu__body">
              <nav className="mobile-menu__nav">
                <NavLink to="/" end onClick={handleMobileMenuClick(() => {})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8M14 2L20 8M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Staking
                </NavLink>
                <NavLink to="/how-to-start" onClick={handleMobileMenuClick(() => {})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  How to Start
                </NavLink>
                <NavLink to="/withdraw" onClick={handleMobileMenuClick(() => {})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15L21 19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21L5 21C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19L3 15M7 10L12 15M12 15L17 10M12 15L12 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('nav.withdraw')}
                </NavLink>
                <NavLink to="/history" onClick={handleMobileMenuClick(() => {})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 17L12 22L22 17M2 12L12 17L22 12M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('nav.history')}
                </NavLink>
                <NavLink to="/security" onClick={handleMobileMenuClick(() => {})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Security
                </NavLink>
                <NavLink to="/profile" onClick={handleMobileMenuClick(() => {})}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 17L21 12L16 7M21 12H3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {t('nav.profile')}
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
      )}

      {isDepositOpen && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__content">
            <div className="modal__head">
              <div className="modal__title">Deposit XRP</div>
              <button className="modal__close" aria-label="Close" onClick={closeDepositModal}>
                <img src={ShutIcon} alt="Close" />
              </button>
            </div>
            <div className="modal__body">
              {/* <label className="modal__field">
                <span>Network</span>
                <input value="RStaking" disabled />
              </label>
              <label className="modal__field">
                <span>Currency</span>
                <input value="XRP" disabled />
              </label> */}
              {depositAddress && (
                <>
                  <label className="modal__field">
                    <span>Address</span>
                    <input value={depositAddress} readOnly />
                  </label>
                  <label className="modal__field">
                    <span>Memo</span>
                    <input value={depositMemo} readOnly />
                  </label>
                  <div className="modal__qr-actions" style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      className={`btn${qrType === 'address' ? ' btn--primary' : ''}`}
                      onClick={() => setQrType(qrType === 'address' ? 'none' : 'address')}
                    >
                      Show Address QR
                    </button>
                    <button
                      className={`btn${qrType === 'memo' ? ' btn--primary' : ''}`}
                      onClick={() => setQrType(qrType === 'memo' ? 'none' : 'memo')}
                    >
                      Show Memo QR
                    </button>
                  </div>
                  {qrType !== 'none' && (
                    <div className="modal__qr" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        {qrType === 'address' ? 'Scan address' : 'Scan memo'}
                      </div>
                      <QRCodeSVG
                        value={qrType === 'address' ? depositAddress : depositMemo}
                        size={176}
                        includeMargin
                      />
                      
                      {qrType === 'address' && (
                  <div className='plan__desc'>
                          Minimum deposit 30 XRP
                        </div>
                        
                      )}
                    </div>
                  )}
                </>
              )}
              {/* {depositMsg && <p>{depositMsg}</p>} */}
            </div>
            <div className="modal__foot">
              <button className="btn" onClick={closeDepositModal}>Back</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </DepositModalContext.Provider>
  );
}



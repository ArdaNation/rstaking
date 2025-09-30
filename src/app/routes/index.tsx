import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import RootLayout from '../ui/RootLayout.tsx';
import HomePage from '../ui/pages/main/StakingPage.tsx';
import LoginPage from '../ui/pages/auth/LoginPage.tsx';
import RegisterPage from '../ui/pages/auth/RegisterPage.tsx';
import ForgotPasswordPage from '../ui/pages/auth/ForgotPasswordPage.tsx';
import PasswordRecoveryPage from '../ui/pages/auth/PasswordRecoveryPage.tsx';
import NotFoundPage from '../ui/pages/common/NotFoundPage.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import ProfilePage from '../ui/pages/main/ProfilePage';
import WithdrawPage from '../ui/pages/main/WithdrawPage.tsx';
import HistoryPage from '../ui/pages/main/HistoryPage.tsx';
import HowToStartPage from '../ui/pages/main/HowToStartPage.tsx';
import SecurityPage from '../ui/pages/main/SecurityPage.tsx';
import { ErrorFallbackComponent } from '../providers/errorBoundary/ErrorBoundary.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />} errorElement={<ErrorFallbackComponent />}> 
      <Route element={<ProtectedRoute />}> 
        <Route index element={<HomePage />} errorElement={<ErrorFallbackComponent />} />
      </Route>
      <Route path="login" element={<LoginPage />} errorElement={<ErrorFallbackComponent />} />
      <Route path="forgot" element={<ForgotPasswordPage />} errorElement={<ErrorFallbackComponent />} />
      <Route path="password-recovery" element={<PasswordRecoveryPage />} errorElement={<ErrorFallbackComponent />} />
      <Route path="register" element={<RegisterPage />} errorElement={<ErrorFallbackComponent />} />
      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<ProfilePage />} errorElement={<ErrorFallbackComponent />} />
        <Route path="withdraw" element={<WithdrawPage />} errorElement={<ErrorFallbackComponent />} />
        <Route path="history" element={<HistoryPage />} errorElement={<ErrorFallbackComponent />} />
        <Route path="how-to-start" element={<HowToStartPage />} errorElement={<ErrorFallbackComponent />} />
        <Route path="security" element={<SecurityPage />} errorElement={<ErrorFallbackComponent />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} errorElement={<ErrorFallbackComponent />} />
    </Route>
  )
);

export default router;



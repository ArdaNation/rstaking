import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import RootLayout from '../ui/RootLayout.tsx';
import HomePage from '../ui/pages/ContractsPage.tsx';
import LoginPage from '../ui/pages/LoginPage.tsx';
import RegisterPage from '../ui/pages/RegisterPage.tsx';
import ForgotPasswordPage from '../ui/pages/ForgotPasswordPage.tsx';
import PasswordRecoveryPage from '../ui/pages/PasswordRecoveryPage.tsx';
import NotFoundPage from '../ui/pages/NotFoundPage.tsx';
import ProtectedRoute from './ProtectedRoute.tsx';
import ProfilePage from '../ui/pages/ProfilePage';
import WithdrawPage from '../ui/pages/WithdrawPage.tsx';
import HistoryPage from '../ui/pages/HistoryPage.tsx';
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
      </Route>
      <Route path="*" element={<NotFoundPage />} errorElement={<ErrorFallbackComponent />} />
    </Route>
  )
);

export default router;



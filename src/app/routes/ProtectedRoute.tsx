import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthToken } from '../../shared/auth/useAuthToken';

export default function ProtectedRoute() {
  const token = useAuthToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}


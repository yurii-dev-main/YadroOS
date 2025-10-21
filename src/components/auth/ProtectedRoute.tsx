import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types/auth';
import { hasRoleAccess } from '../../utils/permissions';

interface ProtectedRouteProps {
  roles?: Role[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles, redirectTo = '/login' }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.user?.role);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !hasRoleAccess(userRole, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

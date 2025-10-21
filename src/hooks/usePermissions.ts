import { useMemo } from 'react';

import { useAuthStore } from '../store/authStore';
import type { Permission, Role } from '../types/auth';
import { hasPermission, hasRoleAccess } from '../utils/permissions';

export const usePermissions = () => {
  const role = useAuthStore((state) => state.user?.role);

  return useMemo(
    () => ({
      can: (permission: Permission) => hasPermission(role, permission),
      hasRole: (roles: Role | Role[]) =>
        Array.isArray(roles) ? hasRoleAccess(role, roles) : hasRoleAccess(role, [roles])
    }),
    [role]
  );
};

import type { Permission, Role } from '../types/auth';

export const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    'crm:read',
    'crm:write',
    'communications:read',
    'communications:write',
    'hr:read',
    'hr:write',
    'accounting:read',
    'accounting:write',
    'ai:read'
  ],
  ADMIN: [
    'crm:read',
    'crm:write',
    'communications:read',
    'communications:write',
    'hr:read',
    'hr:write',
    'accounting:read',
    'accounting:write',
    'ai:read'
  ],
  MANAGER: ['crm:read', 'crm:write', 'communications:read', 'communications:write', 'ai:read'],
  OPERATOR: ['crm:read', 'crm:write', 'communications:read', 'ai:read'],
  ACCOUNTANT: ['accounting:read', 'accounting:write', 'ai:read'],
  HR_SPECIALIST: ['hr:read', 'hr:write', 'ai:read'],
  VIEWER: ['crm:read', 'communications:read', 'hr:read', 'accounting:read', 'ai:read']
};

export const hasPermission = (role: Role | undefined, permission: Permission): boolean => {
  if (!role) {
    return false;
  }

  return rolePermissions[role]?.includes(permission) ?? false;
};

export const hasRoleAccess = (role: Role | undefined, allowedRoles: Role[]): boolean => {
  if (!role) {
    return false;
  }

  return allowedRoles.includes(role);
};

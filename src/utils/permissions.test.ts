import { describe, it, expect } from 'vitest';
import { hasPermission, hasRoleAccess } from './permissions';
import type { Role, Permission } from '../types/auth';

describe('Permissions Utility', () => {
  describe('hasPermission', () => {
    it('should return true if the role has the requested permission', () => {
      expect(hasPermission('ADMIN' as Role, 'crm:read' as Permission)).toBe(true);
      expect(hasPermission('ADMIN' as Role, 'ai:read' as Permission)).toBe(true);
    });

    it('should return false if the role does not have the requested permission', () => {
      expect(hasPermission('MANAGER' as Role, 'accounting:write' as Permission)).toBe(false);
      expect(hasPermission('OPERATOR' as Role, 'hr:write' as Permission)).toBe(false);
    });

    it('should return false if role is undefined', () => {
      expect(hasPermission(undefined, 'crm:read' as Permission)).toBe(false);
    });
  });

  describe('hasRoleAccess', () => {
    it('should return true if the role is in the allowed list', () => {
      expect(hasRoleAccess('ADMIN' as Role, ['ADMIN', 'MANAGER'] as Role[])).toBe(true);
      expect(hasRoleAccess('HR_SPECIALIST' as Role, ['HR_SPECIALIST', 'ADMIN'] as Role[])).toBe(true);
    });

    it('should return false if the role is not in the allowed list', () => {
      expect(hasRoleAccess('VIEWER' as Role, ['ADMIN', 'MANAGER'] as Role[])).toBe(false);
    });

    it('should return false if role is undefined', () => {
      expect(hasRoleAccess(undefined, ['ADMIN'] as Role[])).toBe(false);
    });
  });
});

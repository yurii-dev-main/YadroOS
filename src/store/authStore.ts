import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authService } from '../services/authService';
import type { AuthState, Role, User } from '../types/auth';

interface AuthStateExtended extends AuthState {
  currentOrganizationId?: string;
}

interface AuthActions {
  login: (params: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    name: string;
    company: string;
  }) => Promise<void>;
  refreshTokens: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  changePassword: (params: { currentPassword: string; newPassword: string }) => Promise<void>;
  resetPasswordRequest: (email: string) => Promise<void>;
  verifyEmailToken: (token: string) => Promise<boolean>;
  setRole: (role: Role) => void;
  switchOrganization: (organizationId: string) => Promise<void>;
}

export const useAuthStore = create<AuthStateExtended & AuthActions>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      tokens: null,
      currentOrganizationId: undefined,
      login: async ({ email, password, rememberMe }) => {
        const { user, tokens, organizationId } = await authService.login({
          email,
          password,
          rememberMe
        });
        set({ isAuthenticated: true, user, tokens, currentOrganizationId: organizationId });
      },
      register: async ({ email, password, name, company }) => {
        const { user, tokens } = await authService.register({ email, password, name, company });
        set({ isAuthenticated: true, user, tokens });
      },
      refreshTokens: async () => {
        const tokens = get().tokens;
        if (!tokens) {
          return;
        }
        const refreshed = await authService.refresh(tokens.refreshToken);
        set({ tokens: refreshed });
      },
      logout: async () => {
        const tokens = get().tokens;
        if (tokens) {
          await authService.logout(tokens.refreshToken);
        }
        set({ isAuthenticated: false, user: null, tokens: null });
      },
      updateUser: async (user) => {
        const currentUser = get().user;
        if (!currentUser) {
          throw new Error('No user in session');
        }
        const updated = await authService.updateProfile({ ...currentUser, ...user });
        set({ user: updated });
      },
      changePassword: async (params) => {
        await authService.changePassword(params);
      },
      resetPasswordRequest: async (email) => {
        await authService.resetPassword(email);
      },
      verifyEmailToken: async (token) => authService.verifyResetToken(token),
      setRole: (role) => {
        const currentUser = get().user;
        if (!currentUser) {
          return;
        }
        set({ user: { ...currentUser, role } });
      },
      switchOrganization: async (organizationId) => {
        const data = await authService.switchOrganization(organizationId);
        const tokens = get().tokens;
        if (tokens) {
          set({
            tokens: { ...tokens, accessToken: data.accessToken },
            currentOrganizationId: organizationId
          });
          get().setRole(data.role as Role);
        }
      }
    }),
    {
      name: 'yadroos-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        tokens: state.tokens,
        currentOrganizationId: state.currentOrganizationId
      })
    }
  )
);

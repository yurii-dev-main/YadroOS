import type { AuthTokens, User } from '../types/auth';
import { apiClient } from './apiClient';

interface LoginParams {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterParams {
  email: string;
  password: string;
  name: string;
  company: string;
}

interface PasswordChangeParams {
  currentPassword: string;
  newPassword: string;
}

export const authService = {
  async login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens; organizationId?: string }> {
    const { data } = await apiClient.post('/auth/login', params);
    return {
      user: data.user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: 'cookie-based',
        expiresAt: Date.now() + (params.rememberMe ? 1000 * 60 * 60 * 24 : 1000 * 60 * 15)
      },
      organizationId: data.organizationId
    };
  },
  async register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }> {
    const { data } = await apiClient.post('/auth/register', params);
    return {
      user: data.user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: 'cookie-based',
        expiresAt: Date.now() + 1000 * 60 * 15
      }
    };
  },
  async refresh(refreshToken: string): Promise<AuthTokens> {
    const { data } = await apiClient.post('/auth/refresh');
    return {
      accessToken: data.accessToken,
      refreshToken: 'cookie-based',
      expiresAt: Date.now() + 1000 * 60 * 15
    };
  },
  async logout(_refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout');
  },
  async updateProfile(user: User): Promise<User> {
    const { data } = await apiClient.patch('/auth/me', user);
    return data;
  },
  async changePassword(params: PasswordChangeParams): Promise<void> {
    await apiClient.post('/auth/change-password', params);
  },
  async resetPassword(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email });
  },
  async verifyResetToken(token: string): Promise<boolean> {
    const { data } = await apiClient.get(`/auth/reset-password/verify?token=${token}`);
    return data.valid;
  },
  async applyResetToken(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password/apply', { token, newPassword });
  },
  async switchOrganization(organizationId: string): Promise<{ accessToken: string; role: string }> {
    const { data } = await apiClient.post('/auth/switch-org', { organizationId });
    return data;
  }
};

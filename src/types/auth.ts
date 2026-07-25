export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'ACCOUNTANT' | 'HR_SPECIALIST' | 'VIEWER';

export type Permission =
  | 'crm:read'
  | 'crm:write'
  | 'communications:read'
  | 'communications:write'
  | 'hr:read'
  | 'hr:write'
  | 'accounting:read'
  | 'accounting:write'
  | 'ai:read';

export interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: Role;
  avatarUrl?: string;
  preferences: {
    language: 'uk' | 'en';
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
}

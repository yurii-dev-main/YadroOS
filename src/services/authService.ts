import { v4 as uuid } from 'uuid';

import type { AuthTokens, Role, User } from '../types/auth';

interface StoredUser extends User {
  password: string;
}

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

const users = new Map<string, StoredUser>();
const resetTokens = new Map<string, string>();


const createTokens = (rememberMe: boolean): AuthTokens => {
  const expiresIn = rememberMe ? 1000 * 60 * 60 * 24 : 1000 * 60 * 15;
  return {
    accessToken: uuid(),
    refreshToken: uuid(),
    expiresAt: Date.now() + expiresIn
  };
};

const delay = async (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const getDefaultUser = (params: RegisterParams, role: Role = 'VIEWER'): StoredUser => ({
  id: uuid(),
  email: params.email,
  name: params.name,
  company: params.company,
  role,
  password: params.password,
  preferences: {
    language: 'uk',
    theme: 'dark',
    notifications: {
      email: true,
      push: true
    }
  }
});

const seedAdmin = getDefaultUser({ email: 'admin@dao.ua', password: 'Admin123', name: 'Admin', company: 'Yadro DAO' }, 'ADMIN');
users.set(seedAdmin.email.toLowerCase(), seedAdmin);

const sanitizeUser = (user: StoredUser): User => ({
  id: user.id,
  email: user.email,
  name: user.name,
  company: user.company,
  role: user.role,
  avatarUrl: user.avatarUrl,
  preferences: user.preferences
});

export const authService = {
  async login(params: LoginParams): Promise<{ user: User; tokens: AuthTokens }> {
    await delay();
    const stored = users.get(params.email.toLowerCase());
    if (!stored || stored.password !== params.password) {
      throw new Error('Invalid login credentials');
    }
    const tokens = createTokens(params.rememberMe);
    return { user: sanitizeUser(stored), tokens };
  },
  async register(params: RegisterParams): Promise<{ user: User; tokens: AuthTokens }> {
    await delay();
    const key = params.email.toLowerCase();
    if (users.has(key)) {
      throw new Error('User already exists');
    }
    const newUser = getDefaultUser(params);
    users.set(key, newUser);
    const tokens = createTokens(false);
    return { user: sanitizeUser(newUser), tokens };
  },
  async refresh(refreshToken: string): Promise<AuthTokens> {
    await delay(300);
    if (!refreshToken) {
      throw new Error('Invalid refresh token');
    }
    return {
      accessToken: uuid(),
      refreshToken,
      expiresAt: Date.now() + 1000 * 60 * 15
    };
  },
  async logout(_refreshToken: string): Promise<void> {
    await delay(200);
  },
  async updateProfile(user: User): Promise<User> {
    await delay(400);
    const stored = users.get(user.email.toLowerCase());
    if (!stored) {
      throw new Error('User not found');
    }
    const updated: StoredUser = {
      ...stored,
      ...user,
      password: stored.password
    };
    users.set(updated.email.toLowerCase(), updated);
    return sanitizeUser(updated);
  },
  async changePassword({ currentPassword, newPassword }: PasswordChangeParams): Promise<void> {
    await delay(400);
    const userEntry = [...users.entries()].find(([, value]) => value.password === currentPassword);
    if (!userEntry) {
      throw new Error('Invalid current password');
    }
    const [email, stored] = userEntry;
    users.set(email, { ...stored, password: newPassword });
  },
  async resetPassword(email: string): Promise<void> {
    await delay(400);
    const key = email.toLowerCase();
    if (!users.has(key)) {
      throw new Error('Email address not found');
    }
    const token = uuid();
    resetTokens.set(token, key);
  },
  async verifyResetToken(token: string): Promise<boolean> {
    await delay(300);
    return resetTokens.has(token);
  },
  async applyResetToken(token: string, newPassword: string): Promise<void> {
    await delay(300);
    const email = resetTokens.get(token);
    if (!email) {
      throw new Error('Invalid token');
    }
    const stored = users.get(email);
    if (!stored) {
      throw new Error('User not found');
    }
    users.set(email, { ...stored, password: newPassword });
    resetTokens.delete(token);
  }
};

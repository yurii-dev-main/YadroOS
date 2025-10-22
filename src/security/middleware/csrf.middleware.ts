const cryptoProvider: Crypto = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto as Crypto;
  }
  throw new Error('Web Crypto API is not available in this environment');
})();

const randomUuid = () => {
  if (typeof cryptoProvider.randomUUID === 'function') {
    return cryptoProvider.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = cryptoProvider.getRandomValues(new Uint8Array(1))[0] & 15;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
};

import { hashingService } from '../encryption/hashing.service';

const STORAGE_KEY = 'yadroos-csrf-tokens';

interface StoredToken {
  token: string;
  sessionId: string;
  expiresAt: number;
}

const TOKEN_TTL = 60 * 60 * 1000;

const getStorage = (): StoredToken[] => {
  if (typeof sessionStorage === 'undefined') {
    return [];
  }
  const raw = sessionStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as StoredToken[]) : [];
};

const persist = (tokens: StoredToken[]) => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }
};

export class CsrfMiddleware {
  async createToken(sessionId: string): Promise<string> {
    const rawToken = randomUuid();
    const expiresAt = Date.now() + TOKEN_TTL;
    const tokens = getStorage();
    const hashed = await hashingService.hashToken(rawToken);
    tokens.push({ token: hashed, sessionId, expiresAt });
    persist(tokens);
    return rawToken;
  }

  async verify(sessionId: string, token: string): Promise<boolean> {
    const tokens = getStorage();
    const now = Date.now();
    const validTokens = tokens.filter((item) => item.expiresAt > now);
    persist(validTokens);
    const match = validTokens.find((item) => item.sessionId === sessionId);
    if (!match) {
      return false;
    }
    return hashingService.compareSecret(token, match.token);
  }
}

export const csrfMiddleware = new CsrfMiddleware();

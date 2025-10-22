import { hashingService } from '../encryption/hashing.service';

const cryptoProvider: Crypto = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto as Crypto;
  }
  throw new Error('Web Crypto API is not available in this environment');
})();

interface LoginAttemptState {
  attempts: number;
  backoffLevel: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
}

export interface LoginDecision {
  allowed: boolean;
  requireCaptcha: boolean;
  lockedUntil?: number;
  retryAfter?: number;
}

export interface SessionDevice {
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export interface SessionRecord {
  sessionId: string;
  userId: string;
  createdAt: number;
  lastActiveAt: number;
  device: SessionDevice;
  fingerprint: string;
  expiresAt: number;
}

export interface SuspiciousActivityEvent {
  userId: string;
  ipAddress: string;
  attempts: number;
  lastAttemptAt: number;
}

const LOCKOUT_THRESHOLDS = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000];
const MAX_IDLE_TIME = 30 * 60 * 1000;
const SESSION_TTL = 24 * 60 * 60 * 1000;

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

const deviceFingerprint = async (device: SessionDevice) =>
  hashingService.hashToken(`${device.ipAddress}:${device.userAgent}:${device.location ?? ''}`);

export class AuthSecurityManager {
  private attempts = new Map<string, LoginAttemptState>();

  private sessions = new Map<string, SessionRecord>();

  private onSuspiciousActivity?: (event: SuspiciousActivityEvent) => void;

  constructor(private readonly maxAttempts = 5) {}

  registerSuspiciousActivityHandler(handler: (event: SuspiciousActivityEvent) => void) {
    this.onSuspiciousActivity = handler;
  }

  evaluateLoginAttempt(identifier: string): LoginDecision {
    const now = Date.now();
    const state = this.attempts.get(identifier) ?? {
      attempts: 0,
      backoffLevel: 0,
      lockedUntil: null,
      lastAttemptAt: 0
    };

    if (state.lockedUntil && now < state.lockedUntil) {
      return { allowed: false, requireCaptcha: true, lockedUntil: state.lockedUntil, retryAfter: state.lockedUntil - now };
    }

    state.attempts += 1;
    state.lastAttemptAt = now;

    let lockedUntil: number | null = null;
    if (state.attempts >= this.maxAttempts) {
      const penaltyIndex = Math.min(state.backoffLevel, LOCKOUT_THRESHOLDS.length - 1);
      lockedUntil = now + LOCKOUT_THRESHOLDS[penaltyIndex];
      state.lockedUntil = lockedUntil;
      state.backoffLevel = Math.min(state.backoffLevel + 1, LOCKOUT_THRESHOLDS.length - 1);
    }

    this.attempts.set(identifier, state);

    if (state.attempts >= 3 && this.onSuspiciousActivity) {
      this.onSuspiciousActivity({
        userId: identifier,
        ipAddress: identifier,
        attempts: state.attempts,
        lastAttemptAt: state.lastAttemptAt
      });
    }

    return {
      allowed: lockedUntil === null,
      requireCaptcha: state.attempts >= 3,
      lockedUntil: state.lockedUntil ?? undefined,
      retryAfter: lockedUntil ? lockedUntil - now : undefined
    };
  }

  recordSuccessfulLogin(identifier: string) {
    this.attempts.delete(identifier);
  }

  async createSession(userId: string, device: SessionDevice): Promise<SessionRecord> {
    const sessionId = randomUuid();
    const now = Date.now();
    const fingerprint = await deviceFingerprint(device);
    const record: SessionRecord = {
      sessionId,
      userId,
      createdAt: now,
      lastActiveAt: now,
      device,
      fingerprint,
      expiresAt: now + SESSION_TTL
    };
    this.sessions.set(sessionId, record);
    return record;
  }

  touchSession(sessionId: string): boolean {
    const record = this.sessions.get(sessionId);
    if (!record) {
      return false;
    }
    const now = Date.now();
    if (record.expiresAt < now || now - record.lastActiveAt > MAX_IDLE_TIME) {
      this.sessions.delete(sessionId);
      return false;
    }
    record.lastActiveAt = now;
    record.expiresAt = now + SESSION_TTL;
    this.sessions.set(sessionId, record);
    return true;
  }

  listSessions(userId: string): SessionRecord[] {
    this.removeExpiredSessions();
    return [...this.sessions.values()].filter((session) => session.userId === userId);
  }

  forceLogout(sessionId: string) {
    this.sessions.delete(sessionId);
  }

  forceLogoutAll(userId: string) {
    for (const session of this.listSessions(userId)) {
      this.sessions.delete(session.sessionId);
    }
  }

  removeExpiredSessions() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  async isKnownDevice(userId: string, device: SessionDevice): Promise<boolean> {
    const fingerprint = await deviceFingerprint(device);
    return this.listSessions(userId).some((session) => session.fingerprint === fingerprint);
  }
}

export const authSecurityManager = new AuthSecurityManager();

import { encryptionService } from '../encryption/encryption.service';

export type AuditAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'EXPORT';

export interface AuditLogEntry<TPayload = unknown> {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  payload: TPayload;
  ipAddress?: string;
  createdAt: number;
  hash: string;
}

interface AuditLogConfig {
  encryptionKey: string;
  retentionMs: number;
}

interface StoredAuditEntry {
  iv: string;
  cipherText: string;
  tag?: string;
}

const STORAGE_KEY = 'yadroos-audit-log';

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

const toBuffer = (value: string) => new TextEncoder().encode(value);

const toBase64 = (value: string) => {
  if (typeof btoa === 'function') {
    return btoa(value);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf-8').toString('base64');
  }
  throw new Error('Unable to encode to base64');
};

const digest = async (value: string) => {
  const hashBuffer = await cryptoProvider.subtle.digest('SHA-256', toBuffer(value));
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const readStorage = (): StoredAuditEntry[] => {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as StoredAuditEntry[];
  } catch (error) {
    console.error('Failed to parse audit log', error);
    return [];
  }
};

const writeStorage = (entries: StoredAuditEntry[]) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
};

export class AuditLogService {
  constructor(private readonly config: AuditLogConfig) {}

  private async encryptEntry(entry: AuditLogEntry) {
    const serialized = JSON.stringify(entry);
    return encryptionService.encrypt(serialized, this.config.encryptionKey);
  }

  private async decryptEntry(entry: StoredAuditEntry): Promise<AuditLogEntry | null> {
    try {
      const decrypted = await encryptionService.decrypt(entry, this.config.encryptionKey);
      return JSON.parse(decrypted) as AuditLogEntry;
    } catch (error) {
      console.error('Failed to decrypt audit entry', error);
      return null;
    }
  }

  async record<TPayload>(params: Omit<AuditLogEntry<TPayload>, 'id' | 'createdAt' | 'hash'>): Promise<AuditLogEntry<TPayload>> {
    const entry: AuditLogEntry<TPayload> = {
      ...params,
      id: randomUuid(),
      createdAt: Date.now(),
      hash: ''
    };
    entry.hash = await digest(`${entry.userId}-${entry.resource}-${entry.createdAt}-${JSON.stringify(entry.payload)}`);
    const encrypted = await this.encryptEntry(entry);
    const stored = readStorage();
    stored.push(encrypted);
    writeStorage(stored);
    return entry;
  }

  async export(): Promise<string> {
    const stored = readStorage();
    const payload = { exportedAt: new Date().toISOString(), entries: stored };
    return JSON.stringify(payload, null, 2);
  }

  async list(): Promise<AuditLogEntry[]> {
    const stored = readStorage();
    const decrypted = await Promise.all(stored.map((entry) => this.decryptEntry(entry)));
    return decrypted.filter((entry): entry is AuditLogEntry => Boolean(entry));
  }

  async prune(): Promise<void> {
    const threshold = Date.now() - this.config.retentionMs;
    const stored = readStorage();
    const decrypted = await Promise.all(stored.map((entry) => this.decryptEntry(entry)));
    const filtered: StoredAuditEntry[] = [];
    decrypted.forEach((item, index) => {
      if (item && item.createdAt >= threshold) {
        filtered.push(stored[index]);
      }
    });
    writeStorage(filtered);
  }
}

const resolveKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AUDIT_LOG_KEY) {
    return import.meta.env.VITE_AUDIT_LOG_KEY as string;
  }
  return toBase64('default-audit-key-default-audit-key-32');
};

export const auditLogService = new AuditLogService({
  encryptionKey: resolveKey(),
  retentionMs: 365 * 24 * 60 * 60 * 1000
});

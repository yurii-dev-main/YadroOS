import { hashingService } from '../encryption/hashing.service';

export interface TotpSetupPayload {
  secret: string;
  otpauthUrl: string;
  backupCodes: string[];
  qrCodeDataUrl?: string;
}

export interface TotpVerifyOptions {
  token: string;
  secret: string;
  window?: number;
}

export interface RememberDevicePayload {
  deviceId: string;
  userId: string;
  expiresAt: number;
}

interface RememberedDeviceEntry {
  token: string;
  expiresAt: number;
}

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const SECRET_KEY_BYTES = 20;
const DEFAULT_STEP = 30;

const cryptoProvider: Crypto = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto as Crypto;
  }
  throw new Error('Web Crypto API is not available in this environment');
})();

const base32Encode = (bytes: Uint8Array): string => {
  let output = '';
  let buffer = 0;
  let bitsLeft = 0;

  bytes.forEach((byte) => {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;

    while (bitsLeft >= 5) {
      const index = (buffer >>> (bitsLeft - 5)) & 31;
      bitsLeft -= 5;
      output += BASE32_ALPHABET[index];
    }
  });

  if (bitsLeft > 0) {
    const index = (buffer << (5 - bitsLeft)) & 31;
    output += BASE32_ALPHABET[index];
  }

  return output;
};

const base32Decode = (input: string): Uint8Array => {
  const cleaned = input.toUpperCase().replace(/=+$/, '');
  let buffer = 0;
  let bitsLeft = 0;
  const bytes: number[] = [];

  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      continue;
    }

    buffer = (buffer << 5) | index;
    bitsLeft += 5;

    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      bytes.push((buffer >>> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(bytes);
};

const leftPad = (value: string, length: number) => value.padStart(length, '0');

const getTimeCounter = (timestamp = Date.now(), step = DEFAULT_STEP) => {
  const counter = Math.floor(timestamp / 1000 / step);
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  const high = Math.floor(counter / 0x100000000);
  const low = counter & 0xffffffff;
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);
  return new Uint8Array(buffer);
};

const createSecret = () => {
  const buffer = new Uint8Array(SECRET_KEY_BYTES);
  cryptoProvider.getRandomValues(buffer);
  return base32Encode(buffer);
};

const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

const rememberDeviceStorageKey = (userId: string) => `yadroos-security-remembered-${userId}`;

export class TotpService {
  static async generateSetupPayload(account: string, issuer: string): Promise<TotpSetupPayload> {
    const secret = createSecret();
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&period=${DEFAULT_STEP}`;
    const backupCodes = await this.generateBackupCodes();
    return { secret, otpauthUrl, backupCodes };
  }

  static async generateQRCode(otpauthUrl: string): Promise<string> {
    const { toDataURL } = await import('qrcode');
    return toDataURL(otpauthUrl, { errorCorrectionLevel: 'M', margin: 1, scale: 6 });
  }

  static async generateBackupCodes(count = 10): Promise<string[]> {
    const codes: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const random = cryptoProvider.getRandomValues(new Uint8Array(6));
      const hex = toHex(random);
      const formatted = `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
      codes.push(formatted);
    }
    return codes;
  }

  static async hashBackupCodes(codes: string[]): Promise<string[]> {
    const hashedCodes: string[] = [];
    for (const code of codes) {
      // eslint-disable-next-line no-await-in-loop
      hashedCodes.push(await hashingService.hashSecret(code));
    }
    return hashedCodes;
  }

  static async verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
    for (const hashed of hashedCodes) {
      // eslint-disable-next-line no-await-in-loop
      const match = await hashingService.compareSecret(code, hashed);
      if (match) {
        return true;
      }
    }
    return false;
  }

  static async generateToken(secret: string, timestamp = Date.now(), step = DEFAULT_STEP, digits = 6): Promise<string> {
    const counter = getTimeCounter(timestamp, step);
    const decodedSecret = base32Decode(secret);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const key = await cryptoProvider.subtle.importKey('raw', decodedSecret as any, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signature = await cryptoProvider.subtle.sign('HMAC', key, counter as any);
    const hmac = new Uint8Array(signature);
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
    const otp = binary % 10 ** digits;
    return leftPad(String(otp), digits);
  }

  static async verifyToken({ token, secret, window = 1 }: TotpVerifyOptions): Promise<boolean> {
    const currentTime = Date.now();
    for (let errorWindow = -window; errorWindow <= window; errorWindow += 1) {
      const timestamp = currentTime + errorWindow * DEFAULT_STEP * 1000;
      // eslint-disable-next-line no-await-in-loop
      const generated = await this.generateToken(secret, timestamp);
      if (generated === token) {
        return true;
      }
    }
    return false;
  }

  static async rememberDevice(payload: RememberDevicePayload): Promise<void> {
    const { deviceId, userId, expiresAt } = payload;
    const key = rememberDeviceStorageKey(userId);
    const hashed = await hashingService.hashSecret(deviceId);
    const entry: RememberedDeviceEntry = { token: hashed, expiresAt };
    const existingRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const existing: RememberedDeviceEntry[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push(entry);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(existing));
    }
  }

  static async isDeviceRemembered(userId: string, deviceId: string): Promise<boolean> {
    const key = rememberDeviceStorageKey(userId);
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const storedRaw = localStorage.getItem(key);
    if (!storedRaw) {
      return false;
    }
    const stored: RememberedDeviceEntry[] = JSON.parse(storedRaw);
    const now = Date.now();
    const validEntries = stored.filter((entry) => entry.expiresAt > now);
    localStorage.setItem(key, JSON.stringify(validEntries));
    for (const entry of validEntries) {
      // eslint-disable-next-line no-await-in-loop
      if (await hashingService.compareSecret(deviceId, entry.token)) {
        return true;
      }
    }
    return false;
  }
}

export const totpService = TotpService;

const cryptoProvider: Crypto = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto as Crypto;
  }
  throw new Error('Web Crypto API is not available in this environment');
})();

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export interface EncryptionPayload {
  iv: string;
  cipherText: string;
  tag?: string;
}

const toBase64 = (bytes: ArrayBuffer): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const bytesArray = new Uint8Array(bytes);
  bytesArray.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const fromBase64 = (value: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const importKey = async (rawKey: string) => {
  const keyBytes = fromBase64(rawKey);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cryptoProvider.subtle.importKey('raw', keyBytes as any, 'AES-GCM', false, [
    'encrypt',
    'decrypt'
  ]);
};

const createIv = (length = 12) => {
  const iv = new Uint8Array(length);
  cryptoProvider.getRandomValues(iv);
  return iv;
};

export const encryptionService = {
  async encrypt(plainText: string, base64Key: string): Promise<EncryptionPayload> {
    const key = await importKey(base64Key);
    const iv = createIv();
    const encoded = textEncoder.encode(plainText);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cipherBuffer = await cryptoProvider.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      encoded as any
    );
    return {
      iv: toBase64(iv.buffer),
      cipherText: toBase64(cipherBuffer)
    };
  },
  async decrypt(payload: EncryptionPayload, base64Key: string): Promise<string> {
    const key = await importKey(base64Key);
    const iv = fromBase64(payload.iv);
    const data = fromBase64(payload.cipherText);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plainBuffer = await cryptoProvider.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as any },
      key,
      data as any
    );
    return textDecoder.decode(plainBuffer);
  }
};

export type EncryptionService = typeof encryptionService;

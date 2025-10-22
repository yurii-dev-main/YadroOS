import { apiClient } from '../../services/apiClient';

export interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateWebhookSignature(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toHex(signature);
}

export async function verifyWebhookSignature(
  secret: string,
  payload: string,
  signature: string
): Promise<boolean> {
  const computed = await generateWebhookSignature(secret, payload);
  return timingSafeEqual(computed, signature);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function buildApiKeyHeader(apiKey: string): Record<string, string> {
  return { 'X-API-Key': apiKey };
}

export function getApiKeyPreview(apiKey: string): string {
  return `${apiKey.slice(0, 4)}••••${apiKey.slice(-4)}`;
}

export const apiKeyService = {
  list() {
    return apiClient.get<ApiKeyRecord[]>('/auth/api-keys').then((response) => response.data);
  },
  create(name: string) {
    return apiClient
      .post<{ apiKey: string; record: ApiKeyRecord }>('/auth/api-keys', { name })
      .then((response) => response.data);
  },
  revoke(keyId: string) {
    return apiClient.delete(`/auth/api-keys/${keyId}`).then(() => undefined);
  }
};

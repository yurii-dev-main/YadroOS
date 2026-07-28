export type IntegrationProvider =
  | 'monobank'
  | 'privatbank'
  | 'gmail'
  | 'outlook'
  | 'custom-smtp'
  | 'telegram'
  | 'whatsapp'
  | 'google-calendar'
  | 'microsoft-calendar'
  | 'gemini';

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope?: string[];
}

export interface IntegrationToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string[];
  metadata?: Record<string, unknown>;
}

export interface SyncLogEntry {
  id: string;
  provider: IntegrationProvider;
  startedAt: string;
  finishedAt?: string;
  status: 'pending' | 'success' | 'failed';
  message?: string;
  details?: Record<string, unknown>;
}

export interface SyncHistoryResponse {
  entries: SyncLogEntry[];
  nextCursor?: string;
}

export interface IntegrationConnection {
  id: string;
  provider: IntegrationProvider;
  displayName: string;
  connectedAt: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: string;
  configuration: Record<string, unknown>;
}

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResponse<TItem> {
  items: TItem[];
  nextCursor?: string;
  previousCursor?: string;
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required?: boolean;
}

export interface ImportPreviewRow<T> {
  raw: Record<string, string>;
  mapped: Partial<T>;
  errors?: string[];
}

export interface ImportPreviewResponse<T> {
  rows: ImportPreviewRow<T>[];
  validCount: number;
  invalidCount: number;
}

export interface IntegrationHealthStatus {
  provider: IntegrationProvider;
  status: 'healthy' | 'degraded' | 'unavailable';
  checkedAt: string;
  issues?: string[];
  metrics?: Record<string, number>;
}

export interface ApiUsageMetric {
  keyId: string;
  periodStart: string;
  periodEnd: string;
  totalRequests: number;
  throttledRequests: number;
  averageLatencyMs?: number;
}

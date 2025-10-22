import { apiClient } from '../../services/apiClient';
import type {
  CursorPaginationParams,
  IntegrationConnection,
  IntegrationToken,
  SyncHistoryResponse
} from '../types';

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  snippet: string;
  receivedAt: string;
  labels: string[];
}

export interface GmailCalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  attendees: Array<{ email: string; responseStatus?: string }>;
  hangoutLink?: string;
}

export class GmailIntegration {
  private readonly basePath = '/integrations/email/gmail';

  startOAuth(redirectUri: string, scopes: string[]): Promise<{ authorizationUrl: string }> {
    return apiClient
      .post(`${this.basePath}/oauth/start`, { redirectUri, scopes })
      .then((response) => response.data as { authorizationUrl: string });
  }

  exchangeCode(code: string): Promise<IntegrationConnection> {
    return apiClient
      .post(`${this.basePath}/oauth/exchange`, { code })
      .then((response) => response.data as IntegrationConnection);
  }

  refreshToken(connectionId: string): Promise<IntegrationToken> {
    return apiClient
      .post(`${this.basePath}/connections/${connectionId}/token/refresh`)
      .then((response) => response.data as IntegrationToken);
  }

  listMessages(
    connectionId: string,
    params?: CursorPaginationParams & { query?: string }
  ): Promise<{ items: GmailMessageSummary[]; nextCursor?: string }> {
    return apiClient
      .get(`${this.basePath}/connections/${connectionId}/messages`, { params })
      .then((response) => response.data as { items: GmailMessageSummary[]; nextCursor?: string });
  }

  syncCalendar(connectionId: string): Promise<SyncHistoryResponse> {
    return apiClient
      .post(`${this.basePath}/connections/${connectionId}/calendar/sync`)
      .then((response) => response.data as SyncHistoryResponse);
  }

  listEvents(
    connectionId: string,
    params?: CursorPaginationParams & { from?: string; to?: string }
  ): Promise<{ items: GmailCalendarEvent[]; nextCursor?: string }> {
    return apiClient
      .get(`${this.basePath}/connections/${connectionId}/calendar/events`, { params })
      .then((response) => response.data as { items: GmailCalendarEvent[]; nextCursor?: string });
  }
}

export const gmailIntegration = new GmailIntegration();

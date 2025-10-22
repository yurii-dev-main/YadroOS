import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams, IntegrationConnection, SyncHistoryResponse } from '../types';

export interface OutlookContact {
  id: string;
  displayName: string;
  emailAddresses: string[];
  jobTitle?: string;
  businessPhones?: string[];
}

export interface OutlookCalendarEvent {
  id: string;
  subject: string;
  start: string;
  end: string;
  organizer: string;
  location?: string;
  isOnlineMeeting?: boolean;
}

export class OutlookIntegration {
  private readonly basePath = '/integrations/email/outlook';

  startAzureAuth(redirectUri: string, tenantId: string): Promise<{ authorizationUrl: string }> {
    return apiClient
      .post(`${this.basePath}/oauth/start`, { redirectUri, tenantId })
      .then((response) => response.data as { authorizationUrl: string });
  }

  exchangeCode(code: string): Promise<IntegrationConnection> {
    return apiClient
      .post(`${this.basePath}/oauth/exchange`, { code })
      .then((response) => response.data as IntegrationConnection);
  }

  listContacts(
    connectionId: string,
    params?: CursorPaginationParams
  ): Promise<{ items: OutlookContact[]; nextCursor?: string }> {
    return apiClient
      .get(`${this.basePath}/connections/${connectionId}/contacts`, { params })
      .then((response) => response.data as { items: OutlookContact[]; nextCursor?: string });
  }

  syncCalendar(connectionId: string): Promise<SyncHistoryResponse> {
    return apiClient
      .post(`${this.basePath}/connections/${connectionId}/calendar/sync`)
      .then((response) => response.data as SyncHistoryResponse);
  }

  listEvents(
    connectionId: string,
    params?: CursorPaginationParams & { from?: string; to?: string }
  ): Promise<{ items: OutlookCalendarEvent[]; nextCursor?: string }> {
    return apiClient
      .get(`${this.basePath}/connections/${connectionId}/calendar/events`, { params })
      .then((response) => response.data as { items: OutlookCalendarEvent[]; nextCursor?: string });
  }
}

export const outlookIntegration = new OutlookIntegration();

import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams, SyncHistoryResponse } from '../types';
import type { CalendarEvent, CalendarEventInput } from './google-calendar';

export interface CalendarConflict {
  eventId: string;
  conflictingEventId: string;
  startsAt: string;
  endsAt: string;
  resolution: 'keep_local' | 'use_remote' | 'merge';
}

export class MicrosoftCalendarIntegration {
  private readonly basePath = '/integrations/calendar/microsoft';

  sync(connectionId: string): Promise<SyncHistoryResponse> {
    return apiClient
      .post(`${this.basePath}/connections/${connectionId}/sync`)
      .then((response) => response.data as SyncHistoryResponse);
  }

  listEvents(
    connectionId: string,
    params?: CursorPaginationParams & { from?: string; to?: string; timezone?: string }
  ): Promise<{ items: CalendarEvent[]; nextCursor?: string }> {
    return apiClient
      .get(`${this.basePath}/connections/${connectionId}/events`, { params })
      .then((response) => response.data as { items: CalendarEvent[]; nextCursor?: string });
  }

  createEvent(connectionId: string, payload: CalendarEventInput): Promise<CalendarEvent> {
    return apiClient
      .post(`${this.basePath}/connections/${connectionId}/events`, payload)
      .then((response) => response.data as CalendarEvent);
  }

  detectConflicts(connectionId: string): Promise<CalendarConflict[]> {
    return apiClient
      .get(`${this.basePath}/connections/${connectionId}/conflicts`)
      .then((response) => response.data as CalendarConflict[]);
  }

  resolveConflict(
    connectionId: string,
    conflictId: string,
    resolution: CalendarConflict['resolution']
  ): Promise<CalendarConflict> {
    return apiClient
      .post(`${this.basePath}/connections/${connectionId}/conflicts/${conflictId}`, { resolution })
      .then((response) => response.data as CalendarConflict);
  }
}

export const microsoftCalendarIntegration = new MicrosoftCalendarIntegration();

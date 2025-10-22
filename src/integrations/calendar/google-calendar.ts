import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams, SyncHistoryResponse } from '../types';

export interface CalendarEventInput {
  title: string;
  description?: string;
  start: string;
  end: string;
  timeZone: string;
  attendees?: Array<{ email: string; optional?: boolean }>;
  reminders?: Array<{ method: 'email' | 'popup'; minutesBefore: number }>;
}

export interface CalendarEvent extends CalendarEventInput {
  id: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  organizerEmail: string;
  conferenceLink?: string;
}

export class GoogleCalendarIntegration {
  private readonly basePath = '/integrations/calendar/google';

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

  updateEvent(
    connectionId: string,
    eventId: string,
    payload: Partial<CalendarEventInput> & { sequence?: number }
  ): Promise<CalendarEvent> {
    return apiClient
      .put(`${this.basePath}/connections/${connectionId}/events/${eventId}`, payload)
      .then((response) => response.data as CalendarEvent);
  }

  deleteEvent(connectionId: string, eventId: string, notifyAttendees = false): Promise<void> {
    return apiClient
      .delete(`${this.basePath}/connections/${connectionId}/events/${eventId}`, {
        params: { notifyAttendees }
      })
      .then(() => undefined);
  }
}

export const googleCalendarIntegration = new GoogleCalendarIntegration();

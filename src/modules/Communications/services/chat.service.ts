/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import {
  AutoResponder,
  CannedResponse,
  ChatMessage,
  ChatParticipant,
  ChatThread,
  MessageSearchParams,
  NotificationPreferences
} from '../types/communication.types';
import { apiClient } from '../../../services/apiClient';

export const chatService = {
  async fetchThreads() {
    const response = await apiClient.get<ChatThread[]>('/v1/communications/threads');
    return response.data;
  },

  async fetchMessages(chatId: string) {
    const response = await apiClient.get<ChatMessage[]>(
      `/v1/communications/threads/${chatId}/messages`
    );
    return response.data;
  },

  async searchMessages(params: MessageSearchParams) {
    const response = await apiClient.get<ChatMessage[]>('/v1/communications/messages', { params });
    return response.data;
  },

  async sendMessage(chatId: string, author: ChatParticipant, content: string) {
    const response = await apiClient.post<ChatMessage>('/v1/communications/messages', {
      chatId,
      author,
      content
    });
    return response.data;
  },

  async updateTypingStatus() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  },

  async fetchCannedResponses() {
    const response = await apiClient.get<CannedResponse[]>('/v1/communications/canned-responses');
    return response.data;
  },

  async fetchAutoResponders(): Promise<AutoResponder[]> {
    try {
      const response = await apiClient.get<any>('/v1/communications/auto-responders');
      const data = response.data?.data || response.data || [];
      return data.map((r: any) => ({
        ...r,
        id: String(r.id),
        type:
          r.type ||
          (r.name?.toLowerCase().includes('welcome') ? 'welcome_message' : 'out_of_office'),
        message: r.message || 'Thank you for your message. We will get back to you shortly.',
        active: !!r.active
      }));
    } catch {
      return [];
    }
  },

  async fetchNotificationPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await apiClient.get<any>('/v1/communications/notification-preferences');
      const data = response.data?.data || response.data || {};
      return {
        desktop: data.pushNotifications ?? data.desktop ?? true,
        sound: data.sound ?? true,
        emailDigest: data.emailDigest ?? 'daily',
        doNotDisturb: data.doNotDisturb ?? false,
        channelPreferences: data.channelPreferences || {
          email: data.emailNotifications ?? true,
          telegram: true,
          whatsapp: false,
          livechat: true,
          internal: true
        }
      };
    } catch {
      return {
        desktop: true,
        sound: true,
        emailDigest: 'daily',
        doNotDisturb: false,
        channelPreferences: {
          email: true,
          telegram: true,
          whatsapp: false,
          livechat: true,
          internal: true
        }
      };
    }
  },

  async updateNotificationPreferences(prefs: NotificationPreferences) {
    const response = await apiClient.put<NotificationPreferences>(
      '/v1/communications/notification-preferences',
      prefs
    );
    return response.data;
  }
};

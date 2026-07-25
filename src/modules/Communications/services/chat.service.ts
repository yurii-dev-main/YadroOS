import {
  AutoResponder,
  CannedResponse,
  ChatMessage,
  ChatParticipant,
  ChatThread,
  MessageSearchParams,
  NotificationPreferences,
} from '../types/communication.types';
import { apiClient } from '../../../services/apiClient';

const cannedResponses: CannedResponse[] = [
  { id: 'cr-1', shortcut: '/thanks', title: 'Thank You', content: 'Thank you for reaching out! We are already working on your request.' },
  {
    id: 'cr-2',
    shortcut: '/schedule',
    title: 'Offer a call',
    content: 'Would it be convenient for you to discuss the details on a short call tomorrow at 12:00?',
  },
];

const autoResponders: AutoResponder[] = [
  {
    id: 'auto-1',
    type: 'out_of_office',
    active: false,
    message: 'Hello! We are currently out of office, we will get back to you within 24 hours.',
  },
  {
    id: 'auto-2',
    type: 'business_hours',
    active: true,
    message: 'Welcome! We work from 9:00 to 18:00. We will reply as soon as we are online.',
  },
];

const notificationPreferences: NotificationPreferences = {
  desktop: true,
  emailDigest: 'daily',
  sound: true,
  urgentOnly: false,
  doNotDisturb: false,
  schedule: {
    startHour: 9,
    endHour: 18,
    timezone: 'Europe/Kyiv',
    days: [1, 2, 3, 4, 5],
  },
  channelPreferences: {
    email: true,
    internal: true,
    telegram: false,
  },
};

export const chatService = {
  async fetchThreads() {
    const response = await apiClient.get<ChatThread[]>('/v1/communications/threads');
    return response.data;
  },

  async fetchMessages(chatId: string) {
    const response = await apiClient.get<ChatMessage[]>(`/v1/communications/threads/${chatId}/messages`);
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
      content,
    });
    return response.data;
  },

  async updateTypingStatus() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  },

  async fetchCannedResponses() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return cannedResponses;
  },

  async fetchAutoResponders() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return autoResponders;
  },

  async fetchNotificationPreferences() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return notificationPreferences;
  },

  async updateNotificationPreferences(prefs: NotificationPreferences) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    Object.assign(notificationPreferences, prefs);
    return notificationPreferences;
  },
};

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
  { id: 'cr-1', shortcut: '/thanks', title: 'Подяка', content: 'Дякуємо за звернення! Ми вже працюємо над вашим запитом.' },
  {
    id: 'cr-2',
    shortcut: '/schedule',
    title: 'Запропонувати дзвінок',
    content: 'Чи зручно буде вам обговорити деталі на короткому дзвінку завтра о 12:00?',
  },
];

const autoResponders: AutoResponder[] = [
  {
    id: 'auto-1',
    type: 'out_of_office',
    active: false,
    message: 'Доброго дня! Ми зараз поза офісом, повернемося до вас протягом 24 годин.',
  },
  {
    id: 'auto-2',
    type: 'business_hours',
    active: true,
    message: 'Вітаємо! Ми працюємо з 9:00 до 18:00. Відповімо одразу, як будемо онлайн.',
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

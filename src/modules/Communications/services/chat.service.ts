import { v4 as uuid } from 'uuid';
import {
  AutoResponder,
  CannedResponse,
  ChatMessage,
  ChatParticipant,
  ChatThread,
  MessageSearchParams,
  NotificationPreferences,
} from '../types/communication.types';
import { filterMessages } from '../utils/message.utils';

const teamMembers: ChatParticipant[] = [
  { id: 'u-1', name: 'Анна Левченко', avatar: 'https://i.pravatar.cc/64?img=15', role: 'Support', online: true },
  { id: 'u-2', name: 'Сергій Поліщук', avatar: 'https://i.pravatar.cc/64?img=18', role: 'Sales', online: true },
  { id: 'u-3', name: 'Ірина Петренко', avatar: 'https://i.pravatar.cc/64?img=25', role: 'Marketing', online: false },
];

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

const chatThreads: ChatThread[] = [
  {
    id: 'chat-1',
    title: 'Підтримка / Марія',
    participants: [teamMembers[0], teamMembers[1]],
    type: 'group',
    unreadCount: 2,
    lastMessage: {
      id: 'msg-3',
      chatId: 'chat-1',
      author: teamMembers[1],
      content: 'Перевірив CRM картку, додав нотатку.',
      createdAt: '2024-02-05T08:20:00Z',
      status: 'read',
    },
  },
  {
    id: 'chat-2',
    title: 'DM / Сергій',
    participants: [teamMembers[1]],
    type: 'dm',
    unreadCount: 0,
    lastMessage: {
      id: 'msg-5',
      chatId: 'chat-2',
      author: teamMembers[1],
      content: 'Готовий до синку о 15:00.',
      createdAt: '2024-02-04T11:44:00Z',
      status: 'delivered',
    },
  },
];

const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    author: teamMembers[0],
    content: 'Колеги, Марія питає про інтеграцію з e-commerce.',
    createdAt: '2024-02-05T08:01:00Z',
    status: 'read',
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    author: teamMembers[1],
    content: 'Я уточню у техпідтримки, чи є готовий конектор.',
    createdAt: '2024-02-05T08:05:00Z',
    status: 'read',
  },
  {
    id: 'msg-3',
    chatId: 'chat-1',
    author: teamMembers[1],
    content: 'Перевірив CRM картку, додав нотатку.',
    createdAt: '2024-02-05T08:20:00Z',
    status: 'read',
  },
  {
    id: 'msg-4',
    chatId: 'chat-1',
    author: teamMembers[2],
    content: 'Я можу підготувати оновлений one-pager для неї.',
    createdAt: '2024-02-05T08:25:00Z',
    status: 'delivered',
  },
  {
    id: 'msg-5',
    chatId: 'chat-2',
    author: teamMembers[1],
    content: 'Готовий до синку о 15:00.',
    createdAt: '2024-02-04T11:44:00Z',
    status: 'delivered',
  },
];

export const chatService = {
  async fetchThreads() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return chatThreads;
  },

  async fetchMessages(chatId: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return chatMessages.filter((message) => message.chatId === chatId);
  },

  async searchMessages(params: MessageSearchParams) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return filterMessages(chatMessages, params);
  },

  async sendMessage(chatId: string, author: ChatParticipant, content: string) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newMessage: ChatMessage = {
      id: uuid(),
      chatId,
      author,
      content,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    chatMessages.push(newMessage);
    const thread = chatThreads.find((item) => item.id === chatId);
    if (thread) {
      thread.lastMessage = newMessage;
      thread.unreadCount = 0;
    }
    return newMessage;
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

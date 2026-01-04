import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

type ChatParticipant = {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  online?: boolean;
};

type ChatMessage = {
  id: string;
  chatId: string;
  author: ChatParticipant;
  content: string;
  createdAt: string;
  status?: 'sent' | 'delivered' | 'read';
};

type ChatThread = {
  id: string;
  title: string;
  participants: ChatParticipant[];
  type: 'dm' | 'group';
  lastMessage?: ChatMessage;
  unreadCount?: number;
};

type TelegramStatus = {
  connected: boolean;
  botName?: string | null;
  webhookUrl?: string | null;
  lastEventAt?: string | null;
};

const teamMembers: ChatParticipant[] = [
  { id: 'u-1', name: 'Анна Левченко', avatar: 'https://i.pravatar.cc/64?img=15', role: 'Support', online: true },
  { id: 'u-2', name: 'Сергій Поліщук', avatar: 'https://i.pravatar.cc/64?img=18', role: 'Sales', online: true },
  { id: 'u-3', name: 'Ірина Петренко', avatar: 'https://i.pravatar.cc/64?img=25', role: 'Marketing', online: false }
];

const chatThreads: ChatThread[] = [
  {
    id: 'chat-1',
    title: 'Підтримка / Марія',
    participants: [teamMembers[0], teamMembers[1]],
    type: 'group',
    unreadCount: 2
  },
  {
    id: 'chat-2',
    title: 'DM / Сергій',
    participants: [teamMembers[1]],
    type: 'dm',
    unreadCount: 0
  }
];

const chatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    chatId: 'chat-1',
    author: teamMembers[0],
    content: 'Колеги, Марія питає про інтеграцію з e-commerce.',
    createdAt: '2024-02-05T08:01:00Z',
    status: 'read'
  },
  {
    id: 'msg-2',
    chatId: 'chat-1',
    author: teamMembers[1],
    content: 'Я уточню у техпідтримки, чи є готовий конектор.',
    createdAt: '2024-02-05T08:05:00Z',
    status: 'read'
  },
  {
    id: 'msg-3',
    chatId: 'chat-1',
    author: teamMembers[1],
    content: 'Перевірив CRM картку, додав нотатку.',
    createdAt: '2024-02-05T08:20:00Z',
    status: 'read'
  },
  {
    id: 'msg-4',
    chatId: 'chat-1',
    author: teamMembers[2],
    content: 'Я можу підготувати оновлений one-pager для неї.',
    createdAt: '2024-02-05T08:25:00Z',
    status: 'delivered'
  },
  {
    id: 'msg-5',
    chatId: 'chat-2',
    author: teamMembers[1],
    content: 'Готовий до синку о 15:00.',
    createdAt: '2024-02-04T11:44:00Z',
    status: 'delivered'
  }
];

const telegramStatus: TelegramStatus = {
  connected: false,
  botName: null,
  webhookUrl: null,
  lastEventAt: null
};

const updateThreadWithMessage = (message: ChatMessage) => {
  const thread = chatThreads.find((item) => item.id === message.chatId);
  if (thread) {
    thread.lastMessage = message;
    thread.unreadCount = Math.max(0, (thread.unreadCount ?? 0) + 1);
    return;
  }

  chatThreads.unshift({
    id: message.chatId,
    title: `Диалог с ${message.author.name}`,
    participants: [message.author],
    type: 'dm',
    unreadCount: 1,
    lastMessage: message
  });
};

export const listThreads = (_req: Request, res: Response) => {
  chatThreads.forEach((thread) => {
    if (!thread.lastMessage) {
      const lastMessage = [...chatMessages].reverse().find((message) => message.chatId === thread.id);
      if (lastMessage) {
        thread.lastMessage = lastMessage;
      }
    }
  });

  res.json(chatThreads);
};

export const listMessagesForThread = (req: Request, res: Response) => {
  const { threadId } = req.params;
  const messages = chatMessages.filter((message) => message.chatId === threadId);
  res.json(messages);
};

export const listMessages = (req: Request, res: Response) => {
  const { chatId, authorId, query } = req.query as {
    chatId?: string;
    authorId?: string;
    query?: string;
  };

  let messages = chatMessages;
  if (chatId) {
    messages = messages.filter((message) => message.chatId === chatId);
  }
  if (authorId) {
    messages = messages.filter((message) => message.author.id === authorId);
  }
  if (query) {
    const normalized = query.toLowerCase();
    messages = messages.filter((message) => message.content.toLowerCase().includes(normalized));
  }

  res.json(messages);
};

export const createMessage = (req: Request, res: Response) => {
  const { chatId, author, content } = req.body as {
    chatId?: string;
    author?: ChatParticipant;
    content?: string;
  };

  if (!chatId || !author || !content) {
    return res.status(400).json({ message: 'chatId, author and content are required' });
  }

  const newMessage: ChatMessage = {
    id: randomUUID(),
    chatId,
    author,
    content,
    createdAt: new Date().toISOString(),
    status: 'sent'
  };

  chatMessages.push(newMessage);
  updateThreadWithMessage(newMessage);
  return res.status(201).json(newMessage);
};

export const getTelegramStatus = (_req: Request, res: Response) => {
  res.json(telegramStatus);
};

export const updateTelegramStatus = (req: Request, res: Response) => {
  const { connected, botName, webhookUrl } = req.body as TelegramStatus;
  if (typeof connected === 'boolean') {
    telegramStatus.connected = connected;
  }
  if (botName !== undefined) {
    telegramStatus.botName = botName;
  }
  if (webhookUrl !== undefined) {
    telegramStatus.webhookUrl = webhookUrl;
  }
  telegramStatus.lastEventAt = new Date().toISOString();

  res.json(telegramStatus);
};

export const handleTelegramWebhook = (req: Request, res: Response) => {
  const message = req.body?.message;
  if (!message) {
    return res.json({ ok: true });
  }

  const chatId = message.chat?.id ? `telegram-${message.chat.id}` : `telegram-${randomUUID()}`;
  const from = message.from ?? {};
  const author: ChatParticipant = {
    id: `telegram-${from.id ?? randomUUID()}`,
    name: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Telegram User'
  };
  const content = message.text ?? '[unsupported message]';

  const newMessage: ChatMessage = {
    id: randomUUID(),
    chatId,
    author,
    content,
    createdAt: new Date().toISOString(),
    status: 'delivered'
  };

  chatMessages.push(newMessage);
  updateThreadWithMessage(newMessage);
  telegramStatus.connected = true;
  telegramStatus.lastEventAt = new Date().toISOString();

  return res.json({ ok: true });
};

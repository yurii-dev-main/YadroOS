export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'custom';

export interface EmailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface EmailTag {
  id: string;
  label: string;
  color: string;
}

export interface EmailMessage {
  id: string;
  subject: string;
  preview: string;
  body: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  date: string;
  folder: EmailFolder;
  unread: boolean;
  starred?: boolean;
  attachments?: EmailAttachment[];
  tags?: EmailTag[];
  relatedClientId?: string;
  threadId?: string;
}

export interface EmailSearchParams {
  query?: string;
  folder?: EmailFolder;
  unreadOnly?: boolean;
  starredOnly?: boolean;
  from?: string;
  tagIds?: string[];
}

export interface EmailDraft {
  id: string;
  subject: string;
  body: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  attachments?: File[];
}

export interface ClientSummary {
  id: string;
  name: string;
  company?: string;
  email: string;
  avatar?: string;
  lastInteraction?: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  author: ChatParticipant;
  content: string;
  createdAt: string;
  attachments?: EmailAttachment[];
  reactions?: Record<string, string[]>;
  replyTo?: string;
  mentions?: string[];
  readBy?: string[];
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatThread {
  id: string;
  title: string;
  participants: ChatParticipant[];
  type: 'dm' | 'group';
  lastMessage?: ChatMessage;
  unreadCount?: number;
  muted?: boolean;
  description?: string;
  avatar?: string;
}

export interface MessageSearchParams {
  query?: string;
  chatId?: string;
  authorId?: string;
}

export type CommunicationChannel = 'email' | 'internal' | 'telegram';

export interface UnifiedInboxItem {
  id: string;
  channel: CommunicationChannel;
  title: string;
  preview: string;
  timestamp: string;
  unread?: boolean;
  priority?: 'normal' | 'high';
  tags?: EmailTag[];
  relatedClient?: ClientSummary;
  payload: EmailMessage | ChatMessage;
}

export interface NotificationPreferences {
  desktop: boolean;
  emailDigest: 'daily' | 'weekly' | 'off';
  sound: boolean;
  urgentOnly?: boolean;
  doNotDisturb?: boolean;
  schedule?: {
    startHour: number;
    endHour: number;
    timezone: string;
    days: number[];
  };
  channelPreferences: Record<CommunicationChannel, boolean>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  categoryId?: string;
  subject: string;
  body: string;
  variables?: string[];
}

export interface CannedResponse {
  id: string;
  shortcut: string;
  title: string;
  content: string;
}

export interface AutoResponder {
  id: string;
  type: 'out_of_office' | 'business_hours' | 'greeting';
  active: boolean;
  message: string;
  schedule?: {
    start: string;
    end: string;
  };
}

export interface TelegramConnectionStatus {
  connected: boolean;
  botName?: string | null;
  webhookUrl?: string | null;
  lastEventAt?: string | null;
}

import { v4 as uuid } from 'uuid';
import {
  ClientSummary,
  EmailDraft,
  EmailMessage,
  EmailSearchParams,
  EmailTag,
  EmailTemplate,
  TemplateCategory,
} from '../types/communication.types';
import { filterEmails } from '../utils/email.utils';

const sampleTags: EmailTag[] = [
  { id: 'vip', label: 'VIP', color: 'bg-red-500' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-500' },
  { id: 'support', label: 'Support', color: 'bg-blue-500' },
];

const sampleClients: ClientSummary[] = [
  {
    id: 'client-1',
    name: 'Марія Коваль',
    company: 'TechVision',
    email: 'maria.koval@techvision.ua',
    avatar: 'https://i.pravatar.cc/64?img=1',
    lastInteraction: '2024-02-05T08:40:00Z',
  },
  {
    id: 'client-2',
    name: 'Олег Гринь',
    company: 'GreenSoft',
    email: 'oleh@greensoft.io',
    avatar: 'https://i.pravatar.cc/64?img=22',
    lastInteraction: '2024-02-05T06:12:00Z',
  },
];

const sampleEmails: EmailMessage[] = [
  {
    id: 'email-1',
    subject: 'Підтвердження зустрічі',
    preview: 'Доброго дня! Підтверджую зустріч на завтра...',
    body:
      'Доброго дня! Підтверджую зустріч на завтра о 14:00. Будь ласка, надішліть мені короткий порядок денний.',
    from: 'maria.koval@techvision.ua',
    to: ['sales@yadroos.io'],
    date: '2024-02-05T07:32:00Z',
    folder: 'inbox',
    unread: true,
    starred: true,
    tags: [sampleTags[0]],
    relatedClientId: 'client-1',
  },
  {
    id: 'email-2',
    subject: 'Запит на комерційну пропозицію',
    preview: 'Доброго дня, цікавить інтеграція CRM...',
    body:
      'Доброго дня, цікавить інтеграція CRM та автоматизація комунікацій. Чи можемо обговорити деталі? Чекаю на відповідь.',
    from: 'oleh@greensoft.io',
    to: ['sales@yadroos.io'],
    date: '2024-02-04T16:12:00Z',
    folder: 'inbox',
    unread: false,
    tags: [sampleTags[1]],
    relatedClientId: 'client-2',
  },
  {
    id: 'email-3',
    subject: 'Щотижневий дайджест',
    preview: 'Команда, ділюсь з оновленнями по проекту...',
    body: 'Команда, ділюсь з оновленнями по проекту. Деталі у вкладеному файлі.',
    from: 'project-manager@yadroos.io',
    to: ['marketing@yadroos.io'],
    date: '2024-02-03T08:20:00Z',
    folder: 'sent',
    unread: false,
    attachments: [
      {
        id: 'attach-1',
        name: 'weekly-report.pdf',
        size: 1024 * 400,
        type: 'application/pdf',
      },
    ],
  },
];

const templateCategories: TemplateCategory[] = [
  { id: 'welcome', name: 'Welcome', description: 'Листи для первинного контакту' },
  { id: 'follow-up', name: 'Follow-up', description: 'Нагадування та супровід' },
  { id: 'proposal', name: 'Proposal', description: 'Комерційні пропозиції' },
];

const emailTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Welcome клієнт',
    categoryId: 'welcome',
    subject: 'Вітаємо, {{client_name}}!',
    body:
      '<p>Вітаємо, {{client_name}}!</p><p>Раді бачити вас серед наших клієнтів. Найближчим часом менеджер зв\'яжеться з вами.</p>',
    variables: ['client_name'],
  },
  {
    id: 'tmpl-2',
    name: 'Follow-up після демо',
    categoryId: 'follow-up',
    subject: 'Як враження від демо, {{client_name}}?',
    body:
      '<p>Добрий день, {{client_name}}!</p><p>Дякуємо за час на демо. Чи є питання щодо інтеграції?</p>',
    variables: ['client_name'],
  },
];

export const emailService = {
  async fetchEmails(params: EmailSearchParams = {}) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return filterEmails(sampleEmails, params);
  },

  async fetchEmailById(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sampleEmails.find((email) => email.id === id) ?? null;
  },

  async sendEmail(draft: EmailDraft) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newEmail: EmailMessage = {
      id: uuid(),
      subject: draft.subject,
      preview: draft.body.slice(0, 120),
      body: draft.body,
      from: 'you@yadroos.io',
      to: draft.to,
      cc: draft.cc,
      bcc: draft.bcc,
      date: new Date().toISOString(),
      folder: 'sent',
      unread: false,
    };
    sampleEmails.unshift(newEmail);
    return newEmail;
  },

  async updateEmailStatus(id: string, changes: Partial<EmailMessage>) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = sampleEmails.findIndex((email) => email.id === id);
    if (index === -1) return null;
    sampleEmails[index] = { ...sampleEmails[index], ...changes };
    return sampleEmails[index];
  },

  async moveToFolder(ids: string[], folder: EmailMessage['folder']) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    ids.forEach((id) => {
      const email = sampleEmails.find((item) => item.id === id);
      if (email) {
        email.folder = folder;
      }
    });
    return this.fetchEmails({ folder });
  },

  async attachToClient(emailId: string, clientId: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const email = sampleEmails.find((item) => item.id === emailId);
    if (!email) throw new Error('Email not found');
    email.relatedClientId = clientId;
    return email;
  },

  async createClientFromEmail(emailId: string) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const email = sampleEmails.find((item) => item.id === emailId);
    if (!email) throw new Error('Email not found');
    const newClient: ClientSummary = {
      id: uuid(),
      name: email.from.split('@')[0],
      email: email.from,
    };
    sampleClients.push(newClient);
    email.relatedClientId = newClient.id;
    return newClient;
  },

  async fetchClients() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sampleClients;
  },

  async fetchTags() {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return sampleTags;
  },

  async fetchTemplateCategories() {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return templateCategories;
  },

  async fetchTemplates() {
    await new Promise((resolve) => setTimeout(resolve, 160));
    return emailTemplates;
  },
};

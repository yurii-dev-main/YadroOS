/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { v4 as uuid } from 'uuid';
import {
  ClientSummary,
  EmailDraft,
  EmailMessage,
  EmailSearchParams,
  EmailTag,
  EmailTemplate,
  TemplateCategory
} from '../types/communication.types';
import { filterEmails } from '../utils/email.utils';
import { apiClient, IS_DEMO_MODE } from '../../../services/apiClient';

const sampleTags: EmailTag[] = [
  { id: 'vip', label: 'VIP', color: 'bg-red-500' },
  { id: 'finance', label: 'Finance', color: 'bg-emerald-500' },
  { id: 'support', label: 'Support', color: 'bg-primary' }
];

const sampleClients: ClientSummary[] = [
  {
    id: 'client-1',
    name: 'Maria Koval',
    company: 'TechVision',
    email: 'maria.koval@techvision.ua',
    avatar: 'https://i.pravatar.cc/64?img=1',
    lastInteraction: '2024-02-05T08:40:00Z'
  },
  {
    id: 'client-2',
    name: 'Oleh Hryn',
    company: 'GreenSoft',
    email: 'oleh@greensoft.io',
    avatar: 'https://i.pravatar.cc/64?img=22',
    lastInteraction: '2024-02-05T06:12:00Z'
  }
];

const sampleEmails: EmailMessage[] = [
  {
    id: 'email-1',
    subject: 'Meeting confirmation',
    preview: 'Hello! I confirm the meeting for tomorrow...',
    body: 'Hello! I confirm the meeting for tomorrow at 14:00. Please send me a short agenda.',
    from: 'maria.koval@techvision.ua',
    to: ['sales@yadroos.io'],
    date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    folder: 'inbox',
    unread: true,
    starred: true,
    tags: [sampleTags[0]],
    relatedClientId: 'client-1'
  },
  {
    id: 'email-2',
    subject: 'Commercial proposal request',
    preview: 'Hello, interested in CRM integration...',
    body: 'Hello, I am interested in CRM integration and communication automation. Can we discuss the details? Looking forward to your reply.',
    from: 'oleh@greensoft.io',
    to: ['sales@yadroos.io'],
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    folder: 'inbox',
    unread: false,
    tags: [sampleTags[1]],
    relatedClientId: 'client-2'
  },
  {
    id: 'email-3',
    subject: 'Weekly digest',
    preview: 'Team, sharing project updates...',
    body: 'Team, sharing project updates. Details in the attached file.',
    from: 'project-manager@yadroos.io',
    to: ['marketing@yadroos.io'],
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    folder: 'sent',
    unread: false,
    attachments: [
      {
        id: 'attach-1',
        name: 'weekly-report.pdf',
        size: 1024 * 400,
        type: 'application/pdf'
      }
    ]
  }
];

const templateCategories: TemplateCategory[] = [
  { id: 'welcome', name: 'Welcome', description: 'Emails for initial contact' },
  { id: 'follow-up', name: 'Follow-up', description: 'Reminders and follow-up' },
  { id: 'proposal', name: 'Proposal', description: 'Commercial proposals' }
];

const emailTemplates: EmailTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Welcome client',
    categoryId: 'welcome',
    subject: 'Welcome, {{client_name}}!',
    body: '<p>Welcome, {{client_name}}!</p><p>We are glad to see you among our clients. A manager will contact you shortly.</p>',
    variables: ['client_name']
  },
  {
    id: 'tmpl-2',
    name: 'Follow-up after demo',
    categoryId: 'follow-up',
    subject: 'How were your impressions of the demo, {{client_name}}?',
    body: '<p>Hello, {{client_name}}!</p><p>Thank you for your time on the demo. Do you have any questions regarding integration?</p>',
    variables: ['client_name']
  }
];

export const emailService = {
  async fetchEmails(params: EmailSearchParams = {}) {
    if (!IS_DEMO_MODE) {
      try {
        const response = await apiClient.get('/v1/communications/emails', { params });
        return response.data?.data || response.data || [];
      } catch {
        return [];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return filterEmails(sampleEmails, params);
  },

  async fetchEmailById(id: string) {
    if (!IS_DEMO_MODE) {
      try {
        const response = await apiClient.get(`/v1/communications/emails/${id}`);
        return response.data;
      } catch {
        return null;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
    return sampleEmails.find((email) => email.id === id) ?? null;
  },

  async sendEmail(draft: EmailDraft) {
    if (!IS_DEMO_MODE) {
      try {
        const response = await apiClient.post('/v1/communications/emails', draft);
        return response.data;
      } catch {
        throw new Error('Failed to send email');
      }
    }
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
      unread: false
    };
    sampleEmails.unshift(newEmail);
    return newEmail;
  },

  async updateEmailStatus(id: string, changes: Partial<EmailMessage>) {
    try {
      const response = await apiClient.patch(`/v1/communications/emails/${id}`, changes);
      return response.data?.data || response.data;
    } catch {
      return null;
    }
  },

  async moveToFolder(ids: string[], folder: EmailMessage['folder']) {
    await apiClient.put('/v1/communications/emails/bulk-folder', { emailIds: ids, folder });
    return this.fetchEmails({ folder });
  },

  async attachToClient(emailId: string, clientId: string) {
    return this.updateEmailStatus(emailId, { relatedClientId: clientId });
  },

  async createClientFromEmail(emailId: string) {
    const email = await this.fetchEmailById(emailId);
    if (!email) throw new Error('Email not found');
    const newClient = await apiClient.post('/api/crm/clients', {
      name: email.from.split('@')[0],
      email: email.from
    });
    await this.attachToClient(emailId, newClient.data.id);
    return newClient.data;
  },

  async fetchClients() {
    try {
      const response = await apiClient.get('/api/crm/clients');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  async fetchTags() {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return sampleTags;
  },

  async fetchTemplateCategories() {
    try {
      const response = await apiClient.get('/v1/communications/template-categories');
      return response.data?.data || response.data || [];
    } catch {
      return templateCategories;
    }
  },

  async fetchTemplates() {
    if (!IS_DEMO_MODE) {
      try {
        const response = await apiClient.get('/v1/communications/email-templates');
        return response.data?.data || response.data || [];
      } catch {
        return [];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 160));
    return emailTemplates;
  },

  async createTemplate(template: Partial<EmailTemplate>) {
    const response = await apiClient.post('/v1/communications/email-templates', template);
    return response.data?.data || response.data;
  },

  async deleteTemplate(id: string) {
    await apiClient.delete(`/v1/communications/email-templates/${id}`);
  },

  async getAutoResponders() {
    try {
      const response = await apiClient.get('/v1/communications/auto-responders');
      return response.data?.data || response.data || [];
    } catch {
      return [];
    }
  },

  async updateAutoResponder(
    id: string,
    payload: { active: boolean; message: string; type: string }
  ) {
    const response = await apiClient.put(`/v1/communications/auto-responders/${id}`, payload);
    return response.data?.data || response.data;
  }
};

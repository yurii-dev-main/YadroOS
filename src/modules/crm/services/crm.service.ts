import { v4 as uuid } from 'uuid';

import { apiClient } from '../../../services/apiClient';
import {
  CRMActivity,
  CRMAnalyticsSummary,
  CRMClient,
  CRMClientFilters,
  CRMClientQuery,
  CRMClientQueryResult,
  CRMClientSort,
  CRMDeal,
  CRMEmailCampaign,
  CRMEmailTemplate,
  CRMEventPayload,
  CRMEventType,
  CRMFile,
  CRMNote,
  CRMPipelineFilters,
  DealStage
} from '../types/crm.types';
import { buildAnalyticsSnapshot, stageLabels, toCSV } from '../utils/crm.utils';

type CRMDataStore = {
  clients: CRMClient[];
  deals: CRMDeal[];
  activities: CRMActivity[];
  emailTemplates: CRMEmailTemplate[];
  campaigns: CRMEmailCampaign[];
};

type ActivityApiResponse = {
  id: string;
  clientId?: string | null;
  dealId?: string | null;
  type: ActivityType;
  subject?: string | null;
  description?: string | null;
  date?: string | null;
  duration?: number | null;
  createdBy?: string | null;
  createdAt: string;
  creator?: {
    firstName: string;
    lastName: string;
  } | null;
};

const crmEventTarget = new EventTarget();

const emitEvent = (payload: CRMEventPayload) => {
  crmEventTarget.dispatchEvent(new CustomEvent<CRMEventPayload>('crm:event', { detail: payload }));
};

export const subscribeToCRMEvents = (
  callback: (payload: CRMEventPayload) => void
) => {
  const handler = (event: Event) => {
    const custom = event as CustomEvent<CRMEventPayload>;
    callback(custom.detail);
  };
  crmEventTarget.addEventListener('crm:event', handler);
  return () => crmEventTarget.removeEventListener('crm:event', handler);
};

const managers = [
  { name: 'Олександр Петренко', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Марія Іванченко', avatar: 'https://i.pravatar.cc/150?img=2' },
  { name: 'Ігор Сидоренко', avatar: 'https://i.pravatar.cc/150?img=3' }
];

const industries = ['FinTech', 'Retail', 'Healthcare', 'Manufacturing', 'Education'];

const generateMockClients = (): CRMClient[] => {
  return Array.from({ length: 18 }).map((_, index) => {
    const manager = managers[index % managers.length];
    return {
      id: uuid(),
      name: `Клієнт ${index + 1}`,
      company: `Компанія ${index + 1}`,
      email: `client${index + 1}@example.com`,
      phone: `+380 67 000 0${(index + 1).toString().padStart(2, '0')}`,
      website: `https://client${index + 1}.ua`,
      industry: industries[index % industries.length],
      size: Math.floor(Math.random() * 500) + 50,
      revenue: Math.floor(Math.random() * 1500000) + 50000,
      status: (['lead', 'active', 'inactive', 'lost'] as CRMClient['status'][])[index % 4],
      tags: [
        {
          id: uuid(),
          label: index % 2 === 0 ? 'VIP' : 'Стратегічний',
          color: index % 2 === 0 ? '#38bdf8' : '#f97316'
        }
      ],
      assignedTo: manager.name,
      assignedToAvatar: manager.avatar,
      createdAt: new Date(Date.now() - index * 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
      lastContactedAt: new Date(Date.now() - index * 86400000).toISOString(),
      customFields: [
        { id: uuid(), label: 'CRM ID', value: `CRM-${1000 + index}` },
        { id: uuid(), label: 'Сегмент', value: index % 2 === 0 ? 'Enterprise' : 'SMB' }
      ],
      files: [],
      notes: [
        {
          id: uuid(),
          author: manager.name,
          content: 'Потребує оновлення пропозиції наступного тижня.',
          createdAt: new Date().toISOString()
        }
      ]
    } satisfies CRMClient;
  });
};

const generateMockDeals = (clients: CRMClient[]): CRMDeal[] => {
  return clients.slice(0, 20).map((client, index) => ({
    id: uuid(),
    title: `Угода ${client.company}`,
    value: Math.floor(Math.random() * 200000) + 20000,
    clientId: client.id,
    clientName: client.name,
    stage: stageLabels[index % stageLabels.length],
    probability: Math.min(95, 15 + index * 10),
    owner: client.assignedTo,
    createdAt: client.createdAt,
    updatedAt: new Date().toISOString()
  }));
};

const generateMockActivities = (clients: CRMClient[]): CRMActivity[] => {
  return clients.flatMap((client) => {
    const baseDate = new Date(client.createdAt).getTime();
    return [
      {
        id: uuid(),
        clientId: client.id,
        type: 'call',
        createdAt: new Date(baseDate + 86400000).toISOString(),
        createdBy: client.assignedTo,
        duration: 12,
        summary: 'Обговорили умови співпраці.',
        notes: 'Потрібно надіслати презентацію.'
      },
      {
        id: uuid(),
        clientId: client.id,
        type: 'meeting',
        createdAt: new Date(baseDate + 172800000).toISOString(),
        createdBy: client.assignedTo,
        date: new Date(baseDate + 172800000).toISOString(),
        attendees: [client.assignedTo, client.name],
        notes: 'Запланувати демо продукту.'
      },
      {
        id: uuid(),
        clientId: client.id,
        type: 'note',
        createdAt: new Date(baseDate + 259200000).toISOString(),
        createdBy: client.assignedTo,
        content: 'Клієнт цікавиться кастомною інтеграцією.'
      }
    ] as CRMActivity[];
  });
};

const normalizeActivityDate = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const mapActivityFromApi = (activity: ActivityApiResponse): CRMActivity => {
  const creatorName = activity.creator
    ? `${activity.creator.firstName} ${activity.creator.lastName}`
    : 'Система';
  const createdAt = normalizeActivityDate(activity.createdAt) ?? new Date().toISOString();
  const base = {
    id: activity.id,
    clientId: activity.clientId ?? '',
    createdAt,
    createdBy: creatorName,
    type: activity.type,
    notes: activity.description ?? undefined
  };

  switch (activity.type) {
    case 'call':
      return {
        ...base,
        type: 'call',
        duration: activity.duration ?? 0,
        summary: activity.subject ?? activity.description ?? ''
      };
    case 'meeting':
      return {
        ...base,
        type: 'meeting',
        date: normalizeActivityDate(activity.date) ?? createdAt,
        attendees: [],
        notes: activity.description ?? ''
      };
    case 'email':
      return {
        ...base,
        type: 'email',
        subject: activity.subject ?? '',
        direction: 'outbound',
        status: 'sent'
      };
    case 'note':
      return {
        ...base,
        type: 'note',
        content: activity.description ?? activity.subject ?? ''
      };
    case 'task': {
      const rawStatus = activity.subject ?? '';
      const status = rawStatus === 'pending' || rawStatus === 'in_progress' || rawStatus === 'completed'
        ? rawStatus
        : 'pending';
      return {
        ...base,
        type: 'task',
        deadline: normalizeActivityDate(activity.date) ?? createdAt,
        status
      };
    }
    default:
      return {
        ...base,
        type: 'note',
        content: activity.description ?? activity.subject ?? ''
      };
  }
};

const mapActivityToApi = (activity: Omit<CRMActivity, 'id' | 'createdAt'>) => {
  const description =
    'notes' in activity && activity.notes
      ? activity.notes
      : 'content' in activity
        ? activity.content
        : undefined;

  const payload: {
    clientId: string;
    dealId?: string;
    type: ActivityType;
    subject?: string;
    description?: string;
    date?: string;
    duration?: number;
  } = {
    clientId: activity.clientId,
    type: activity.type,
    description
  };

  if ('summary' in activity && activity.summary) {
    payload.subject = activity.summary;
  }

  if ('subject' in activity && activity.subject) {
    payload.subject = activity.subject;
  }

  if (activity.type === 'task') {
    payload.subject = 'status' in activity ? activity.status : payload.subject;
    payload.date = 'deadline' in activity ? activity.deadline : payload.date;
  }

  if (activity.type === 'meeting') {
    payload.date = 'date' in activity ? activity.date : payload.date;
  }

  if ('duration' in activity && activity.duration) {
    payload.duration = activity.duration;
  }

  return payload;
};

class CRMService {
  private store: CRMDataStore;

  constructor() {
    const clients = generateMockClients();
    this.store = {
      clients,
      deals: generateMockDeals(clients),
      activities: generateMockActivities(clients),
      emailTemplates: [
        {
          id: uuid(),
          name: 'Вітальний лист',
          subject: 'Дякуємо за інтерес до YadroOS',
          body: 'Вітаємо, {name}! Дякуємо за інтерес. Менеджер зв\'яжеться з вами найближчим часом.'
        },
        {
          id: uuid(),
          name: 'Follow-up',
          subject: 'Чи залишилися питання?',
          body: 'Доброго дня, {name}! Нагадуємо про нашу пропозицію. Будемо раді відповісти на питання.'
        }
      ],
      campaigns: []
    };
  }

  private async simulateLatency<T>(data: T, delay = 350): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), delay));
  }

  private applyFilters(clients: CRMClient[], filters: CRMClientFilters) {
    return clients.filter((client) => {
      const statusMatch = !filters.status || filters.status === 'all' || client.status === filters.status;
      const industryMatch = !filters.industry || filters.industry === 'all' || client.industry === filters.industry;
      const assignedMatch = !filters.assignedTo || filters.assignedTo === 'all' || client.assignedTo === filters.assignedTo;
      const dateMatch = !filters.dateRange
        || (!filters.dateRange.from || new Date(client.createdAt) >= new Date(filters.dateRange.from))
        && (!filters.dateRange.to || new Date(client.createdAt) <= new Date(filters.dateRange.to));
      const tagsMatch = !filters.tagIds || !filters.tagIds.length || filters.tagIds.every((tagId) => client.tags.some((tag) => tag.id === tagId));
      return statusMatch && industryMatch && assignedMatch && dateMatch && tagsMatch;
    });
  }

  private applySearch(clients: CRMClient[], search: string) {
    if (!search) return clients;
    const term = search.toLowerCase();
    return clients.filter((client) =>
      [
        client.name,
        client.company,
        client.email,
        client.phone,
        client.website ?? '',
        client.industry,
        client.assignedTo,
        client.tags.map((tag) => tag.label).join(' ')
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }

  private applySort(clients: CRMClient[], sort: CRMClientSort) {
    return [...clients].sort((a, b) => {
      if (sort.field === 'name') {
        return sort.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      if (sort.field === 'createdAt') {
        return sort.direction === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return sort.direction === 'asc' ? a.revenue - b.revenue : b.revenue - a.revenue;
    });
  }

  async getClients(query: CRMClientQuery): Promise<CRMClientQueryResult> {
    const { page, pageSize, filters, search, sort } = query;
    let filtered = this.applyFilters(this.store.clients, filters);
    filtered = this.applySearch(filtered, search);
    filtered = this.applySort(filtered, sort);
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return this.simulateLatency({ data, total });
  }

  async getClient(id: string) {
    const client = this.store.clients.find((item) => item.id === id);
    if (!client) throw new Error('Клієнта не знайдено');
    return this.simulateLatency(client);
  }

  async createClient(input: Omit<CRMClient, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'files'> & { notes?: CRMNote[]; files?: CRMFile[] }) {
    const client: CRMClient = {
      ...input,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: input.notes ?? [],
      files: input.files ?? []
    };
    this.store.clients = [client, ...this.store.clients];
    emitEvent({ type: 'clients:updated', resourceId: client.id });
    return this.simulateLatency(client);
  }

  async updateClient(id: string, updates: Partial<CRMClient>) {
    const index = this.store.clients.findIndex((client) => client.id === id);
    if (index === -1) throw new Error('Клієнта не знайдено');
    const updated: CRMClient = {
      ...this.store.clients[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.store.clients[index] = updated;
    emitEvent({ type: 'clients:updated', resourceId: id });
    return this.simulateLatency(updated);
  }

  async deleteClient(id: string) {
    this.store.clients = this.store.clients.filter((client) => client.id !== id);
    this.store.deals = this.store.deals.filter((deal) => deal.clientId !== id);
    this.store.activities = this.store.activities.filter((activity) => activity.clientId !== id);
    emitEvent({ type: 'clients:updated', resourceId: id });
    emitEvent({ type: 'deals:updated' });
    emitEvent({ type: 'activities:updated' });
    return this.simulateLatency(true);
  }

  async bulkUpdate(ids: string[], updates: Partial<CRMClient>) {
    this.store.clients = this.store.clients.map((client) =>
      ids.includes(client.id)
        ? { ...client, ...updates, updatedAt: new Date().toISOString() }
        : client
    );
    emitEvent({ type: 'clients:updated' });
    return this.simulateLatency(true);
  }

  async bulkDelete(ids: string[]) {
    this.store.clients = this.store.clients.filter((client) => !ids.includes(client.id));
    this.store.deals = this.store.deals.filter((deal) => !ids.includes(deal.clientId));
    this.store.activities = this.store.activities.filter((activity) => !ids.includes(activity.clientId));
    emitEvent({ type: 'clients:updated' });
    return this.simulateLatency(true);
  }

  async getDeals(filters: CRMPipelineFilters = {}) {
    let deals = [...this.store.deals];
    if (filters.owner && filters.owner !== 'all') {
      deals = deals.filter((deal) => deal.owner === filters.owner);
    }
    if (filters.minValue) {
      deals = deals.filter((deal) => deal.value >= filters.minValue!);
    }
    if (filters.maxValue) {
      deals = deals.filter((deal) => deal.value <= filters.maxValue!);
    }
    if (filters.from) {
      deals = deals.filter((deal) => new Date(deal.createdAt) >= new Date(filters.from!));
    }
    if (filters.to) {
      deals = deals.filter((deal) => new Date(deal.createdAt) <= new Date(filters.to!));
    }
    return this.simulateLatency(deals);
  }

  async updateDealStage(dealId: string, stage: DealStage) {
    const index = this.store.deals.findIndex((deal) => deal.id === dealId);
    if (index === -1) throw new Error('Угоду не знайдено');
    this.store.deals[index] = {
      ...this.store.deals[index],
      stage,
      updatedAt: new Date().toISOString()
    };
    emitEvent({ type: 'deals:updated', resourceId: dealId });
    return this.simulateLatency(this.store.deals[index]);
  }

  async updateDeal(dealId: string, updates: Partial<CRMDeal>) {
    const index = this.store.deals.findIndex((deal) => deal.id === dealId);
    if (index === -1) throw new Error('Угоду не знайдено');
    this.store.deals[index] = {
      ...this.store.deals[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    emitEvent({ type: 'deals:updated', resourceId: dealId });
    return this.simulateLatency(this.store.deals[index]);
  }

  async createDeal(input: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt' | 'clientName'>) {
    const client = this.store.clients.find((item) => item.id === input.clientId);
    if (!client) throw new Error('Клієнта не знайдено для угоди');
    const deal: CRMDeal = {
      ...input,
      id: uuid(),
      clientName: client.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.store.deals = [deal, ...this.store.deals];
    emitEvent({ type: 'deals:updated', resourceId: deal.id });
    return this.simulateLatency(deal);
  }

  async getActivities(clientId?: string) {
    const response = await apiClient.get<{ data: ActivityApiResponse[] }>('/activities', {
      params: clientId ? { clientId } : undefined
    });
    return response.data.data.map(mapActivityFromApi);
  }

  async createActivity(activity: Omit<CRMActivity, 'id' | 'createdAt'>) {
    const response = await apiClient.post<ActivityApiResponse>('/activities', mapActivityToApi(activity));
    const mapped = mapActivityFromApi(response.data);
    emitEvent({ type: 'activities:updated', resourceId: mapped.clientId });
    return mapped;
  }

  async getAnalytics(): Promise<CRMAnalyticsSummary> {
    const summary = buildAnalyticsSnapshot(this.store.clients, this.store.deals);
    return this.simulateLatency(summary, 420);
  }

  async exportClientsCSV() {
    return this.simulateLatency(toCSV(this.store.clients), 120);
  }

  async importClientsCSV(content: string) {
    const [headerLine, ...rows] = content.split(/\r?\n/);
    if (!headerLine) return this.store.clients;
    const newClients: CRMClient[] = rows
      .map((row) => row.trim())
      .filter(Boolean)
      .map((row) => {
        const [id, name, company, email, phone, website, industry, size, revenue, status, assignedTo, tags] = row.split(',');
        const manager = managers[Math.floor(Math.random() * managers.length)];
        return {
          id: id || uuid(),
          name,
          company,
          email,
          phone,
          website,
          industry,
          size: Number(size) || 0,
          revenue: Number(revenue) || 0,
          status: (status as CRMClient['status']) || 'lead',
          assignedTo: assignedTo || manager.name,
          assignedToAvatar: manager.avatar,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastContactedAt: new Date().toISOString(),
          tags: (tags?.split('|') ?? []).filter(Boolean).map((label) => ({ id: uuid(), label, color: '#64748b' })),
          customFields: [],
          files: [],
          notes: []
        } as CRMClient;
      });
    this.store.clients = [...newClients, ...this.store.clients];
    emitEvent({ type: 'clients:updated' });
    return this.simulateLatency(this.store.clients);
  }

  async listEmailTemplates() {
    return this.simulateLatency(this.store.emailTemplates);
  }

  async createCampaign(campaign: Omit<CRMEmailCampaign, 'id' | 'sentAt' | 'status'>) {
    const newCampaign: CRMEmailCampaign = {
      ...campaign,
      id: uuid(),
      status: 'draft'
    };
    this.store.campaigns.push(newCampaign);
    emitEvent({ type: 'activities:updated' });
    return this.simulateLatency(newCampaign);
  }

  async sendCampaign(campaignId: string) {
    const campaign = this.store.campaigns.find((item) => item.id === campaignId);
    if (!campaign) throw new Error('Розсилку не знайдено');
    campaign.status = 'sent';
    campaign.sentAt = new Date().toISOString();
    campaign.metrics = {
      delivered: campaign.recipients.length,
      opened: Math.floor(campaign.recipients.length * 0.6),
      clicked: Math.floor(campaign.recipients.length * 0.2),
      bounced: Math.floor(campaign.recipients.length * 0.05)
    };
    emitEvent({ type: 'activities:updated' });
    return this.simulateLatency(campaign);
  }
}

export const crmService = new CRMService();

export type { CRMEventPayload, CRMEventType };

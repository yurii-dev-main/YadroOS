/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { apiClient } from '../../../services/apiClient';
import {
  ActivityType,
  CRMActivity,
  CRMAnalyticsSummary,
  CRMClient,
  CRMClientQuery,
  CRMClientQueryResult,
  CRMDeal,
  CRMEmailCampaign,
  CRMEventPayload,
  CRMEventType,
  CRMFile,
  CRMNote,
  CRMPipelineFilters,
  DealStage
} from '../types/crm.types';
import { buildAnalyticsSnapshot } from '../utils/crm.utils';

const stageMapFromApi: Record<string, DealStage> = {
  'lead': 'Lead',
  'contact_made': 'Contact Made',
  'qualification': 'Qualification',
  'proposal': 'Proposal',
  'negotiation': 'Negotiation',
  'closed_won': 'Closed Won',
  'closed_lost': 'Closed Lost'
};

const stageMapToApi: Record<DealStage, string> = {
  'Lead': 'lead',
  'Contact Made': 'contact_made',
  'Qualification': 'qualification',
  'Proposal': 'proposal',
  'Negotiation': 'negotiation',
  'Closed Won': 'closed_won',
  'Closed Lost': 'closed_lost'
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

export const subscribeToCRMEvents = (callback: (payload: CRMEventPayload) => void) => {
  const handler = (event: Event) => {
    const custom = event as CustomEvent<CRMEventPayload>;
    callback(custom.detail);
  };
  crmEventTarget.addEventListener('crm:event', handler);
  return () => crmEventTarget.removeEventListener('crm:event', handler);
};

const normalizeActivityDate = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const mapActivityFromApi = (activity: ActivityApiResponse): CRMActivity => {
  const creatorName = activity.creator
    ? `${activity.creator.firstName} ${activity.creator.lastName}`
    : 'System';
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
      const status =
        rawStatus === 'pending' || rawStatus === 'in_progress' || rawStatus === 'completed'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const act = activity as any;
  const description =
    'notes' in act && act.notes ? act.notes : 'content' in act ? act.content : undefined;

  const payload: {
    clientId: string;
    dealId?: string;
    type: ActivityType;
    subject?: string;
    description?: string;
    date?: string;
    duration?: number;
  } = {
    clientId: act.clientId,
    type: act.type,
    description
  };

  if ('summary' in act && act.summary) {
    payload.subject = act.summary;
  }

  if ('subject' in act && act.subject) {
    payload.subject = act.subject;
  }

  if (act.type === 'task') {
    payload.subject = 'status' in act ? act.status : payload.subject;
    payload.date = 'deadline' in act ? act.deadline : payload.date;
  }

  if (act.type === 'meeting') {
    payload.date = 'date' in act ? act.date : payload.date;
  }

  if ('duration' in act && act.duration) {
    payload.duration = act.duration;
  }

  return payload;
};

class CRMService {
  async getClients(query: CRMClientQuery): Promise<CRMClientQueryResult> {
    const response = await apiClient.get('/crm/clients', { params: query });
    const data = Array.isArray(response.data) ? response.data : [];
    const mappedData = data.map((client: any) => ({
      ...client,
      tags: client.tags || [],
      notes: client.notes || [],
      files: client.files || [],
      customFields: client.customFields || []
    }));
    return { data: mappedData, total: mappedData.length };
  }

  async getClient(id: string) {
    const response = await apiClient.get(`/crm/clients/${id}`);
    const client = response.data;
    if (client) {
      client.tags = client.tags || [];
      client.notes = client.notes || [];
      client.files = client.files || [];
      client.customFields = client.customFields || [];
    }
    return client;
  }

  async createClient(
    input: Omit<CRMClient, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'files'> & {
      notes?: CRMNote[];
      files?: CRMFile[];
    }
  ) {
    const response = await apiClient.post('/crm/clients', input);
    emitEvent({ type: 'clients:updated', resourceId: response.data?.id });
    return response.data;
  }

  async updateClient(id: string, updates: Partial<CRMClient>) {
    const response = await apiClient.put(`/crm/clients/${id}`, updates);
    emitEvent({ type: 'clients:updated', resourceId: id });
    return response.data;
  }

  async deleteClient(id: string) {
    await apiClient.delete(`/crm/clients/${id}`);
    emitEvent({ type: 'clients:updated', resourceId: id });
    emitEvent({ type: 'deals:updated' });
    emitEvent({ type: 'activities:updated' });
    return true;
  }

  async bulkUpdate(ids: string[], updates: Partial<CRMClient>) {
    const response = await apiClient.patch('/crm/clients/bulk', { ids, updates });
    emitEvent({ type: 'clients:updated' });
    return response.data;
  }

  async bulkDelete(ids: string[]) {
    const response = await apiClient.delete('/crm/clients/bulk', { data: { ids } });
    emitEvent({ type: 'clients:updated' });
    emitEvent({ type: 'deals:updated' });
    emitEvent({ type: 'activities:updated' });
    return response.data;
  }

  async getDeals(filters: CRMPipelineFilters = {}) {
    const response = await apiClient.get('/crm/deals', { params: filters });
    const deals = response.data?.data || response.data || [];
    return deals.map((d: any) => ({
      ...d,
      stage: stageMapFromApi[d.stage] || 'Lead'
    }));
  }

  async updateDealStage(dealId: string, stage: DealStage) {
    const response = await apiClient.put(`/crm/deals/${dealId}`, { stage: stageMapToApi[stage] });
    emitEvent({ type: 'deals:updated', resourceId: dealId });
    return response.data;
  }

  async updateDeal(dealId: string, updates: Partial<CRMDeal>) {
    const payload = { ...updates };
    if (payload.stage) payload.stage = stageMapToApi[payload.stage] as any;
    const response = await apiClient.put(`/crm/deals/${dealId}`, payload);
    emitEvent({ type: 'deals:updated', resourceId: dealId });
    return response.data;
  }

  async createDeal(input: Omit<CRMDeal, 'id' | 'createdAt' | 'updatedAt' | 'clientName'>) {
    const payload = { ...input, stage: stageMapToApi[input.stage] };
    const response = await apiClient.post('/crm/deals', payload);
    emitEvent({ type: 'deals:updated', resourceId: response.data?.id });
    return response.data;
  }

  async getActivities(clientId?: string) {
    const response = await apiClient.get<{ data: ActivityApiResponse[] }>('/activities', {
      params: clientId ? { clientId } : undefined
    });
    return response.data?.data?.map(mapActivityFromApi) || [];
  }

  async createActivity(activity: Omit<CRMActivity, 'id' | 'createdAt'>) {
    const response = await apiClient.post<ActivityApiResponse>(
      '/activities',
      mapActivityToApi(activity)
    );
    const mapped = mapActivityFromApi(response.data);
    emitEvent({ type: 'activities:updated', resourceId: mapped.clientId });
    return mapped;
  }

  async getAnalytics(): Promise<CRMAnalyticsSummary> {
    const response = await apiClient.get('/crm/analytics');
    return response.data;
  }

  async exportClientsCSV() {
    const response = await apiClient.get('/crm/clients/export', { responseType: 'blob' });
    return response.data;
  }

  async importClientsCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/crm/clients/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    emitEvent({ type: 'clients:updated' });
    return response.data;
  }

  async listEmailTemplates() {
    const response = await apiClient.get('/crm/email-templates');
    return response.data;
  }

  async createCampaign(campaign: Omit<CRMEmailCampaign, 'id' | 'sentAt' | 'status'>) {
    const response = await apiClient.post('/crm/campaigns', campaign);
    emitEvent({ type: 'activities:updated' });
    return response.data;
  }

  async sendCampaign(campaignId: string) {
    const response = await apiClient.post(`/crm/campaigns/${campaignId}/send`);
    emitEvent({ type: 'activities:updated' });
    return response.data;
  }
  async generateClientSummary(clientId: string) {
    const response = await apiClient.post(`/crm/clients/${clientId}/summary`);
    return response.data?.summary || response.data?.content || response.data;
  }
}

export const crmService = new CRMService();

export type { CRMEventPayload, CRMEventType };

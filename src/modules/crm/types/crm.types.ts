export type ClientStatus = 'lead' | 'active' | 'inactive' | 'lost';

export type DealStage =
  | 'Lead'
  | 'Contact Made'
  | 'Qualification'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export type ActivityType = 'call' | 'meeting' | 'email' | 'note' | 'task';

export interface CRMTag {
  id: string;
  label: string;
  color: string;
}

export interface CRMCustomField {
  id: string;
  label: string;
  value: string;
}

export interface CRMFile {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size: number;
}

export interface CRMNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CRMClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  size: number;
  revenue: number;
  status: ClientStatus;
  tags: CRMTag[];
  assignedTo: string;
  assignedToAvatar?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  customFields: CRMCustomField[];
  files: CRMFile[];
  notes: CRMNote[];
}

export interface CRMDeal {
  id: string;
  title: string;
  value: number;
  clientId: string;
  clientName: string;
  stage: DealStage;
  probability: number;
  assignedTo: string;
  closeDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CRMActivityBase {
  id: string;
  clientId: string;
  createdAt: string;
  createdBy: string;
  type: ActivityType;
  notes?: string;
  attachments?: CRMFile[];
}

export interface CRMCallActivity extends CRMActivityBase {
  type: 'call';
  duration: number;
  summary: string;
}

export interface CRMMeetingActivity extends CRMActivityBase {
  type: 'meeting';
  date: string;
  attendees: string[];
  notes: string;
}

export interface CRMEmailActivity extends CRMActivityBase {
  type: 'email';
  subject: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'opened' | 'clicked' | 'bounced';
}

export interface CRMNoteActivity extends CRMActivityBase {
  type: 'note';
  content: string;
}

export interface CRMTaskActivity extends CRMActivityBase {
  type: 'task';
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export type CRMActivity =
  CRMCallActivity | CRMMeetingActivity | CRMEmailActivity | CRMNoteActivity | CRMTaskActivity;

export interface CRMClientFilters {
  status?: ClientStatus | 'all';
  industry?: string | 'all';
  assignedTo?: string | 'all';
  dateRange?: {
    from?: string;
    to?: string;
  };
  tagIds?: string[];
}

export type ClientSortField = 'name' | 'createdAt' | 'revenue' | 'manager' | 'status';

export interface CRMClientSort {
  field: ClientSortField;
  direction: 'asc' | 'desc';
}

export interface CRMClientQuery {
  page: number;
  pageSize: number;
  search: string;
  filters: CRMClientFilters;
  sort: CRMClientSort;
}

export interface CRMClientQueryResult {
  data: CRMClient[];
  total: number;
}

export interface CRMPipelineFilters {
  assignedTo?: string | 'all';
  minValue?: number;
  maxValue?: number;
  from?: string;
  to?: string;
}

export interface CRMAnalyticsSummary {
  newClients: Array<{ period: string; value: number }>;
  funnel: Array<{ stage: DealStage; value: number }>;
  averageDealSize: number;
  ltv: number;
  winRate: number;
  revenueForecast: Array<{ month: string; value: number }>;
  managerPerformance: Array<{ manager: string; deals: number; won: number; revenue: number }>;
  statusDistribution: Array<{ status: ClientStatus; value: number }>;
}

export interface CRMEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface CRMEmailCampaign {
  id: string;
  name: string;
  templateId: string;
  recipients: string[];
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent';
  metrics?: {
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
  };
}

export type CRMEventType =
  'clients:updated' | 'deals:updated' | 'activities:updated' | 'analytics:updated';

export interface CRMEventPayload {
  type: CRMEventType;
  resourceId?: string;
}

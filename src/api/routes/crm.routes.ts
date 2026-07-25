import { apiClient } from '../../services/apiClient';
import type { ApiBulkResponse, ApiListRequest, ApiListResponse } from '../types';

export interface CrmClient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: 'lead' | 'prospect' | 'customer';
  ownerId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CrmDeal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  clientId: string;
  ownerId?: string;
  expectedCloseDate?: string;
  probability?: number;
  createdAt: string;
  updatedAt: string;
}

export const crmRoutes = {
  listClients(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<CrmClient>>('/crm/clients', { params: request })
      .then((response) => response.data);
  },
  createClient(payload: Partial<CrmClient>) {
    return apiClient.post<CrmClient>('/crm/clients', payload).then((response) => response.data);
  },
  updateClient(clientId: string, payload: Partial<CrmClient>) {
    return apiClient
      .put<CrmClient>(`/crm/clients/${clientId}`, payload)
      .then((response) => response.data);
  },
  deleteClient(clientId: string) {
    return apiClient.delete(`/crm/clients/${clientId}`).then(() => undefined);
  },
  importClients(payload: FormData) {
    return apiClient
      .post<ApiBulkResponse<CrmClient>>('/crm/clients/import', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((response) => response.data);
  },
  exportClients(format: 'csv' | 'xlsx' | 'pdf', params?: ApiListRequest) {
    return apiClient
      .get(`/crm/clients/export`, {
        params: { ...params, format },
        responseType: 'blob'
      })
      .then((response) => response.data as Blob);
  },
  listDeals(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<CrmDeal>>('/crm/deals', { params: request })
      .then((response) => response.data);
  },
  createDeal(payload: Partial<CrmDeal>) {
    return apiClient.post<CrmDeal>('/crm/deals', payload).then((response) => response.data);
  },
  updateDeal(dealId: string, payload: Partial<CrmDeal>) {
    return apiClient
      .put<CrmDeal>(`/crm/deals/${dealId}`, payload)
      .then((response) => response.data);
  },
  markDealAsWon(dealId: string) {
    return apiClient.post<CrmDeal>(`/crm/deals/${dealId}/win`).then((response) => response.data);
  },
  importDeals(payload: FormData) {
    return apiClient
      .post<ApiBulkResponse<CrmDeal>>('/crm/deals/import', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((response) => response.data);
  }
};

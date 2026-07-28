import { apiClient } from '../../services/apiClient';
import type { ApiListRequest, ApiListResponse } from '../types';

export interface AiInsight {
  id: string;
  module: 'crm' | 'hr' | 'accounting' | 'operations';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  metadata?: Record<string, unknown>;
}

export const aiRoutes = {
  listInsights(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<AiInsight>>('/v1/ai/insights', { params: request })
      .then((response) => response.data);
  },
  getInsight(insightId: string) {
    return apiClient.get<AiInsight>(`/v1/ai/insights/${insightId}`).then((response) => response.data);
  },
  markInsightResolved(insightId: string) {
    return apiClient
      .post<AiInsight>(`/v1/ai/insights/${insightId}/resolve`)
      .then((response) => response.data);
  }
};

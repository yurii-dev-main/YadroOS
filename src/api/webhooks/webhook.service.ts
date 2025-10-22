import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams, SyncHistoryResponse } from '../../integrations/types';

export interface WebhookSubscription {
  id: string;
  event: string;
  targetUrl: string;
  secret: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDeliveryLog {
  id: string;
  subscriptionId: string;
  status: number;
  deliveredAt: string;
  latencyMs: number;
  attempts: number;
  errorMessage?: string;
}

export const webhookService = {
  listSubscriptions(params?: { events?: string[] }) {
    return apiClient
      .get<WebhookSubscription[]>('/webhooks/subscriptions', { params })
      .then((response) => response.data);
  },
  createSubscription(payload: { event: string; targetUrl: string }) {
    return apiClient
      .post<WebhookSubscription>('/webhooks/subscriptions', payload)
      .then((response) => response.data);
  },
  rotateSecret(subscriptionId: string) {
    return apiClient
      .post<{ secret: string }>(`/webhooks/subscriptions/${subscriptionId}/rotate-secret`)
      .then((response) => response.data);
  },
  pause(subscriptionId: string) {
    return apiClient
      .post<WebhookSubscription>(`/webhooks/subscriptions/${subscriptionId}/pause`)
      .then((response) => response.data);
  },
  resume(subscriptionId: string) {
    return apiClient
      .post<WebhookSubscription>(`/webhooks/subscriptions/${subscriptionId}/resume`)
      .then((response) => response.data);
  },
  delete(subscriptionId: string) {
    return apiClient.delete(`/webhooks/subscriptions/${subscriptionId}`).then(() => undefined);
  },
  listDeliveries(subscriptionId: string, params?: CursorPaginationParams) {
    return apiClient
      .get<SyncHistoryResponse>(`/webhooks/subscriptions/${subscriptionId}/deliveries`, { params })
      .then((response) => response.data);
  },
  getDeliveryLog(deliveryId: string) {
    return apiClient
      .get<WebhookDeliveryLog>(`/webhooks/deliveries/${deliveryId}`)
      .then((response) => response.data);
  },
  replayDelivery(deliveryId: string) {
    return apiClient
      .post<WebhookDeliveryLog>(`/webhooks/deliveries/${deliveryId}/replay`)
      .then((response) => response.data);
  }
};

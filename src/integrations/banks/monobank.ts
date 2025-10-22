import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams, SyncLogEntry } from '../types';
import { AbstractBankIntegration } from './base';

export interface MonobankWebhookPayload {
  account: string;
  statementItem: {
    id: string;
    time: number;
    description: string;
    mcc?: number;
    amount: number;
    operationAmount: number;
    currencyCode: number;
    balance: number;
    comment?: string;
  };
}

export class MonobankIntegration extends AbstractBankIntegration {
  constructor() {
    super({ provider: 'monobank', basePath: '/integrations/banks/monobank' });
  }

  exchangeAuthorizationCode(code: string): Promise<SyncLogEntry> {
    return apiClient
      .post(`${this.context.basePath}/oauth/exchange`, { code })
      .then((response) => response.data as SyncLogEntry);
  }

  subscribeToWebhook(connectionId: string, callbackUrl: string): Promise<void> {
    return apiClient
      .post(`${this.context.basePath}/connections/${connectionId}/webhook`, { callbackUrl })
      .then(() => undefined);
  }

  confirmWebhookSignature(payload: MonobankWebhookPayload, signature: string): Promise<boolean> {
    return apiClient
      .post(`${this.context.basePath}/webhook/verify`, { payload, signature })
      .then((response) => Boolean(response.data?.valid));
  }

  getStatementUpdates(
    connectionId: string,
    params?: CursorPaginationParams & { lastTransactionId?: string }
  ) {
    return apiClient
      .get(`${this.context.basePath}/connections/${connectionId}/statements/updates`, { params })
      .then((response) => response.data);
  }
}

export const monobankIntegration = new MonobankIntegration();

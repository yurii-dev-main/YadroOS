import { apiClient } from '../../services/apiClient';
import type { CursorPaginationParams } from '../types';
import { AbstractBankIntegration } from './base';

export interface PrivatBankAccount {
  id: string;
  iban: string;
  currency: string;
  displayName: string;
  isCorporate: boolean;
}

export class PrivatBankIntegration extends AbstractBankIntegration {
  constructor() {
    super({ provider: 'privatbank', basePath: '/integrations/banks/privatbank' });
  }

  listAccounts(connectionId: string): Promise<PrivatBankAccount[]> {
    return apiClient
      .get(`${this.context.basePath}/connections/${connectionId}/accounts`)
      .then((response) => response.data as PrivatBankAccount[]);
  }

  fetchAccountStatement(
    connectionId: string,
    accountId: string,
    params?: CursorPaginationParams & { from?: string; to?: string }
  ) {
    return apiClient
      .get(
        `${this.context.basePath}/connections/${connectionId}/accounts/${accountId}/statements`,
        {
          params
        }
      )
      .then((response) => response.data);
  }

  rotateWebhookSecret(connectionId: string): Promise<{ secret: string }> {
    return apiClient
      .post(`${this.context.basePath}/connections/${connectionId}/webhook/rotate-secret`)
      .then((response) => response.data as { secret: string });
  }
}

export const privatBankIntegration = new PrivatBankIntegration();

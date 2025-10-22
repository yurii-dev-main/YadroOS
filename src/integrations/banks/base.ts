import { apiClient } from '../../services/apiClient';
import type {
  CursorPaginationParams,
  IntegrationConnection,
  IntegrationProvider,
  PaginatedResponse,
  SyncHistoryResponse,
  SyncLogEntry
} from '../types';

export interface BankAccountSummary {
  accountId: string;
  accountNumber: string;
  currency: string;
  balance: number;
  availableBalance: number;
  lastSyncAt?: string;
}

export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  description: string;
  occurredAt: string;
  category?: string;
  matchedTransactionId?: string;
  metadata?: Record<string, unknown>;
}

export interface StatementResponse extends PaginatedResponse<BankTransaction> {
  accounts: BankAccountSummary[];
}

export interface TransactionMatchRule {
  id: string;
  name: string;
  criteria: {
    amountTolerance?: number;
    textIncludes?: string[];
    direction?: 'credit' | 'debit';
    accountIds?: string[];
  };
  actions: {
    matchTransactionId?: string;
    categorizeAs?: string;
    assignToUserId?: string;
  };
  enabled: boolean;
}

export interface AutoCategorizationConfig {
  categories: Array<{
    id: string;
    name: string;
    keywords: string[];
  }>;
  fallbackCategoryId?: string;
}

export interface BankIntegrationContext {
  provider: IntegrationProvider;
  basePath: string;
}

export abstract class AbstractBankIntegration {
  protected readonly context: BankIntegrationContext;

  constructor(context: BankIntegrationContext) {
    this.context = context;
  }

  connect(): Promise<IntegrationConnection> {
    return apiClient.post(`${this.context.basePath}/connect`).then((response) => response.data);
  }

  disconnect(connectionId: string): Promise<void> {
    return apiClient
      .delete(`${this.context.basePath}/connections/${connectionId}`)
      .then(() => undefined);
  }

  listConnections(): Promise<IntegrationConnection[]> {
    return apiClient
      .get(`${this.context.basePath}/connections`)
      .then((response) => response.data as IntegrationConnection[]);
  }

  fetchStatements(
    connectionId: string,
    params?: CursorPaginationParams & { from?: string; to?: string }
  ): Promise<StatementResponse> {
    return apiClient
      .get(`${this.context.basePath}/connections/${connectionId}/statements`, { params })
      .then((response) => response.data as StatementResponse);
  }

  getSyncHistory(connectionId: string, params?: CursorPaginationParams): Promise<SyncHistoryResponse> {
    return apiClient
      .get(`${this.context.basePath}/connections/${connectionId}/sync-history`, { params })
      .then((response) => response.data as SyncHistoryResponse);
  }

  triggerSync(connectionId: string): Promise<SyncLogEntry> {
    return apiClient
      .post(`${this.context.basePath}/connections/${connectionId}/sync`)
      .then((response) => response.data as SyncLogEntry);
  }

  listTransactionRules(connectionId: string): Promise<TransactionMatchRule[]> {
    return apiClient
      .get(`${this.context.basePath}/connections/${connectionId}/rules`)
      .then((response) => response.data as TransactionMatchRule[]);
  }

  upsertTransactionRule(
    connectionId: string,
    rule: TransactionMatchRule
  ): Promise<TransactionMatchRule> {
    return apiClient
      .post(`${this.context.basePath}/connections/${connectionId}/rules`, rule)
      .then((response) => response.data as TransactionMatchRule);
  }

  deleteTransactionRule(connectionId: string, ruleId: string): Promise<void> {
    return apiClient
      .delete(`${this.context.basePath}/connections/${connectionId}/rules/${ruleId}`)
      .then(() => undefined);
  }

  getAutoCategorizationConfig(connectionId: string): Promise<AutoCategorizationConfig> {
    return apiClient
      .get(`${this.context.basePath}/connections/${connectionId}/auto-categorization`)
      .then((response) => response.data as AutoCategorizationConfig);
  }

  updateAutoCategorizationConfig(
    connectionId: string,
    config: AutoCategorizationConfig
  ): Promise<AutoCategorizationConfig> {
    return apiClient
      .put(`${this.context.basePath}/connections/${connectionId}/auto-categorization`, config)
      .then((response) => response.data as AutoCategorizationConfig);
  }
}

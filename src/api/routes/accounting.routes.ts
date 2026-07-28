import { apiClient } from '../../services/apiClient';
import type { ApiBulkResponse, ApiListRequest, ApiListResponse } from '../types';

export interface AccountingTransaction {
  id: string;
  externalId?: string;
  accountId: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  description: string;
  occurredAt: string;
  categoryId?: string;
  matched?: boolean;
}

export interface AccountingInvoice {
  id: string;
  clientId: string;
  number: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
  currency: string;
  totalAmount: number;
  balanceDue: number;
}

export const accountingRoutes = {
  listTransactions(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<AccountingTransaction>>('/v1/accounting/transactions', {
        params: request
      })
      .then((response) => response.data);
  },
  createTransaction(payload: Partial<AccountingTransaction>) {
    return apiClient
      .post<AccountingTransaction>('/v1/accounting/transactions', payload)
      .then((response) => response.data);
  },
  reconcileTransaction(transactionId: string, ledgerEntryId: string) {
    return apiClient
      .post(`/v1/accounting/transactions/${transactionId}/reconcile`, { ledgerEntryId })
      .then(() => undefined);
  },
  bulkImportTransactions(payload: FormData) {
    return apiClient
      .post<ApiBulkResponse<AccountingTransaction>>('/v1/accounting/transactions/import', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then((response) => response.data);
  },
  listInvoices(request?: ApiListRequest) {
    return apiClient
      .get<ApiListResponse<AccountingInvoice>>('/v1/accounting/invoices', { params: request })
      .then((response) => response.data);
  },
  createInvoice(payload: Partial<AccountingInvoice>) {
    return apiClient
      .post<AccountingInvoice>('/v1/accounting/invoices', payload)
      .then((response) => response.data);
  },
  markInvoicePaid(invoiceId: string, paidAt: string) {
    return apiClient
      .post<AccountingInvoice>(`/v1/accounting/invoices/${invoiceId}/pay`, { paidAt })
      .then((response) => response.data);
  },
  exportInvoices(format: 'csv' | 'xlsx' | 'pdf', params?: ApiListRequest) {
    return apiClient
      .get(`/v1/accounting/invoices/export`, {
        params: { ...params, format },
        responseType: 'blob'
      })
      .then((response) => response.data as Blob);
  }
};

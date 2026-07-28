/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { apiClient } from '../../../services/apiClient';
import {
  Account,
  AccountingAuditEvent,
  AccountingDashboardData,
  AccountingFilterState,
  BalanceSheetItem,
  Budget,
  CashFlowForecast,
  CashFlowSegment,
  CategorisedExpense,
  ClientPaymentHistory,
  ClientProfitability,
  ExchangeRate,
  FinancialForecast,
  Invoice,
  InvoiceEmailOptions,
  InvoiceReminderConfig,
  InvoiceStatus,
  MultiCurrencyBalance,
  PaymentExecutionRequest,
  PaymentReminder,
  PayrollRecord,
  PayrollRunRequest,
  ProjectProfitability,
  RecurringTransactionInsight,
  ReportSummary,
  Transaction,
  TransactionCategory,
  TransferRequest,
  CurrencyCode
} from '../types/accounting.types';

export const accountingService = {
  async getAccounts(): Promise<Account[]> {
    const res = await apiClient.get('/v1/accounting/accounts');
    return res.data;
  },

  async createAccount(
    payload: Omit<Account, 'id' | 'balance' | 'isActive'> & { balance?: number }
  ): Promise<Account> {
    const res = await apiClient.post('/v1/accounting/accounts', payload);
    return res.data;
  },

  async updateAccount(accountId: string, payload: Partial<Account>): Promise<Account> {
    const res = await apiClient.put(`/v1/accounting/accounts/${accountId}`, payload);
    return res.data;
  },

  async transfer(request: TransferRequest): Promise<Transaction> {
    const res = await apiClient.post('/v1/accounting/accounts/transfer', request);
    return res.data;
  },

  async reconcile(
    accountId: string,
    statementBalance: number
  ): Promise<{ accountId: string; statementBalance: number; variance: number; date: string }> {
    const res = await apiClient.post(`/v1/accounting/accounts/${accountId}/reconcile`, {
      statementBalance
    });
    return res.data;
  },

  async getCategories(): Promise<TransactionCategory[]> {
    const res = await apiClient.get('/v1/accounting/categories');
    return res.data;
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await apiClient.get('/v1/accounting/transactions');
    return res.data;
  },

  async addTransaction(
    payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Transaction> {
    const res = await apiClient.post('/v1/accounting/transactions', payload);
    return res.data;
  },

  async importTransactions(accountId: string): Promise<number> {
    const res = await apiClient.post(`/v1/accounting/accounts/${accountId}/import`);
    return res.data;
  },

  async bulkImportTransactions(file: File): Promise<number> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/v1/accounting/transactions/bulk-import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async rollbackImport(batchId: string): Promise<boolean> {
    const res = await apiClient.delete(`/v1/accounting/transactions/import-batch/${batchId}`);
    return res.data;
  },

  async syncBank(accountId: string): Promise<boolean> {
    const res = await apiClient.post(`/v1/accounting/accounts/${accountId}/sync`);
    return res.data;
  },

  async getInvoices(): Promise<Invoice[]> {
    const res = await apiClient.get('/finance/invoices');
    return res.data;
  },

  async createInvoice(
    payload: Omit<Invoice, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'number' | 'taxes'>
  ): Promise<Invoice> {
    const res = await apiClient.post('/finance/invoices', payload);
    return res.data;
  },

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<Invoice> {
    const res = await apiClient.put(`/finance/invoices/${invoiceId}/status`, { status });
    return res.data;
  },

  async recordInvoicePayment(
    invoiceId: string,
    amount: number,
    currency: CurrencyCode
  ): Promise<any> {
    const res = await apiClient.post(`/finance/invoices/${invoiceId}/payments`, {
      amount,
      currency
    });
    return res.data;
  },

  async scheduleReminders(config: InvoiceReminderConfig): Promise<PaymentReminder[]> {
    const res = await apiClient.post('/finance/invoices/reminders', config);
    return res.data;
  },

  async sendInvoice(invoiceId: string, options: InvoiceEmailOptions): Promise<boolean> {
    const res = await apiClient.post(`/finance/invoices/${invoiceId}/send`, options);
    return res.data;
  },

  async getPayrollRecords(): Promise<PayrollRecord[]> {
    try {
      const res = await apiClient.get('/v1/accounting/payroll');
      const data = res.data?.data || res.data || [];
      return data.map((emp: any) => ({
        id: emp.id?.startsWith('payroll') ? emp.id : `payroll-${emp.id}`,
        employeeId: emp.employeeId || emp.id,
        employeeName:
          emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown',
        period: emp.period || new Date().toISOString().slice(0, 7),
        currency: emp.currency || 'USD',
        baseSalary: Number(emp.baseSalary || emp.salary || 0),
        grossSalary: Number(emp.grossSalary || emp.salary || 0),
        netSalary: Number(emp.netSalary || (emp.salary ? Number(emp.salary) * 0.8 : 0)),
        deductions: emp.deductions || [
          { type: 'tax', amount: Number(emp.salary || 0) * 0.2, description: 'Income Tax 20%' }
        ],
        bonuses: emp.bonuses || [],
        status: emp.status || 'scheduled',
        generatedAt: emp.generatedAt || new Date().toISOString(),
        paidAt: emp.paidAt
      }));
    } catch {
      return [];
    }
  },

  async runPayroll(request: PayrollRunRequest): Promise<PayrollRecord[]> {
    try {
      const res = await apiClient.post('/v1/accounting/payroll/run', request);
      const data = res.data?.data;
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async markPayrollPaid(request: PaymentExecutionRequest): Promise<boolean> {
    const res = await apiClient.post('/v1/accounting/payroll/pay', request);
    return res.data;
  },

  async getBudgets(): Promise<Budget[]> {
    try {
      const res = await apiClient.get('/v1/accounting/budgets');
      const data = res.data?.data || res.data || [];
      return data.map((b: any) => ({
        ...b,
        allocatedAmount: Number(b.allocatedAmount || b.amount || 0),
        spentAmount: Number(b.spentAmount || 0),
        currency: b.currency || 'USD',
        period: b.period || 'monthly'
      }));
    } catch {
      return [];
    }
  },

  async updateBudget(budgetId: string, changes: Partial<Budget>): Promise<Budget> {
    const res = await apiClient.put(`/v1/accounting/budgets/${budgetId}`, changes);
    return res.data;
  },

  async createBudget(payload: Partial<Budget>): Promise<Budget> {
    const res = await apiClient.post('/v1/accounting/budgets', payload);
    return res.data;
  },

  async getExchangeRates(): Promise<ExchangeRate | null> {
    const res = await apiClient.get('/v1/accounting/exchange-rates');
    return res.data;
  },

  async refreshExchangeRates(): Promise<ExchangeRate> {
    const res = await apiClient.post('/v1/accounting/exchange-rates/refresh');
    return res.data;
  },

  async getDashboardData(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<AccountingDashboardData> {
    const res = await apiClient.get('/v1/accounting/dashboard', { params: { baseCurrency } });
    return res.data;
  },

  async getReports(baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'): Promise<{
    summaries: ReportSummary[];
    cashFlow: CashFlowSegment[];
    forecasts: FinancialForecast[];
    balanceSheet: BalanceSheetItem[];
    taxLiability: number;
    cashFlowForecast: CashFlowForecast[];
  }> {
    const res = await apiClient.get('/v1/accounting/reports', { params: { baseCurrency } });
    return res.data;
  },

  async getCategoryBreakdown(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<CategorisedExpense[]> {
    const res = await apiClient.get('/v1/accounting/category-breakdown', {
      params: { baseCurrency }
    });
    return res.data;
  },

  async getBudgetsUsage(): Promise<{ id: string; usage: number }[]> {
    try {
      const res = await apiClient.get('/v1/accounting/budgets/usage');
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  async getClientProfitability(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<ClientProfitability[]> {
    const res = await apiClient.get('/v1/accounting/client-profitability', {
      params: { baseCurrency }
    });
    return res.data;
  },

  async getProjectProfitability(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<ProjectProfitability[]> {
    return [];
  },

  async getCashBalances(): Promise<MultiCurrencyBalance[]> {
    const res = await apiClient.get('/v1/accounting/cash-balances');
    return res.data;
  },

  async getAuditLog(): Promise<AccountingAuditEvent[]> {
    try {
      const res = await apiClient.get('/v1/accounting/audit-log');
      return res.data?.data || res.data || [];
    } catch {
      return [];
    }
  },

  async searchTransactions(filters: AccountingFilterState): Promise<Transaction[]> {
    const res = await apiClient.get('/v1/accounting/transactions/search', { params: filters });
    return res.data;
  },

  async getRecurringInsights(): Promise<RecurringTransactionInsight[]> {
    try {
      const res = await apiClient.get('/v1/accounting/recurring-insights');
      return res.data;
    } catch {
      return [];
    }
  },

  async getClientPaymentHistory(clientId: string): Promise<ClientPaymentHistory> {
    const res = await apiClient.get(`/v1/accounting/clients/${clientId}/payment-history`);
    return res.data;
  }
};

import { useEffect } from 'react';
import { create } from 'zustand';
import { accountingService } from '../services/accounting.service';
import {
  Account,
  AccountingDashboardData,
  AccountingFilterState,
  AccountingAuditEvent,
  Budget,
  CashFlowForecast,
  CashFlowSegment,
  CategorisedExpense,
  ClientProfitability,
  ExchangeRate,
  FinancialForecast,
  MultiCurrencyBalance,
  PaymentReminder,
  ProjectProfitability,
  ReportSummary,
  Transaction,
  TransactionCategory,
  TransferRequest
} from '../types/accounting.types';

interface AccountingState {
  categories: TransactionCategory[];
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  exchangeRate: ExchangeRate | null;
  dashboard: AccountingDashboardData | null;
  reports: ReportSummary[];
  cashFlow: CashFlowSegment[];
  cashFlowForecast: CashFlowForecast[];
  forecasts: FinancialForecast[];
  categoryBreakdown: CategorisedExpense[];
  clientProfitability: ClientProfitability[];
  projectProfitability: ProjectProfitability[];
  cashBalances: MultiCurrencyBalance[];
  auditLog: AccountingAuditEvent[];
  reminders: PaymentReminder[];
  filters: AccountingFilterState;
  loading: boolean;
  initialized: boolean;
  error?: string;
  load: () => Promise<void>;
  refreshExchangeRates: () => Promise<void>;
  addAccount: (
    payload: Omit<Account, 'id' | 'isActive' | 'syncedAt' | 'reconciliationStatus'> & {
      balance?: number;
    }
  ) => Promise<Account>;
  transfer: (request: TransferRequest) => Promise<Transaction>;
  addTransaction: (
    payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Transaction>;
  importTransactions: (accountId: string) => Promise<number>;
  loadBudgets: () => Promise<void>;
  updateBudget: (budgetId: string, changes: Partial<Budget>) => Promise<void>;
  loadReports: () => Promise<void>;
  loadAuditLog: () => Promise<void>;
  scheduleReminders: (config: {
    daysBeforeDue: number[];
    daysAfterDue: number[];
    enabled: boolean;
  }) => Promise<void>;
  setFilters: (filters: Partial<AccountingFilterState>) => void;
  searchTransactions: () => Promise<Transaction[]>;
}

const initialFilters: AccountingFilterState = {
  accountIds: [],
  types: [],
  categories: [],
  clients: [],
  projects: [],
  tags: []
};

const useAccountingStore = create<AccountingState>((set, get) => ({
  categories: [],
  accounts: [],
  transactions: [],
  budgets: [],
  exchangeRate: null,
  dashboard: null,
  reports: [],
  cashFlow: [],
  cashFlowForecast: [],
  forecasts: [],
  categoryBreakdown: [],
  clientProfitability: [],
  projectProfitability: [],
  cashBalances: [],
  auditLog: [],
  reminders: [],
  filters: initialFilters,
  loading: false,
  initialized: false,
  error: undefined,
  async load() {
    set({ loading: true, error: undefined });
    try {
      const [
        accounts,
        transactions,
        budgets,
        cashBalances,
        auditLog,
        categoryBreakdown,
        clientProfitability,
        projectProfitability,
        categories
      ] = await Promise.all([
        accountingService.getAccounts(),
        accountingService.getTransactions(),
        accountingService.getBudgets(),
        accountingService.getCashBalances(),
        accountingService.getAuditLog(),
        accountingService.getCategoryBreakdown(),
        accountingService.getClientProfitability(),
        accountingService.getProjectProfitability(),
        accountingService.getCategories()
      ]);

      const exchangeRate = await accountingService.getExchangeRates();
      const dashboard = await accountingService.getDashboardData(exchangeRate?.base ?? 'UAH');
      const reportsData = await accountingService.getReports(exchangeRate?.base ?? 'UAH');

      set({
        accounts,
        transactions,
        budgets,
        cashBalances,
        auditLog,
        categoryBreakdown,
        clientProfitability,
        projectProfitability,
        categories,
        exchangeRate,
        dashboard,
        reports: reportsData.summaries,
        cashFlow: reportsData.cashFlow,
        forecasts: reportsData.forecasts,
        cashFlowForecast: reportsData.cashFlowForecast,
        loading: false,
        initialized: true,
        error: undefined
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load accounting module'
      });
    }
  },
  async refreshExchangeRates() {
    const rates = await accountingService.refreshExchangeRates();
    const dashboard = await accountingService.getDashboardData(rates.base);
    const reportsData = await accountingService.getReports(rates.base);
    set({
      exchangeRate: rates,
      dashboard,
      reports: reportsData.summaries,
      cashFlow: reportsData.cashFlow,
      forecasts: reportsData.forecasts,
      cashFlowForecast: reportsData.cashFlowForecast
    });
  },
  async addAccount(payload) {
    const account = await accountingService.createAccount(payload);
    set({ accounts: [account, ...get().accounts] });
    return account;
  },
  async transfer(request) {
    const transaction = await accountingService.transfer(request);
    const [accounts, transactions] = await Promise.all([
      accountingService.getAccounts(),
      accountingService.getTransactions()
    ]);
    set({ accounts, transactions });
    return transaction;
  },
  async addTransaction(payload) {
    const transaction = await accountingService.addTransaction(payload);
    const accounts = await accountingService.getAccounts();
    set({ transactions: [transaction, ...get().transactions], accounts });
    return transaction;
  },
  async importTransactions(accountId) {
    const count = await accountingService.importTransactions(accountId);
    const [transactions, accounts] = await Promise.all([
      accountingService.getTransactions(),
      accountingService.getAccounts()
    ]);
    set({ transactions, accounts });
    return count;
  },
  async loadBudgets() {
    const budgets = await accountingService.getBudgets();
    set({ budgets });
  },
  async updateBudget(budgetId, changes) {
    const budget = await accountingService.updateBudget(budgetId, changes);
    set({
      budgets: get().budgets.map((item) => (item.id === budgetId ? budget : item))
    });
  },
  async loadReports() {
    const base = get().exchangeRate?.base ?? 'UAH';
    const reportsData = await accountingService.getReports(base);
    set({
      reports: reportsData.summaries,
      cashFlow: reportsData.cashFlow,
      forecasts: reportsData.forecasts,
      cashFlowForecast: reportsData.cashFlowForecast
    });
  },
  async loadAuditLog() {
    const auditLog = await accountingService.getAuditLog();
    set({ auditLog });
  },
  async scheduleReminders(config) {
    const reminders = await accountingService.scheduleReminders(config);
    set({ reminders });
  },
  setFilters(filters) {
    set({ filters: { ...get().filters, ...filters } });
  },
  async searchTransactions() {
    return accountingService.searchTransactions(get().filters);
  }
}));

export const useAccounting = () => {
  const store = useAccountingStore();
  useEffect(() => {
    if (!store.initialized && !store.loading) {
      void store.load();
    }
  }, [store, store.initialized, store.loading, store.load]);
  return store;
};

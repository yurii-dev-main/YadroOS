import Decimal from 'decimal.js';
import { addMonths, format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { hrService } from '../../hr/services/hr.service';
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
import { bankIntegrationService } from './bank-integration.service';
import {
  applyTaxConfiguration,
  calculateDiscountedAmount,
  calculateNetSalary,
  calculatePayrollDeductions,
  calculateTaxLiability,
  defaultTaxConfiguration
} from '../utils/tax.utils';
import {
  aggregateTransactions,
  buildBalanceSheet,
  buildCashFlowStatement,
  buildProfitAndLossReport,
  calculateBudgetForecast,
  calculateBudgetUsage,
  calculateTotalBalance,
  computeCashFlowForecast,
  convertCurrency,
  projectFinancialForecast,
  summarisePayroll
} from '../utils/calculations.utils';

const accounts: Account[] = [
  {
    id: 'acc-mono',
    name: 'Monobank',
    type: 'bank',
    currency: 'UAH',
    balance: 420000,
    bankName: 'Monobank',
    accountNumber: '2625400000001',
    iban: 'UA123456789012345678901234567',
    color: '#1f2937',
    isActive: true,
    syncedAt: new Date().toISOString(),
    reconciliationStatus: 'clean'
  },
  {
    id: 'acc-privat',
    name: 'PrivatBank',
    type: 'bank',
    currency: 'USD',
    balance: 52000,
    bankName: 'PrivatBank',
    accountNumber: '260050000002',
    iban: 'UA987654321098765432109876543',
    color: '#16a34a',
    isActive: true,
    syncedAt: new Date().toISOString(),
    reconciliationStatus: 'pending'
  },
  {
    id: 'acc-cash',
    name: 'Cash',
    type: 'cash',
    currency: 'UAH',
    balance: 8200,
    color: '#f97316',
    isActive: true,
    syncedAt: new Date().toISOString(),
    reconciliationStatus: 'clean'
  }
];

const categories: TransactionCategory[] = [
  { id: 'cat-sales', name: 'Sales', type: 'income', color: '#22c55e' },
  { id: 'cat-office', name: 'Office', type: 'expense', color: '#38bdf8' },
  { id: 'cat-rent', name: 'Rent', type: 'expense', parentId: 'cat-office' },
  { id: 'cat-utilities', name: 'Utilities', type: 'expense', parentId: 'cat-office' },
  { id: 'cat-salaries', name: 'Salaries', type: 'expense', color: '#ef4444' },
  { id: 'cat-taxes', name: 'Taxes', type: 'expense', color: '#facc15' },
  { id: 'cat-marketing', name: 'Marketing', type: 'expense', color: '#a855f7' },
  { id: 'cat-development', name: 'Development', type: 'expense' },
  { id: 'cat-travel', name: 'Travel', type: 'expense' },
  { id: 'cat-custom', name: 'Custom Categories', type: 'mixed' }
];

const transactions: Transaction[] = [
  {
    id: uuid(),
    type: 'income',
    amount: 28000,
    currency: 'USD',
    accountId: 'acc-privat',
    categoryId: 'cat-sales',
    date: format(addMonths(new Date(), -1), 'yyyy-MM-05'),
    description: 'Payment for CRM project',
    status: 'completed',
    attachments: [],
    tags: ['crm', 'client:acme'],
    clientId: 'client-1',
    projectId: 'project-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    type: 'expense',
    amount: 180000,
    currency: 'UAH',
    accountId: 'acc-mono',
    categoryId: 'cat-salaries',
    date: format(addMonths(new Date(), -1), 'yyyy-MM-28'),
    description: 'Salary for March',
    status: 'completed',
    attachments: [],
    tags: ['payroll'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    type: 'expense',
    amount: 52000,
    currency: 'UAH',
    accountId: 'acc-mono',
    categoryId: 'cat-office',
    subcategory: 'rent',
    date: format(addMonths(new Date(), -1), 'yyyy-MM-10'),
    description: 'Office rent',
    status: 'completed',
    attachments: [],
    tags: ['office'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const invoices: Invoice[] = [
  {
    id: uuid(),
    number: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'Acme Corporation',
    projectId: 'project-1',
    status: 'sent',
    issueDate: format(addMonths(new Date(), -1), 'yyyy-MM-01'),
    dueDate: format(addMonths(new Date(), -1), 'yyyy-MM-15'),
    currency: 'USD',
    lineItems: [
      {
        id: uuid(),
        name: 'CRM module development',
        quantity: 120,
        unitPrice: 80,
        currency: 'USD',
        taxRate: 0.2
      }
    ],
    taxes: 1920,
    discount: 0.05,
    notes: 'Payment within 14 days',
    attachments: [],
    payments: [],
    branding: {
      logoUrl: '/logo.svg',
      accentColor: '#6366f1'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuid(),
    number: 'INV-2024-002',
    clientId: 'client-2',
    clientName: 'Delta Logistics',
    projectId: 'project-2',
    status: 'paid',
    issueDate: format(addMonths(new Date(), -2), 'yyyy-MM-03'),
    dueDate: format(addMonths(new Date(), -2), 'yyyy-MM-20'),
    currency: 'EUR',
    lineItems: [
      {
        id: uuid(),
        name: 'API integration',
        quantity: 40,
        unitPrice: 120,
        currency: 'EUR',
        taxRate: 0.2
      }
    ],
    taxes: 960,
    discount: 0,
    notes: 'Paid via Stripe',
    attachments: [],
    payments: [
      {
        id: uuid(),
        amount: 5760,
        currency: 'EUR',
        date: format(addMonths(new Date(), -2), 'yyyy-MM-18'),
        method: 'online',
        reference: 'stripe-2024-0003'
      }
    ],
    branding: {
      accentColor: '#f97316'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const payrollRecords: PayrollRecord[] = [];
const budgets: Budget[] = [
  {
    id: 'budget-marketing-2024',
    name: 'Marketing 2024',
    categoryId: 'cat-marketing',
    currency: 'UAH',
    period: 'yearly',
    startDate: `${new Date().getFullYear()}-01-01`,
    endDate: `${new Date().getFullYear()}-12-31`,
    allocatedAmount: 1200000,
    spentAmount: 320000,
    alertsEnabled: true,
    history: [
      { date: `${new Date().getFullYear()}-01-31`, amount: 120000 },
      { date: `${new Date().getFullYear()}-02-28`, amount: 95000 }
    ]
  },
  {
    id: 'budget-rd-q2',
    name: 'R&D Q2',
    categoryId: 'cat-development',
    currency: 'USD',
    period: 'quarterly',
    startDate: `${new Date().getFullYear()}-04-01`,
    endDate: `${new Date().getFullYear()}-06-30`,
    allocatedAmount: 180000,
    spentAmount: 42000,
    alertsEnabled: true,
    history: [{ date: `${new Date().getFullYear()}-04-30`, amount: 28000 }]
  }
];

const reminders: PaymentReminder[] = [];
const auditLog: AccountingAuditEvent[] = [];
let exchangeRate: ExchangeRate | null = null;

const recordAudit = (event: Omit<AccountingAuditEvent, 'id' | 'timestamp'>) => {
  auditLog.unshift({
    ...event,
    id: uuid(),
    timestamp: new Date().toISOString()
  });
};

const processTransactionBalance = (transaction: Transaction) => {
  const account = accounts.find((item) => item.id === transaction.accountId);
  if (!account) return;

  const amount = new Decimal(transaction.amount);
  if (transaction.type === 'income') {
    account.balance = Number(new Decimal(account.balance).add(amount).toFixed(2));
  }

  if (transaction.type === 'expense') {
    account.balance = Number(new Decimal(account.balance).minus(amount).toFixed(2));
  }

  if (transaction.type === 'transfer' && transaction.toAccountId) {
    const target = accounts.find((item) => item.id === transaction.toAccountId);
    if (!target) return;

    const convertedAmount = convertCurrency(
      transaction.amount,
      transaction.currency,
      target.currency,
      exchangeRate
    );

    account.balance = Number(new Decimal(account.balance).minus(amount).toFixed(2));
    target.balance = Number(new Decimal(target.balance).add(convertedAmount).toFixed(2));
  }
};

export const accountingService = {
  async getAccounts(): Promise<Account[]> {
    return [...accounts];
  },

  async createAccount(
    payload: Omit<Account, 'id' | 'balance' | 'isActive'> & { balance?: number }
  ) {
    const account: Account = {
      ...payload,
      id: uuid(),
      balance: payload.balance ?? 0,
      isActive: true,
      syncedAt: new Date().toISOString(),
      reconciliationStatus: 'pending'
    };

    accounts.push(account);
    recordAudit({
      entity: 'account',
      entityId: account.id,
      action: 'create',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return account;
  },

  async updateAccount(accountId: string, payload: Partial<Account>) {
    const index = accounts.findIndex((account) => account.id === accountId);
    if (index === -1) throw new Error('Account not found');

    accounts[index] = { ...accounts[index], ...payload };
    recordAudit({
      entity: 'account',
      entityId: accountId,
      action: 'update',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return accounts[index];
  },

  async transfer(request: TransferRequest) {
    const from = accounts.find((account) => account.id === request.fromAccountId);
    const to = accounts.find((account) => account.id === request.toAccountId);
    if (!from || !to) throw new Error('Account not found');

    const amount = new Decimal(request.amount);
    if (amount.greaterThan(from.balance)) {
      throw new Error('Insufficient funds');
    }

    const convertedAmount = convertCurrency(
      request.amount,
      request.currency,
      to.currency,
      exchangeRate
    );

    from.balance = Number(new Decimal(from.balance).minus(amount).toFixed(2));
    to.balance = Number(new Decimal(to.balance).add(convertedAmount).toFixed(2));

    const transaction: Transaction = {
      id: uuid(),
      type: 'transfer',
      amount: request.amount,
      currency: request.currency,
      accountId: from.id,
      toAccountId: to.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      description: request.description ?? `Transfer to ${to.name}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    transactions.unshift(transaction);
    recordAudit({
      entity: 'transaction',
      entityId: transaction.id,
      action: 'create',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return transaction;
  },

  async reconcile(accountId: string, statementBalance: number) {
    const account = accounts.find((item) => item.id === accountId);
    if (!account) throw new Error('Account not found');

    const variance = Number(new Decimal(account.balance).minus(statementBalance).toFixed(2));
    account.reconciliationStatus = Math.abs(variance) < 1 ? 'clean' : 'mismatch';
    account.syncedAt = new Date().toISOString();

    recordAudit({
      entity: 'account',
      entityId: accountId,
      action: 'reconcile',
      performedBy: 'system',
      performedByRole: 'accountant',
      metadata: { variance }
    });
    return {
      accountId,
      statementBalance,
      variance,
      date: new Date().toISOString()
    };
  },

  async getCategories(): Promise<TransactionCategory[]> {
    return [...categories];
  },

  async getTransactions(): Promise<Transaction[]> {
    return [...transactions];
  },

  async addTransaction(payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const transaction: Transaction = {
      ...payload,
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    transactions.unshift(transaction);
    processTransactionBalance(transaction);
    recordAudit({
      entity: 'transaction',
      entityId: transaction.id,
      action: 'create',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return transaction;
  },

  async importTransactions(accountId: string) {
    const imported = await bankIntegrationService.fetchTransactions(accountId);
    imported.forEach((transaction) => {
      transactions.unshift(transaction);
      processTransactionBalance(transaction);
    });
    recordAudit({
      entity: 'transaction',
      entityId: accountId,
      action: 'import',
      performedBy: 'system',
      performedByRole: 'accountant',
      metadata: { count: imported.length }
    });
    return imported.length;
  },

  async bulkImportTransactions(file: File) {
    const imported = await bankIntegrationService.importFromCsv(file);
    imported.forEach((transaction) => {
      transactions.unshift(transaction);
      processTransactionBalance(transaction);
    });

    recordAudit({
      entity: 'transaction',
      entityId: 'bulk',
      action: 'import',
      performedBy: 'system',
      performedByRole: 'accountant',
      metadata: { count: imported.length }
    });
    return imported.length;
  },

  async getInvoices(): Promise<Invoice[]> {
    return invoices.map((invoice) => applyTaxConfiguration(invoice, defaultTaxConfiguration));
  },

  async createInvoice(
    payload: Omit<Invoice, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'number' | 'taxes'>
  ) {
    const taxes = payload.lineItems.reduce((acc, item) => {
      const rate = item.taxRate ?? defaultTaxConfiguration.vatRate;
      return acc + item.quantity * item.unitPrice * rate;
    }, 0);

    const invoice: Invoice = {
      ...payload,
      id: uuid(),
      number: `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(3, '0')}`,
      status: 'draft',
      taxes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    invoices.unshift(invoice);
    recordAudit({
      entity: 'invoice',
      entityId: invoice.id,
      action: 'create',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return invoice;
  },

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    invoice.status = status;
    invoice.updatedAt = new Date().toISOString();
    recordAudit({
      entity: 'invoice',
      entityId: invoiceId,
      action: 'update',
      performedBy: 'system',
      performedByRole: 'accountant',
      metadata: { status }
    });
    return invoice;
  },

  async recordInvoicePayment(invoiceId: string, amount: number, currency: CurrencyCode) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const payment = {
      id: uuid(),
      amount,
      currency,
      date: format(new Date(), 'yyyy-MM-dd'),
      method: 'bank_transfer' as const,
      reference: `manual-${Date.now()}`
    };

    invoice.payments = [...(invoice.payments ?? []), payment];
    const paidAmount = invoice.payments.reduce((acc, item) => acc + item.amount, 0);
    const totalDue = calculateDiscountedAmount(invoice) + invoice.taxes;

    if (paidAmount >= totalDue) {
      invoice.status = 'paid';
    } else if (paidAmount > 0 && invoice.status !== 'paid') {
      invoice.status = 'sent';
    }

    invoice.updatedAt = new Date().toISOString();
    recordAudit({
      entity: 'invoice',
      entityId: invoiceId,
      action: 'update',
      performedBy: 'system',
      performedByRole: 'accountant',
      metadata: { payment }
    });
    return payment;
  },

  async scheduleReminders(config: InvoiceReminderConfig) {
    reminders.length = 0;
    invoices
      .filter((invoice) => invoice.status !== 'paid')
      .forEach((invoice) => {
        config.daysBeforeDue.forEach((days) => {
          reminders.push({
            invoiceId: invoice.id,
            sentAt: new Date(new Date(invoice.dueDate).getTime() - days * 86400000).toISOString(),
            channel: 'email',
            status: 'scheduled'
          });
        });
      });
    return [...reminders];
  },

  async sendInvoice(invoiceId: string, options: InvoiceEmailOptions) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    invoice.status = 'sent';
    invoice.updatedAt = new Date().toISOString();
    recordAudit({
      entity: 'invoice',
      entityId: invoiceId,
      action: 'update',
      performedBy: 'system',
      performedByRole: 'accountant',
      metadata: { email: options.to }
    });
    return true;
  },

  async getPayrollRecords(): Promise<PayrollRecord[]> {
    return [...payrollRecords];
  },

  async runPayroll(request: PayrollRunRequest) {
    const employees = hrService.getEmployees({ status: 'active' });
    const period = request.period;

    employees.forEach((employee) => {
      const baseSalary = employee.salary;
      const bonuses = [
        {
          name: 'Performance bonus',
          amount: Number(new Decimal(baseSalary).mul(0.1).toFixed(2)),
          reason: 'KPI > 85%'
        }
      ];

      const deductions = calculatePayrollDeductions(baseSalary, defaultTaxConfiguration);
      const overtimeAmount = request.includeOvertime
        ? Number(new Decimal(baseSalary).mul(0.05).toFixed(2))
        : 0;
      const grossSalary = Number(
        new Decimal(baseSalary)
          .add(overtimeAmount)
          .add(bonuses.reduce((acc, bonus) => acc + bonus.amount, 0))
          .toFixed(2)
      );

      const record: PayrollRecord = {
        id: uuid(),
        employeeId: employee.id,
        employeeName: employee.name,
        baseSalary,
        bonuses,
        deductions,
        overtimeHours: request.includeOvertime ? 10 : 0,
        overtimeAmount,
        grossSalary,
        netSalary: calculateNetSalary({ grossSalary, deductions }),
        currency: (employee.currency as CurrencyCode) ?? 'USD',
        period,
        status: request.approveImmediately ? 'processed' : 'pending',
        generatedAt: new Date().toISOString()
      };

      payrollRecords.unshift(record);
      recordAudit({
        entity: 'payroll',
        entityId: record.id,
        action: 'create',
        performedBy: 'system',
        performedByRole: 'accountant'
      });
    });

    return payrollRecords.filter((record) => record.period === period);
  },

  async markPayrollPaid(request: PaymentExecutionRequest) {
    request.payrollRecordIds.forEach((recordId) => {
      const record = payrollRecords.find((item) => item.id === recordId);
      if (record) {
        record.status = 'paid';
        record.paidAt = new Date().toISOString();
        recordAudit({
          entity: 'payroll',
          entityId: recordId,
          action: 'pay',
          performedBy: request.executedBy,
          performedByRole: 'accountant'
        });
      }
    });
    return true;
  },

  async getBudgets(): Promise<Budget[]> {
    return [...budgets];
  },

  async updateBudget(budgetId: string, changes: Partial<Budget>) {
    const budget = budgets.find((item) => item.id === budgetId);
    if (!budget) throw new Error('Budget not found');

    Object.assign(budget, changes);
    recordAudit({
      entity: 'budget',
      entityId: budgetId,
      action: 'update',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return budget;
  },

  async getExchangeRates(): Promise<ExchangeRate | null> {
    if (!exchangeRate) {
      exchangeRate = await bankIntegrationService.fetchExchangeRates();
    }
    return exchangeRate;
  },

  async refreshExchangeRates(): Promise<ExchangeRate> {
    exchangeRate = await bankIntegrationService.fetchExchangeRates();
    recordAudit({
      entity: 'report',
      entityId: 'fx',
      action: 'update',
      performedBy: 'system',
      performedByRole: 'accountant'
    });
    return exchangeRate;
  },

  async getDashboardData(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<AccountingDashboardData> {
    const rates = await this.getExchangeRates();
    const totalBalance = calculateTotalBalance(accounts, baseCurrency, rates);
    const totals = aggregateTransactions(transactions, baseCurrency, rates);
    const payroll = payrollRecords.slice(0, 5);

    return {
      accounts: [...accounts],
      totalBalance,
      totalIncome: totals.income,
      totalExpense: totals.expense,
      pendingInvoices: invoices.filter((invoice) => invoice.status === 'sent').length,
      overdueInvoices: invoices.filter((invoice) => invoice.status === 'overdue').length,
      payrollSummary: payroll.length
        ? {
            period: payroll[0].period,
            totalEmployees: payroll.length,
            totalNetAmount: payroll.reduce((acc, record) => acc + record.netSalary, 0),
            totalDeductions: payroll.reduce(
              (acc, record) =>
                acc + record.deductions.reduce((sum, deduction) => sum + deduction.amount, 0),
              0
            ),
            totalBonuses: payroll.reduce(
              (acc, record) => acc + record.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0),
              0
            ),
            currency: payroll[0].currency
          }
        : null,
      exchangeRate: rates
    };
  },

  async getReports(baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'): Promise<{
    summaries: ReportSummary[];
    cashFlow: CashFlowSegment[];
    forecasts: FinancialForecast[];
    balanceSheet: BalanceSheetItem[];
    taxLiability: number;
    cashFlowForecast: CashFlowForecast[];
  }> {
    const rates = await this.getExchangeRates();
    const profitLoss = buildProfitAndLossReport(transactions, baseCurrency, rates);
    const { report: cashFlowReport, segments } = buildCashFlowStatement(
      transactions,
      baseCurrency,
      rates
    );
    const balance = buildBalanceSheet(accounts, baseCurrency, rates);
    const payrollReport = summarisePayroll(payrollRecords, baseCurrency, rates);
    const forecastPoints = calculateBudgetForecast(budgets, baseCurrency, rates);
    const forecast = projectFinancialForecast(forecastPoints, rates, baseCurrency);
    const taxLiability = calculateTaxLiability(payrollRecords);
    const cashForecast = computeCashFlowForecast(accounts, transactions, baseCurrency, rates);

    const balanceSheet: BalanceSheetItem[] = [
      {
        name: 'Cash and cash equivalents',
        amount: profitLoss.figures.income - profitLoss.figures.expenses,
        type: 'asset'
      },
      { name: 'Liabilities', amount: balance.figures.liabilities, type: 'liability' },
      { name: 'Equity', amount: balance.figures.equity, type: 'equity' }
    ];

    return {
      summaries: [profitLoss, cashFlowReport, balance, payrollReport],
      cashFlow: segments,
      forecasts: [forecast],
      balanceSheet,
      taxLiability,
      cashFlowForecast: cashForecast
    };
  },

  async getCategoryBreakdown(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<CategorisedExpense[]> {
    const rates = await this.getExchangeRates();
    return categories
      .filter((category) => category.type !== 'income')
      .map((category) => {
        const total = transactions
          .filter(
            (transaction) =>
              transaction.categoryId === category.id && transaction.type === 'expense'
          )
          .reduce((acc, transaction) => {
            const amount = convertCurrency(
              transaction.amount,
              transaction.currency,
              baseCurrency,
              rates
            );
            return acc + amount;
          }, 0);
        return {
          categoryId: category.id,
          categoryName: category.name,
          total,
          currency: baseCurrency
        };
      });
  },

  async getBudgetsUsage(): Promise<{ id: string; usage: number }[]> {
    const rates = await this.getExchangeRates();
    return budgets.map((budget) => ({
      id: budget.id,
      usage: calculateBudgetUsage(budget, transactions, rates)
    }));
  },

  async getClientProfitability(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<ClientProfitability[]> {
    const rates = await this.getExchangeRates();
    const clients = new Map<string, ClientProfitability>();

    transactions.forEach((transaction) => {
      if (!transaction.clientId) return;
      if (!clients.has(transaction.clientId)) {
        clients.set(transaction.clientId, {
          clientId: transaction.clientId,
          clientName: transaction.clientId,
          revenue: 0,
          expenses: 0,
          margin: 0,
          currency: baseCurrency
        });
      }
      const summary = clients.get(transaction.clientId)!;
      const amount = convertCurrency(transaction.amount, transaction.currency, baseCurrency, rates);
      if (transaction.type === 'income') {
        summary.revenue += amount;
      } else if (transaction.type === 'expense') {
        summary.expenses += amount;
      }
      summary.margin = summary.revenue - summary.expenses;
    });

    return Array.from(clients.values());
  },

  async getProjectProfitability(
    baseCurrency: 'UAH' | 'USD' | 'EUR' = 'UAH'
  ): Promise<ProjectProfitability[]> {
    const rates = await this.getExchangeRates();
    const projects = new Map<string, ProjectProfitability>();

    transactions.forEach((transaction) => {
      if (!transaction.projectId) return;
      if (!projects.has(transaction.projectId)) {
        projects.set(transaction.projectId, {
          projectId: transaction.projectId,
          projectName: transaction.projectId,
          revenue: 0,
          expenses: 0,
          margin: 0,
          currency: baseCurrency
        });
      }
      const summary = projects.get(transaction.projectId)!;
      const amount = convertCurrency(transaction.amount, transaction.currency, baseCurrency, rates);
      if (transaction.type === 'income') {
        summary.revenue += amount;
      } else if (transaction.type === 'expense') {
        summary.expenses += amount;
      }
      summary.margin = summary.revenue - summary.expenses;
    });

    return Array.from(projects.values());
  },

  async getCashBalances(): Promise<MultiCurrencyBalance[]> {
    return accounts.reduce<MultiCurrencyBalance[]>((acc, account) => {
      const existing = acc.find((item) => item.currency === account.currency);
      if (existing) {
        existing.total += account.balance;
      } else {
        acc.push({ currency: account.currency, total: account.balance });
      }
      return acc;
    }, []);
  },

  async getAuditLog(): Promise<AccountingAuditEvent[]> {
    return [...auditLog];
  },

  async searchTransactions(filters: AccountingFilterState): Promise<Transaction[]> {
    return transactions.filter((transaction) => {
      if (filters.accountIds.length && !filters.accountIds.includes(transaction.accountId))
        return false;
      if (filters.types.length && !filters.types.includes(transaction.type)) return false;
      if (
        filters.categories.length &&
        (!transaction.categoryId || !filters.categories.includes(transaction.categoryId))
      )
        return false;
      if (filters.dateRange) {
        if (transaction.date < filters.dateRange.from || transaction.date > filters.dateRange.to)
          return false;
      }
      return true;
    });
  },

  async getRecurringInsights(): Promise<RecurringTransactionInsight[]> {
    return transactions
      .filter((transaction) => transaction.recurring)
      .map((transaction) => ({
        transactionId: transaction.id,
        nextRun: transaction.recurring!.nextRun,
        description: transaction.description ?? '',
        estimatedAnnualCost: transaction.amount * 12,
        currency: transaction.currency
      }));
  },

  async getClientPaymentHistory(clientId: string): Promise<ClientPaymentHistory> {
    const clientInvoices = invoices.filter((invoice) => invoice.clientId === clientId);
    const payments = clientInvoices.flatMap((invoice) =>
      (invoice.payments ?? []).map((payment) => ({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        amount: payment.amount,
        currency: payment.currency,
        date: payment.date,
        status: invoice.status
      }))
    );

    return {
      clientId,
      clientName: clientInvoices[0]?.clientName ?? clientId,
      payments
    };
  }
};

export type CurrencyCode = 'USD' | 'EUR' | 'UAH';
export type AccountType = 'bank' | 'cash' | 'card';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface ExchangeRate {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  updatedAt: string;
  provider: string;
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  bankName?: string;
  accountNumber?: string;
  iban?: string;
  color?: string;
  isActive: boolean;
  syncedAt?: string;
  reconciliationStatus?: 'clean' | 'pending' | 'mismatch';
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  currency: CurrencyCode;
  description?: string;
}

export interface ReconciliationRecord {
  accountId: string;
  statementBalance: number;
  variance: number;
  date: string;
  notes?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: TransactionType | 'mixed';
  parentId?: string;
  color?: string;
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextRun: string;
  endDate?: string;
  occurrencesLeft?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  subcategory?: string;
  date: string;
  description?: string;
  attachments?: Attachment[];
  tags?: string[];
  projectId?: string;
  clientId?: string;
  status: TransactionStatus;
  recurring?: RecurringConfig;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currency: CurrencyCode;
  taxRate?: number;
  discount?: number;
}

export interface InvoicePayment {
  id: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  method: 'bank_transfer' | 'cash' | 'card' | 'online';
  reference?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  projectId?: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: CurrencyCode;
  lineItems: InvoiceLineItem[];
  taxes: number;
  discount?: number;
  notes?: string;
  attachments?: Attachment[];
  payments?: InvoicePayment[];
  branding?: {
    logoUrl?: string;
    accentColor?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PayrollBonusBreakdown {
  name: string;
  amount: number;
  reason: string;
}

export interface PayrollDeduction {
  name: string;
  amount: number;
  type: 'tax' | 'insurance' | 'pension' | 'other';
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  bonuses: PayrollBonusBreakdown[];
  deductions: PayrollDeduction[];
  overtimeHours: number;
  overtimeAmount: number;
  grossSalary: number;
  netSalary: number;
  currency: CurrencyCode;
  period: string;
  status: 'pending' | 'processed' | 'paid';
  generatedAt: string;
  paidAt?: string;
  payslipUrl?: string;
}

export interface PayrollSummary {
  period: string;
  totalEmployees: number;
  totalNetAmount: number;
  totalDeductions: number;
  totalBonuses: number;
  currency: CurrencyCode;
}

export interface TaxBracket {
  id: string;
  name: string;
  rate: number;
  appliesTo: 'income' | 'vat' | 'social';
}

export interface TaxConfiguration {
  country: string;
  incomeTaxRate: number;
  socialSecurityRate: number;
  pensionRate: number;
  vatRate: number;
  progressiveBrackets?: TaxBracket[];
}

export interface ReportSummary {
  type: 'profitAndLoss' | 'cashFlow' | 'balanceSheet' | 'tax' | 'budget';
  title: string;
  generatedAt: string;
  currency: CurrencyCode;
  figures: Record<string, number>;
}

export interface CashFlowSegment {
  name: string;
  inflow: number;
  outflow: number;
}

export interface ForecastPoint {
  month: string;
  expectedIncome: number;
  expectedExpense: number;
}

export interface Budget {
  id: string;
  name: string;
  categoryId?: string;
  projectId?: string;
  currency: CurrencyCode;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  allocatedAmount: number;
  spentAmount: number;
  alertsEnabled: boolean;
  history: Array<{ date: string; amount: number }>;
}

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  revenue: number;
  expenses: number;
  margin: number;
  currency: CurrencyCode;
}

export interface ProjectProfitability {
  projectId: string;
  projectName: string;
  revenue: number;
  expenses: number;
  margin: number;
  currency: CurrencyCode;
}

export interface AccountingAuditEvent {
  id: string;
  entity: 'account' | 'transaction' | 'invoice' | 'payroll' | 'budget' | 'report';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'export' | 'import' | 'reconcile' | 'pay';
  performedBy: string;
  performedByRole: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface InvoiceBuilderSection {
  id: string;
  title: string;
  description?: string;
  items: InvoiceLineItem[];
}

export interface BulkImportResult<T> {
  processed: number;
  created: number;
  skipped: number;
  errors: Array<{ row: number; message: string; raw: Partial<T> }>;
}

export interface PaymentReminder {
  invoiceId: string;
  sentAt: string;
  channel: 'email' | 'sms' | 'messenger';
  status: 'scheduled' | 'sent';
}

export interface AccountingDashboardData {
  accounts: Account[];
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  pendingInvoices: number;
  overdueInvoices: number;
  payrollSummary: PayrollSummary | null;
  exchangeRate: ExchangeRate | null;
}

export interface RecurringTransactionSchedule {
  id: string;
  transactionId: string;
  frequency: RecurringConfig['frequency'];
  nextRun: string;
  lastRun?: string;
  enabled: boolean;
}

export interface ImportPreview<T> {
  sample: T[];
  columns: string[];
  valid: boolean;
  warnings: string[];
}

export interface PayslipGenerationOptions {
  includeSignature?: boolean;
  showCompanyBranding?: boolean;
  locale?: string;
}

export interface InvoiceEmailOptions {
  to: string;
  cc?: string[];
  subject?: string;
  body?: string;
  attachPdf?: boolean;
}

export interface FinancialForecast {
  timeHorizon: '3m' | '6m' | '12m';
  points: ForecastPoint[];
  assumptions: string[];
}

export interface AccountingPermissions {
  canView: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canExecutePayments: boolean;
}

export interface PayrollRunRequest {
  period: string;
  includeBonuses?: boolean;
  includeOvertime?: boolean;
  approveImmediately?: boolean;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  sections: InvoiceBuilderSection[];
  defaultNotes?: string;
  defaultTerms?: string;
}

export interface CategoryNode extends TransactionCategory {
  children?: CategoryNode[];
}

export interface ExchangeRateProvider {
  name: string;
  fetchRates: () => Promise<ExchangeRate>;
}

export interface PaymentExecutionRequest {
  payrollRecordIds: string[];
  accountId: string;
  executedBy: string;
}

export interface AccountingFilterState {
  accountIds: string[];
  types: TransactionType[];
  categories: string[];
  clients: string[];
  projects: string[];
  tags: string[];
  dateRange?: { from: string; to: string };
  amountRange?: { from: number; to: number };
}

export interface CategorisedExpense {
  categoryId: string;
  categoryName: string;
  total: number;
  currency: CurrencyCode;
}

export interface CategoryBudgetUsage {
  categoryId: string;
  allocated: number;
  spent: number;
  remaining: number;
  currency: CurrencyCode;
}

export interface RecurringTransactionInsight {
  transactionId: string;
  nextRun: string;
  description: string;
  estimatedAnnualCost: number;
  currency: CurrencyCode;
}

export interface TransactionSearchResult {
  total: number;
  results: Transaction[];
}

export interface AccountingSearchFilters {
  searchTerm?: string;
  tags?: string[];
  statuses?: TransactionStatus[];
  period?: 'week' | 'month' | 'quarter' | 'year';
}

export interface InvoiceReminderConfig {
  daysBeforeDue: number[];
  daysAfterDue: number[];
  enabled: boolean;
}

export interface CashFlowForecast {
  month: string;
  openingBalance: number;
  closingBalance: number;
  inflow: number;
  outflow: number;
  currency: CurrencyCode;
}

export interface BudgetAlert {
  budgetId: string;
  threshold: number;
  triggeredAt: string;
  message: string;
}

export interface AuditLogFilter {
  entity?: AccountingAuditEvent['entity'];
  entityId?: string;
  action?: AccountingAuditEvent['action'];
  from?: string;
  to?: string;
}

export interface PayrollCalendarEntry {
  id: string;
  period: string;
  runDate: string;
  paymentDate: string;
  status: 'scheduled' | 'processed' | 'paid';
}

export interface PayrollAutomationRule {
  id: string;
  name: string;
  description: string;
  kpiThreshold?: number;
  attendanceThreshold?: number;
  salesThreshold?: number;
  bonusMultiplier: number;
}

export interface PayrollEngineConfig {
  overtimeRate: number;
  defaultTaxConfiguration: TaxConfiguration;
  automationRules: PayrollAutomationRule[];
}

export interface AccountingSecuritySettings {
  encryptionEnabled: boolean;
  twoFactorEnabled: boolean;
  auditLogRetentionDays: number;
}

export interface AccountingModuleState {
  dashboard: AccountingDashboardData | null;
  accounts: Account[];
  transactions: Transaction[];
  invoices: Invoice[];
  payroll: PayrollRecord[];
  budgets: Budget[];
  categories: TransactionCategory[];
  exchangeRate: ExchangeRate | null;
  reports: ReportSummary[];
  cashFlow: CashFlowSegment[];
  forecasts: FinancialForecast[];
  auditLog: AccountingAuditEvent[];
  reminders: PaymentReminder[];
  recurringSchedules: RecurringTransactionSchedule[];
  payrollCalendar: PayrollCalendarEntry[];
  filters: AccountingFilterState;
  lastUpdated?: string;
}

export interface PaymentHistoryEntry {
  invoiceId: string;
  clientId: string;
  amount: number;
  currency: CurrencyCode;
  date: string;
  status: InvoiceStatus;
}

export interface ClientPaymentHistory {
  clientId: string;
  clientName: string;
  payments: PaymentHistoryEntry[];
}

export interface MultiCurrencyBalance {
  currency: CurrencyCode;
  total: number;
}

export interface BalanceSheetItem {
  name: string;
  amount: number;
  type: 'asset' | 'liability' | 'equity';
}

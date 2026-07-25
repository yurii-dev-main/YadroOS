import Decimal from 'decimal.js';
import { addMonths, format, parseISO } from 'date-fns';
import {
  Account,
  Budget,
  CashFlowForecast,
  CashFlowSegment,
  CurrencyCode,
  ExchangeRate,
  FinancialForecast,
  ForecastPoint,
  PayrollRecord,
  ReportSummary,
  Transaction,
  TransactionType
} from '../types/accounting.types';

export const convertCurrency = (
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): number => {
  if (!exchangeRate || from === to) {
    return Number(new Decimal(amount).toFixed(2));
  }

  if (exchangeRate.base === from) {
    return Number(new Decimal(amount).mul(exchangeRate.rates[to] ?? 1).toFixed(2));
  }

  if (exchangeRate.base === to) {
    const base = new Decimal(amount).div(exchangeRate.rates[from] ?? 1);
    return Number(base.toFixed(2));
  }

  const baseAmount = new Decimal(amount).div(exchangeRate.rates[from] ?? 1);
  return Number(baseAmount.mul(exchangeRate.rates[to] ?? 1).toFixed(2));
};

export const calculateTotalBalance = (
  accounts: Account[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): number =>
  accounts.reduce((acc, account) => {
    const converted = convertCurrency(
      account.balance,
      account.currency,
      baseCurrency,
      exchangeRate
    );
    return acc + converted;
  }, 0);

export const aggregateTransactions = (
  transactions: Transaction[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): Record<TransactionType, number> => {
  return transactions.reduce(
    (acc, transaction) => {
      const amount = convertCurrency(
        transaction.amount,
        transaction.currency,
        baseCurrency,
        exchangeRate
      );
      acc[transaction.type] += amount;
      return acc;
    },
    { income: 0, expense: 0, transfer: 0 }
  );
};

export const buildProfitAndLossReport = (
  transactions: Transaction[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): ReportSummary => {
  const aggregated = aggregateTransactions(transactions, baseCurrency, exchangeRate);
  const grossProfit = aggregated.income - aggregated.expense;

  return {
    type: 'profitAndLoss',
    title: 'Profit and Loss Statement',
    generatedAt: new Date().toISOString(),
    currency: baseCurrency,
    figures: {
      income: Number(grossProfit + aggregated.expense),
      expenses: Number(aggregated.expense),
      grossProfit: Number(grossProfit)
    }
  };
};

export const buildCashFlowStatement = (
  transactions: Transaction[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): { report: ReportSummary; segments: CashFlowSegment[] } => {
  const grouped: Record<string, CashFlowSegment> = {};

  transactions.forEach((transaction) => {
    const amount = convertCurrency(
      transaction.amount,
      transaction.currency,
      baseCurrency,
      exchangeRate
    );
    const category = transaction.type === 'income' ? 'Operating Activities' : 'Operating Expenses';
    const key = transaction.categoryId ?? category;

    if (!grouped[key]) {
      grouped[key] = {
        name: key,
        inflow: 0,
        outflow: 0
      };
    }

    if (transaction.type === 'income') {
      grouped[key].inflow += amount;
    } else if (transaction.type === 'expense') {
      grouped[key].outflow += amount;
    }
  });

  const totalInflow = Object.values(grouped).reduce((acc, segment) => acc + segment.inflow, 0);
  const totalOutflow = Object.values(grouped).reduce((acc, segment) => acc + segment.outflow, 0);

  return {
    report: {
      type: 'cashFlow',
      title: 'Cash Flow Statement',
      generatedAt: new Date().toISOString(),
      currency: baseCurrency,
      figures: {
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow
      }
    },
    segments: Object.values(grouped)
  };
};

export const buildBalanceSheet = (
  accounts: Account[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): ReportSummary => {
  const totalAssets = calculateTotalBalance(accounts, baseCurrency, exchangeRate);

  return {
    type: 'balanceSheet',
    title: 'Balance Sheet',
    generatedAt: new Date().toISOString(),
    currency: baseCurrency,
    figures: {
      assets: totalAssets,
      liabilities: totalAssets * 0.35,
      equity: totalAssets * 0.65
    }
  };
};

export const calculateBudgetForecast = (
  budgets: Budget[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): ForecastPoint[] => {
  const points: ForecastPoint[] = [];
  const now = new Date();

  for (let i = 0; i < 6; i += 1) {
    const date = addMonths(now, i);
    const month = format(date, 'yyyy-MM');

    const expectedIncome = budgets
      .filter((budget) => budget.allocatedAmount > budget.spentAmount)
      .reduce((acc, budget) => {
        const remaining = budget.allocatedAmount - budget.spentAmount;
        const amount = convertCurrency(remaining / 6, budget.currency, baseCurrency, exchangeRate);
        return acc + amount;
      }, 0);

    const expectedExpense = budgets.reduce((acc, budget) => {
      const monthly = budget.allocatedAmount / 12;
      const amount = convertCurrency(monthly, budget.currency, baseCurrency, exchangeRate);
      return acc + amount;
    }, 0);

    points.push({ month, expectedIncome, expectedExpense });
  }

  return points;
};

export const summarisePayroll = (
  records: PayrollRecord[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): ReportSummary => {
  const figures = records.reduce(
    (acc, record) => {
      acc.totalGross += convertCurrency(
        record.grossSalary,
        record.currency,
        baseCurrency,
        exchangeRate
      );
      acc.totalNet += convertCurrency(
        record.netSalary,
        record.currency,
        baseCurrency,
        exchangeRate
      );
      const deductions = record.deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
      acc.totalDeductions += convertCurrency(
        deductions,
        record.currency,
        baseCurrency,
        exchangeRate
      );
      return acc;
    },
    { totalGross: 0, totalNet: 0, totalDeductions: 0 }
  );

  return {
    type: 'tax',
    title: 'Payroll and Tax Report',
    generatedAt: new Date().toISOString(),
    currency: baseCurrency,
    figures
  };
};

export const computeCashFlowForecast = (
  accounts: Account[],
  transactions: Transaction[],
  baseCurrency: CurrencyCode,
  exchangeRate?: ExchangeRate | null
): CashFlowForecast[] => {
  const monthlyTotals: Record<string, { inflow: number; outflow: number }> = {};
  transactions.forEach((transaction) => {
    const month = format(parseISO(transaction.date), 'yyyy-MM');
    if (!monthlyTotals[month]) {
      monthlyTotals[month] = { inflow: 0, outflow: 0 };
    }

    const amount = convertCurrency(
      transaction.amount,
      transaction.currency,
      baseCurrency,
      exchangeRate
    );
    if (transaction.type === 'income') {
      monthlyTotals[month].inflow += amount;
    }
    if (transaction.type === 'expense') {
      monthlyTotals[month].outflow += amount;
    }
  });

  const openingBalance = calculateTotalBalance(accounts, baseCurrency, exchangeRate);
  let runningBalance = openingBalance;

  return Object.entries(monthlyTotals)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, totals]) => {
      runningBalance += totals.inflow - totals.outflow;
      return {
        month,
        openingBalance: Number(
          new Decimal(runningBalance).minus(totals.inflow - totals.outflow).toFixed(2)
        ),
        closingBalance: Number(new Decimal(runningBalance).toFixed(2)),
        inflow: Number(new Decimal(totals.inflow).toFixed(2)),
        outflow: Number(new Decimal(totals.outflow).toFixed(2)),
        currency: baseCurrency
      };
    });
};

export const calculateBudgetUsage = (
  budget: Budget,
  transactions: Transaction[],
  exchangeRate?: ExchangeRate | null
): number => {
  const relatedTransactions = transactions.filter(
    (transaction) => transaction.categoryId === budget.categoryId
  );
  const spent = relatedTransactions.reduce((acc, transaction) => {
    const amount = convertCurrency(
      transaction.amount,
      transaction.currency,
      budget.currency,
      exchangeRate
    );
    return acc + amount;
  }, 0);

  const usage = (spent / budget.allocatedAmount) * 100;
  return Math.min(100, Number(new Decimal(usage || 0).toFixed(2)));
};

export const projectFinancialForecast = (
  forecast: ForecastPoint[],
  exchangeRate?: ExchangeRate | null,
  _currency: CurrencyCode = 'UAH'
): FinancialForecast => ({
  timeHorizon: '6m',
  points: forecast,
  assumptions: [
    'Stable expenses at the level of the previous six months',
    exchangeRate ? `Base currency rate: ${exchangeRate.base}` : 'Company base currency used'
  ]
});

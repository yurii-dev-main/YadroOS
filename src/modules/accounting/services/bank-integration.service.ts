import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { ExchangeRate, Transaction } from '../types/accounting.types';

const mockExchangeRates: ExchangeRate = {
  base: 'UAH',
  rates: {
    UAH: 1,
    USD: 0.026,
    EUR: 0.024,
  },
  updatedAt: new Date().toISOString(),
  provider: 'Mock FX Provider',
};

const bankTransactions: Transaction[] = [
  {
    id: uuid(),
    type: 'income',
    amount: 32000,
    currency: 'UAH',
    accountId: 'acc-mono',
    categoryId: 'cat-sales',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: 'Payment from client via Monobank API',
    status: 'completed',
    tags: ['monobank', 'imported'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuid(),
    type: 'expense',
    amount: 15000,
    currency: 'UAH',
    accountId: 'acc-privat',
    categoryId: 'cat-marketing',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: 'Payment for ads via PrivatBank API',
    status: 'completed',
    tags: ['privatbank', 'imported'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const bankIntegrationService = {
  async fetchExchangeRates(): Promise<ExchangeRate> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      ...mockExchangeRates,
      updatedAt: new Date().toISOString(),
    };
  },

  async fetchTransactions(accountId: string): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return bankTransactions.filter((transaction) => transaction.accountId === accountId);
  },

  async importFromCsv(_file: File): Promise<Transaction[]> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return bankTransactions.map((transaction) => ({
      ...transaction,
      id: uuid(),
      description: `${transaction.description} (CSV)`,
    }));
  },
};

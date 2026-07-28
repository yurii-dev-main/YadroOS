export interface BankTransaction {
  id: string;
  amount: number; // Positive for income, negative for expense (or always positive based on type)
  description: string;
  time: number; // Unix timestamp in ms
  type: 'income' | 'expense';
}

export interface IBankingAdapter {
  fetchTransactions(accountId: string, fromDate: Date, toDate: Date): Promise<BankTransaction[]>;
}

export class MonobankAdapter implements IBankingAdapter {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async fetchTransactions(
    accountId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<BankTransaction[]> {
    // Real implementation would look like this:
    /*
    const response = await fetch(`https://api.monobank.ua/personal/statement/${accountId}/${Math.floor(fromDate.getTime() / 1000)}/${Math.floor(toDate.getTime() / 1000)}`, {
      headers: { 'X-Token': this.token }
    });
    if (!response.ok) throw new Error('Bank API Error');
    const data = await response.json();
    return data.map((tx: any) => ({
      id: tx.id,
      amount: Math.abs(tx.amount) / 100, // Monobank returns amount in kopecks
      description: tx.description,
      time: tx.time * 1000,
      type: tx.amount > 0 ? 'income' : 'expense'
    }));
    */

    // Returning realistic mock data structure for demo purposes
    return [
      {
        id: `mono-${Date.now()}-1`,
        amount: 12.5,
        description: 'Coffee Shop',
        time: Date.now() - 86400000,
        type: 'expense'
      },
      {
        id: `mono-${Date.now()}-2`,
        amount: 1500.0,
        description: 'Client Payment',
        time: Date.now() - 86400000 * 2,
        type: 'income'
      },
      {
        id: `mono-${Date.now()}-3`,
        amount: 99.99,
        description: 'Software Subscription',
        time: Date.now() - 86400000 * 3,
        type: 'expense'
      }
    ];
  }
}

export const bankingService = {
  getAdapter(provider: string, credentials: any): IBankingAdapter {
    if (provider === 'monobank') {
      return new MonobankAdapter(credentials.token);
    }
    // Fallback to a mock adapter if provider is unknown
    return new MonobankAdapter('dummy-token');
  }
};

import { useEffect, useState } from 'react';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionTable } from '../components/TransactionTable';
import { RecurringTransactionsPanel } from '../components/RecurringTransactionsPanel';
import { useAccounting } from '../hooks/useAccounting';
import { accountingService } from '../services/accounting.service';
import { RecurringTransactionInsight, Transaction } from '../types/accounting.types';

export const TransactionsPage = () => {
  const {
    accounts,
    transactions,
    categories,
    addTransaction,
    filters,
    setFilters,
    searchTransactions,
  } = useAccounting();
  const [filtered, setFiltered] = useState<Transaction[]>(transactions);
  const [recurring, setRecurring] = useState<RecurringTransactionInsight[]>([]);

  useEffect(() => {
    setFiltered(transactions);
  }, [transactions]);

  useEffect(() => {
    accountingService.getRecurringInsights().then(setRecurring);
  }, []);

  const handleSearch = async () => {
    const results = await searchTransactions();
    setFiltered(results);
  };

  return (
    <div className="space-y-6">
      <TransactionFilters
        filters={filters}
        categories={categories}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <TransactionTable transactions={filtered} accounts={accounts} categories={categories} />
          <RecurringTransactionsPanel insights={recurring} />
        </div>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          onSubmit={async (payload) => {
            await addTransaction(payload);
            await handleSearch();
          }}
        />
      </div>
    </div>
  );
};

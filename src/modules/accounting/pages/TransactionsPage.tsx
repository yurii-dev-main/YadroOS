import { useEffect, useState } from 'react';
import { TransactionFilters } from '../components/TransactionFilters';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionTable } from '../components/TransactionTable';
import { RecurringTransactionsPanel } from '../components/RecurringTransactionsPanel';
import { ImportModal } from '../components/ImportModal';
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
    searchTransactions
  } = useAccounting();
  const [filtered, setFiltered] = useState<Transaction[]>(transactions);
  const [recurring, setRecurring] = useState<RecurringTransactionInsight[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

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
      <div className="flex items-center justify-between">
        <TransactionFilters
          filters={filters}
          categories={categories}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
        />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:bg-slate-700"
          >
            Import CSV/Excel
          </button>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/80"
          >
            + New Transaction
          </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <TransactionTable transactions={filtered} accounts={accounts} categories={categories} />
        <RecurringTransactionsPanel insights={recurring} />
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl shadow-black/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">New Transaction</h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
              >
                Close
              </button>
            </div>
            <TransactionForm
              accounts={accounts}
              categories={categories}
              onSubmit={async (payload) => {
                await addTransaction(payload);
                await handleSearch();
                setIsFormOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {isImportOpen && (
        <ImportModal
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => {
            setIsImportOpen(false);
            handleSearch();
          }}
        />
      )}
    </div>
  );
};

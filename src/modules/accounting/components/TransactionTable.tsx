import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Account, Transaction, TransactionCategory } from '../types/accounting.types';

interface TransactionTableProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: TransactionCategory[];
}

const statusColor: Record<Transaction['status'], string> = {
  pending: 'text-amber-300',
  completed: 'text-emerald-300',
  cancelled: 'text-rose-300'
};

type SortField = 'date' | 'description' | 'account' | 'category' | 'amount' | 'status';

export const TransactionTable = ({ transactions, accounts, categories }: TransactionTableProps) => {
  const accountMap = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);
  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'description':
          comparison = (a.description ?? '').localeCompare(b.description ?? '');
          break;
        case 'account': {
          const accA = accountMap.get(a.accountId)?.name ?? '';
          const accB = accountMap.get(b.accountId)?.name ?? '';
          comparison = accA.localeCompare(accB);
          break;
        }
        case 'category': {
          const catA = (a.categoryId ? categoryMap.get(a.categoryId)?.name : '') ?? '';
          const catB = (b.categoryId ? categoryMap.get(b.categoryId)?.name : '') ?? '';
          comparison = catA.localeCompare(catB);
          break;
        }
        case 'amount': {
          const valA = a.type === 'expense' ? -a.amount : a.amount;
          const valB = b.type === 'expense' ? -b.amount : b.amount;
          comparison = valA - valB;
          break;
        }
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [transactions, sortField, sortDir, accountMap, categoryMap]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const Th = ({ field, label, align = 'left' }: { field: SortField; label: string; align?: 'left' | 'right' }) => (
    <th 
      className={`px-4 py-3 cursor-pointer select-none hover:text-white transition ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label} <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <Th field="date" label="Date" />
            <Th field="description" label="Description" />
            <Th field="account" label="Account" />
            <Th field="category" label="Category" />
            <Th field="amount" label="Amount" align="right" />
            <Th field="status" label="Status" align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {sortedTransactions.map((transaction) => {
            const account = accountMap.get(transaction.accountId);
            const category = transaction.categoryId
              ? categoryMap.get(transaction.categoryId)
              : undefined;
            const amountClass =
              transaction.type === 'income'
                ? 'text-emerald-300'
                : transaction.type === 'expense'
                  ? 'text-rose-300'
                  : 'text-slate-100';
            return (
              <tr key={transaction.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {format(new Date(transaction.date), 'dd.MM.yyyy')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-100">
                      {transaction.description ?? '—'}
                    </span>
                    {transaction.tags && transaction.tags.length > 0 && (
                      <span className="text-xs text-slate-500">{transaction.tags.join(', ')}</span>
                    )}
                    {transaction.recurring && (
                      <span className="text-[10px] uppercase text-amber-400">
                        Repeats: {transaction.recurring.frequency}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span>{account?.name ?? '—'}</span>
                    {transaction.toAccountId && (
                      <span className="text-xs text-slate-500">
                        → {accountMap.get(transaction.toAccountId)?.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{category?.name ?? '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${amountClass}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {transaction.amount.toLocaleString('uk-UA', {
                    style: 'currency',
                    currency: transaction.currency
                  })}
                </td>
                <td className="px-4 py-3 text-right text-xs uppercase tracking-wide">
                  <span className={statusColor[transaction.status]}>{transaction.status}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!transactions.length && (
        <p className="p-4 text-center text-xs text-slate-500">
          No transactions found for the selected filters.
        </p>
      )}
    </div>
  );
};

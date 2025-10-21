import { format } from 'date-fns';
import { Account, Transaction, TransactionCategory } from '../types/accounting.types';

interface TransactionTableProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: TransactionCategory[];
}

const statusColor: Record<Transaction['status'], string> = {
  pending: 'text-amber-300',
  completed: 'text-emerald-300',
  cancelled: 'text-rose-300',
};

export const TransactionTable = ({ transactions, accounts, categories }: TransactionTableProps) => {
  const accountMap = new Map(accounts.map((account) => [account.id, account]));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">Дата</th>
            <th className="px-4 py-3 text-left">Опис</th>
            <th className="px-4 py-3 text-left">Рахунок</th>
            <th className="px-4 py-3 text-left">Категорія</th>
            <th className="px-4 py-3 text-right">Сума</th>
            <th className="px-4 py-3 text-right">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {transactions.map((transaction) => {
            const account = accountMap.get(transaction.accountId);
            const category = transaction.categoryId ? categoryMap.get(transaction.categoryId) : undefined;
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
                    <span className="font-medium text-slate-100">{transaction.description ?? '—'}</span>
                    {transaction.tags && transaction.tags.length > 0 && (
                      <span className="text-xs text-slate-500">{transaction.tags.join(', ')}</span>
                    )}
                    {transaction.recurring && (
                      <span className="text-[10px] uppercase text-amber-400">Повторюється {transaction.recurring.frequency}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span>{account?.name ?? '—'}</span>
                    {transaction.toAccountId && (
                      <span className="text-xs text-slate-500">→ {accountMap.get(transaction.toAccountId)?.name}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">{category?.name ?? '—'}</td>
                <td className={`px-4 py-3 text-right font-semibold ${amountClass}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {transaction.amount.toLocaleString('uk-UA', { style: 'currency', currency: transaction.currency })}
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
        <p className="p-4 text-center text-xs text-slate-500">Транзакції відсутні за обраними фільтрами.</p>
      )}
    </div>
  );
};

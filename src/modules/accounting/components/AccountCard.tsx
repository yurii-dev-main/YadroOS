import { format } from 'date-fns';
import { Account } from '../types/accounting.types';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface AccountCardProps {
  account: Account;
  onReconcile?: (accountId: string) => void;
}

export const AccountCard = ({ account, onReconcile }: AccountCardProps) => {
  return (
    <Card className="border border-slate-800 bg-slate-900/60 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold text-slate-50">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: account.color ?? '#4f46e5' }} />
            {account.name}
          </span>
        </CardTitle>
        <span className="text-xs uppercase tracking-wide text-slate-400">{account.type}</span>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-300">
        <div className="flex items-baseline justify-between">
          <span className="text-slate-400">Баланс</span>
          <span className="text-2xl font-semibold text-emerald-400">
            {account.balance.toLocaleString('uk-UA', { style: 'currency', currency: account.currency })}
          </span>
        </div>
        {account.bankName && (
          <div className="flex justify-between text-xs text-slate-400">
            <span>Банк</span>
            <span>{account.bankName}</span>
          </div>
        )}
        {account.accountNumber && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>Рахунок</span>
            <span>{account.accountNumber}</span>
          </div>
        )}
        {account.iban && (
          <div className="flex justify-between text-xs text-slate-500">
            <span>IBAN</span>
            <span>{account.iban}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Синхронізація</span>
          <span>{account.syncedAt ? format(new Date(account.syncedAt), 'dd.MM.yyyy HH:mm') : '—'}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Статус</span>
          <span
            className={`rounded-full px-2 py-1 text-[11px] uppercase tracking-wide ${
              account.reconciliationStatus === 'clean'
                ? 'bg-emerald-500/10 text-emerald-300'
                : account.reconciliationStatus === 'pending'
                  ? 'bg-amber-500/10 text-amber-300'
                  : 'bg-rose-500/10 text-rose-300'
            }`}
          >
            {account.reconciliationStatus}
          </span>
        </div>
        {onReconcile && (
          <button
            type="button"
            onClick={() => onReconcile(account.id)}
            className="w-full rounded-md border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-700"
          >
            Звірити з банком
          </button>
        )}
      </CardContent>
    </Card>
  );
};

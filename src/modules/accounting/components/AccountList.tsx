import { useMemo } from 'react';
import { Account, CurrencyCode, ExchangeRate } from '../types/accounting.types';
import { AccountCard } from './AccountCard';
import { calculateTotalBalance } from '../utils/calculations.utils';

interface AccountListProps {
  accounts: Account[];
  exchangeRate: ExchangeRate | null;
  baseCurrency: CurrencyCode;
  onReconcile?: (accountId: string) => void;
  onSync?: (accountId: string) => void;
  syncingAccountId?: string | null;
}

export const AccountList = ({
  accounts,
  exchangeRate,
  baseCurrency,
  onReconcile,
  onSync,
  syncingAccountId
}: AccountListProps) => {
  const total = useMemo(
    () => calculateTotalBalance(accounts, baseCurrency, exchangeRate),
    [accounts, baseCurrency, exchangeRate]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Accounts</h3>
        <div className="text-sm text-slate-400">
          Total Balance:{' '}
          <span className="font-semibold text-secondary">
            {total.toLocaleString('uk-UA', { style: 'currency', currency: baseCurrency })}
          </span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onReconcile={onReconcile}
            onSync={onSync}
            isSyncing={syncingAccountId === account.id}
          />
        ))}
      </div>
    </div>
  );
};

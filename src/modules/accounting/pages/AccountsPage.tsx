import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AccountForm } from '../components/AccountForm';
import { AccountList } from '../components/AccountList';
import { ExchangeRateWidget } from '../components/ExchangeRateWidget';
import { ReconciliationPanel } from '../components/ReconciliationPanel';
import { useAccounting } from '../hooks/useAccounting';
import { CurrencyCode } from '../types/accounting.types';
import { accountingService } from '../services/accounting.service';

export const AccountsPage = () => {
  const {
    accounts,
    exchangeRate,
    addAccount,
    refreshExchangeRates,
    transfer,
    importTransactions,
    loading
  } = useAccounting();
  const [transferAmount, setTransferAmount] = useState(0);
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [currency, setCurrency] = useState<CurrencyCode>('UAH');
  const [description, setDescription] = useState('');
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);

  const handleSync = async (accountId: string) => {
    setSyncingAccountId(accountId);
    try {
      await accountingService.syncBank(accountId);
      // Wait for 1 second just to simulate the sync
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !transferAmount) return;
    await transfer({
      fromAccountId: fromAccount,
      toAccountId: toAccount,
      amount: transferAmount,
      currency,
      description
    });
    setTransferAmount(0);
    setDescription('');
  };

  const handleImport = async (accountId: string) => {
    await importTransactions(accountId);
  };

  const baseCurrency = exchangeRate?.base ?? 'UAH';

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <AccountList
            accounts={accounts}
            exchangeRate={exchangeRate}
            baseCurrency={baseCurrency}
            onReconcile={(accountId) => handleImport(accountId)}
            onSync={handleSync}
            syncingAccountId={syncingAccountId}
          />
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
            <h3 className="text-base font-semibold text-slate-100">Transfer between accounts</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="grid gap-2">
                <span className="text-xs text-slate-500">From account</span>
                <select
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={fromAccount}
                  onChange={(event) => {
                    setFromAccount(event.target.value);
                    const account = accounts.find((item) => item.id === event.target.value);
                    if (account) setCurrency(account.currency);
                  }}
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <span className="text-xs text-slate-500">To account</span>
                <select
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={toAccount}
                  onChange={(event) => setToAccount(event.target.value)}
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((account) => account.id !== fromAccount)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="grid gap-2">
                <span className="text-xs text-slate-500">Amount</span>
                <Input
                  type="number"
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(Number(event.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <span className="text-xs text-slate-500">Currency</span>
                <select
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
                >
                  <option value="UAH">UAH</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
              <div className="grid gap-2">
                <span className="text-xs text-slate-500">Description</span>
                <Input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleTransfer} disabled={loading}>
                Execute transfer
              </Button>
              {fromAccount && (
                <Button variant="ghost" size="sm" onClick={() => handleImport(fromAccount)}>
                  Import from bank
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <AccountForm
            onSubmit={async (payload) => {
              await addAccount(payload);
            }}
          />
          <ExchangeRateWidget
            exchangeRate={exchangeRate}
            onRefresh={() => refreshExchangeRates()}
          />
          <ReconciliationPanel accounts={accounts} />
        </div>
      </div>
    </div>
  );
};

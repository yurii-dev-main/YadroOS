import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Account } from '../types/accounting.types';

interface ReconciliationPanelProps {
  accounts: Account[];
}

export const ReconciliationPanel = ({ accounts }: ReconciliationPanelProps) => {
  const pending = accounts.filter((account) => account.reconciliationStatus !== 'clean');
  return (
    <Card className="border border-slate-800 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">Account Reconciliation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-300">
        {pending.length ? (
          pending.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2"
            >
              <div>
                <p className="font-medium text-slate-100">{account.name}</p>
                <p className="text-xs text-slate-500">
                  Current balance:{' '}
                  {account.balance.toLocaleString('uk-UA', {
                    style: 'currency',
                    currency: account.currency
                  })}
                </p>
              </div>
              <span className="text-xs uppercase tracking-wide text-amber-300">Pending</span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">
            All accounts are reconciled with bank statements.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

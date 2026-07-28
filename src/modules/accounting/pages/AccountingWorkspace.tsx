import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { AccountsPage } from './AccountsPage';
import { TransactionsPage } from './TransactionsPage';
import { InvoicesPage } from './InvoicesPage';
import { PayrollPage } from './PayrollPage';
import { ReportsPage } from './ReportsPage';
import { BudgetsPage } from './BudgetsPage';
import { DataSourceBadge, DataSourceType } from '../../../components/ui/DataSourceBadge';

const sections = [
  { id: 'accounts', label: 'Accounts', component: AccountsPage },
  { id: 'transactions', label: 'Transactions', component: TransactionsPage },
  { id: 'invoices', label: 'Invoices', component: InvoicesPage },
  { id: 'payroll', label: 'Payroll', component: PayrollPage },
  { id: 'reports', label: 'Reports', component: ReportsPage },
  { id: 'budgets', label: 'Budgets', component: BudgetsPage }
];

export const AccountingWorkspace = () => {
  const [active, setActive] = useState(sections[0].id);
  const [source, setSource] = useState<DataSourceType>('mock');
  const ActiveComponent =
    sections.find((section) => section.id === active)?.component ?? AccountsPage;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/50 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={section.id === active ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActive(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <DataSourceBadge source={source} onSourceChange={setSource} />
        </div>
      </div>
      <div className="space-y-6">
        <ActiveComponent />
      </div>
    </div>
  );
};

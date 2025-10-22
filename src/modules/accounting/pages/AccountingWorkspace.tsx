import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { AccountsPage } from './AccountsPage';
import { TransactionsPage } from './TransactionsPage';
import { InvoicesPage } from './InvoicesPage';
import { PayrollPage } from './PayrollPage';
import { ReportsPage } from './ReportsPage';
import { BudgetsPage } from './BudgetsPage';

const sections = [
  { id: 'accounts', label: 'Рахунки', component: AccountsPage },
  { id: 'transactions', label: 'Транзакції', component: TransactionsPage },
  { id: 'invoices', label: 'Інвойси', component: InvoicesPage },
  { id: 'payroll', label: 'Зарплати', component: PayrollPage },
  { id: 'reports', label: 'Звіти', component: ReportsPage },
  { id: 'budgets', label: 'Бюджети', component: BudgetsPage },
];

export const AccountingWorkspace = () => {
  const [active, setActive] = useState(sections[0].id);
  const ActiveComponent = sections.find((section) => section.id === active)?.component ?? AccountsPage;

  return (
    <div className="space-y-6">
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
      <div className="space-y-6">
        <ActiveComponent />
      </div>
    </div>
  );
};

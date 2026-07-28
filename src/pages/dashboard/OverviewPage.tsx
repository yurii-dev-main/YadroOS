import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../store/authStore';
import { useAccounting } from '../../modules/accounting/hooks/useAccounting';
import { useClients } from '../../modules/crm/hooks/useClients';
import { useEmployees } from '../../modules/hr/hooks/useEmployees';
import { formatCurrency } from '../../modules/crm/utils/crm.utils';
import { useTranslation } from '../../i18n/useTranslation';

export const OverviewPage = () => {
  const user = useAuthStore((state) => state.user);
  const { dashboard, cashFlowForecast, transactions } = useAccounting();
  const { clients } = useClients();
  const { employees } = useEmployees();
  const { t } = useTranslation();

  const stats = [
    { label: t('overview.totalBalance', 'Total Balance'), value: dashboard ? formatCurrency(dashboard.totalBalance) : '0', delta: t('overview.allAccounts', 'All Accounts') },
    { label: t('overview.totalIncome', 'Total Income'), value: dashboard ? formatCurrency(dashboard.totalIncome) : '0', delta: t('overview.thisMonth', 'This Month') },
    { label: t('overview.totalExpense', 'Total Expense'), value: dashboard ? formatCurrency(dashboard.totalExpense) : '0', delta: t('overview.thisMonth', 'This Month') },
    { label: t('overview.activeClients', 'Active Clients'), value: clients.filter(c => c.status === 'active').length.toString(), delta: t('overview.outOfTotal', `Out of ${clients.length} total`) },
    { label: t('overview.activeEmployees', 'Active Employees'), value: employees.filter(e => e.status === 'active').length.toString(), delta: t('overview.companySize', 'Company Size') }
  ];

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">
          {t('module.overview.title').replace('{name}', user?.name || '')}
        </h1>
        <p className="text-sm text-slate-400">
          {t('module.overview.subtitle')}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle>{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold text-slate-50">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.delta}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Cash Flow Forecast</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: 12, border: '1px solid rgba(148,163,184,0.3)' }}
                />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <Area type="monotone" dataKey="outflow" stackId="2" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`font-medium ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
              {!recentTransactions.length && <p className="text-sm text-slate-500">No recent transactions.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

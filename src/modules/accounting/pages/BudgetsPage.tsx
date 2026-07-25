import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { BudgetManager } from '../components/BudgetManager';
import { useAccounting } from '../hooks/useAccounting';

export const BudgetsPage = () => {
  const { budgets, loadBudgets, updateBudget } = useAccounting();
  const [usage, setUsage] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBudgets().catch(() => undefined);
  }, [loadBudgets]);

  useEffect(() => {
    const map: Record<string, number> = {};
    budgets.forEach((budget) => {
      if (budget.allocatedAmount) {
        map[budget.id] = Number(((budget.spentAmount / budget.allocatedAmount) * 100).toFixed(2));
      }
    });
    setUsage(map);
  }, [budgets]);

  return (
    <div className="space-y-6">
      <BudgetManager budgets={budgets} onUpdate={updateBudget} />
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Budget Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          {budgets.map((budget) => (
            <div
              key={budget.id}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 p-3"
            >
              <span>{budget.name}</span>
              <span className={usage[budget.id] > 90 ? 'text-rose-300' : 'text-emerald-300'}>
                {usage[budget.id] ?? 0}%
              </span>
            </div>
          ))}
          {!budgets.length && <p className="text-xs text-slate-500">No data to display.</p>}
        </CardContent>
      </Card>
    </div>
  );
};

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Budget } from '../types/accounting.types';

interface BudgetManagerProps {
  budgets: Budget[];
  onUpdate: (budgetId: string, changes: Partial<Budget>) => void;
}

export const BudgetManager = ({ budgets, onUpdate }: BudgetManagerProps) => {
  const [editing, setEditing] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  const startEdit = (budget: Budget) => {
    setEditing(budget.id);
    setAmount(budget.allocatedAmount);
  };

  const save = () => {
    if (!editing) return;
    onUpdate(editing, { allocatedAmount: amount });
    setEditing(null);
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
      <h3 className="text-base font-semibold text-slate-100">Бюджети</h3>
      {budgets.map((budget) => {
        const usage = (budget.spentAmount / budget.allocatedAmount) * 100;
        return (
          <div key={budget.id} className="rounded-md border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{budget.name}</p>
                <p className="text-xs text-slate-500">Період: {budget.period}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>Виділено: {budget.allocatedAmount.toLocaleString('uk-UA', { style: 'currency', currency: budget.currency })}</p>
                <p>Витрачено: {budget.spentAmount.toLocaleString('uk-UA', { style: 'currency', currency: budget.currency })}</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.min(100, usage)}%` }} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {editing === budget.id ? (
                <>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    className="w-32"
                  />
                  <Button variant="secondary" size="sm" onClick={save}>
                    Зберегти
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                    Скасувати
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => startEdit(budget)}>
                  Редагувати бюджет
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {!budgets.length && <p className="text-xs text-slate-500">Немає активних бюджетів.</p>}
    </div>
  );
};

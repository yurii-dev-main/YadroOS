/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Budget } from '../types/accounting.types';

interface BudgetManagerProps {
  budgets: Budget[];
  onUpdate: (budgetId: string, changes: Partial<Budget>) => void;
  onCreate: (name: string, amount: number) => Promise<void>;
}

export const BudgetManager = ({ budgets, onUpdate, onCreate }: BudgetManagerProps) => {
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

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(0);

  const handleCreate = () => {
    // We mock the creation here by calling onUpdate with a fake id or extending the hook to support onCreate.
    // Wait, the hook doesn't have onCreate. Let's check useAccounting.
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold text-slate-100">Budgets</h3>
        <Button variant="secondary" size="sm" onClick={() => setIsCreating(true)}>Add Budget</Button>
      </div>
      
      {isCreating && (
        <div className="rounded-md border border-slate-800 bg-slate-900/80 p-3 mb-4 space-y-3">
            <h4 className="font-semibold text-slate-200">New Budget</h4>
            <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Budget Name (e.g. Marketing Q3)" value={newName} onChange={e => setNewName(e.target.value)} />
                <Input type="number" placeholder="Allocated Amount" value={newAmount} onChange={e => setNewAmount(Number(e.target.value))} />
            </div>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={async () => {
                    await onCreate(newName, newAmount);
                    setIsCreating(false);
                    setNewName('');
                    setNewAmount(0);
                }}>Create</Button>
                <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
        </div>
      )}
      {budgets.map((budget) => {
        const usage = (budget.spentAmount / budget.allocatedAmount) * 100;
        return (
          <div key={budget.id} className="rounded-md border border-slate-800 bg-slate-900/80 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-100">{budget.name}</p>
                <p className="text-xs text-slate-500">Period: {budget.period}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>
                  Allocated:{' '}
                  {budget.allocatedAmount.toLocaleString('uk-UA', {
                    style: 'currency',
                    currency: budget.currency
                  })}
                </p>
                <p>
                  Spent:{' '}
                  {budget.spentAmount.toLocaleString('uk-UA', {
                    style: 'currency',
                    currency: budget.currency
                  })}
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-secondary"
                style={{ width: `${Math.min(100, usage)}%` }}
              />
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
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => startEdit(budget)}>
                  Edit budget
                </Button>
              )}
            </div>
          </div>
        );
      })}
      {!budgets.length && <p className="text-xs text-slate-500">No active budgets.</p>}
    </div>
  );
};

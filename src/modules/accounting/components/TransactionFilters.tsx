import { ChangeEvent } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  AccountingFilterState,
  TransactionCategory,
  TransactionType
} from '../types/accounting.types';

interface TransactionFiltersProps {
  filters: AccountingFilterState;
  categories: TransactionCategory[];
  onFiltersChange: (filters: Partial<AccountingFilterState>) => void;
  onSearch?: () => void;
}

const typeLabels: Record<TransactionType, string> = {
  income: 'Income',
  expense: 'Expense',
  transfer: 'Transfer'
};

export const TransactionFilters = ({
  filters,
  categories,
  onFiltersChange,
  onSearch
}: TransactionFiltersProps) => {
  const toggleType = (type: TransactionType) => {
    const current = new Set(filters.types);
    if (current.has(type)) {
      current.delete(type);
    } else {
      current.add(type);
    }
    onFiltersChange({ types: Array.from(current) });
  };

  const handleDateChange = (key: 'from' | 'to') => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const next = { ...filters.dateRange, [key]: value };
    onFiltersChange({
      dateRange: next.from || next.to ? (next as { from: string; to: string }) : undefined
    });
  };

  return (
    <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
      <div className="flex flex-wrap items-center gap-3">
        {(Object.keys(typeLabels) as TransactionType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => toggleType(type)}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide transition ${
              filters.types.includes(type)
                ? 'bg-secondary/80 text-slate-950'
                : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {typeLabels[type]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="grid gap-2">
          <span className="text-xs text-slate-500">From</span>
          <Input
            type="date"
            value={filters.dateRange?.from ?? ''}
            onChange={handleDateChange('from')}
          />
        </div>
        <div className="grid gap-2">
          <span className="text-xs text-slate-500">To</span>
          <Input
            type="date"
            value={filters.dateRange?.to ?? ''}
            onChange={handleDateChange('to')}
          />
        </div>
        <div className="grid gap-2">
          <span className="text-xs text-slate-500">Category</span>
          <select
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            value={filters.categories[0] ?? ''}
            onChange={(event) =>
              onFiltersChange({ categories: event.target.value ? [event.target.value] : [] })
            }
          >
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search by description or tags"
            value={filters.tags[0] ?? ''}
            onChange={(event) =>
              onFiltersChange({ tags: event.target.value ? [event.target.value] : [] })
            }
          />
        </div>
        {onSearch && (
          <Button variant="secondary" onClick={onSearch}>
            Apply
          </Button>
        )}
      </div>
    </div>
  );
};

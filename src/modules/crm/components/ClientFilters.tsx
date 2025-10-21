import { ChangeEvent } from 'react';

import { CRMClientFilters } from '../types/crm.types';

interface ClientFiltersProps {
  filters: CRMClientFilters;
  managers: string[];
  industries: string[];
  onChange: (filters: CRMClientFilters) => void;
  onReset: () => void;
}

export const ClientFilters = ({ filters, managers, industries, onChange, onReset }: ClientFiltersProps) => {
  const handleSelect = (key: keyof CRMClientFilters) => (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...filters,
      [key]: event.target.value === 'all' ? 'all' : event.target.value
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-700/40 bg-slate-900/40 p-4 shadow-inner shadow-black/20">
      <div className="flex flex-col">
        <label className="text-xs uppercase tracking-wide text-slate-400">Статус</label>
        <select
          value={filters.status ?? 'all'}
          onChange={handleSelect('status')}
          className="mt-1 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Всі</option>
          <option value="lead">Ліди</option>
          <option value="active">Активні</option>
          <option value="inactive">Неактивні</option>
          <option value="lost">Втрачено</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs uppercase tracking-wide text-slate-400">Індустрія</label>
        <select
          value={filters.industry ?? 'all'}
          onChange={handleSelect('industry')}
          className="mt-1 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Всі</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs uppercase tracking-wide text-slate-400">Менеджер</label>
        <select
          value={filters.assignedTo ?? 'all'}
          onChange={handleSelect('assignedTo')}
          className="mt-1 rounded-lg border border-slate-700/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">Всі</option>
          {managers.map((manager) => (
            <option key={manager} value={manager}>
              {manager}
            </option>
          ))}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-600/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/80"
        >
          Скинути
        </button>
      </div>
    </div>
  );
};

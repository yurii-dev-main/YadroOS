import { ChangeEvent, FC } from 'react';
import { EmployeeFilterState } from '../hooks/useEmployees';

interface EmployeeFiltersProps {
  filters: EmployeeFilterState;
  departments: string[];
  positions: string[];
  onChange: (filters: EmployeeFilterState) => void;
  onReset: () => void;
}

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'On leave', value: 'on_leave' },
  { label: 'Terminated', value: 'terminated' }
];

export const EmployeeFilters: FC<EmployeeFiltersProps> = ({
  filters,
  departments,
  positions,
  onChange,
  onReset
}) => {
  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value || undefined });
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    onChange({ ...filters, search: value || undefined });
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">Search</label>
        <input
          type="search"
          placeholder="Name or email"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          value={filters.search ?? ''}
          onChange={handleSearch}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">Department</label>
        <select
          name="department"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          value={filters.department ?? ''}
          onChange={handleSelect}
        >
          <option value="">All departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">Position</label>
        <select
          name="position"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          value={filters.position ?? ''}
          onChange={handleSelect}
        >
          <option value="">All positions</option>
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs uppercase tracking-wide text-slate-400">Status</label>
        <select
          name="status"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          value={filters.status ?? ''}
          onChange={handleSelect}
        >
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2 lg:col-span-4">
        <button
          type="button"
          className="rounded-md border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/10"
          onClick={onReset}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
};

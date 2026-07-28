/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { PayrollDashboard } from '../components/PayrollDashboard';
import { PayrollTable } from '../components/PayrollTable';
import { usePayroll } from '../hooks/usePayroll';

export const PayrollPage = () => {
  const { records, runPayroll, markPaid, generatePayslip, loading } = usePayroll();
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));
  const [includeBonuses, setIncludeBonuses] = useState(true);
  const [includeOvertime, setIncludeOvertime] = useState(false);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'net' | 'gross'>('name');

  const filteredRecords = useMemo(() => {
    let result = [...records];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.employeeName.toLowerCase().includes(q) || r.employeeId.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.employeeName.localeCompare(b.employeeName);
      if (sortBy === 'net') return b.netSalary - a.netSalary;
      if (sortBy === 'gross') return b.grossSalary - a.grossSalary;
      return 0;
    });
    return result;
  }, [records, search, sortBy]);

  const handleRun = async () => {
    await runPayroll({ period, includeBonuses, includeOvertime, approveImmediately: true });
  };

  const handleMarkPaid = async () => {
    await markPaid({
      payrollRecordIds: records
        .filter((record) => record.status !== 'paid')
        .map((record) => record.id),
      accountId: 'acc-mono',
      executedBy: 'finance-admin'
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
        <h3 className="text-base font-semibold text-slate-100">Run Calculation</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <span className="text-xs text-slate-500">Period</span>
            <Input
              type="month"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={includeBonuses}
              onChange={(event) => setIncludeBonuses(event.target.checked)}
              className="h-4 w-4 rounded border border-slate-600 bg-slate-900"
            />
            Include AI bonuses
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={includeOvertime}
              onChange={(event) => setIncludeOvertime(event.target.checked)}
              className="h-4 w-4 rounded border border-slate-600 bg-slate-900"
            />
            Overtime pay
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={handleRun} disabled={loading}>
              Calculate
            </Button>
            <Button variant="outline" size="sm" onClick={handleMarkPaid}>
              Mark as paid
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        >
          <option value="name">Sort by Name</option>
          <option value="net">Sort by Net Salary (High to Low)</option>
          <option value="gross">Sort by Gross Salary (High to Low)</option>
        </select>
      </div>

      <PayrollDashboard records={filteredRecords} />
      <PayrollTable
        records={filteredRecords}
        onGeneratePayslip={(recordId) => generatePayslip(recordId)}
      />
    </div>
  );
};

import { useState } from 'react';
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

  const handleRun = async () => {
    await runPayroll({ period, includeBonuses, includeOvertime, approveImmediately: true });
  };

  const handleMarkPaid = async () => {
    await markPaid({
      payrollRecordIds: records.filter((record) => record.status !== 'paid').map((record) => record.id),
      accountId: 'acc-mono',
      executedBy: 'finance-admin',
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
        <h3 className="text-base font-semibold text-slate-100">Run Calculation</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <span className="text-xs text-slate-500">Period</span>
            <Input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
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
      <PayrollDashboard records={records} />
      <PayrollTable records={records} onGeneratePayslip={(recordId) => generatePayslip(recordId)} />
    </div>
  );
};

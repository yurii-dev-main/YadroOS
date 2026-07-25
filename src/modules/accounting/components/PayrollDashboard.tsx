import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { PayrollRecord } from '../types/accounting.types';

interface PayrollDashboardProps {
  records: PayrollRecord[];
}

export const PayrollDashboard = ({ records }: PayrollDashboardProps) => {
  const totalNet = records.reduce((acc, record) => acc + record.netSalary, 0);
  const totalDeductions = records.reduce(
    (acc, record) => acc + record.deductions.reduce((sum, deduction) => sum + deduction.amount, 0),
    0
  );
  const totalBonuses = records.reduce(
    (acc, record) => acc + record.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0),
    0
  );
  const currency = records[0]?.currency ?? 'UAH';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Net Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-emerald-300">
            {totalNet.toLocaleString('uk-UA', { style: 'currency', currency })}
          </p>
          <p className="text-xs text-slate-500">Payouts for the current period</p>
        </CardContent>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Deductions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-rose-300">
            {totalDeductions.toLocaleString('uk-UA', { style: 'currency', currency })}
          </p>
          <p className="text-xs text-slate-500">Taxes, social security, pension contributions</p>
        </CardContent>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Bonuses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-secondary">
            {totalBonuses.toLocaleString('uk-UA', { style: 'currency', currency })}
          </p>
          <p className="text-xs text-slate-500">AI motivation calculation</p>
        </CardContent>
      </Card>
    </div>
  );
};

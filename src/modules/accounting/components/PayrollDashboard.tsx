import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { PayrollRecord } from '../types/accounting.types';

interface PayrollDashboardProps {
  records: PayrollRecord[];
}

export const PayrollDashboard = ({ records }: PayrollDashboardProps) => {
  const totalNet = records.reduce((acc, record) => acc + record.netSalary, 0);
  const totalDeductions = records.reduce(
    (acc, record) => acc + record.deductions.reduce((sum, deduction) => sum + deduction.amount, 0),
    0,
  );
  const totalBonuses = records.reduce(
    (acc, record) => acc + record.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0),
    0,
  );
  const currency = records[0]?.currency ?? 'UAH';

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Нетто виплати</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-emerald-300">
            {totalNet.toLocaleString('uk-UA', { style: 'currency', currency })}
          </p>
          <p className="text-xs text-slate-500">Виплати за поточний період</p>
        </CardContent>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Відрахування</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-rose-300">
            {totalDeductions.toLocaleString('uk-UA', { style: 'currency', currency })}
          </p>
          <p className="text-xs text-slate-500">Податки, ЄСВ, пенсійні внески</p>
        </CardContent>
      </Card>
      <Card className="border border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-100">Бонуси</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-secondary">
            {totalBonuses.toLocaleString('uk-UA', { style: 'currency', currency })}
          </p>
          <p className="text-xs text-slate-500">AI-розрахунок мотивації</p>
        </CardContent>
      </Card>
    </div>
  );
};

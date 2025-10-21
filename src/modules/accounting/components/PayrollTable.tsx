import { Button } from '../../../components/ui/button';
import { PayrollRecord } from '../types/accounting.types';

interface PayrollTableProps {
  records: PayrollRecord[];
  onGeneratePayslip: (recordId: string) => void;
}

export const PayrollTable = ({ records, onGeneratePayslip }: PayrollTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-slate-800">
    <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
      <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
        <tr>
          <th className="px-4 py-3 text-left">Працівник</th>
          <th className="px-4 py-3 text-left">Період</th>
          <th className="px-4 py-3 text-right">Брутто</th>
          <th className="px-4 py-3 text-right">Нетто</th>
          <th className="px-4 py-3 text-right">Бонуси</th>
          <th className="px-4 py-3 text-right">Відрахування</th>
          <th className="px-4 py-3 text-right">Статус</th>
          <th className="px-4 py-3 text-right" />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800 bg-slate-950/40">
        {records.map((record) => (
          <tr key={record.id} className="hover:bg-slate-900/40">
            <td className="px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium text-slate-100">{record.employeeName}</span>
                <span className="text-xs text-slate-500">{record.employeeId}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-xs text-slate-400">{record.period}</td>
            <td className="px-4 py-3 text-right text-emerald-300">
              {record.grossSalary.toLocaleString('uk-UA', { style: 'currency', currency: record.currency })}
            </td>
            <td className="px-4 py-3 text-right text-slate-100">
              {record.netSalary.toLocaleString('uk-UA', { style: 'currency', currency: record.currency })}
            </td>
            <td className="px-4 py-3 text-right text-emerald-400">
              {record.bonuses.reduce((acc, bonus) => acc + bonus.amount, 0).toLocaleString('uk-UA', {
                style: 'currency',
                currency: record.currency,
              })}
            </td>
            <td className="px-4 py-3 text-right text-rose-300">
              {record.deductions.reduce((acc, deduction) => acc + deduction.amount, 0).toLocaleString('uk-UA', {
                style: 'currency',
                currency: record.currency,
              })}
            </td>
            <td className="px-4 py-3 text-right text-xs uppercase text-slate-400">
              {record.status}
            </td>
            <td className="px-4 py-3 text-right text-xs">
              <Button variant="ghost" size="sm" onClick={() => onGeneratePayslip(record.id)}>
                Payslip
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {!records.length && <p className="p-4 text-center text-xs text-slate-500">Дані про зарплати відсутні.</p>}
  </div>
);

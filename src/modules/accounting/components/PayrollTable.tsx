import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { PayrollRecord } from '../types/accounting.types';

interface PayrollTableProps {
  records: PayrollRecord[];
  onGeneratePayslip: (recordId: string) => void;
}

type SortField = 'employee' | 'period' | 'gross' | 'net' | 'bonuses' | 'deductions' | 'status';

export const PayrollTable = ({ records, onGeneratePayslip }: PayrollTableProps) => {
  const [sortField, setSortField] = useState<SortField>('employee');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'employee':
          comparison = a.employeeName.localeCompare(b.employeeName);
          break;
        case 'period':
          comparison = a.period.localeCompare(b.period);
          break;
        case 'gross':
          comparison = a.grossSalary - b.grossSalary;
          break;
        case 'net':
          comparison = a.netSalary - b.netSalary;
          break;
        case 'bonuses':
          comparison =
            a.bonuses.reduce((acc, sum) => acc + sum.amount, 0) -
            b.bonuses.reduce((acc, sum) => acc + sum.amount, 0);
          break;
        case 'deductions':
          comparison =
            a.deductions.reduce((acc, sum) => acc + sum.amount, 0) -
            b.deductions.reduce((acc, sum) => acc + sum.amount, 0);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [records, sortField, sortDir]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const Th = ({
    field,
    label,
    align = 'left'
  }: {
    field: SortField;
    label: string;
    align?: 'left' | 'right';
  }) => (
    <th
      className={`px-4 py-3 cursor-pointer select-none hover:text-white transition ${align === 'right' ? 'text-right' : 'text-left'}`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label} <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm text-slate-200">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <Th field="employee" label="Employee" />
            <Th field="period" label="Period" />
            <Th field="gross" label="Gross" align="right" />
            <Th field="net" label="Net" align="right" />
            <Th field="bonuses" label="Bonuses" align="right" />
            <Th field="deductions" label="Deductions" align="right" />
            <Th field="status" label="Status" align="right" />
            <th className="px-4 py-3 text-right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-950/40">
          {sortedRecords.map((record) => (
            <tr key={record.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-100">{record.employeeName}</span>
                  <span className="text-xs text-slate-500">{record.employeeId}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">{record.period}</td>
              <td className="px-4 py-3 text-right text-emerald-300">
                {record.grossSalary.toLocaleString('uk-UA', {
                  style: 'currency',
                  currency: record.currency
                })}
              </td>
              <td className="px-4 py-3 text-right text-slate-100">
                {record.netSalary.toLocaleString('uk-UA', {
                  style: 'currency',
                  currency: record.currency
                })}
              </td>
              <td className="px-4 py-3 text-right text-emerald-400">
                {record.bonuses
                  .reduce((acc, bonus) => acc + bonus.amount, 0)
                  .toLocaleString('uk-UA', {
                    style: 'currency',
                    currency: record.currency
                  })}
              </td>
              <td className="px-4 py-3 text-right text-rose-300">
                {record.deductions
                  .reduce((acc, deduction) => acc + deduction.amount, 0)
                  .toLocaleString('uk-UA', {
                    style: 'currency',
                    currency: record.currency
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
      {!records.length && (
        <p className="p-4 text-center text-xs text-slate-500">No payroll data available.</p>
      )}
    </div>
  );
};

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Employee } from '../types/hr.types';
import { formatCurrency, formatDate, getStatusLabel } from '../utils/hr.utils';

interface EmployeeCardProps {
  employee: Employee;
  onSelect?: (employee: Employee) => void;
  isSelected?: boolean;
}

const statusColors: Record<Employee['status'], string> = {
  active: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/40',
  on_leave: 'bg-amber-500/10 text-amber-300 border border-amber-500/40',
  terminated: 'bg-rose-500/10 text-rose-300 border border-rose-500/40'
};

export const EmployeeCard: FC<EmployeeCardProps> = ({ employee, onSelect, isSelected }) => (
  <Card
    className={`cursor-pointer transition-all duration-150 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 ${
      isSelected ? 'border-primary shadow-lg shadow-primary/20' : 'border-slate-800'
    }`}
    onClick={() => onSelect?.(employee)}
  >
    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
      <CardTitle className="text-base font-semibold text-slate-100">{employee.name}</CardTitle>
      <span
        className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[employee.status]}`}
      >
        {getStatusLabel(employee.status)}
      </span>
    </CardHeader>
    <CardContent className="space-y-3 text-sm text-slate-300">
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wide text-slate-400">Position</span>
        <span className="font-medium text-slate-100">{employee.position}</span>
        <span className="text-xs text-slate-400">{employee.department}</span>
      </div>
      <div className="flex justify-between text-xs">
        <div>
          <span className="block text-slate-400">Hire Date</span>
          <span className="font-medium text-slate-100">{formatDate(employee.hireDate)}</span>
        </div>
        <div className="text-right">
          <span className="block text-slate-400">Salary</span>
          <span className="font-medium text-emerald-300">
            {formatCurrency(employee.salary, employee.currency)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{employee.email}</span>
        <span>{employee.phone}</span>
      </div>
    </CardContent>
  </Card>
);

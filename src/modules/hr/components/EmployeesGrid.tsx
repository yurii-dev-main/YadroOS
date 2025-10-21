import { FC } from 'react';
import { Employee } from '../types/hr.types';
import { EmployeeCard } from './EmployeeCard';

interface EmployeesGridProps {
  employees: Employee[];
  onSelect: (employee: Employee) => void;
  selectedEmployeeId?: string | null;
}

export const EmployeesGrid: FC<EmployeesGridProps> = ({ employees, onSelect, selectedEmployeeId }) => {
  if (!employees.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-700 bg-slate-900/70 p-6 text-center text-sm text-slate-400">
        Співробітників не знайдено. Змініть фільтри.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {employees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onSelect={onSelect}
          isSelected={employee.id === selectedEmployeeId}
        />
      ))}
    </div>
  );
};

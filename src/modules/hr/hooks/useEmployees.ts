import { useMemo, useState } from 'react';
import { hrService } from '../services/hr.service';
import {
  Department,
  Employee,
  EmployeeStatus,
  HRStatistics,
  OrgChartNode,
} from '../types/hr.types';

export interface EmployeeFilterState {
  department?: string;
  position?: string;
  status?: EmployeeStatus;
  search?: string;
}

interface UseEmployeesResult {
  employees: Employee[];
  departments: Department[];
  positions: string[];
  filters: EmployeeFilterState;
  setFilters: (filters: EmployeeFilterState) => void;
  resetFilters: () => void;
  selectedEmployee?: Employee;
  selectEmployee: (id: string | null) => void;
  orgChart: OrgChartNode;
  statistics: HRStatistics;
}

export const useEmployees = (): UseEmployeesResult => {
  const [filters, setFilters] = useState<EmployeeFilterState>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const employees = useMemo(() => hrService.getEmployees(filters), [filters]);

  const departments = useMemo(() => hrService.getDepartments(), []);

  const positions = useMemo(() => {
    const allEmployees = hrService.getEmployees();
    return Array.from(new Set(allEmployees.map((employee) => employee.position))).sort();
  }, []);

  const orgChart = useMemo(() => hrService.getOrgChart(), []);

  const statistics = useMemo(() => hrService.getStatistics(), []);

  const selectedEmployee = useMemo(
    () => (selectedEmployeeId ? hrService.getEmployeeById(selectedEmployeeId) : undefined),
    [selectedEmployeeId],
  );

  return {
    employees,
    departments,
    positions,
    filters,
    setFilters,
    resetFilters: () => setFilters({}),
    selectedEmployee,
    selectEmployee: setSelectedEmployeeId,
    orgChart,
    statistics,
  };
};

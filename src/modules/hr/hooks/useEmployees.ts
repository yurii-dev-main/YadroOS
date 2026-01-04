import { useEffect, useMemo, useState } from 'react';
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
  isLoading: boolean;
}

export const useEmployees = (): UseEmployeesResult => {
  const [filters, setFilters] = useState<EmployeeFilterState>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const departments = useMemo(() => hrService.getDepartments(), []);

  const positions = useMemo(() => {
    return Array.from(new Set(employees.map((employee) => employee.position))).sort();
  }, [employees]);

  const orgChart = useMemo(() => hrService.getOrgChart(), []);

  const statistics = useMemo(() => hrService.getStatistics(), []);

  useEffect(() => {
    let isMounted = true;
    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await hrService.fetchEmployees(filters);
        if (isMounted) {
          setEmployees(data);
          if (selectedEmployeeId && !data.find((employee) => employee.id === selectedEmployeeId)) {
            setSelectedEmployeeId(null);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadEmployees();
    return () => {
      isMounted = false;
    };
  }, [filters, selectedEmployeeId]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
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
    isLoading,
  };
};

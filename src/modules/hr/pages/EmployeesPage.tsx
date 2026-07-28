import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useEmployees } from '../hooks/useEmployees';
import { EmployeeFilters } from '../components/EmployeeFilters';
import { EmployeesGrid } from '../components/EmployeesGrid';
import { EmployeeProfile } from '../components/EmployeeProfile';
import { OrgChartView } from '../components/OrgChartView';

export const EmployeesPage = () => {
  const {
    employees,
    departments,
    positions,
    filters,
    setFilters,
    resetFilters,
    selectedEmployee,
    selectEmployee,
    orgChart,
    statistics
  } = useEmployees();

  const departmentOptions = useMemo(
    () => departments.map((department) => department.name),
    [departments]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-primary">{statistics.totalEmployees}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Active Trainings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-300">{statistics.activeTrainings}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-emerald-300">
              {statistics.attendanceRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-300">
            {statistics.topPerformers.map((highlight) => (
              <p key={highlight.employeeId}>
                {employees.find(e => e.id === highlight.employeeId)?.name ?? 'Unknown'} —{' '}
                {highlight.score}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <EmployeeFilters
        filters={filters}
        departments={departmentOptions}
        positions={positions}
        onChange={setFilters}
        onReset={resetFilters}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr,1fr]">
        <EmployeesGrid
          employees={employees}
          onSelect={(employee) => selectEmployee(employee.id)}
          selectedEmployeeId={selectedEmployee?.id}
        />
        <EmployeeProfile employee={selectedEmployee} />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-100">Organizational Structure</h3>
        <p className="text-sm text-slate-400">
          Drag-and-drop and export available in future releases.
        </p>
        <div className="mt-4">
          <OrgChartView data={orgChart} />
        </div>
      </div>
    </div>
  );
};

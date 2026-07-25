import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { hrService } from '../services/hr.service';
import { useAttendance } from '../hooks/useAttendance';
import { AttendanceDashboard } from '../components/AttendanceDashboard';

export const AttendancePage = () => {
  const employees = useMemo(() => hrService.getEmployees(), []);
  const { records, summaries, leaveRequests, leaveBalances, averageAttendance, totalLateArrivals } =
    useAttendance();

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Time Tracking</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          Track check-ins, schedules, vacations, and sick leave. Report on attendance and monitor
          overtime.
        </CardContent>
      </Card>

      <AttendanceDashboard
        employees={employees}
        records={records}
        summaries={summaries}
        leaveRequests={leaveRequests}
        leaveBalances={leaveBalances}
        averageAttendance={averageAttendance}
        totalLateArrivals={totalLateArrivals}
      />
    </div>
  );
};

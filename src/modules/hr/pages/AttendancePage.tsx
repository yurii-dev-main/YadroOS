import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { useEmployees } from '../hooks/useEmployees';
import { useAttendance } from '../hooks/useAttendance';
import { AttendanceDashboard } from '../components/AttendanceDashboard';

export const AttendancePage = () => {
  const { employees } = useEmployees();
  const { records, summaries, leaveRequests, leaveBalances, averageAttendance, totalLateArrivals } =
    useAttendance();
  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7));

  const filteredRecords = useMemo(() => {
    if (!period) return records;
    return records
      .map((r) => ({
        ...r,
        entries: r.entries.filter((e) => e.date.startsWith(period))
      }))
      .filter((r) => r.entries.length > 0);
  }, [records, period]);

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-100">Time Tracking</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Period:</span>
            <Input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-auto h-8"
            />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          Track check-ins, schedules, vacations, and sick leave. Report on attendance and monitor
          overtime.
        </CardContent>
      </Card>

      <AttendanceDashboard
        employees={employees}
        records={filteredRecords}
        summaries={summaries}
        leaveRequests={leaveRequests}
        leaveBalances={leaveBalances}
        averageAttendance={averageAttendance}
        totalLateArrivals={totalLateArrivals}
      />
    </div>
  );
};

import { useMemo } from 'react';
import { hrService } from '../services/hr.service';
import { AttendanceRecord, AttendanceSummary, LeaveBalance, LeaveRequest } from '../types/hr.types';

interface UseAttendanceResult {
  records: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  summaries: AttendanceSummary[];
  averageAttendance: number;
  totalLateArrivals: number;
}

export const useAttendance = (): UseAttendanceResult => {
  const records = useMemo(() => hrService.getAttendanceRecords(), []);
  const leaveRequests = useMemo(() => hrService.getLeaveRequests(), []);
  const leaveBalances = useMemo(() => hrService.getLeaveBalances(), []);
  const summaries = useMemo(() => hrService.getAttendanceSummaries(), []);

  const averageAttendance = useMemo(() => {
    if (!summaries.length) return 0;
    return summaries.reduce((acc, item) => acc + item.attendanceRate, 0) / summaries.length;
  }, [summaries]);

  const totalLateArrivals = useMemo(
    () => summaries.reduce((acc, item) => acc + item.lateArrivals, 0),
    [summaries]
  );

  return {
    records,
    leaveRequests,
    leaveBalances,
    summaries,
    averageAttendance,
    totalLateArrivals
  };
};

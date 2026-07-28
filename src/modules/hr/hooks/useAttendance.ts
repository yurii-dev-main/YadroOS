import { useMemo, useState, useEffect } from 'react';
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
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);

  useEffect(() => {
    hrService.getAttendanceRecords().then(setRecords).catch(console.error);
    hrService.getLeaveRequests().then(setLeaveRequests).catch(console.error);
    hrService.getLeaveBalances().then(setLeaveBalances).catch(console.error);
    hrService.getAttendanceSummaries().then(setSummaries).catch(console.error);
  }, []);

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

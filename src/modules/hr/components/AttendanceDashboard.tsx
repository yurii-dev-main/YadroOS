import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  AttendanceRecord,
  AttendanceSummary,
  Employee,
  LeaveBalance,
  LeaveRequest,
} from '../types/hr.types';
import { formatDate, getEmployeeName } from '../utils/hr.utils';

interface AttendanceDashboardProps {
  employees: Employee[];
  records: AttendanceRecord[];
  summaries: AttendanceSummary[];
  leaveRequests: LeaveRequest[];
  leaveBalances: LeaveBalance[];
  averageAttendance: number;
  totalLateArrivals: number;
}

export const AttendanceDashboard: FC<AttendanceDashboardProps> = ({
  employees,
  records,
  summaries,
  leaveRequests,
  leaveBalances,
  averageAttendance,
  totalLateArrivals,
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">Середня відвідуваність</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-emerald-300">{averageAttendance.toFixed(1)}%</p>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">Запізнення (місяць)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-amber-300">{totalLateArrivals}</p>
        </CardContent>
      </Card>
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-sm text-slate-400">Активні відпустки</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-semibold text-indigo-300">
            {leaveRequests.filter((request) => request.status === 'approved').length}
          </p>
        </CardContent>
      </Card>
    </div>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Графік присутності</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        {records.map((record) => (
          <div key={record.employeeId} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <p className="text-sm font-semibold text-slate-100">
                {getEmployeeName(employees, record.employeeId)}
              </p>
              <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-1 text-xs uppercase tracking-wide text-indigo-200">
                {record.schedule}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {record.entries.map((entry) => (
                <div key={entry.date} className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">{formatDate(entry.date)}</p>
                  <p className="text-sm text-slate-100">
                    {entry.checkIn} → {entry.checkOut}
                  </p>
                  <p className="text-xs text-slate-400">
                    Локація: {entry.location ?? '—'} | Перерва: {entry.lunchBreakMinutes} хв | Овертайм:{' '}
                    {entry.overtimeHours} год
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Відпустки</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="px-3 py-2">Співробітник</th>
                <th className="px-3 py-2">Тип</th>
                <th className="px-3 py-2">Період</th>
                <th className="px-3 py-2">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leaveRequests.map((request) => (
                <tr key={request.id}>
                  <td className="px-3 py-2 text-slate-100">
                    {getEmployeeName(employees, request.employeeId)}
                  </td>
                  <td className="px-3 py-2">{request.type}</td>
                  <td className="px-3 py-2">
                    {formatDate(request.startDate)} – {formatDate(request.endDate)}
                  </td>
                  <td className="px-3 py-2 capitalize">{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Баланс днів</h4>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            {leaveBalances.map((balance) => (
              <div key={`${balance.employeeId}-${balance.type}`} className="rounded-md border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-sm font-semibold text-slate-100">
                  {getEmployeeName(employees, balance.employeeId)}
                </p>
                <p className="text-xs text-slate-400">{balance.type}</p>
                <p className="text-sm text-indigo-300">
                  Залишок: {balance.total - balance.used} днів з {balance.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-lg text-slate-100">Аналітика</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 text-sm text-slate-300 md:grid-cols-2">
        {summaries.map((summary) => (
          <div key={summary.employeeId} className="rounded-md border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-sm font-semibold text-slate-100">
              {getEmployeeName(employees, summary.employeeId)}
            </p>
            <p>Відвідуваність: {summary.attendanceRate}%</p>
            <p>Запізнення: {summary.lateArrivals}</p>
            <p>Абсентеїзм: {summary.absenteeismRate}%</p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

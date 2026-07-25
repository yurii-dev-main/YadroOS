import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Employee } from '../types/hr.types';
import { formatCurrency, formatDate } from '../utils/hr.utils';
import { Timeline } from './Timeline';

interface EmployeeProfileProps {
  employee?: Employee;
}

export const EmployeeProfile: FC<EmployeeProfileProps> = ({ employee }) => {
  if (!employee) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-400">
        Select an employee to view profile.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">{employee.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm text-slate-300 md:grid-cols-2">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Contacts</h4>
            <p>{employee.email}</p>
            <p>{employee.phone}</p>
            <p>Date of Birth: {formatDate(employee.birthdate)}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Position & Manager</h4>
            <p>{employee.position}</p>
            <p>Department: {employee.department}</p>
            <p>Manager ID: {employee.managerId ?? '—'}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Dates</h4>
            <p>Hire: {formatDate(employee.hireDate)}</p>
            {employee.probationEnd && <p>Probation End: {formatDate(employee.probationEnd)}</p>}
            {employee.contractEnd && <p>Contract End: {formatDate(employee.contractEnd)}</p>}
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Salary</h4>
            <p className="font-medium text-emerald-300">
              {formatCurrency(employee.salary, employee.currency)}
            </p>
            <p>Payment Method: {employee.paymentMethod}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Documents & Contacts</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm text-slate-300 md:grid-cols-2">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Documents</h4>
            <p>Passport: {employee.documents.passport}</p>
            <p>Tax ID: {employee.documents.taxId}</p>
            <p>Bank details: {employee.documents.bankDetails}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Emergency Contact</h4>
            <p>{employee.emergencyContact.name}</p>
            <p>{employee.emergencyContact.relationship}</p>
            <p>{employee.emergencyContact.phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">History</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline events={employee.timeline} />
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Trainings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          {employee.trainings.length ? (
            employee.trainings.map((trainingId) => (
              <p key={trainingId}>Training ID: {trainingId}</p>
            ))
          ) : (
            <p>No trainings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

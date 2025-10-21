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
        Оберіть співробітника для перегляду профілю.
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
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Контакти</h4>
            <p>{employee.email}</p>
            <p>{employee.phone}</p>
            <p>Дата народження: {formatDate(employee.birthdate)}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Посада та менеджер</h4>
            <p>{employee.position}</p>
            <p>Департамент: {employee.department}</p>
            <p>Менеджер ID: {employee.managerId ?? '—'}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Дати</h4>
            <p>Найм: {formatDate(employee.hireDate)}</p>
            {employee.probationEnd && <p>Кінець випробувального: {formatDate(employee.probationEnd)}</p>}
            {employee.contractEnd && <p>Кінець контракту: {formatDate(employee.contractEnd)}</p>}
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Зарплата</h4>
            <p className="font-medium text-emerald-300">
              {formatCurrency(employee.salary, employee.currency)}
            </p>
            <p>Метод виплат: {employee.paymentMethod}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Документи та контакти</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 text-sm text-slate-300 md:grid-cols-2">
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Документи</h4>
            <p>Паспорт: {employee.documents.passport}</p>
            <p>ІПН: {employee.documents.taxId}</p>
            <p>Банківські реквізити: {employee.documents.bankDetails}</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Екстрений контакт</h4>
            <p>{employee.emergencyContact.name}</p>
            <p>{employee.emergencyContact.relationship}</p>
            <p>{employee.emergencyContact.phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Історія</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline events={employee.timeline} />
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Тренінги</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          {employee.trainings.length ? (
            employee.trainings.map((trainingId) => <p key={trainingId}>Тренінг ID: {trainingId}</p>)
          ) : (
            <p>Немає тренінгів</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

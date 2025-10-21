import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Employee, OnboardingPlan } from '../types/hr.types';
import { formatDate, getEmployeeName } from '../utils/hr.utils';

interface OnboardingChecklistProps {
  employees: Employee[];
  plans: OnboardingPlan[];
}

export const OnboardingChecklist: FC<OnboardingChecklistProps> = ({ employees, plans }) => (
  <Card className="border-slate-800 bg-slate-900/70">
    <CardHeader>
      <CardTitle className="text-lg text-slate-100">Онбординг</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm text-slate-300">
      {plans.map((plan) => (
        <div key={plan.employeeId} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
            <p className="text-sm font-semibold text-slate-100">
              {getEmployeeName(employees, plan.employeeId)} — старт {formatDate(plan.startDate)}
            </p>
            <span className="text-xs text-slate-400">Buddy: {getEmployeeName(employees, plan.buddyId)}</span>
          </div>
          <ul className="mt-3 space-y-2">
            {plan.tasks.map((task) => (
              <li key={task.id} className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-100">{task.title}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      task.completed
                        ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {task.completed ? 'Завершено' : 'В процесі'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Відповідальний: {task.owner}</p>
                <p className="text-xs text-slate-400">Дедлайн: {formatDate(task.dueDate)}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </CardContent>
  </Card>
);

import { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Employee, OffboardingChecklist } from '../types/hr.types';
import { getEmployeeName } from '../utils/hr.utils';

interface OffboardingChecklistProps {
  employees: Employee[];
  checklists: OffboardingChecklist[];
}

export const OffboardingChecklist: FC<OffboardingChecklistProps> = ({ employees, checklists }) => (
  <Card className="border-slate-800 bg-slate-900/70">
    <CardHeader>
      <CardTitle className="text-lg text-slate-100">Офбординг</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 text-sm text-slate-300">
      {checklists.length === 0 && <p>Активних офбордингів немає.</p>}
      {checklists.map((checklist) => (
        <div key={checklist.employeeId} className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold text-slate-100">
            {getEmployeeName(employees, checklist.employeeId)}
          </p>
          <p className="text-xs text-slate-400">
            Exit interview: {checklist.exitInterviewScheduled ? 'заплановано' : 'не заплановано'} | Фінальний розрахунок:{' '}
            {checklist.finalPaycheckProcessed ? 'готово' : 'в процесі'}
          </p>
          <ul className="mt-3 space-y-2">
            {checklist.tasks.map((task) => (
              <li key={task.id} className="rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-100">{task.title}</span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      task.completed
                        ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
                    }`}
                  >
                    {task.completed ? 'Готово' : 'Очікує'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Відповідальний: {task.owner}</p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </CardContent>
  </Card>
);

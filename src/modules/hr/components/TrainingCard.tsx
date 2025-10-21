import { FC, FormEvent, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Employee, Training } from '../types/hr.types';
import { formatDate, getEmployeeName } from '../utils/hr.utils';

interface TrainingCardProps {
  training: Training;
  employees: Employee[];
  onRegister: (trainingId: string, employeeId: string) => void;
  onMarkAttendance: (trainingId: string, employeeId: string, attended: boolean) => void;
  onSubmitFeedback: (trainingId: string, employeeId: string, rating: number, comments: string) => void;
}

export const TrainingCard: FC<TrainingCardProps> = ({
  training,
  employees,
  onRegister,
  onMarkAttendance,
  onSubmitFeedback,
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [feedbackEmployeeId, setFeedbackEmployeeId] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const availableEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => !training.participants.some((participant) => participant.employeeId === employee.id),
      ),
    [employees, training.participants],
  );

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedEmployeeId) return;
    onRegister(training.id, selectedEmployeeId);
    setSelectedEmployeeId('');
  };

  const handleSubmitFeedback = (event: FormEvent) => {
    event.preventDefault();
    if (!feedbackEmployeeId) return;
    onSubmitFeedback(training.id, feedbackEmployeeId, feedbackRating, feedbackComment || 'Без коментарів');
    setFeedbackEmployeeId('');
    setFeedbackRating(5);
    setFeedbackComment('');
  };

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-100">{training.title}</CardTitle>
            <p className="text-sm text-slate-400">{training.description}</p>
          </div>
          <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs uppercase tracking-wide text-indigo-200">
            {training.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p>Інструктор: {training.instructor}</p>
            <p>Дата: {formatDate(training.date)}</p>
            <p>Тривалість: {training.duration} год.</p>
            <p>Локація: {training.location}</p>
          </div>
          <div>
            <p>Статус: {training.status}</p>
            <p>Вмістимість: {training.participants.length}/{training.capacity}</p>
            <p>Матеріали:</p>
            <ul className="list-inside list-disc text-xs text-indigo-200">
              {training.materials.map((material) => (
                <li key={material.id}>
                  <a href={material.url} className="underline" download>
                    {material.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Учасники</h4>
          <ul className="mt-2 space-y-2">
            {training.participants.map((participant) => {
              const employeeName = getEmployeeName(employees, participant.employeeId);
              return (
                <li
                  key={participant.employeeId}
                  className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">{employeeName}</p>
                    <p className="text-xs text-slate-400">
                      Відвідав: {participant.attended ? 'так' : 'ні'} | Відгук:{' '}
                      {participant.feedbackSubmitted ? 'поданий' : 'немає'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      className="rounded-md border border-emerald-500/40 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10"
                      onClick={() => onMarkAttendance(training.id, participant.employeeId, !participant.attended)}
                    >
                      {participant.attended ? 'Скасувати' : 'Відмітити'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <form onSubmit={handleRegister} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Реєстрація на тренінг</h4>
          <div className="mt-2 flex flex-col gap-2 md:flex-row">
            <select
              value={selectedEmployeeId}
              onChange={(event) => setSelectedEmployeeId(event.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none md:w-1/2"
            >
              <option value="">Оберіть співробітника</option>
              {availableEmployees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} — {employee.position}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-300 transition hover:bg-indigo-500/10 md:w-auto"
            >
              Зареєструвати
            </button>
          </div>
        </form>

        <form onSubmit={handleSubmitFeedback} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Залишити відгук</h4>
          <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
            <select
              value={feedbackEmployeeId}
              onChange={(event) => setFeedbackEmployeeId(event.target.value)}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Оберіть співробітника</option>
              {training.participants.map((participant) => (
                <option key={participant.employeeId} value={participant.employeeId}>
                  {getEmployeeName(employees, participant.employeeId)}
                </option>
              ))}
            </select>
            <select
              value={feedbackRating}
              onChange={(event) => setFeedbackRating(Number(event.target.value))}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  Оцінка {rating}
                </option>
              ))}
            </select>
            <input
              value={feedbackComment}
              onChange={(event) => setFeedbackComment(event.target.value)}
              placeholder="Коментар"
              className="md:col-span-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="mt-2 text-right">
            <button
              type="submit"
              className="rounded-md border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/10"
            >
              Надіслати
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

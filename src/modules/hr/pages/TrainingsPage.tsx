import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { hrService } from '../services/hr.service';
import { useTrainings } from '../hooks/useTrainings';
import { TrainingCalendar } from '../components/TrainingCalendar';
import { TrainingCard } from '../components/TrainingCard';
import { TrainingStatus } from '../types/hr.types';

const statusOptions = [
  { label: 'All events', value: '' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
];

export const TrainingsPage = () => {
  const employees = useMemo(() => hrService.getEmployees(), []);
  const {
    trainings,
    selectedTraining,
    filters,
    setFilters,
    selectTraining,
    register,
    markAttendance,
    submitFeedback
  } = useTrainings();

  return (
    <div className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/70">
        <CardHeader>
          <CardTitle className="text-lg text-slate-100">Training Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-300">
              Plan workshops, webinars, and courses. Mark attendance and gather feedback.
            </p>
            <select
              value={filters.status ?? ''}
              onChange={(event) => {
                const value = event.target.value as TrainingStatus | '';
                setFilters({ status: value ? value : undefined });
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none md:w-64"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <TrainingCalendar trainings={trainings} onSelectTraining={selectTraining} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {(selectedTraining ? [selectedTraining] : trainings).map((training) => (
          <TrainingCard
            key={training.id}
            training={training}
            employees={employees}
            onRegister={register}
            onMarkAttendance={markAttendance}
            onSubmitFeedback={submitFeedback}
          />
        ))}
      </div>
    </div>
  );
};

import { FC, FormEvent, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Star } from 'lucide-react';
import { Employee, Training } from '../types/hr.types';
import { formatDate, getEmployeeName } from '../utils/hr.utils';

interface TrainingCardProps {
  training: Training;
  employees: Employee[];
  onRegister: (trainingId: string, employeeId: string) => void;
  onMarkAttendance: (trainingId: string, employeeId: string, attended: boolean) => void;
  onSubmitFeedback: (
    trainingId: string,
    employeeId: string,
    rating: number,
    comments: string
  ) => void;
  currentUserRole?: string;
  currentUserId?: string;
}

export const TrainingCard: FC<TrainingCardProps> = ({
  training,
  employees,
  onRegister,
  onMarkAttendance,
  onSubmitFeedback,
  currentUserRole,
  currentUserId
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const availableEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          !training.participants.some((participant) => participant.employeeId === employee.id)
      ),
    [employees, training.participants]
  );

  const handleRegister = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedEmployeeId) return;
    onRegister(training.id, selectedEmployeeId);
    setSelectedEmployeeId('');
  };

  const handleSubmitFeedback = (event: FormEvent) => {
    event.preventDefault();
    if (!currentUserId || feedbackRating === 0) return;
    onSubmitFeedback(
      training.id,
      currentUserId,
      feedbackRating,
      feedbackComment || 'No comments'
    );
    setFeedbackRating(0);
    setFeedbackComment('');
  };

  const isPast = new Date(training.date) < new Date();
  const canManage = currentUserRole === 'OWNER' || currentUserRole === 'HR_SPECIALIST';

  return (
    <Card className="border-slate-800 bg-slate-900/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-100">{training.title}</CardTitle>
            <p className="text-sm text-slate-400">{training.description}</p>
          </div>
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
            {training.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-300">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p>Instructor: {training.instructor}</p>
            <p>Date: {formatDate(training.date)}</p>
            <p>Duration: {training.duration} hrs</p>
            <p>Location: {training.location}</p>
          </div>
          <div>
            <p>Status: {training.status}</p>
            <p>
              Capacity: {training.participants.length}/{training.capacity}
            </p>
            <p>Materials:</p>
            <ul className="list-inside list-disc text-xs text-primary">
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
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Participants</h4>
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
                      Attended: {participant.attended ? 'yes' : 'no'} | Feedback:{' '}
                      {participant.feedbackSubmitted ? 'submitted' : 'none'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {canManage && (
                      <button
                        type="button"
                        className="rounded-md border border-emerald-500/40 px-3 py-1 text-emerald-300 hover:bg-emerald-500/10"
                        onClick={() =>
                          onMarkAttendance(training.id, participant.employeeId, !participant.attended)
                        }
                      >
                        {participant.attended ? 'Cancel' : 'Mark'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {canManage && (
          <form
            onSubmit={handleRegister}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"
          >
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Training Registration</h4>
            <div className="mt-2 flex flex-col gap-2 md:flex-row">
              <select
                value={selectedEmployeeId}
                onChange={(event) => setSelectedEmployeeId(event.target.value)}
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none md:w-1/2"
              >
                <option value="">Select employee</option>
                {availableEmployees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} — {employee.position}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/10 md:w-auto"
              >
                Register
              </button>
            </div>
          </form>
        )}

        {isPast && (
          <form
            onSubmit={handleSubmitFeedback}
            className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
          >
            <h4 className="text-xs uppercase tracking-wide text-slate-400">Leave Feedback</h4>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-300 mr-2">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setFeedbackRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= (hoverRating || feedbackRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={feedbackComment}
                onChange={(event) => setFeedbackComment(event.target.value)}
                placeholder="Write your review here..."
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-900 p-3 text-sm text-slate-100 focus:border-primary focus:outline-none resize-y"
              />
            </div>
            <div className="mt-3 text-right">
              <button
                type="submit"
                disabled={feedbackRating === 0}
                className="rounded-md border border-emerald-500 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

import { CRMActivity, ActivityType } from '../types/crm.types';

interface ActivityLogProps {
  activities: CRMActivity[];
  filter: ActivityType | 'all';
  onFilterChange: (filter: ActivityType | 'all') => void;
}

const activityLabels: Record<ActivityType, string> = {
  call: 'Call',
  meeting: 'Meeting',
  email: 'Email',
  note: 'Note',
  task: 'Task'
};

export const ActivityLog = ({ activities, filter, onFilterChange }: ActivityLogProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {(['all', 'call', 'meeting', 'email', 'note', 'task'] as Array<ActivityType | 'all'>).map(
          (type) => (
            <button
              key={type}
              onClick={() => onFilterChange(type)}
              type="button"
              className={`rounded-full px-4 py-1 text-sm transition ${
                filter === type
                  ? 'bg-blue-600 text-white shadow shadow-blue-500/40'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              {type === 'all' ? 'All' : activityLabels[type]}
            </button>
          )
        )}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 h-full w-px bg-slate-700/60" aria-hidden />
        <div className="flex flex-col gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="relative flex gap-4">
              <div className="absolute left-3 top-2 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
              <div className="ml-8 flex flex-1 flex-col gap-2 rounded-2xl border border-slate-700/40 bg-slate-900/60 p-4 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">
                    {activity.type === 'call' && 'Call'}
                    {activity.type === 'meeting' && 'Meeting'}
                    {activity.type === 'email' && 'Email'}
                    {activity.type === 'note' && 'Note'}
                    {activity.type === 'task' && 'Task'}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-200">
                  {('notes' in activity && activity.notes) ||
                    ('content' in activity && activity.content) ||
                    '—'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
                  {'duration' in activity && <span>Duration: {activity.duration} min.</span>}
                  {'summary' in activity && <span>Summary: {activity.summary}</span>}
                  {'deadline' in activity && (
                    <span>Deadline: {new Date(activity.deadline).toLocaleDateString()}</span>
                  )}
                  {'status' in activity && 'deadline' in activity && (
                    <span>Status: {activity.status}</span>
                  )}
                  {'attendees' in activity && (
                    <span>Attendees: {activity.attendees.join(', ')}</span>
                  )}
                  {'subject' in activity && <span>Subject: {activity.subject}</span>}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="ml-8 rounded-2xl border border-dashed border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              No activities to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

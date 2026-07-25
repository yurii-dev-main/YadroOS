import { FC } from 'react';
import { EmployeeTimelineEvent } from '../types/hr.types';
import { formatDate, getTimelineLabel } from '../utils/hr.utils';

interface TimelineProps {
  events: EmployeeTimelineEvent[];
}

export const Timeline: FC<TimelineProps> = ({ events }) => {
  if (!events.length) {
    return <p className="text-sm text-slate-400">No events recorded.</p>;
  }

  return (
    <ol className="space-y-4">
      {events
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((event) => (
          <li
            key={event.id}
            className="relative rounded-lg border border-slate-800 bg-slate-900/60 p-4"
          >
            <span className="absolute -left-2 top-4 h-4 w-4 rounded-full border border-indigo-500 bg-slate-900" />
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{getTimelineLabel(event.type)}</span>
              <span>{formatDate(event.date)}</span>
            </div>
            <h4 className="mt-2 text-sm font-semibold text-slate-100">{event.title}</h4>
            <p className="text-sm text-slate-300">{event.description}</p>
          </li>
        ))}
    </ol>
  );
};

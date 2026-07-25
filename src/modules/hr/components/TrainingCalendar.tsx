import { addHours, format, getDay, parse, startOfWeek } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { FC, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, EventPropGetter } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Training } from '../types/hr.types';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface TrainingCalendarProps {
  trainings: Training[];
  onSelectTraining: (trainingId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const eventPropGetter: EventPropGetter<any> = (event: any) => {
  const training = event.resource as Training;
  const statusColor = {
    scheduled: '#6366f1',
    ongoing: '#f59e0b',
    completed: '#10b981',
    cancelled: '#f87171',
  }[training.status];

  return {
    className: 'border-none text-xs font-medium',
    style: {
      backgroundColor: `${statusColor}33`,
      color: statusColor,
      borderRadius: '8px',
      padding: '4px 8px',
    },
  };
};

export const TrainingCalendar: FC<TrainingCalendarProps> = ({ trainings, onSelectTraining }) => {
  const events = useMemo(
    () =>
      trainings.map((training) => ({
        id: training.id,
        title: training.title,
        start: new Date(training.date),
        end: addHours(new Date(training.date), training.duration),
        resource: training,
      })),
    [trainings],
  );

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <Calendar
        culture="en-US"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 520 }}
        popup
        messages={{
          next: 'Next',
          previous: 'Previous',
          today: 'Today',
          month: 'Month',
          week: 'Week',
          day: 'Day',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Time',
          event: 'Event',
          showMore: (total: number) => `+${total} more`,
        }}
        views={['month', 'agenda']}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSelectEvent={(event: any) => onSelectTraining(event.id as string)}
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
};

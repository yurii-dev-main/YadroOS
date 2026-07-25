import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ActivityType, CRMActivity } from '../types/crm.types';

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Omit<CRMActivity, 'id' | 'createdAt'>) => Promise<void> | void;
  clientId: string;
  creator: string;
}

interface ActivityFormValues {
  type: ActivityType;
  notes: string;
  duration?: number;
  summary?: string;
  deadline?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

const defaultValues: ActivityFormValues = {
  type: 'call',
  notes: ''
};

export const ActivityModal = ({
  open,
  onClose,
  onSubmit,
  clientId,
  creator
}: ActivityModalProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting }
  } = useForm<ActivityFormValues>({ defaultValues });

  const type = watch('type');

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">New Activity</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
          >
            Close
          </button>
        </div>

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit({
              clientId,
              createdBy: creator,
              type: values.type,
              notes: values.notes,
              duration: values.duration,
              summary: values.summary,
              deadline: values.deadline,
              status: values.status
            } as Omit<CRMActivity, 'id' | 'createdAt'>);
            onClose();
          })}
        >
          <label className="flex flex-col text-sm text-slate-200">
            Activity type
            <select
              {...register('type')}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="call">Call</option>
              <option value="meeting">Meeting</option>
              <option value="email">Email</option>
              <option value="note">Note</option>
              <option value="task">Task</option>
            </select>
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Notes / description
            <textarea
              {...register('notes')}
              className="mt-1 min-h-[120px] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          {(type === 'call' || type === 'meeting') && (
            <label className="flex flex-col text-sm text-slate-200">
              Summary
              <textarea
                {...register('summary')}
                className="mt-1 min-h-[80px] rounded-xl border border-slate-700 bg-slate-900 px-3 py-2"
              />
            </label>
          )}

          {(type === 'call' || type === 'meeting') && (
            <label className="flex flex-col text-sm text-slate-200">
              Duration (min)
              <input
                type="number"
                {...register('duration', { valueAsNumber: true })}
                className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              />
            </label>
          )}

          {type === 'task' && (
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col text-sm text-slate-200">
                Deadline
                <input
                  type="date"
                  {...register('deadline')}
                  className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                />
              </label>
              <label className="flex flex-col text-sm text-slate-200">
                Status
                <select
                  {...register('status')}
                  className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                >
                  <option value="pending">Scheduled</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
            </div>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

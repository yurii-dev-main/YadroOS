import { FC } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { OKR } from '../types/hr.types';

interface OKRFormModalProps {
  onClose: () => void;
  onSubmit: (okr: Partial<OKR>) => void;
}

export const OKRFormModal: FC<OKRFormModalProps> = ({ onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<Partial<OKR>>({
    defaultValues: { objective: '' }
  });

  const onFormSubmit = (data: Partial<OKR>) => {
    onSubmit({
      ...data,
      keyResults: [{ id: '1', description: 'Sample Key Result', progress: 0 }]
    });
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">Create OKR</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Objective</label>
            <input
              required
              {...register('objective')}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { CRMClient, ClientStatus } from '../types/crm.types';

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  initialData?: Partial<CRMClient>;
}

export interface ClientFormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  industry: string;
  size: number;
  revenue: number;
  status: ClientStatus;
  assignedTo: string;
}

const defaultValues: ClientFormValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  industry: 'FinTech',
  size: 50,
  revenue: 50000,
  status: 'lead',
  assignedTo: 'Oleksandr Petrenko'
};

export const ClientFormModal = ({ open, onClose, onSubmit, initialData }: ClientFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<ClientFormValues>({ defaultValues });

  useEffect(() => {
    if (open) {
      reset(initialData ? { ...defaultValues, ...initialData } : defaultValues);
    }
  }, [open, reset, initialData]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700/60 bg-slate-900/90 p-8 shadow-2xl shadow-black/40">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{initialData ? 'Edit Client' : 'New Client'}</h2>
          <button
            type="button"
            className="rounded-lg border border-slate-600/60 px-3 py-1 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <form
          className="grid grid-cols-2 gap-4"
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values);
            onClose();
          })}
        >
          <label className="flex flex-col text-sm text-slate-200">
            Contact Person Name
            <input
              {...register('name', { required: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Company
            <input
              {...register('company', { required: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Email
            <input
              type="email"
              {...register('email', { required: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Phone
            <input
              {...register('phone', { required: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Website
            <input
              {...register('website')}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Industry
            <input
              {...register('industry', { required: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Number of Employees
            <input
              type="number"
              {...register('size', { valueAsNumber: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Annual Revenue
            <input
              type="number"
              {...register('revenue', { valueAsNumber: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Status
            <select
              {...register('status')}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            >
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lost">Lost</option>
            </select>
          </label>

          <label className="flex flex-col text-sm text-slate-200">
            Assigned Manager
            <input
              {...register('assignedTo', { required: true })}
              className="mt-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
            />
          </label>

          <div className="col-span-2 mt-4 flex justify-end gap-3">
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
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

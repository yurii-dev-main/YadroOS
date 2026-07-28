import { FC } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Employee } from '../types/hr.types';

interface EmployeeFormModalProps {
  onClose: () => void;
  onSubmit: (employee: Partial<Employee>) => void;
  initialData?: Partial<Employee>;
}

export const EmployeeFormModal: FC<EmployeeFormModalProps> = ({ onClose, onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Partial<Employee>>({
    defaultValues: initialData || {
      name: '', email: '', phone: '', department: 'Engineering', position: 'Developer', salary: 0, status: 'active',
      currency: 'USD', paymentMethod: 'bank_transfer'
    }
  });

  const onFormSubmit = (data: Partial<Employee>) => {
    onSubmit(data);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-100">{initialData ? 'Edit Employee' : 'New Employee'}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Full Name</label>
              <input required {...register('name')} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <input required type="email" {...register('email')} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Phone</label>
              <input required {...register('phone')} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Department</label>
              <input required {...register('department')} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Position</label>
              <input required {...register('position')} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Salary</label>
              <input required type="number" {...register('salary', { valueAsNumber: true })} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">Save</button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

import { ErrorMessage } from '@hookform/error-message';
import type { FieldValues, Path } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';

import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}

export const FormField = <TFieldValues extends FieldValues>({
  name,
  label,
  type = 'text',
  autoComplete,
  placeholder
}: FormFieldProps<TFieldValues>) => {
  const { register, formState } = useFormContext<TFieldValues>();

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} type={type} autoComplete={autoComplete} placeholder={placeholder} {...register(name)} />
      <ErrorMessage
        errors={formState.errors}
        name={name as string}
        render={({ message }) => <p className="text-xs text-danger">{message}</p>}
      />
    </div>
  );
};

import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={twMerge('text-sm font-medium text-slate-200', className)}
      {...props}
    />
  )
);

Label.displayName = 'Label';

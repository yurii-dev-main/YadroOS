import * as React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg', className)} {...props} />
);

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('mb-4 flex flex-col gap-1', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={twMerge('text-lg font-semibold text-slate-50', className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={twMerge('flex flex-col gap-4', className)} {...props} />
);

import * as React from 'react';
import { twMerge } from 'tailwind-merge';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, className, ...props }) => (
  <div
    className={twMerge(
      'flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-lg font-semibold uppercase',
      className
    )}
    {...props}
  >
    {src ? (
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    ) : (
      fallback.slice(0, 2)
    )}
  </div>
);

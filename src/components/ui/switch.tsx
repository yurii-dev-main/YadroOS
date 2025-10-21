import * as React from 'react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  'aria-label'?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange, label, ...props }) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-200">
    <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        {...props}
      />
      <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5 peer-checked:bg-primary" />
    </span>
    {label && <span>{label}</span>}
  </label>
);

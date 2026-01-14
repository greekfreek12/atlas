'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export function FormField({ label, description, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-zinc-400 text-xs font-medium">{label}</label>
      {children}
      {description && (
        <p className="text-zinc-500 text-xs">{description}</p>
      )}
    </div>
  );
}

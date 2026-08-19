import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'secondary' | 'outline';
}

export const Badge = ({ className = '', variant = 'neutral', ...props }: BadgeProps) => {
  const baseClass = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors';
  
  const variants = {
    neutral: 'bg-zinc-50 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300',
    primary: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-900/50 dark:text-indigo-300',
    secondary: 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-950/40 dark:border-slate-900/50 dark:text-slate-300',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-300',
    error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300',
    info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-900/50 dark:text-sky-300',
    outline: 'bg-transparent border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-300',
  };

  return (
    <span
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

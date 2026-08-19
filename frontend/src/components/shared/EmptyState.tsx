import * as React from 'react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 rounded-2xl bg-zinc-50/30 dark:bg-zinc-900/10 min-h-[300px]">
      {icon && (
        <div className="p-4 rounded-full bg-zinc-50 border border-zinc-100 dark:bg-zinc-800/40 dark:border-zinc-800 text-zinc-400 mb-4 shrink-0 shadow-sm animate-pulse">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mt-1 mb-6 font-medium">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

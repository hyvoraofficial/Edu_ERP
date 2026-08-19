import * as React from 'react';

export function LoadingSkeleton({ variant = 'card' }: { variant?: 'card' | 'table' | 'text' }) {
  const baseShimmer = 'bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded-xl';

  if (variant === 'text') {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className={`${baseShimmer} h-4 w-1/3`} />
        <div className={`${baseShimmer} h-3 w-3/4`} />
        <div className={`${baseShimmer} h-3 w-1/2`} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="flex flex-col gap-4 w-full border border-border p-4 rounded-2xl bg-card">
        <div className={`${baseShimmer} h-8 w-1/4`} />
        <div className="space-y-3">
          <div className={`${baseShimmer} h-12 w-full`} />
          <div className={`${baseShimmer} h-12 w-full`} />
          <div className={`${baseShimmer} h-12 w-full`} />
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border p-6 rounded-2xl bg-card flex flex-col gap-4 w-full h-[180px]">
      <div className="flex items-center gap-3">
        <div className={`${baseShimmer} w-10 h-10 rounded-xl`} />
        <div className="flex-1 space-y-2">
          <div className={`${baseShimmer} h-3.5 w-1/3`} />
          <div className={`${baseShimmer} h-3 w-1/4`} />
        </div>
      </div>
      <div className="space-y-2 mt-4">
        <div className={`${baseShimmer} h-3 w-5/6`} />
        <div className={`${baseShimmer} h-3 w-1/2`} />
      </div>
    </div>
  );
}

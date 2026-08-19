import * as React from 'react';

export default function GlobalLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-4 bg-background select-none animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-black text-2xl shadow">
        H
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          Loading Workspace
        </span>
        <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">
          HYVORA EduERP
        </span>
      </div>
    </div>
  );
}

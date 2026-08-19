import * as React from 'react';
import { Settings } from 'lucide-react';

export function Maintenance() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 select-none">
      <div className="p-4 rounded-full bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 text-amber-600 mb-4 shrink-0 shadow-sm animate-spin-slow">
        <Settings className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
        SaaS System Maintenance
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mt-1 mb-6 font-medium leading-relaxed">
        HYVORA platform database and server nodes are undergoing routine maintenance update optimizations. We will be back online shortly.
      </p>
    </div>
  );
}
export default Maintenance;

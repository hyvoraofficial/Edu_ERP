import * as React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

export function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 select-none">
      <div className="p-4 rounded-full bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/30 text-rose-600 mb-4 shrink-0 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
        403 - Forbidden Access
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mt-1 mb-6 font-medium leading-relaxed">
        Your logged-in role does not possess the correct permission clearance to view this resource.
      </p>
      <Link href="/">
        <Button variant="outline" size="sm">
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
export default Forbidden;

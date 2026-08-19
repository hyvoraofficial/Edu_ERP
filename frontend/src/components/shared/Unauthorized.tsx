import * as React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '../ui/Button';

export function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 select-none">
      <div className="p-4 rounded-full bg-zinc-50 border border-zinc-100 dark:bg-zinc-800/40 dark:border-zinc-800 text-zinc-400 mb-4 shrink-0 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">
        401 - Unauthorized Access
      </h3>
      <p className="text-sm text-zinc-400 max-w-sm mt-1 mb-6 font-medium leading-relaxed">
        Authentication session is missing or expired. Please sign in to regain access.
      </p>
      <Link href="/login">
        <Button variant="primary" size="sm">
          Sign In
        </Button>
      </Link>
    </div>
  );
}
export default Unauthorized;

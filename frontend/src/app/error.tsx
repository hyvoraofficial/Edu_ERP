'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-6 px-6 text-center select-none bg-background">
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xl shadow-sm">
        !
      </div>
      <div className="flex flex-col items-center gap-1.5 max-w-md">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Application Render Error
        </h2>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
          An unexpected error occurred while rendering the current page. Please click reload to try again.
        </p>
      </div>
      <div className="flex gap-4">
        <Button onClick={() => reset()} variant="primary" size="sm">
          Reload Workspace
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline" size="sm">
          Back to Homepage
        </Button>
      </div>
    </div>
  );
}

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function GlobalNotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-6 px-6 text-center select-none bg-background">
      <div className="text-4xl font-extrabold tracking-tight text-primary">
        404
      </div>
      <div className="flex flex-col items-center gap-1.5 max-w-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Page Not Found
        </h2>
        <p className="text-xs text-zinc-400 font-medium leading-relaxed">
          The requested page does not exist or may have been relocated.
        </p>
      </div>
      <Link href="/">
        <Button variant="outline" size="sm">
          Return to Safety
        </Button>
      </Link>
    </div>
  );
}

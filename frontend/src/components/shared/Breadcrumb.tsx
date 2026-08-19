'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, UserPlus } from 'lucide-react';
import { useBranchContext } from '@/providers/BranchProvider';
import { Button } from '@/components/ui/Button';

export function Breadcrumb() {
  const pathname = usePathname();
  const { selectedBranch } = useBranchContext();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    const campusTitle = selectedBranch ? selectedBranch.name.toUpperCase() : 'ALL BRANCHES';

    return (
      <div className="flex items-center justify-between gap-4 mb-6 select-none border-b border-slate-200/60 pb-3">
        {/* Left: Campus Pill */}
        <span className="inline-flex items-center px-5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-black uppercase tracking-wider shadow-2xs">
          CAMPUS: {campusTitle}
        </span>
      </div>
    );
  }

  const paths = pathname.split('/').filter(Boolean);
  if (paths.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400 font-bold mb-6 select-none">
      <Link
        href="/"
        className="hover:text-slate-950 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
      >
        <Home className="w-3.5 h-3.5 text-slate-600 dark:text-zinc-400" />
      </Link>

      {paths.map((p, idx) => {
        const href = '/' + paths.slice(0, idx + 1).join('/');
        const isLast = idx === paths.length - 1;
        const title = p.replace('-', ' ');

        return (
          <React.Fragment key={href}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-950 dark:text-zinc-50 font-extrabold capitalize truncate">
                {title}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-slate-950 dark:hover:text-zinc-100 transition-colors capitalize"
              >
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

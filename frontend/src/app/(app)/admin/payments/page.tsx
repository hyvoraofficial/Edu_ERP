'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/finance');
  }, [router]);

  return (
    <div className="p-16 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-xs font-bold text-slate-600 animate-pulse">Loading Payments Ledger...</p>
    </div>
  );
}

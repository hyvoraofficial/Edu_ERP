import * as React from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['ACADEMY_ADMIN', 'SUPER_ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar - hides on mobile, shown on desktop */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
            <Breadcrumb />
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

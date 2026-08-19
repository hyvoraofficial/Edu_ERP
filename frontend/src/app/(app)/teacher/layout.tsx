import * as React from 'react';
import { Sidebar } from '@/components/shared/Sidebar';
import { Navbar } from '@/components/shared/Navbar';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function TeacherPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={['TEACHER', 'ACADEMY_ADMIN', 'SUPER_ADMIN']}>
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>
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

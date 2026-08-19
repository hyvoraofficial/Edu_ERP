'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/config/roles';
import { ShieldAlert, Lock, ArrowRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getAuthToken } from '@/config/api.config';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, role, token, logout } = useAuthStore();

  const [isChecking, setIsChecking] = React.useState(true);
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    // 1. Check if token exists in store, localStorage, or cookies
    const currentToken = token || getAuthToken();
    const storedUser = localStorage.getItem('auth-user');
    const storedRole = (localStorage.getItem('auth-role') || role) as UserRole | null;

    if (!currentToken || !storedUser) {
      // Unauthenticated -> redirect to login immediately
      setIsAuthorized(false);
      setIsChecking(false);
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Check Role permissions if restricted
    if (allowedRoles && allowedRoles.length > 0) {
      const activeRole = storedRole || role;
      if (!activeRole || !allowedRoles.includes(activeRole)) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [pathname, token, user, role, allowedRoles, router]);

  // Loading state while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 select-none">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Authenticating Access...</h3>
            <p className="text-xs text-zinc-500">Verifying security token and portal permissions.</p>
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // Unauthorized Access Screen (Role mismatch)
  if (!isAuthorized) {
    const activeRole = role || (localStorage.getItem('auth-role') as UserRole) || 'UNKNOWN';
    const activeEmail = user?.email || 'Logged in user';

    let targetPortal = '/login';
    if (activeRole === 'SUPER_ADMIN') targetPortal = '/super-admin';
    else if (activeRole === 'ACADEMY_ADMIN') targetPortal = '/admin';
    else if (activeRole === 'TEACHER') targetPortal = '/teacher';
    else if (activeRole === 'STUDENT') targetPortal = '/student';

    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 select-none">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-lg animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <Badge variant="error" className="px-3 py-1 font-bold">
              403 Unauthorized Access
            </Badge>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Access Restricted
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your active account (<strong className="text-zinc-700 dark:text-zinc-300">{activeEmail}</strong>) with role{' '}
              <Badge variant="outline" className="font-mono text-[10px] uppercase ml-1">
                {activeRole}
              </Badge>{' '}
              does not have permission to view the requested portal page (
              <span className="font-mono text-zinc-600 dark:text-zinc-400">{pathname}</span>).
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {targetPortal !== '/login' && (
              <Button onClick={() => router.push(targetPortal)} className="w-full h-10 gap-2 cursor-pointer">
                Go to My Permitted Portal <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                logout();
                localStorage.removeItem('auth-user');
                localStorage.removeItem('auth-role');
                localStorage.removeItem('auth-token');
                document.cookie = 'mock-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                router.push('/login');
              }}
              className="w-full h-10 gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Log Out & Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import * as React from 'react';
import { useAuthStore, UserSession } from '@/store/useAuthStore';
import { UserRole } from '@/config/roles';

// Helper to get cookies client-side
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      const val = c.substring(nameEQ.length, c.length);
      if (val && val !== 'null' && val !== 'undefined') return val;
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    const syncSession = () => {
      let token = getCookie('mock-auth-token') || sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
      const storedUser = sessionStorage.getItem('auth-user') || localStorage.getItem('auth-user');
      const storedRole = sessionStorage.getItem('auth-role') || localStorage.getItem('auth-role');

      if (!token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.token) token = parsedUser.token;
        } catch (e) {}
      }

      if (token && storedUser && storedRole) {
        try {
          const user = JSON.parse(storedUser) as UserSession;
          const role = storedRole as UserRole;
          document.cookie = `mock-auth-token=${token}; path=/; max-age=604800; SameSite=Lax`;
          localStorage.setItem('auth-token', token);
          login(user, role, token);
        } catch (err) {
          console.error('Failed to restore authentication session:', err);
          logout();
        }
      } else {
        logout();
      }
      setIsInitializing(false);
    };

    syncSession();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-user' || e.key === 'auth-token' || e.key === 'auth-role') {
        syncSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [login, logout]);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-zinc-500 animate-pulse">Initializing Portal Session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

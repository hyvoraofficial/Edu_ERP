import { create } from 'zustand';
import { UserRole } from '@/config/roles';

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  academyId: string;
}

interface AuthState {
  user: UserSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (session: UserSession, role: UserRole, token: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  token: null,
  login: (user, role, token) => set({ user, role, token, isAuthenticated: true }),
  logout: () => set({ user: null, role: null, token: null, isAuthenticated: false }),
  setRole: (role) => set({ role }),
}));

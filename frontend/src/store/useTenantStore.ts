import { create } from 'zustand';
import { Academy, AcademySettings } from '@/types/academy';

interface TenantState {
  academy: Academy | null;
  settings: AcademySettings | null;
  setTenant: (academy: Academy, settings: AcademySettings) => void;
  resetTenant: () => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  academy: null,
  settings: null,
  setTenant: (academy, settings) => {
    // If settings define dynamic primary/secondary colors, inject them into style root
    if (typeof window !== 'undefined' && settings) {
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--secondary-color', settings.secondaryColor);
    }
    set({ academy, settings });
  },
  resetTenant: () => {
    if (typeof window !== 'undefined') {
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--secondary-color');
    }
    set({ academy: null, settings: null });
  },
}));

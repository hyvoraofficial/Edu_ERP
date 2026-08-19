export interface ThemeBranding {
  name: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string; // HEX
  secondaryColor: string; // HEX
  darkTheme: boolean;
}

export const PLATFORM_BRANDING: ThemeBranding = {
  name: 'HYVORA',
  primaryColor: '#4F46E5', // Indigo
  secondaryColor: '#06B6D4', // Cyan
  darkTheme: false
};

export const DEFAULT_ACADEMY_BRANDING: ThemeBranding = {
  name: 'Demo Academy',
  primaryColor: '#3B82F6', // Blue
  secondaryColor: '#10B981', // Emerald
  darkTheme: false
};

import { ThemeBranding } from '@/config/theme';

export interface Academy {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface AcademySettings extends ThemeBranding {
  id: string;
  academyId: string;
  address?: string;
  phone?: string;
  email?: string;
  timezone: string;
  currency: string;
  smtpSettings: Record<string, any>;
  paymentGatewayKeys: Record<string, any>;
  socialLinks: Record<string, string>;
  seoSettings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

'use client';

import * as React from 'react';
import { useTenantStore } from '@/store/useTenantStore';
import { Academy, AcademySettings } from '@/types/academy';

// Demo Tenant (Hyvora Academy matching the database seed)
const HYVORA_ACADEMY: Academy = {
  id: 'a1111111-1111-1111-1111-111111111111',
  name: 'Hyvora Academy',
  subdomain: 'hyvora',
  domain: 'hyvora.edu',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const HYVORA_SETTINGS: AcademySettings = {
  id: 'a2222222-2222-2222-2222-222222222222',
  academyId: 'a1111111-1111-1111-1111-111111111111',
  name: 'Hyvora Academy',
  primaryColor: '#4F46E5', // Indigo
  secondaryColor: '#06B6D4', // Cyan
  darkTheme: false,
  address: '123 Science Park Drive, Tech City, Karnataka, India',
  phone: '+91-9876543210',
  email: 'info@hyvora.com',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  smtpSettings: {},
  paymentGatewayKeys: {},
  socialLinks: { facebook: 'facebook.com/hyvora' },
  seoSettings: { meta_title: 'Hyvora Academy' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { setTenant, academy } = useTenantStore();

  React.useEffect(() => {
    // In demo mode, load Hyvora Academy variables automatically
    if (!academy) {
      setTenant(HYVORA_ACADEMY, HYVORA_SETTINGS);
    }
  }, [academy, setTenant]);

  return <>{children}</>;
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/providers/ToastProvider';
import { Globe, Layout, Image as ImageIcon, Save, Check } from 'lucide-react';

export default function WebsiteCmsPage() {
  const { toast } = useToast();
  const [heroTitle, setHeroTitle] = React.useState('Transforming Education Through Digital Excellence');
  const [heroSubtitle, setHeroSubtitle] = React.useState('Empowering students and faculty with modern learning management and institute ERP.');
  const [contactEmail, setContactEmail] = React.useState('admissions@hyvora.edu');
  const [contactPhone, setContactPhone] = React.useState('+91 98765 43210');
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaved(true);
    toast('Settings Saved', 'Website CMS content updated successfully.', 'success');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Website CMS Configuration</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage academy public landing page content, banner text, and contact info.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 h-10">
          {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'Saved!' : 'Save CMS Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-900">Homepage Hero Banner</h3>
          </div>
          <Input
            label="Hero Title"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Hero Tagline / Subtitle</label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Layout className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-900">Institute Contact Details</h3>
          </div>
          <Input
            label="Admissions Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Input
            label="Helpline Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </Card>
      </div>
    </div>
  );
}

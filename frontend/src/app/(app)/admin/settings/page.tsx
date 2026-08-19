'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, Save, Check } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [academyName, setAcademyName] = React.useState('Hyvora Academy');
  const [primaryColor, setPrimaryColor] = React.useState('#4f46e5');
  const [academicYear, setAcademicYear] = React.useState('2026-2027');
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = () => {
    setIsSaved(true);
    toast('Settings Saved', 'Academy ERP settings saved.', 'success');
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">ERP Portal Settings</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Customize branding theme, academic term settings, and parameters.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 h-10">
          {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          {isSaved ? 'Saved!' : 'Save System Settings'}
        </Button>
      </div>

      <Card className="max-w-2xl space-y-4 p-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Settings className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-slate-900">Branding & Academic Parameters</h3>
        </div>

        <Input
          label="Academy Display Name"
          value={academyName}
          onChange={(e) => setAcademyName(e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700">Brand Primary Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-700">{primaryColor}</span>
          </div>
        </div>

        <Input
          label="Current Academic Session / Year"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />
      </Card>
    </div>
  );
}

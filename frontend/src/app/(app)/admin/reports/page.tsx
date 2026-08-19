'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileSpreadsheet, Download, FileText } from 'lucide-react';
import { useToast } from '@/providers/ToastProvider';

export default function ReportsPage() {
  const { toast } = useToast();

  const handleExport = (reportName: string) => {
    toast('Generating Export', `Preparing CSV/Excel file for ${reportName}...`, 'success');
  };

  const reports = [
    { title: 'Student Enrollment Master Register', desc: 'Full student demographic data, batch assignments, and contact details.' },
    { title: 'Monthly Fee Collection Ledger', desc: 'Detailed breakdown of offline and online Razorpay payments.' },
    { title: 'Subject-wise Attendance Breakdown', desc: 'Monthly rollcall percentage per student and cohort.' },
    { title: 'Teacher Workload & Class Schedules', desc: 'Assigned subject schedules and active teaching hours.' }
  ];

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Reports & Data Export</h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">Generate and download CSV reports for administrative compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((rep, idx) => (
          <Card key={idx} className="p-5 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
              </div>
              <p className="text-xs text-slate-500">{rep.desc}</p>
            </div>
            <Button variant="secondary" onClick={() => handleExport(rep.title)} className="gap-2 h-9 text-xs w-fit">
              <Download className="w-3.5 h-3.5" /> Download Export (.CSV)
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

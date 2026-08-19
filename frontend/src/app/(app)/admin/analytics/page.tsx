'use client';

import * as React from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GraduationCap, Users, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import { MOCK_ANALYTICS, MOCK_STUDENTS } from '@/lib/mockData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function AnalyticsPage() {
  // Columns for student table
  const studentColumns = [
    {
      header: 'Student Name',
      accessor: (row: typeof MOCK_STUDENTS[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-extrabold text-xs text-primary border border-primary/30 shrink-0">
            {row.firstName.substring(0, 1)}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-950 text-xs">{row.firstName} {row.lastName}</span>
            <span className="text-[11px] font-bold text-slate-600">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Admission No',
      accessor: (row: typeof MOCK_STUDENTS[0]) => (
        <span className="font-mono text-xs font-extrabold text-slate-900">{row.admissionNumber}</span>
      ),
    },
    {
      header: 'Parent Contact',
      accessor: (row: typeof MOCK_STUDENTS[0]) => (
        <div className="flex flex-col text-xs font-bold text-slate-800">
          <span>{row.parentName}</span>
          <span className="text-[11px] text-slate-600 font-mono">{row.parentPhone}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row: typeof MOCK_STUDENTS[0]) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none p-8">
      {/* Welcome header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-950">
          Academy Analytics & Metrics
        </h1>
        <p className="text-xs text-slate-600 font-extrabold">
          Real-time metrics, revenue trends, and operational metrics for Hyvora Academy.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={MOCK_ANALYTICS.totalStudents}
          description="Active admissions"
          change={12}
          isPositive={true}
          icon={<GraduationCap className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Academic Faculty"
          value={MOCK_ANALYTICS.totalTeachers}
          description="Teachers & tutors"
          change={4}
          isPositive={true}
          icon={<Users className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Active Batches"
          value={MOCK_ANALYTICS.totalCourses}
          description="Active cohorts"
          change={0}
          isPositive={true}
          icon={<Calendar className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Monthly Collections"
          value={`₹${MOCK_ANALYTICS.monthlyRevenue.toLocaleString()}`}
          description="Income ledger"
          change={8}
          isPositive={true}
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Analytical Charts and Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Trends Graph */}
        <Card className="lg:col-span-2 flex flex-col gap-4 border border-slate-200 bg-white shadow-xs">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-extrabold text-slate-950">Revenue Ledger Trends</h3>
              <p className="text-xs text-slate-600 font-bold">Monthly invoice collections over last 6 months.</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-64 w-full text-xs font-bold">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS.revenueHistory}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} />
                <XAxis dataKey="name" stroke="#1e293b" tickLine={false} />
                <YAxis stroke="#1e293b" tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Attendance Statistics Summary */}
        <Card className="flex flex-col justify-between border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-extrabold text-slate-950">Attendance Statistics</h3>
            <p className="text-xs text-slate-600 font-bold">Average weekly attendance rate.</p>
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Circular gauge */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="#cbd5e1" strokeWidth="8" fill="transparent" />
                <circle cx="72" cy="72" r="64" stroke="#4f46e5" strokeWidth="8" fill="transparent"
                  strokeDasharray={402}
                  strokeDashoffset={402 - (402 * MOCK_ANALYTICS.attendancePercentage) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black tracking-tight text-slate-950">{MOCK_ANALYTICS.attendancePercentage}%</span>
                <span className="text-[10px] text-slate-600 uppercase font-black">Weekly Avg</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-4 text-xs font-bold text-slate-800 flex justify-between">
            <span>Target Goal: 95.0%</span>
            <span className="text-emerald-700 font-extrabold">Normal Range</span>
          </div>
        </Card>
      </div>

      {/* Recent Admissions list */}
      <Card className="flex flex-col gap-4 border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-extrabold text-slate-950">Recent Student Admissions</h3>
          <p className="text-xs text-slate-600 font-bold">Newly registered students in the current batch.</p>
        </div>
        <DataTable
          columns={studentColumns}
          data={MOCK_STUDENTS}
          searchPlaceholder="Search students..."
          searchKey="firstName"
        />
      </Card>
    </div>
  );
}

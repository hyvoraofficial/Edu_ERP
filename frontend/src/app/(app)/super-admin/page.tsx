'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/Badge';
import { School, CreditCard, BarChart3, Activity, ArrowUpRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function SuperAdminDashboard() {
  // Demo tenant academies data
  const academiesData = [
    { id: '1', name: 'Hyvora Academy', subdomain: 'hyvora', tier: 'Enterprise', status: 'active', renewalDate: '2027-03-31' },
    { id: '2', name: 'Apex Learning Academy', subdomain: 'apex', tier: 'Premium', status: 'active', renewalDate: '2026-12-15' },
    { id: '3', name: 'St. Mary School', subdomain: 'stmarys', tier: 'Standard', status: 'active', renewalDate: '2026-09-01' },
    { id: '4', name: 'Bright Horizon Tutoring', subdomain: 'brighthorizon', tier: 'Basic', status: 'suspended', renewalDate: '2026-06-30' },
  ];

  const columns = [
    {
      header: 'Academy Name',
      accessor: (row: typeof academiesData[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
            {row.name.substring(0, 1)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{row.name}</span>
            <span className="text-xs text-zinc-400 font-mono">{row.subdomain}.hyvora.com</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Subscription Tier',
      accessor: (row: typeof academiesData[0]) => (
        <span className="font-semibold text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 border border-zinc-100 dark:bg-zinc-800/40 dark:border-zinc-800 px-2 py-0.5 rounded-lg">
          {row.tier}
        </span>
      ),
    },
    {
      header: 'Renewal Date',
      accessor: (row: typeof academiesData[0]) => (
        <span className="text-xs font-mono">{row.renewalDate}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: typeof academiesData[0]) => (
        <Badge variant={row.status === 'active' ? 'success' : 'error'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  // Platform revenue trends
  const platformRevenue = [
    { month: 'Jan', revenue: 1200000 },
    { month: 'Feb', revenue: 1400000 },
    { month: 'Mar', revenue: 1350000 },
    { month: 'Apr', revenue: 1650000 },
    { month: 'May', revenue: 1800000 },
    { month: 'Jun', revenue: 1950000 },
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Header welcome */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          HYVORA Platform Control Center
        </h1>
        <p className="text-sm text-zinc-400 font-medium">
          Global platform stats, SaaS tenant registrations, and subscription trackers.
        </p>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Academies"
          value="4 Tenants"
          description="Registered domains"
          change={25}
          isPositive={true}
          icon={<School className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Platform Subscriptions"
          value="3 Premium"
          description="Enterprise / Premium tiers"
          change={10}
          isPositive={true}
          icon={<CreditCard className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Platform Revenue (MRR)"
          value="₹1,950,000"
          description="SaaS billing collection"
          change={8.3}
          isPositive={true}
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
        />
        <StatsCard
          title="Cluster Health Status"
          value="99.98%"
          description="AWS / Supabase node healthy"
          icon={<Activity className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Revenue Charts and Tenants list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global SaaS Platform Revenue */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Global SaaS Revenue Trends</h3>
              <p className="text-xs text-zinc-400">Monthly subscription collections across all academy platforms.</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="h-64 w-full text-xs font-semibold">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="var(--primary-color)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Global Server Health */}
        <Card className="flex flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">System Log Telemetry</h3>
              <p className="text-xs text-zinc-400">AWS load balancers metrics.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">Database node replication delay:</span>
                <span className="text-emerald-500">0.2ms (healthy)</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">S3 File Vault storage used:</span>
                <span>284.5 GB (of 1 TB)</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">Email dispatch success:</span>
                <span className="text-emerald-500">99.96%</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-500">Daily API Hits:</span>
                <span>124,562 calls</span>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 text-xs font-semibold text-zinc-500 flex justify-between">
            <span>Uptime: 14 days, 6 hours</span>
            <span className="text-emerald-500">All Nodes Active</span>
          </div>
        </Card>
      </div>

      {/* SaaS Tenants grid */}
      <Card className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Registered SaaS Academy Tenants</h3>
          <p className="text-xs text-zinc-400">List of educational academies utilizing the HYVORA platform.</p>
        </div>
        <DataTable
          columns={columns}
          data={academiesData}
          searchPlaceholder="Search academies..."
          searchKey="name"
        />
      </Card>
    </div>
  );
}

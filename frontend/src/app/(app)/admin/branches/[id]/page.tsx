'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Mail, Phone, User, Calendar, GraduationCap, Users, BookOpen, Layers, Settings 
} from 'lucide-react';
import { branchService, Branch } from '@/services/branch.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';

export default function BranchDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const id = params?.id as string;

  const [branch, setBranch] = React.useState<Branch | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const data = await branchService.findOne(id);
        setBranch(data);
      } catch (err: any) {
        toast('Failed to load branch details', err.message || 'Server error', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-zinc-500 animate-pulse">Loading Branch Statistics...</p>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Branch not found</h2>
        <Button onClick={() => router.push('/admin/branches')} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      
      {/* Back button and title info */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/admin/branches')}
          className="p-2 rounded-xl border border-border bg-card text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {branch.name}
            </h1>
            <Badge variant={branch.status === 'active' ? 'success' : 'neutral'}>
              {branch.status}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            System Code: <span className="font-bold text-zinc-700 dark:text-zinc-300">{branch.code}</span>
          </p>
        </div>
      </div>

      {/* Grid containing Stats & Info card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric counts columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 flex items-center gap-4 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Enrolled Students</p>
                <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">
                  {branch._count?.students || 0}
                </h4>
              </div>
            </Card>

            <Card className="p-6 flex items-center gap-4 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assigned Teachers</p>
                <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">
                  {branch._count?.teachers || 0}
                </h4>
              </div>
            </Card>

            <Card className="p-6 flex items-center gap-4 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Available Courses</p>
                <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">
                  {branch._count?.courses || 0}
                </h4>
              </div>
            </Card>

            <Card className="p-6 flex items-center gap-4 border border-border">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Batches</p>
                <h4 className="text-2xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">
                  {branch._count?.batches || 0}
                </h4>
              </div>
            </Card>
          </div>

          {/* Full address card */}
          <Card className="p-6 border border-border space-y-4">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Branch Facility Address
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block uppercase">Street Address</span>
                <span className="text-zinc-700 dark:text-zinc-300">{branch.address}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block uppercase">City / Municipality</span>
                <span className="text-zinc-700 dark:text-zinc-300">{branch.city}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block uppercase">State / Territory</span>
                <span className="text-zinc-700 dark:text-zinc-300">{branch.state}</span>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-semibold block uppercase">Postal Pincode</span>
                <span className="text-zinc-700 dark:text-zinc-300">{branch.pincode}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact details sidebar card */}
        <div className="space-y-6">
          <Card className="p-6 border border-border space-y-6">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50 flex items-center gap-2 pb-3 border-b border-border">
              <Settings className="w-5 h-5 text-primary" /> Contact Details
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Branch Manager</p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate mt-0.5">
                    {branch.manager || 'Not Assigned'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Contact Email</p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate mt-0.5">
                    {branch.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Phone number</p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate mt-0.5">
                    {branch.contactNumber}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Registered Date</p>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate mt-0.5">
                    {new Date(branch.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}

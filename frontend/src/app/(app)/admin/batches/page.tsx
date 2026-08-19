'use client';

import * as React from 'react';
import { 
  Plus, Search, Edit2, Trash2, Layers, RefreshCw, X, AlertTriangle, Calendar, Users 
} from 'lucide-react';
import { batchService, Batch } from '@/services/batch.service';
import { branchService, Branch } from '@/services/branch.service';
import { courseService, Course } from '@/services/course.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/providers/ToastProvider';
import { useBranchContext } from '@/providers/BranchProvider';

export default function BatchesPage() {
  const { toast } = useToast();
  const { selectedBranchId } = useBranchContext();
  
  // Data lists states
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  
  // Pagination & query states
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [branchFilter, setBranchFilter] = React.useState(selectedBranchId);
  const [courseFilter, setCourseFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setBranchFilter(selectedBranchId);
  }, [selectedBranchId]);

  // Modals states
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedBatch, setSelectedBatch] = React.useState<Batch | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [batchToDelete, setBatchToDelete] = React.useState<Batch | null>(null);

  // Form states
  const [formName, setFormName] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formBranchId, setFormBranchId] = React.useState('');
  const [formCourseId, setFormCourseId] = React.useState('');
  const [formCapacity, setFormCapacity] = React.useState(30);
  const [formStartDate, setFormStartDate] = React.useState('');
  const [formEndDate, setFormEndDate] = React.useState('');
  const [formStatus, setFormStatus] = React.useState('active');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Load branches & courses lists for filters/forms
  React.useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [resBranches, resCourses] = await Promise.all([
          branchService.findAll('', 'active', 1, 100),
          courseService.findAll('', '', 'active', 1, 100),
        ]);
        setBranches(resBranches.branches);
        setCourses(resCourses.courses);
      } catch (err: any) {
        console.error('Failed to load filters dropdown data:', err);
      }
    };
    fetchDropdowns();
  }, []);

  const fetchBatches = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await batchService.findAll(search, branchFilter, courseFilter, statusFilter, page, limit);
      setBatches(res.batches);
      setTotal(res.meta.total);
    } catch (err: any) {
      toast('Failed to load batches', err.message || 'Server error', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, branchFilter, courseFilter, statusFilter, page, limit, toast]);

  React.useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleOpenCreateModal = () => {
    setFormName('');
    setFormCode('');
    setFormBranchId(branches[0]?.id || '');
    setFormCourseId(courses[0]?.id || '');
    setFormCapacity(30);
    setFormStartDate('');
    setFormEndDate('');
    setFormStatus('active');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setFormName(batch.name);
    setFormCode(batch.code);
    setFormBranchId(batch.branchId);
    setFormCourseId(batch.courseId);
    setFormCapacity(batch.capacity || 30);
    setFormStartDate(batch.startDate.substring(0, 10));
    setFormEndDate(batch.endDate.substring(0, 10));
    setFormStatus(batch.status);
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBranchId || !formCourseId) {
      toast('Validation Error', 'Please select both a valid branch and course.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await batchService.create({
        name: formName,
        code: formCode,
        branchId: formBranchId,
        courseId: formCourseId,
        capacity: Number(formCapacity),
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
      });
      toast('Success', 'Batch provisioned successfully.', 'success');
      setIsCreateModalOpen(false);
      fetchBatches();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not provision study batch.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    setIsSubmitting(true);
    try {
      await batchService.update(selectedBatch.id, {
        name: formName,
        code: formCode,
        branchId: formBranchId,
        courseId: formCourseId,
        capacity: Number(formCapacity),
        startDate: formStartDate,
        endDate: formEndDate,
        status: formStatus,
      });
      toast('Success', 'Batch updated successfully.', 'success');
      setIsEditModalOpen(false);
      fetchBatches();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update batch parameters.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (batch: Batch) => {
    setBranchToDelete(batch);
    setBatchToDelete(batch);
    setIsConfirmDeleteOpen(true);
  };

  // Dummy setter to keep typescript happy
  const setBranchToDelete = (b: Batch) => {};

  const handleDeleteConfirm = async () => {
    if (!batchToDelete) return;
    try {
      await batchService.remove(batchToDelete.id);
      toast('Success', 'Batch archived successfully.', 'success');
      setIsConfirmDeleteOpen(false);
      fetchBatches();
    } catch (err: any) {
      toast('Archiving Failed', err.message || 'Ensure no active students exist before deletion.', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Batch Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Provision academic class intakes, specify student limits, and schedule active semesters.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="h-10 shrink-0 gap-2" disabled={branches.length === 0 || courses.length === 0}>
          <Plus className="w-4 h-4" /> Create Batch
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search batch name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background font-medium text-zinc-700 dark:text-zinc-300"
          />
        </div>
        <div className="flex flex-wrap w-full lg:w-auto gap-4 items-center justify-end">
          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <Button variant="secondary" onClick={fetchBatches} className="h-10 gap-1.5 shrink-0">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </Card>

      {/* Main Table view */}
      <Card className="overflow-hidden border border-border">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-zinc-500 animate-pulse">Loading Batch Rosters...</p>
          </div>
        ) : batches.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">No Batches Configured</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                No matching batch intakes found in this academy branch layout.
              </p>
            </div>
            <Button onClick={handleOpenCreateModal} className="h-9 gap-2" disabled={branches.length === 0 || courses.length === 0}>
              <Plus className="w-4 h-4" /> Provision First Batch
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-4">Batch Detail</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Branch / Course</th>
                  <th className="px-6 py-4">Dates / Semester</th>
                  <th className="px-6 py-4">Students Enrolled</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-zinc-700 dark:text-zinc-300">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50 block">
                        {batch.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs rounded font-bold">
                        {batch.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{batch.branch?.name}</span>
                        <span className="text-xs text-zinc-400">{batch.course?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-zinc-500 gap-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-400" /> 
                          {new Date(batch.startDate).toLocaleDateString(undefined, { dateStyle: 'short' })} – {new Date(batch.endDate).toLocaleDateString(undefined, { dateStyle: 'short' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-800 dark:text-zinc-200">
                          {batch._count?.students || 0}
                        </span>
                        <span className="text-zinc-400">/</span>
                        <span className="text-xs text-zinc-400">
                          {batch.capacity} capacity
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={batch.status === 'active' ? 'success' : 'neutral'}>
                        {batch.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(batch)}
                          className="p-2 rounded-lg border border-border text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                          title="Edit Batch"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(batch)}
                          className="p-2 rounded-lg border border-border text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Archive Batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-semibold uppercase">
                  Showing {batches.length} of {total} entries
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="h-8 text-xs px-3"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="h-8 text-xs px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-xl p-6 relative border border-border shadow-xl">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Create New Batch
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
              academy operational intake settings
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Batch Name"
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. 2026 Batch A"
                />
                <Input
                  label="Batch Code"
                  id="code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="e.g. NEET26A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Target Branch
                  </label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Course Scope
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Max Student Capacity"
                  id="capacity"
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  required
                />
                <Input
                  label="Start Date"
                  id="startDate"
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  id="endDate"
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Activation Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/85">
                <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Provisioning...' : 'Provision Batch'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-xl p-6 relative border border-border shadow-xl">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Edit Batch Parameters
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
              {selectedBatch?.name} curriculum item
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Batch Name"
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="e.g. 2026 Batch A"
                />
                <Input
                  label="Batch Code"
                  id="code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="e.g. NEET26A"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Target Branch
                  </label>
                  <select
                    value={formBranchId}
                    onChange={(e) => setFormBranchId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Course Scope
                  </label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Max Student Capacity"
                  id="capacity"
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  required
                />
                <Input
                  label="Start Date"
                  id="startDate"
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date"
                  id="endDate"
                  type="date"
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Activation Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/85">
                <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Parameters'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 border border-border shadow-xl space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Archive Class Intake Batch?
                </h3>
                <p className="text-sm text-zinc-500">
                  Are you sure you want to archive batch <span className="font-semibold text-zinc-700 dark:text-zinc-300">"{batchToDelete?.name}"</span>?
                  This action is soft-reversible but will prevent enrolling new students under this batch.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Archive Batch
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

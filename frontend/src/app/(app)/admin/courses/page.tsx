'use client';

import * as React from 'react';
import { 
  Plus, Search, Edit2, Trash2, BookOpen, RefreshCw, X, AlertTriangle, ArrowUp, ArrowDown 
} from 'lucide-react';
import { courseService, Course } from '@/services/course.service';
import { branchService, Branch } from '@/services/branch.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/providers/ToastProvider';
import { useBranchContext } from '@/providers/BranchProvider';

interface SubjectFormRow {
  id?: string;
  name: string;
  code: string;
  subjectType: string;
  description?: string;
  status?: string;
}

export default function CoursesPage() {
  const { toast } = useToast();
  const { selectedBranchId } = useBranchContext();
  
  // Data lists states
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  
  // Pagination & query states
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(100);
  const [search, setSearch] = React.useState('');
  const [branchFilter, setBranchFilter] = React.useState(selectedBranchId);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setBranchFilter(selectedBranchId);
  }, [selectedBranchId]);

  // Modals states
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = React.useState(false);
  const [courseToDelete, setCourseToDelete] = React.useState<Course | null>(null);

  // Form states
  const [formName, setFormName] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formBranchId, setFormBranchId] = React.useState('');
  const [formStatus, setFormStatus] = React.useState('active');
  const [formSubjects, setFormSubjects] = React.useState<SubjectFormRow[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Load branches list once for filters/forms
  React.useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchService.findAll('', 'active', 1, 100);
        setBranches(res.branches);
      } catch (err: any) {
        console.error('Failed to load branches:', err);
      }
    };
    fetchBranches();
  }, []);

  const fetchCourses = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await courseService.findAll(search, branchFilter, statusFilter, page, limit);
      setCourses(res.courses);
      setTotal(res.meta.total);
    } catch (err: any) {
      toast('Failed to load courses', err.message || 'Server error', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, branchFilter, statusFilter, page, limit, toast]);

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleOpenCreateModal = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormBranchId(branches[0]?.id || selectedBranchId || '');
    setFormStatus('active');
    setFormSubjects([
      { name: '', code: '', subjectType: 'theory', description: '', status: 'active' }
    ]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = async (course: Course) => {
    setSelectedCourse(course);
    setFormName(course.name);
    setFormCode(course.code);
    setFormDescription(course.description || '');
    setFormBranchId(course.branchId);
    setFormStatus(course.status);
    setFormSubjects([]);
    setIsEditModalOpen(true);
    
    try {
      const detail = await courseService.findOne(course.id);
      const subs = (detail.subjects && detail.subjects.length > 0) 
        ? detail.subjects 
        : [{ name: '', code: '', subjectType: 'theory', description: '', status: 'active' }];
      setFormSubjects(subs);
    } catch (err: any) {
      toast('Failed to load course subjects', err.message || 'Server error', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBranchId) {
      toast('Validation Error', 'Please select a valid branch.', 'error');
      return;
    }
    // Filter subjects to ensure name/code exist
    const filteredSubs = formSubjects.filter(s => s.name.trim() && s.code.trim());

    if (filteredSubs.length === 0) {
      toast('Validation Error', 'Please enter at least one subject (Subject Name and Code) for this course.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await courseService.create({
        name: formName,
        code: formCode,
        description: formDescription || undefined,
        branchId: formBranchId,
        status: formStatus,
        subjects: filteredSubs,
      });
      toast('Success', 'Course and subjects created successfully.', 'success');
      setIsCreateModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not provision course.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    
    const filteredSubs = formSubjects.filter(s => s.name.trim() && s.code.trim());

    setIsSubmitting(true);
    try {
      await courseService.update(selectedCourse.id, {
        name: formName,
        code: formCode,
        description: formDescription || undefined,
        branchId: formBranchId,
        status: formStatus,
        subjects: filteredSubs,
      });
      toast('Success', 'Course and subjects updated successfully.', 'success');
      setIsEditModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update course details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (course: Course) => {
    setCourseToDelete(course);
    setIsConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      await courseService.remove(courseToDelete.id);
      toast('Success', 'Course archived successfully.', 'success');
      setIsConfirmDeleteOpen(false);
      fetchCourses();
    } catch (err: any) {
      toast('Archiving Failed', err.message || 'Ensure no active dependencies exist before deletion.', 'error');
    }
  };

  // Inline subjects list helpers
  const addSubjectRow = () => {
    setFormSubjects(prev => [
      ...prev,
      { name: '', code: '', subjectType: 'theory', description: '', status: 'active' }
    ]);
  };

  const removeSubjectRow = (index: number) => {
    setFormSubjects(prev => {
      const target = prev[index];
      if (target.id) {
        const next = [...prev];
        next[index] = { ...next[index], status: 'deleted' };
        return next;
      } else {
        return prev.filter((_, i) => i !== index);
      }
    });
  };

  const updateSubjectField = (index: number, field: keyof SubjectFormRow, value: string) => {
    setFormSubjects(prev => {
      const next = [...prev];
      const current = { ...next[index], [field]: value };
      if (field === 'name' && (!current.code || current.code.endsWith('-10' + (index + 1)))) {
        const cleaned = value.trim().toUpperCase();
        if (cleaned) {
          const words = cleaned.split(/\s+/);
          const prefix = words.length > 1 
            ? words.map(w => w[0]).join('').substring(0, 4) 
            : cleaned.substring(0, 4);
          current.code = `${prefix}-10${index + 1}`;
        }
      }
      next[index] = current;
      return next;
    });
  };

  const moveSubjectRow = (index: number, direction: 'up' | 'down') => {
    setFormSubjects(prev => {
      const next = [...prev];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target >= 0 && target < next.length) {
        const temp = next[index];
        next[index] = next[target];
        next[target] = temp;
      }
      return next;
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-8 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Course Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Provision academic courses, configure curriculum branches, and manage activation status.
          </p>
        </div>
        <Button onClick={handleOpenCreateModal} className="h-10 shrink-0 gap-2" disabled={branches.length === 0}>
          <Plus className="w-4 h-4" /> Create Course
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search course name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background font-medium text-zinc-700 dark:text-zinc-300"
          />
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-end">
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

          <Button variant="secondary" onClick={fetchCourses} className="h-10 gap-1.5 shrink-0">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </Card>

      {/* Main Table view */}
      <Card className="overflow-hidden border border-border">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-zinc-500 animate-pulse">Loading Course List...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">No Courses Provisions</h3>
              <p className="text-sm text-zinc-500 max-w-sm">
                No matching course records found in this academy branch layout.
              </p>
            </div>
            <Button onClick={handleOpenCreateModal} className="h-9 gap-2" disabled={branches.length === 0}>
              <Plus className="w-4 h-4" /> Provision First Course
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="px-6 py-4">Course Detail</th>
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Mapped Branch</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium text-zinc-700 dark:text-zinc-300">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-50 block">
                        {course.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs rounded font-bold">
                        {course.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {course.branch?.name || 'Not mapped'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-400 truncate max-w-xs block">
                        {course.description || 'No description'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={course.status === 'active' ? 'success' : 'neutral'}>
                        {course.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(course)}
                          className="p-2 rounded-lg border border-border text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                          title="Edit Course"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(course)}
                          className="p-2 rounded-lg border border-border text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Archive Course"
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
                  Showing {courses.length} of {total} entries
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 relative border border-border shadow-xl my-8">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Create New Course
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
              academic curriculum settings
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Course Name"
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                <Input
                  label="Course Code"
                  id="code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="e.g. JEE-2026"
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
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300"
                />
              </div>

              {/* Subjects Sub-Form */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center bg-primary/5 p-3 rounded-xl border border-primary/20">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">Course Subjects (Required)</span>
                    <span className="text-[11px] text-zinc-500">Define the subjects taught inside this course curriculum.</span>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={addSubjectRow} className="text-xs h-8 gap-1.5 font-semibold">
                    <Plus className="w-3.5 h-3.5" /> Add Subject
                  </Button>
                </div>

                <div className="space-y-3">
                  {formSubjects.map((sub, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-border rounded-xl">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Subject Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Physics"
                            value={sub.name}
                            onChange={(e) => updateSubjectField(i, 'name', e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Subject Code *</label>
                          <input
                            type="text"
                            placeholder="e.g. PHY-101"
                            value={sub.code}
                            onChange={(e) => updateSubjectField(i, 'code', e.target.value)}
                            className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-semibold text-zinc-400 block mb-1">Type</label>
                          <select
                            value={sub.subjectType}
                            onChange={(e) => updateSubjectField(i, 'subjectType', e.target.value)}
                            className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs cursor-pointer font-medium"
                          >
                            <option value="theory">Theory</option>
                            <option value="practical">Practical</option>
                            <option value="lab">Lab</option>
                          </select>
                        </div>
                        <div className="col-span-2 flex justify-end gap-1 pt-4">
                          <button
                            type="button"
                            onClick={() => moveSubjectRow(i, 'up')}
                            disabled={i === 0}
                            className="p-1.5 rounded bg-card hover:bg-zinc-100 text-zinc-500 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSubjectRow(i, 'down')}
                            disabled={i === formSubjects.length - 1}
                            className="p-1.5 rounded bg-card hover:bg-zinc-100 text-zinc-500 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSubjectRow(i)}
                            className="p-1.5 rounded bg-card hover:bg-rose-50 hover:text-rose-500 text-zinc-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formSubjects.length === 0 && (
                    <div className="text-center py-4 text-xs font-semibold text-zinc-400">No subjects added. Click "Add Subject" above to define curriculum subjects.</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/85">
                <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Provisioning...' : 'Provision Course'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 relative border border-border shadow-xl my-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Edit Course Parameters
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
              {selectedCourse?.name} curriculum item
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Course Name"
                  id="editName"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                <Input
                  label="Course Code"
                  id="editCode"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  required
                  placeholder="e.g. JEE-2026"
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
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Description
                </label>
                <textarea
                  id="editDescription"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300"
                />
              </div>

              {/* Subjects Sub-Form */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subjects Curriculum</span>
                  <Button type="button" size="sm" variant="secondary" onClick={addSubjectRow} className="text-xs h-8">
                    Add Subject
                  </Button>
                </div>

                <div className="space-y-3">
                  {formSubjects.filter(s => s.status !== 'deleted').map((sub, i) => {
                    const originalIndex = formSubjects.indexOf(sub);
                    return (
                      <div key={originalIndex} className="flex flex-col gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 border border-border rounded-xl">
                        <div className="grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-5">
                            <input
                              type="text"
                              placeholder="Subject Name"
                              value={sub.name}
                              onChange={(e) => updateSubjectField(originalIndex, 'name', e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                              required
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="text"
                              placeholder="Code"
                              value={sub.code}
                              onChange={(e) => updateSubjectField(originalIndex, 'code', e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs"
                              required
                            />
                          </div>
                          <div className="col-span-2">
                            <select
                              value={sub.subjectType}
                              onChange={(e) => updateSubjectField(originalIndex, 'subjectType', e.target.value)}
                              className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                            >
                              <option value="theory">Theory</option>
                              <option value="practical">Practical</option>
                              <option value="lab">Lab</option>
                            </select>
                          </div>
                          <div className="col-span-2 flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => moveSubjectRow(originalIndex, 'up')}
                              disabled={i === 0}
                              className="p-1.5 rounded bg-card hover:bg-zinc-100 text-zinc-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSubjectRow(originalIndex, 'down')}
                              disabled={i === formSubjects.filter(s => s.status !== 'deleted').length - 1}
                              className="p-1.5 rounded bg-card hover:bg-zinc-100 text-zinc-500 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSubjectRow(originalIndex)}
                              className="p-1.5 rounded bg-card hover:bg-rose-50 hover:text-rose-500 text-zinc-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {formSubjects.filter(s => s.status !== 'deleted').length === 0 && (
                    <div className="text-center py-4 text-xs font-semibold text-zinc-400">No subjects initialized. Click "Add Subject" to begin.</div>
                  )}
                </div>
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
                  Delete Course Permanently?
                </h3>
                <p className="text-sm text-zinc-500">
                  Are you sure you want to permanently delete course <span className="font-semibold text-zinc-700 dark:text-zinc-300">"{courseToDelete?.name}"</span>?
                  This action cannot be undone and will permanently remove this course and its subjects from the database.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setIsConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Delete Permanently
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

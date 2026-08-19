'use client';

import * as React from 'react';
import { 
  Plus, Search, Edit2, Trash2, RefreshCw, X, AlertTriangle, Book, Layers, ShieldAlert, Users, UserCheck, CheckCircle
} from 'lucide-react';
import { subjectService, Subject, TeacherAssignment } from '@/services/subject.service';
import { courseService, Course } from '@/services/course.service';
import { branchService, Branch } from '@/services/branch.service';
import { batchService, Batch } from '@/services/batch.service';
import { teacherService, Teacher } from '@/services/teacher.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/providers/ToastProvider';
import { useBranchContext } from '@/providers/BranchProvider';

export default function SubjectsPage() {
  const { toast } = useToast();
  const { selectedBranchId: globalBranchId } = useBranchContext();

  const [activeTab, setActiveTab] = React.useState<'CATALOG' | 'ASSIGNMENTS'>('CATALOG');

  // Catalog state
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [branches, setBranches] = React.useState<Branch[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  // Modal control states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  // Target item state
  const [selectedSubject, setSelectedSubject] = React.useState<Subject | null>(null);

  // Form states - Create / Edit
  const [formName, setFormName] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formDescription, setFormDescription] = React.useState('');
  const [formCourseId, setFormCourseId] = React.useState('');
  const [formType, setFormType] = React.useState<'theory' | 'practical' | 'lab'>('theory');
  const [formStatus, setFormStatus] = React.useState('active');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Teacher Assignment states
  const [assignments, setAssignments] = React.useState<TeacherAssignment[]>([]);
  const [assignBranchId, setAssignBranchId] = React.useState('');
  const [assignCourseId, setAssignCourseId] = React.useState('');
  const [assignSubjectId, setAssignSubjectId] = React.useState('');
  const [assignBatchId, setAssignBatchId] = React.useState('');
  const [assignTeacherId, setAssignTeacherId] = React.useState('');

  const [assignCourses, setAssignCourses] = React.useState<Course[]>([]);
  const [assignSubjects, setAssignSubjects] = React.useState<Subject[]>([]);
  const [assignBatches, setAssignBatches] = React.useState<Batch[]>([]);
  const [teachersList, setTeachersList] = React.useState<Teacher[]>([]);
  const [isAssigning, setIsAssigning] = React.useState(false);

  const fetchCatalogData = React.useCallback(async () => {
    try {
      const [resCourses, resBranches, resTeachers] = await Promise.all([
        courseService.findAll('', globalBranchId || undefined, 'active', 1, 100),
        branchService.findAll('', 'active', 1, 100),
        teacherService.getTeachers(''),
      ]);
      setCourses(resCourses.courses);
      setBranches(resBranches.branches);
      setTeachersList(resTeachers || []);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  }, [globalBranchId]);

  React.useEffect(() => {
    fetchCatalogData();
  }, [fetchCatalogData]);

  const fetchSubjects = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await subjectService.findAll(selectedCourseId || undefined);
      let items = data;
      if (selectedStatusFilter) {
        items = items.filter(s => s.status === selectedStatusFilter);
      }
      if (search) {
        const query = search.toLowerCase();
        items = items.filter(s => 
          s.name.toLowerCase().includes(query) || 
          s.code.toLowerCase().includes(query)
        );
      }
      setSubjects(items);
    } catch (err: any) {
      toast('Failed to load subjects', err.message || 'Server error', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseId, selectedStatusFilter, search, toast]);

  const fetchAssignments = React.useCallback(async () => {
    try {
      const data = await subjectService.getAssignments();
      setAssignments(data);
    } catch (err: any) {
      console.error(err);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'CATALOG') {
      fetchSubjects();
    } else {
      fetchAssignments();
    }
  }, [activeTab, fetchSubjects, fetchAssignments]);

  // Cascade handler for Teacher Assignments
  const handleAssignBranchChange = async (branchId: string) => {
    setAssignBranchId(branchId);
    setAssignCourseId('');
    setAssignSubjectId('');
    setAssignBatchId('');
    setAssignCourses([]);
    setAssignSubjects([]);
    setAssignBatches([]);
    if (branchId) {
      try {
        const res = await courseService.findAll('', branchId, 'active', 1, 100);
        setAssignCourses(res.courses);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAssignCourseChange = async (courseId: string) => {
    setAssignCourseId(courseId);
    setAssignSubjectId('');
    setAssignBatchId('');
    setAssignSubjects([]);
    setAssignBatches([]);
    if (courseId) {
      try {
        const [subs, resBatches] = await Promise.all([
          subjectService.findAll(courseId),
          batchService.findAll('', assignBranchId, courseId, 'active', 1, 100),
        ]);
        setAssignSubjects(subs);
        setAssignBatches(resBatches.batches);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignBranchId || !assignCourseId || !assignSubjectId || !assignBatchId || !assignTeacherId) {
      toast('Validation Error', 'Please select Branch, Course, Subject, Batch, and Teacher.', 'error');
      return;
    }
    setIsAssigning(true);
    try {
      await subjectService.assignTeacher({
        branchId: assignBranchId,
        courseId: assignCourseId,
        subjectId: assignSubjectId,
        batchId: assignBatchId,
        teacherId: assignTeacherId,
      });
      toast('Teacher Assigned', 'Successfully linked teacher to subject cohort.', 'success');
      fetchAssignments();
    } catch (err: any) {
      toast('Assignment Failed', err.message || 'Could not map teacher to subject.', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveAssignment = async (id: string) => {
    try {
      await subjectService.removeAssignment(id);
      toast('Assignment Removed', 'Teacher assignment deleted successfully.', 'success');
      fetchAssignments();
    } catch (err: any) {
      toast('Action Failed', err.message || 'Could not remove assignment.', 'error');
    }
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormCode('');
    setFormDescription('');
    setFormCourseId(courses[0]?.id || '');
    setFormType('theory');
    setFormStatus('active');
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormName(subject.name);
    setFormCode(subject.code);
    setFormDescription(subject.description || '');
    setFormCourseId(subject.courseId);
    setFormType(subject.subjectType);
    setFormStatus(subject.status);
    setIsEditOpen(true);
  };

  const handleOpenDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteConfirmOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCourseId) {
      toast('Validation Error', 'Please select a Course.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await subjectService.create({
        name: formName,
        code: formCode,
        description: formDescription || undefined,
        subjectType: formType,
        courseId: formCourseId,
      });
      toast('Success', 'Subject created and mapped successfully.', 'success');
      setIsCreateOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast('Creation Failed', err.message || 'Could not register subject.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.update(selectedSubject.id, {
        name: formName,
        code: formCode,
        description: formDescription || undefined,
        subjectType: formType,
        status: formStatus,
      });
      toast('Success', 'Subject parameters updated successfully.', 'success');
      setIsEditOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Could not update subject details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.remove(selectedSubject.id);
      toast('Deleted', 'Subject record deleted successfully.', 'success');
      setIsDeleteConfirmOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast('Deletion Blocked', err.message || 'Attendance or dependent records exist. Archive instead.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveInstead = async () => {
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await subjectService.update(selectedSubject.id, { status: 'archived' });
      toast('Archived', `Subject "${selectedSubject.name}" set to Archived.`, 'success');
      setIsDeleteConfirmOpen(false);
      fetchSubjects();
    } catch (err: any) {
      toast('Archiving Failed', err.message || 'Server error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Subject & Teacher Management
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage academic subjects, track course mappings, and assign faculty teachers to subject cohorts.
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'CATALOG'
                  ? 'bg-card text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Subject Catalog
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNMENTS')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'ASSIGNMENTS'
                  ? 'bg-card text-zinc-900 dark:text-zinc-50 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Teacher Assignments
            </button>
          </div>
          {activeTab === 'CATALOG' && (
            <Button onClick={handleOpenCreate} className="gap-2 h-10 shrink-0" disabled={courses.length === 0}>
              <Plus className="w-4 h-4" /> Create Subject
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'CATALOG' && (
        <>
          {/* Filter and Search Bar */}
          <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by subject name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300"
              />
            </div>
            
            <div className="flex flex-wrap w-full md:w-auto gap-4 items-center justify-end">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>

              <Button variant="secondary" onClick={fetchSubjects} className="h-10 gap-1.5 shrink-0">
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
          </Card>

          {/* Main Table view */}
          <Card className="overflow-hidden border border-border">
            {isLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-sm font-semibold text-zinc-500 animate-pulse">Loading Subject Catalog...</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                  <Book className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">No Subjects Found</h3>
                  <p className="text-sm text-zinc-500 max-w-sm">
                    No active subjects are configured. Create new ones or refine search filters.
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Subject Code</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium text-zinc-700 dark:text-zinc-300">
                    {subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-50 block">{sub.name}</span>
                            {sub.description && <span className="text-xs text-zinc-400 font-semibold line-clamp-1">{sub.description}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-850 dark:text-zinc-200">{sub.course?.name || 'Unmapped Course'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-xs font-bold rounded tracking-wider">{sub.code}</span>
                        </td>
                        <td className="px-6 py-4 capitalize">{sub.subjectType}</td>
                        <td className="px-6 py-4">
                          <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'archived' ? 'warning' : 'neutral'}>
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(sub)}
                              className="p-2 rounded-lg border border-border text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(sub)}
                              className="p-2 rounded-lg border border-border text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {activeTab === 'ASSIGNMENTS' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-4 border border-border">
            <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">Assign Teacher to Subject Cohort</h3>
            <p className="text-xs text-zinc-400">Select Branch, Course, Subject, Batch, and Faculty Teacher to provision teaching authority.</p>

            <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Branch</label>
                <select
                  value={assignBranchId}
                  onChange={(e) => handleAssignBranchChange(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Course</label>
                <select
                  value={assignCourseId}
                  disabled={!assignBranchId}
                  onChange={(e) => handleAssignCourseChange(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">Select Course</option>
                  {assignCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Subject</label>
                <select
                  value={assignSubjectId}
                  disabled={!assignCourseId}
                  onChange={(e) => setAssignSubjectId(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">Select Subject</option>
                  {assignSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Batch</label>
                <select
                  value={assignBatchId}
                  disabled={!assignCourseId}
                  onChange={(e) => setAssignBatchId(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">Select Batch</option>
                  {assignBatches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Teacher</label>
                <select
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-card px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">Select Teacher</option>
                  {teachersList.map(t => (
                    <option key={t.id} value={t.id}>{t.user?.firstName} {t.user?.lastName} ({t.employeeNumber})</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-5 flex justify-end pt-2">
                <Button type="submit" disabled={isAssigning} className="gap-2">
                  <UserCheck className="w-4 h-4" /> {isAssigning ? 'Assigning...' : 'Assign Teacher'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Assignments List */}
          <Card className="overflow-hidden border border-border">
            <div className="p-4 border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Active Faculty Cohort Mappings</h4>
              <Button size="sm" variant="secondary" onClick={fetchAssignments} className="gap-1.5 text-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </Button>
            </div>

            {assignments.length === 0 ? (
              <div className="p-12 text-center text-xs font-semibold text-zinc-400">
                No active teacher-subject assignments mapped.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="border-b border-border text-zinc-400 uppercase tracking-wider">
                      <th className="px-6 py-3">Teacher</th>
                      <th className="px-6 py-3">Subject</th>
                      <th className="px-6 py-3">Course</th>
                      <th className="px-6 py-3">Batch</th>
                      <th className="px-6 py-3">Branch</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-zinc-700 dark:text-zinc-300">
                    {assignments.map(a => (
                      <tr key={a.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                        <td className="px-6 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                          {a.teacher?.user?.firstName} {a.teacher?.user?.lastName}
                          <span className="text-[10px] font-medium text-zinc-400 block">{a.teacher?.employeeNumber}</span>
                        </td>
                        <td className="px-6 py-3 text-primary font-bold">{a.subject?.name}</td>
                        <td className="px-6 py-3">{a.course?.name}</td>
                        <td className="px-6 py-3">{a.batch?.name}</td>
                        <td className="px-6 py-3">{a.branch?.name}</td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleRemoveAssignment(a.id)}
                            className="p-1.5 rounded-lg border border-border text-zinc-400 hover:text-rose-500 transition-colors"
                            title="Remove Assignment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 relative border border-border shadow-xl">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Create Subject
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
              map academic subject to course
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="Subject Name"
                id="subName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                placeholder="e.g. Inorganic Chemistry"
              />
              <Input
                label="Subject Code"
                id="subCode"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                required
                placeholder="e.g. CHEM-INORG"
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Mapping Course</label>
                  <select
                    value={formCourseId}
                    onChange={(e) => setFormCourseId(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Subject Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Subject'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT SUBJECT MODAL */}
      {isEditOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 relative border border-border shadow-xl">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 mb-1">
              Edit Subject Details
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-semibold uppercase tracking-wider">
              Subject Name: {selectedSubject.name}
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="Subject Name"
                id="subEditName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
              <Input
                label="Subject Code"
                id="subEditCode"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Subject Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="lab">Lab</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Subject'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* DELETE DIALOG MODAL WITH ARCHIVE OPTION */}
      {isDeleteConfirmOpen && selectedSubject && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 relative border border-border shadow-xl flex flex-col gap-4">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                  Delete Subject Permanently: {selectedSubject.name}?
                </h3>
                <p className="text-xs text-zinc-500">
                  Are you sure you want to permanently delete subject <span className="font-semibold text-zinc-700 dark:text-zinc-300">"{selectedSubject.name}"</span>?
                  This action cannot be undone and will permanently remove this subject record from the database.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="secondary" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleDeleteSubmit} disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

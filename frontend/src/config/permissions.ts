export type PermissionCode =
  | 'users:create' | 'users:read' | 'users:update' | 'users:delete'
  | 'students:create' | 'students:read' | 'students:update' | 'students:delete'
  | 'teachers:create' | 'teachers:read' | 'teachers:update' | 'teachers:delete'
  | 'courses:create' | 'courses:read' | 'courses:update' | 'courses:delete'
  | 'batches:create' | 'batches:read' | 'batches:update' | 'batches:delete'
  | 'attendance:create' | 'attendance:read' | 'attendance:update'
  | 'fees:manage' | 'payments:create' | 'payments:read'
  | 'assignments:manage' | 'submissions:grade' | 'submissions:submit'
  | 'exams:manage' | 'results:manage' | 'results:read'
  | 'website:manage' | 'enquiries:read'
  | 'logs:read' | 'academies:manage' | 'subscriptions:manage';

export const ROLE_PERMISSIONS: Record<string, PermissionCode[]> = {
  SUPER_ADMIN: [
    'users:create', 'users:read', 'users:update', 'users:delete',
    'academies:manage', 'subscriptions:manage', 'logs:read'
  ],
  ACADEMY_ADMIN: [
    'users:create', 'users:read', 'users:update', 'users:delete',
    'students:create', 'students:read', 'students:update', 'students:delete',
    'teachers:create', 'teachers:read', 'teachers:update', 'teachers:delete',
    'courses:create', 'courses:read', 'courses:update', 'courses:delete',
    'batches:create', 'batches:read', 'batches:update', 'batches:delete',
    'attendance:create', 'attendance:read', 'attendance:update',
    'fees:manage', 'payments:read', 'payments:create',
    'assignments:manage', 'submissions:grade',
    'exams:manage', 'results:manage', 'results:read',
    'website:manage', 'enquiries:read', 'logs:read'
  ],
  TEACHER: [
    'users:read',
    'students:read',
    'attendance:create', 'attendance:read', 'attendance:update',
    'assignments:manage', 'submissions:grade',
    'exams:manage', 'results:manage', 'results:read'
  ],
  STUDENT: [
    'users:read',
    'attendance:read',
    'payments:create', 'payments:read',
    'submissions:submit',
    'results:read'
  ]
};

export function hasPermission(role: string, permission: PermissionCode): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

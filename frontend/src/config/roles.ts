export type UserRole = 'SUPER_ADMIN' | 'ACADEMY_ADMIN' | 'TEACHER' | 'STUDENT';

export const ROLES: Record<UserRole, { name: string; code: UserRole; landingPath: string }> = {
  SUPER_ADMIN: {
    name: 'HYVORA Super Admin',
    code: 'SUPER_ADMIN',
    landingPath: '/super-admin',
  },
  ACADEMY_ADMIN: {
    name: 'Academy Administrator',
    code: 'ACADEMY_ADMIN',
    landingPath: '/admin',
  },
  TEACHER: {
    name: 'Teacher / Instructor',
    code: 'TEACHER',
    landingPath: '/teacher',
  },
  STUDENT: {
    name: 'Student',
    code: 'STUDENT',
    landingPath: '/student',
  },
};

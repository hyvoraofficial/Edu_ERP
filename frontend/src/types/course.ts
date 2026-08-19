export interface Course {
  id: string;
  academyId: string;
  name: string;
  code: string;
  description?: string;
  durationMonths?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  academyId: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  academyId: string;
  courseId: string;
  name: string;
  startDate: string;
  endDate: string;
  maxStrength?: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  academyId: string;
  batchId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: number; // 1-7
  startTime: string; // "HH:MM:SS"
  endTime: string;
  classroomNo?: string;
  createdAt: string;
  updatedAt: string;
}

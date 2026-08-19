import { API_BASE_URL, getAuthToken, getSubdomain } from '@/config/api.config';

export interface StudentSubjectAttendanceStat {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  percentage: number;
}

export interface StudentSubjectWiseAttendanceReport {
  studentId: string;
  courseName: string;
  overallPercentage: number;
  subjectStats: StudentSubjectAttendanceStat[];
}

export interface AttendanceRecordItem {
  id: string;
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  student?: {
    id: string;
    admissionNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export const attendanceService = {
  submitStudentAttendance: async (payload: {
    batchId: string;
    subjectId?: string;
    date: string;
    records: { studentId: string; status: string; remarks?: string }[];
  }) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/attendance/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to submit attendance rollcall.');
    }
    return body.data;
  },

  getStudentAttendanceReport: async (batchId: string, date: string, subjectId?: string): Promise<AttendanceRecordItem[]> => {
    const token = getAuthToken();
    const query = new URLSearchParams({ batchId, date });
    if (subjectId) query.append('subjectId', subjectId);
    const response = await fetch(`${API_BASE_URL}/attendance/students?${query.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      return [];
    }
    return body.data || [];
  },

  getStudentSubjectWise: async (studentId: string): Promise<StudentSubjectWiseAttendanceReport> => {
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/students/${studentId}/subject-wise`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Academy-Subdomain': getSubdomain(),
        },
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        return { studentId, courseName: '', overallPercentage: 0, subjectStats: [] };
      }
      return body.data || { studentId, courseName: '', overallPercentage: 0, subjectStats: [] };
    } catch (err) {
      return { studentId, courseName: '', overallPercentage: 0, subjectStats: [] };
    }
  },
};

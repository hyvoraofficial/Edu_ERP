import { API_BASE_URL } from '@/config/api.config';

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  const nameEQ = 'mock-auth-token=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) {
      const val = c.substring(nameEQ.length, c.length);
      if (val && val !== 'null' && val !== 'undefined') return val;
    }
  }
  const localToken = localStorage.getItem('auth-token');
  if (localToken && localToken !== 'null' && localToken !== 'undefined') return localToken;
  try {
    const authUserStr = localStorage.getItem('auth-user');
    if (authUserStr) {
      const parsed = JSON.parse(authUserStr);
      if (parsed.token) return parsed.token;
    }
  } catch (e) {}
  return '';
}

function getSubdomain(): string {
  if (typeof window === 'undefined') return 'hyvora';
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    if (parts.length > 1 && !parts[0].startsWith('localhost')) {
      return parts[0];
    }
  } else {
    if (parts.length > 2) {
      return parts[0];
    }
  }
  return 'hyvora';
}

export interface AssignmentItem {
  id: string;
  title: string;
  description?: string;
  batchId: string;
  batch?: { id: string; name: string; code: string };
  subjectId: string;
  subject?: { id: string; name: string; code: string };
  teacherId: string;
  teacher?: { id: string; user?: { firstName: string; lastName: string } };
  maxMarks: number;
  dueDate: string;
  mediaFileId?: string;
  createdAt: string;
  _count?: { submissions: number };
}

export interface AssignmentSubmissionItem {
  id: string;
  assignmentId: string;
  studentId: string;
  student?: {
    id: string;
    admissionNumber: string;
    user?: { firstName: string; lastName: string; email: string };
  };
  submissionDate: string;
  mediaFileId?: string;
  studentRemarks?: string;
  status: 'submitted' | 'late_submission' | 'graded';
  marksObtained?: number;
  teacherRemarks?: string;
  gradedAt?: string;
}

export const assignmentService = {
  createAssignment: async (data: {
    batchId: string;
    subjectId: string;
    title: string;
    description?: string;
    maxMarks: number;
    dueDate: string;
    mediaFileId?: string;
  }): Promise<AssignmentItem> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to create assignment task.');
    }
    return body.data;
  },

  findAllAssignments: async (filters: { batchId?: string; subjectId?: string } = {}): Promise<AssignmentItem[]> => {
    const token = getAuthToken();
    const query = new URLSearchParams();
    if (filters.batchId) query.append('batchId', filters.batchId);
    if (filters.subjectId) query.append('subjectId', filters.subjectId);

    try {
      const response = await fetch(`${API_BASE_URL}/assignments?${query.toString()}`, {
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
    } catch (err) {
      return [];
    }
  },

  findOneAssignment: async (id: string): Promise<AssignmentItem> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to fetch assignment details.');
    }
    return body.data;
  },

  removeAssignment: async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to delete assignment.');
    }
  },

  submitAssignment: async (assignmentId: string, data: { mediaFileId?: string; studentRemarks?: string }): Promise<AssignmentSubmissionItem> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to submit assignment.');
    }
    return body.data;
  },

  findSubmissions: async (assignmentId: string): Promise<AssignmentSubmissionItem[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submissions`, {
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

  gradeSubmission: async (submissionId: string, data: { marksObtained: number; teacherRemarks?: string }): Promise<AssignmentSubmissionItem> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/assignments/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
      body: JSON.stringify(data),
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to grade submission.');
    }
    return body.data;
  },
};

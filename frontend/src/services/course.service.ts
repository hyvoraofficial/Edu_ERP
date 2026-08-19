import { API_BASE_URL, getAuthToken, getSubdomain } from '@/config/api.config';

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: string;
  branchId: string;
  branch?: {
    id: string;
    name: string;
  };
  duration?: string;
  createdAt: string;
  updatedAt: string;
  subjects?: {
    id?: string;
    name: string;
    code: string;
    subjectType: string;
    description?: string;
    status?: string;
  }[];
}

export interface PaginatedCourses {
  courses: Course[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const courseService = {
  create: async (data: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'branch'>): Promise<Course> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/academic/courses`, {
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
      const details = body.error?.details || (Array.isArray(body.message) ? body.message : (typeof body.message === 'string' ? [body.message] : []));
      const messageStr = (Array.isArray(details) && details.length > 0)
        ? details.join('. ')
        : (body.error?.message || body.message || 'Failed to create course.');
      const err = new Error(messageStr);
      (err as any).details = details;
      throw err;
    }
    return body.data;
  },

  findAll: async (search?: string, branchId?: string, status?: string, page = 1, limit = 100): Promise<PaginatedCourses> => {
    const token = getAuthToken();
    const query = new URLSearchParams();
    if (search && search.trim()) query.append('search', search.trim());
    if (branchId && branchId !== 'all' && branchId !== 'ALL' && branchId !== 'null' && branchId !== 'undefined') {
      query.append('branchId', branchId);
    }
    if (status && status !== 'all') query.append('status', status);
    query.append('page', String(page));
    query.append('limit', String(limit));

    try {
      const response = await fetch(`${API_BASE_URL}/academic/courses?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Academy-Subdomain': getSubdomain(),
        },
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        console.error('courseService.findAll API response error:', body);
        return { courses: [], meta: { total: 0, page: 1, limit: 100, totalPages: 1 } };
      }
      const rawList = body.data?.courses || body.data?.items || (Array.isArray(body.data) ? body.data : []);
      const metaObj = body.data?.meta || { total: rawList.length, page: 1, limit: 100, totalPages: 1 };
      return {
        courses: rawList,
        meta: metaObj,
      };
    } catch (err) {
      console.error('courseService.findAll fetch exception:', err);
      return { courses: [], meta: { total: 0, page: 1, limit: 100, totalPages: 1 } };
    }
  },

  findOne: async (id: string): Promise<Course> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/academic/courses/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to load course details.');
    }
    return body.data;
  },

  update: async (id: string, data: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'branch'>>): Promise<Course> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/academic/courses/${id}`, {
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
      throw new Error(body.error?.message || 'Failed to update course.');
    }
    return body.data;
  },

  remove: async (id: string, permanent: boolean = true): Promise<void> => {
    const token = getAuthToken();
    const url = permanent 
      ? `${API_BASE_URL}/academic/courses/${id}?permanent=true` 
      : `${API_BASE_URL}/academic/courses/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to delete course.');
    }
  },
};

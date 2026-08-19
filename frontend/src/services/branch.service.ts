import { API_BASE_URL, getAuthToken, getSubdomain } from '@/config/api.config';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email: string;
  manager?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    students: number;
    teachers: number;
    courses: number;
    batches: number;
  };
}

export interface PaginatedBranches {
  branches: Branch[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const branchService = {
  create: async (data: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>): Promise<Branch> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/branches`, {
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
      const err: any = new Error(body.error?.message || 'Failed to create branch.');
      err.details = body.error?.details;
      throw err;
    }
    return body.data;
  },

  findAll: async (search?: string, status?: string, page = 1, limit = 10): Promise<PaginatedBranches> => {
    const token = getAuthToken();
    if (!token) {
      return { branches: [], meta: { total: 0, page: 1, limit: 10 } };
    }
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (status) query.append('status', status);
    query.append('page', String(page));
    query.append('limit', String(limit));

    try {
      const response = await fetch(`${API_BASE_URL}/branches?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Academy-Subdomain': getSubdomain(),
        },
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        return { branches: [], meta: { total: 0, page: 1, limit: 10 } };
      }
      return {
        branches: body.data?.items || [],
        meta: body.data?.meta || { total: 0, page: 1, limit: 10 },
      };
    } catch (err) {
      return { branches: [], meta: { total: 0, page: 1, limit: 10 } };
    }
  },

  findOne: async (id: string): Promise<Branch> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to load branch details.');
    }
    return body.data;
  },

  update: async (id: string, data: Partial<Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Branch> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
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
      throw new Error(body.error?.message || 'Failed to update branch.');
    }
    return body.data;
  },

  remove: async (id: string, permanent: boolean = true): Promise<void> => {
    const token = getAuthToken();
    const url = permanent 
      ? `${API_BASE_URL}/branches/${id}?permanent=true` 
      : `${API_BASE_URL}/branches/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to delete branch.');
    }
  },
};

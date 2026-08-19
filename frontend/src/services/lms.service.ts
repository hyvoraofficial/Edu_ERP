import { API_BASE_URL, getAuthToken, getSubdomain } from '@/config/api.config';

export interface StudyMaterialItem {
  id: string;
  title: string;
  description?: string;
  subjectId?: string;
  subject?: { id: string; name: string; code: string };
  teacherId?: string;
  teacher?: { id: string; user?: { firstName: string; lastName: string } };
  mediaFileId?: string;
  mediaFile?: {
    id: string;
    filename: string;
    originalFilename: string;
    mimeType: string;
    fileSize: string;
    storagePath: string;
  };
  materialType: 'pdf' | 'notes' | 'link' | 'youtube';
  url?: string;
  accessLevel: string;
  createdAt: string;
  batches?: { id: string; batch: { id: string; name: string } }[];
}

export interface PaginatedMaterials {
  materials: StudyMaterialItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
  };
}

export const lmsService = {
  getMaterialAccessUrl: async (id: string): Promise<{
    url: string;
    expiresIn: number | null;
    originalFilename?: string;
    mimeType?: string;
    isExternal?: boolean;
  }> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/lms/materials/${id}/access-url`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success || !body.data?.url) {
      throw new Error(body.error?.message || body.message || 'Unable to open this study material. Please try again.');
    }
    return body.data;
  },

  uploadMaterialFile: async (formData: FormData): Promise<StudyMaterialItem> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/lms/materials/upload`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
      body: formData,
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || body.message || 'Failed to upload study material file.');
    }
    return body.data;
  },

  createMaterial: async (data: {
    title: string;
    description?: string;
    subjectId?: string;
    mediaFileId?: string;
    materialType?: 'pdf' | 'notes' | 'link' | 'youtube';
    url?: string;
    accessLevel: string;
    batchIds?: string[];
  }): Promise<StudyMaterialItem> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/lms/materials`, {
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
      throw new Error(body.error?.message || 'Failed to publish study material.');
    }
    return body.data;
  },

  findAllMaterials: async (filters: {
    search?: string;
    subjectId?: string;
    batchId?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedMaterials> => {
    const token = getAuthToken();
    const query = new URLSearchParams();
    if (filters.search) query.append('search', filters.search);
    if (filters.subjectId) query.append('subjectId', filters.subjectId);
    if (filters.batchId) query.append('batchId', filters.batchId);
    query.append('page', String(filters.page || 1));
    query.append('limit', String(filters.limit || 10));

    try {
      const response = await fetch(`${API_BASE_URL}/lms/materials?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Academy-Subdomain': getSubdomain(),
        },
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        console.warn('lmsService.findAllMaterials non-200:', body);
        return {
          materials: [],
          meta: { total: 0, page: 1, limit: 100, totalPages: 1 },
        };
      }
      return {
        materials: body.data?.materials || [],
        meta: body.data?.meta || { total: 0, page: 1, limit: 100, totalPages: 1 },
      };
    } catch (err) {
      console.warn('lmsService.findAllMaterials exception:', err);
      return {
        materials: [],
        meta: { total: 0, page: 1, limit: 100, totalPages: 1 },
      };
    }
  },

  removeMaterial: async (id: string): Promise<void> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/lms/materials/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Academy-Subdomain': getSubdomain(),
      },
    });
    const body = await response.json();
    if (!response.ok || !body.success) {
      throw new Error(body.error?.message || 'Failed to delete study material.');
    }
  },
};

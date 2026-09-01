import { apiGet, apiPatch, apiPost, apiDelete } from './baseRepository';

export interface CoachingBatchRecord {
  _id?: string;
  id?: string;
  batchName: string;
  className: string;
  subject: string;
  schedule?: string;
  fee?: number;
  maxStudents?: number;
  enrolledCount?: number;
  status?: 'Active' | 'Completed' | 'Upcoming';
  instructorName?: string;
}

export interface CoachingProfileRecord {
  _id?: string;
  userId?: string;
  instituteName: string;
  tradeLicense?: string;
  phone?: string;
  email?: string;
  district?: string;
  location?: string;
  about?: string;
  batches?: CoachingBatchRecord[];
  assignedTutorIds?: any[];
  isVerified?: boolean;
}

export const CoachingRepository = {
  async getProfile() {
    return apiGet<CoachingProfileRecord>('/coaching/profile');
  },
  async updateProfile(data: Partial<CoachingProfileRecord>) {
    return apiPatch<CoachingProfileRecord>('/coaching/profile', data);
  },
  async getStats() {
    return apiGet<{ totalBatches: number; activeBatches: number; activeStudents: number; assignedTutors: number; pendingRequests: number }>('/coaching/stats');
  },
  async createBatch(data: Partial<CoachingBatchRecord>) {
    return apiPost<CoachingProfileRecord>('/coaching/batches', data);
  },
  async deleteBatch(id: string) {
    return apiDelete(`/coaching/batches/${id}`);
  },
  async getAll() {
    return apiGet<CoachingProfileRecord[]>('/coaching/all');
  },
};

// Public fetch - no auth token required (for public coaching explorer page)
export const CoachingPublicRepository = {
  async getAll(): Promise<CoachingProfileRecord[]> {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    const BASE_URL = metaEnv?.VITE_API_URL || 'http://localhost:5001/api/v1';
    const res = await fetch(`${BASE_URL}/coaching/all`);
    if (!res.ok) throw new Error('Failed to fetch coaching centers');
    const json = await res.json();
    return json.data || [];
  },
};

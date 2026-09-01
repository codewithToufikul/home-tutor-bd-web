import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface TutorProfileRecord {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  university?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  subjects?: string[];
  mediums?: string[];
  location?: { district?: string; area?: string };
  salary?: number;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  isPremium?: boolean;
  [key: string]: unknown;
}

export const TutorProfileRepository = {
  async get(id: string) { return apiGet<TutorProfileRecord>(`/tutors/${id}`); },
  async getById(id: string) { return apiGet<TutorProfileRecord>(`/tutors/${id}`); },

  // ✅ Correct: GET /tutors/me uses auth token to fetch the current tutor's own profile
  // Returns null gracefully if the tutor profile doesn't exist yet (new tutor)
  async getByUid(_uid: string): Promise<TutorProfileRecord | null> {
    try {
      return await apiGet<TutorProfileRecord>('/tutors/me');
    } catch (err: any) {
      // 404 = tutor profile not yet created — return null instead of crashing
      const msg = String(err?.message || '');
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        return null;
      }
      throw err;
    }
  },

  async getMe(): Promise<TutorProfileRecord | null> {
    try {
      return await apiGet<TutorProfileRecord>('/tutors/me');
    } catch {
      return null;
    }
  },

  async getAll() { return apiGet<TutorProfileRecord[]>('/tutors'); },
  async list(params?: Record<string, unknown>) {
    const qs = params ? '?' + new URLSearchParams(params as Record<string,string>).toString() : '';
    return apiGet<{ data: TutorProfileRecord[] }>(`/tutors${qs}`);
  },
  async create(data: Partial<TutorProfileRecord>) { return apiPost<TutorProfileRecord>('/tutors/profile', data); },
  async update(_id: string, data: Partial<TutorProfileRecord>) { return apiPatch<TutorProfileRecord>('/tutors/profile', data); },
  async remove(_id: string) { return apiGet<TutorProfileRecord>('/tutors/profile'); },
};

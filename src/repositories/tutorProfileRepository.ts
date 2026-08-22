import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface TutorProfileRecord {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  university?: string;
  department?: string;
  qualification?: string;
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
  async getByUid(uid: string) { return apiGet<TutorProfileRecord>(`/tutors/${uid}`); },
  async getMe() { return apiGet<TutorProfileRecord>('/tutors/me'); },
  async getAll() { return apiGet<TutorProfileRecord[]>('/tutors'); },
  async list(params?: Record<string, unknown>) {
    const qs = params ? '?' + new URLSearchParams(params as Record<string,string>).toString() : '';
    return apiGet<{ data: TutorProfileRecord[] }>(`/tutors${qs}`);
  },
  async create(data: Partial<TutorProfileRecord>) { return apiPost<TutorProfileRecord>('/tutors/profile', data); },
  async update(_id: string, data: Partial<TutorProfileRecord>) { return apiPatch<TutorProfileRecord>('/tutors/profile', data); },
  async remove(_id: string) { return apiGet<TutorProfileRecord>('/tutors/profile'); },
};

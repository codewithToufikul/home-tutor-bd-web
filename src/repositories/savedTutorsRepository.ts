import { apiDelete, apiGet, apiPost } from './baseRepository';

export interface SavedTutorRecord {
  id?: string;
  _id?: string;
  tutorId?: string;
  guardianId?: string;
  studentId?: string;
  [key: string]: unknown;
}

export const SavedTutorsRepository = {
  async list() { return apiGet<SavedTutorRecord[]>('/users/me/saved-tutors'); },
  async listForGuardian(_guardianId?: string) { return apiGet<SavedTutorRecord[]>('/users/me/saved-tutors'); },
  async listForStudent(_studentId?: string) { return apiGet<SavedTutorRecord[]>('/users/me/saved-tutors'); },
  async save(tutorId: string) { return apiPost(`/users/me/saved-tutors`, { tutorId }); },
  async create(payload: Partial<SavedTutorRecord>) { return apiPost(`/users/me/saved-tutors`, payload); },
  async remove(tutorId: string) { return apiDelete(`/users/me/saved-tutors/${tutorId}`); },
};

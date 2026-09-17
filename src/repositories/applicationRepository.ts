import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface ApplicationRecord {
  id?: string;
  _id?: string;
  jobId?: string;
  tutorId?: string;
  status?: 'Pending' | 'Demo_Confirmed' | 'Demo_Completed' | 'Accepted' | 'Rejected' | 'Withdrawn';
  demoConfirmedAt?: string;
  demoCompletedAt?: string;
  finalConfirmedAt?: string;
  rejectionReason?: string;
  [key: string]: unknown;
}

export const ApplicationRepository = {
  async listMine() { return apiGet<ApplicationRecord[]>('/applications/my'); },
  async getByTutor(_tutorId?: string) { return apiGet<ApplicationRecord[]>('/applications/my'); },
  async get(id: string) { return apiGet<ApplicationRecord>(`/applications/${id}`); },
  async getById(id: string) { return apiGet<ApplicationRecord>(`/applications/${id}`); },
  async getByJob(jobId: string) { return apiGet<ApplicationRecord[]>(`/applications/job/${jobId}`); },
  async create(data: Partial<ApplicationRecord>) { return apiPost('/applications', data); },
  async update(id: string, data: Partial<ApplicationRecord>) { return apiPatch(`/applications/${id}`, data); },
  async demoConfirm(id: string) { return apiPatch(`/applications/${id}/demo-confirm`, {}); },
  async demoComplete(id: string) { return apiPatch(`/applications/${id}/demo-complete`, {}); },
  async finalConfirm(id: string) { return apiPatch(`/applications/${id}/final-confirm`, {}); },
  async accept(id: string) { return apiPatch(`/applications/${id}/final-confirm`, {}); },
  async reject(id: string) { return apiPatch(`/applications/${id}/reject`, {}); },
};

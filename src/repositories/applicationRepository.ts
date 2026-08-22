import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface ApplicationRecord {
  id?: string;
  _id?: string;
  jobId?: string;
  tutorId?: string;
  status?: 'Pending' | 'Accepted' | 'Rejected';
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
  async accept(id: string) { return apiPatch(`/applications/${id}/accept`, {}); },
  async reject(id: string) { return apiPatch(`/applications/${id}/reject`, {}); },
};

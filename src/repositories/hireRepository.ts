import { apiGet, apiPatch, apiPost, apiDelete } from './baseRepository';

export interface HireRequestRecord {
  id?: string;
  _id?: string;
  guardianId?: string;
  tutorId?: string;
  jobId?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'pending' | 'approved' | 'rejected';
  message?: string;
  [key: string]: unknown;
}

export const HireRepository = {
  async list() { return apiGet<HireRequestRecord[]>('/hire-requests'); },
  async getAll() { return apiGet<HireRequestRecord[]>('/hire-requests'); },
  async get(id: string) { return apiGet<HireRequestRecord>(`/hire-requests/${id}`); },
  async getById(id: string) { return apiGet<HireRequestRecord>(`/hire-requests/${id}`); },
  async create(data: Partial<HireRequestRecord>) { return apiPost<HireRequestRecord>('/hire-requests', data); },
  async update(id: string, data: Partial<HireRequestRecord>) { return apiPatch<HireRequestRecord>(`/hire-requests/${id}`, data); },
  async approve(id: string) { return apiPatch(`/hire-requests/${id}/approve`, {}); },
  async reject(id: string) { return apiPatch(`/hire-requests/${id}/reject`, {}); },
  async updateStatus(id: string, status: string) { return apiPatch(`/hire-requests/${id}/${status}`, {}); },
  async remove(id: string) { return apiDelete(`/hire-requests/${id}`); },
};

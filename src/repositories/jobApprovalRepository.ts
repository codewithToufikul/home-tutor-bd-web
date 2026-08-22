import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface JobApprovalRecord {
  id?: string;
  _id?: string;
  jobId?: string;
  status?: string;
  [key: string]: unknown;
}

export const JobApprovalRepository = {
  async list() { return apiGet<JobApprovalRecord[]>('/admin/tuition-jobs/pending'); },
  async getAll() { return apiGet<JobApprovalRecord[]>('/admin/tuition-jobs/pending'); },
  async getById(id: string) { return apiGet<JobApprovalRecord>(`/admin/tuition-jobs/${id}`); },
  async approve(id: string) { return apiPatch(`/admin/tuition-jobs/${id}/approve`, {}); },
  async reject(id: string) { return apiPatch(`/admin/tuition-jobs/${id}/reject`, {}); },
  async updateStatus(id: string, status: string) { return apiPatch(`/admin/tuition-jobs/${id}/status`, { status }); },
  async create(data: Partial<JobApprovalRecord>) { return apiPost<JobApprovalRecord>('/admin/tuition-jobs', data); },
  async update(id: string, data: Partial<JobApprovalRecord>) { return apiPatch(`/admin/tuition-jobs/${id}`, data); },
};

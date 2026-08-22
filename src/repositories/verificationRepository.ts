import { apiGet, apiPost } from './baseRepository';

export interface VerificationRecord {
  id?: string;
  _id?: string;
  uid?: string;
  tutorId?: string;
  nidDocument?: string;
  certificateDocuments?: string[];
  cvDocument?: string;
  status?: 'Pending' | 'Approved' | 'Rejected' | 'pending';
  [key: string]: unknown;
}

export const VerificationRepository = {
  async get(id: string) { return apiGet<VerificationRecord>(`/verifications/${id}`); },
  async getById(id: string) { return apiGet<VerificationRecord>(`/verifications/${id}`); },
  async create(data: Partial<VerificationRecord>) { return apiPost<VerificationRecord>('/verifications', data); },
  async update(id: string, data: Partial<VerificationRecord>) { return apiPost<VerificationRecord>('/verifications', data); },
  async list() { return apiGet<VerificationRecord[]>('/admin/verifications'); },
  async getAll() { return apiGet<VerificationRecord[]>('/admin/verifications'); },
};

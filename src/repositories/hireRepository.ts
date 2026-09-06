import { apiGet, apiPatch, apiPost, apiDelete } from './baseRepository';

export interface HireRequestRecord {
  id?: string;
  _id?: string;
  guardianId?: any;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  studentClass?: string;
  subjects?: string[] | string;
  salaryOffer?: string | number;
  requirements?: string;
  location?: {
    district?: string;
    area?: string;
    detailedAddress?: string;
  };
  tutorId?: any;
  tutorProfileId?: any;
  jobId?: any;
  message?: string;
  status?: 'Pending' | 'Contacted' | 'Confirmed' | 'Approved' | 'Rejected' | 'Cancelled';
  adminNotes?: string;
  confirmedTuition?: any;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export const HireRepository = {
  async list() { return apiGet<HireRequestRecord[]>('/hire-requests'); },
  async getAll() { return apiGet<HireRequestRecord[]>('/hire-requests'); },
  async get(id: string) { return apiGet<HireRequestRecord>(`/hire-requests/${id}`); },
  async getById(id: string) { return apiGet<HireRequestRecord>(`/hire-requests/${id}`); },
  async create(data: Partial<HireRequestRecord>) { return apiPost<HireRequestRecord>('/hire-requests', data); },
  async update(id: string, data: Partial<HireRequestRecord>) { return apiPatch<HireRequestRecord>(`/hire-requests/${id}`, data); },
  async updateStatus(id: string, status: string, adminNotes?: string) {
    return apiPatch(`/hire-requests/${id}/status`, { status, adminNotes });
  },
  async confirmTuition(id: string, payload: any) {
    return apiPost(`/hire-requests/${id}/confirm-tuition`, payload);
  },
  async remove(id: string) { return apiDelete(`/hire-requests/${id}`); },
};


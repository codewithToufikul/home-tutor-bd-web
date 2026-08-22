import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface PaymentRequestRecord {
  id?: string;
  _id?: string;
  tutorId?: string;
  amount?: number;
  status?: string;
  method?: string;
  [key: string]: unknown;
}

export const PaymentRequestRepository = {
  async list() { return apiGet<PaymentRequestRecord[]>('/admin/payments'); },
  async getByTutor(_tutorId: string) { return apiGet<PaymentRequestRecord[]>('/admin/payments'); },
  async create(data: Partial<PaymentRequestRecord>) { return apiPost<PaymentRequestRecord>('/payments', data); },
  async update(id: string, data: Partial<PaymentRequestRecord>) { return apiPatch(`/admin/payments/${id}`, data); },
  async updateStatus(id: string, status: string) { return apiPatch(`/admin/payments/${id}`, { status }); },
};

import { apiGet, apiPost } from './baseRepository';

export interface PaymentRecord {
  id?: string;
  _id?: string;
  userId?: string;
  amount?: number;
  status?: string;
  type?: string;
  [key: string]: unknown;
}

export const PaymentRepository = {
  async list() { return apiGet<PaymentRecord[]>('/admin/payments'); },
  async getAll() { return apiGet<PaymentRecord[]>('/admin/payments'); },
  async get(id: string) { return apiGet<PaymentRecord>(`/payments/${id}`); },
  async create(data: Partial<PaymentRecord>) { return apiPost<PaymentRecord>('/payments', data); },
};

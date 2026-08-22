import { apiGet } from './baseRepository';

export interface TransactionRecord {
  id?: string;
  _id?: string;
  userId?: string;
  amount?: number;
  type?: string;
  status?: string;
  description?: string;
  date?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export const TransactionRepository = {
  async list() { return apiGet<TransactionRecord[]>('/payments'); },
  async getAll() { return apiGet<TransactionRecord[]>('/payments'); },
  async get(id: string) { return apiGet<TransactionRecord>(`/payments/${id}`); },
  async getById(id: string) { return apiGet<TransactionRecord>(`/payments/${id}`); },
  async getByTutor(_tutorId: string) { return apiGet<TransactionRecord[]>('/payments'); },
  async create(data: Partial<TransactionRecord>) { return apiGet<TransactionRecord>('/payments'); },
  async update(_id: string, _data: Partial<TransactionRecord>) { return apiGet<TransactionRecord>('/payments'); },
};

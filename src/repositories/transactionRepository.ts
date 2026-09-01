import { apiGet, apiPost, apiPatch } from './baseRepository';

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
  async list(): Promise<TransactionRecord[]> { return []; },
  async getAll(): Promise<TransactionRecord[]> { return []; },
  async getById(_id: string): Promise<TransactionRecord | null> { return null; },
  async get(_id: string): Promise<TransactionRecord | null> { return null; },
  async getByTutor(_tutorId: string): Promise<TransactionRecord[]> { return []; },
  async create(_data: Partial<TransactionRecord>): Promise<TransactionRecord | null> { return null; },
  async update(_id: string, _data: Partial<TransactionRecord>): Promise<TransactionRecord | null> { return null; },
};



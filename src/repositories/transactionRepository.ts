import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface TransactionRecord {
  id?: string;
  tutorId: string;
  type: 'Credit' | 'Debit';
  amount: number;
  status?: 'completed' | 'pending' | 'failed';
  date?: string;
  description?: string;
  method?: string;
  trxId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const TransactionRepository = {
  async getById(id: string) {
    return getDocument<TransactionRecord>('transactions', id);
  },

  async getAll() {
    return listDocuments<TransactionRecord>('transactions');
  },

  async getByTutor(tutorId: string) {
    return listDocuments<TransactionRecord>('transactions', [{ field: 'tutorId', op: '==', value: tutorId }], 'createdAt');
  },

  async create(record: TransactionRecord) {
    return createDocument('transactions', record);
  },

  async update(id: string, data: Partial<TransactionRecord>) {
    return updateDocument('transactions', id, data);
  },

  async remove(id: string) {
    return deleteDocument('transactions', id);
  },
};

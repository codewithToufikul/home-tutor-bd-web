import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface PaymentRecord {
  id?: string;
  tutorId?: string;
  amount?: number;
  status?: 'pending' | 'completed' | 'rejected';
  method?: string;
  createdAt?: string;
}

export const PaymentRepository = {
  async getById(id: string) {
    return getDocument<PaymentRecord>('payments', id);
  },

  async getAll() {
    return listDocuments<PaymentRecord>('payments');
  },

  async create(record: PaymentRecord) {
    return createDocument('payments', record);
  },

  async update(id: string, data: Partial<PaymentRecord>) {
    return updateDocument('payments', id, data);
  },

  async remove(id: string) {
    return deleteDocument('payments', id);
  },
};

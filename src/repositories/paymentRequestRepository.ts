import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface PaymentRequestRecord {
  id?: string;
  tutorId: string;
  method: string;
  senderNumber: string;
  trxId: string;
  amount: number;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export const PaymentRequestRepository = {
  async getById(id: string) {
    return getDocument<PaymentRequestRecord>('payment_requests', id);
  },

  async getAll() {
    return listDocuments<PaymentRequestRecord>('payment_requests');
  },

  async getByTutor(tutorId: string) {
    return listDocuments<PaymentRequestRecord>('payment_requests', [{ field: 'tutorId', op: '==', value: tutorId }], 'createdAt');
  },

  async create(record: PaymentRequestRecord) {
    return createDocument('payment_requests', record);
  },

  async update(id: string, data: Partial<PaymentRequestRecord>) {
    return updateDocument('payment_requests', id, data);
  },

  async remove(id: string) {
    return deleteDocument('payment_requests', id);
  },
};

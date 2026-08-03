import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface VerificationRecord {
  id?: string;
  uid?: string;
  name?: string;
  type?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export const VerificationRepository = {
  async getById(id: string) {
    return getDocument<VerificationRecord>('admin_verification_requests', id);
  },

  async getAll() {
    return listDocuments<VerificationRecord>('admin_verification_requests');
  },

  async create(record: VerificationRecord) {
    return createDocument('admin_verification_requests', record);
  },

  async update(id: string, data: Partial<VerificationRecord>) {
    return updateDocument('admin_verification_requests', id, data);
  },

  async remove(id: string) {
    return deleteDocument('admin_verification_requests', id);
  },
};

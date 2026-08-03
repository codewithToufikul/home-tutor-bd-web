import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface VerificationRequestRecord {
  id?: string;
  uid: string;
  name?: string;
  docType?: string;
  docNumber?: string;
  nidFrontName?: string;
  nidBackName?: string;
  studentIdName?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export const VerificationRequestRepository = {
  async getById(id: string) {
    return getDocument<VerificationRequestRecord>('verification_requests', id);
  },

  async getAll() {
    return listDocuments<VerificationRequestRecord>('verification_requests');
  },

  async getByTutor(uid: string) {
    return listDocuments<VerificationRequestRecord>('verification_requests', [{ field: 'uid', op: '==', value: uid }], 'createdAt');
  },

  async create(record: VerificationRequestRecord) {
    return createDocument('verification_requests', record);
  },

  async update(id: string, data: Partial<VerificationRequestRecord>) {
    return updateDocument('verification_requests', id, data);
  },

  async remove(id: string) {
    return deleteDocument('verification_requests', id);
  },
};

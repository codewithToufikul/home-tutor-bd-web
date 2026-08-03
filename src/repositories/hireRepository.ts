import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface HireRequestRecord {
  id?: string;
  tutorId?: string;
  tutorName?: string;
  guardianName?: string;
  guardianPhone?: string;
  requirements?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export const HireRepository = {
  async getById(id: string) {
    return getDocument<HireRequestRecord>('hire_requests', id);
  },

  async getAll() {
    return listDocuments<HireRequestRecord>('hire_requests');
  },

  async create(record: HireRequestRecord) {
    return createDocument('hire_requests', record);
  },

  async update(id: string, data: Partial<HireRequestRecord>) {
    return updateDocument('hire_requests', id, data);
  },

  async remove(id: string) {
    return deleteDocument('hire_requests', id);
  },
};

import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface ApplicationRecord {
  id?: string;
  jobId: string;
  tutorId: string;
  guardianId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt?: string;
  updatedAt?: string;
}

export const ApplicationRepository = {
  async getById(id: string) {
    return getDocument<ApplicationRecord>('applications', id);
  },

  async getAll() {
    return listDocuments<ApplicationRecord>('applications');
  },

  async getByJob(jobId: string) {
    return listDocuments<ApplicationRecord>('applications', [{ field: 'jobId', op: '==', value: jobId }]);
  },

  async getByTutor(tutorId: string) {
    return listDocuments<ApplicationRecord>('applications', [{ field: 'tutorId', op: '==', value: tutorId }]);
  },

  async create(record: ApplicationRecord) {
    return createDocument('applications', record);
  },

  async update(id: string, data: Partial<ApplicationRecord>) {
    return updateDocument('applications', id, data);
  },

  async remove(id: string) {
    return deleteDocument('applications', id);
  },
};

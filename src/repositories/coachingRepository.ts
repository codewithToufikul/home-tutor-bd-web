import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface CoachingCenterRecord {
  id?: string;
  name: string;
  logo?: string;
  className?: string;
  subject?: string;
  admissionCost?: string;
  currentStudents?: string;
  startDate?: string;
  address?: string;
  licensePhoto?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const CoachingRepository = {
  async getById(id: string) {
    return getDocument<CoachingCenterRecord>('coaching_centers', id);
  },

  async getAll() {
    return listDocuments<CoachingCenterRecord>('coaching_centers');
  },

  async create(record: CoachingCenterRecord) {
    return createDocument('coaching_centers', record);
  },

  async update(id: string, data: Partial<CoachingCenterRecord>) {
    return updateDocument('coaching_centers', id, data);
  },

  async remove(id: string) {
    return deleteDocument('coaching_centers', id);
  },
};

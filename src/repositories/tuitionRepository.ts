import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface TuitionJobRecord {
  id?: string;
  parentId?: string;
  studentClass: string;
  subjects: string[];
  location: string;
  area: string;
  salary: number;
  medium: string;
  genderPreference?: 'Male' | 'Female' | 'Any';
  status: 'Open' | 'Matched' | 'Closed';
  createdAt: string;
  tutoringDays?: string;
  tuitionType?: string;
  studentGender?: string;
  numStudents?: number;
  duration?: string;
  startTime?: string;
  schoolName?: string;
  requirements?: string[];
  description?: string;
  category?: string;
  isDeleted?: boolean;
}

export const TuitionRepository = {
  async getById(id: string) {
    return getDocument<TuitionJobRecord>('tuition_jobs', id);
  },

  async getAll() {
    return listDocuments<TuitionJobRecord>('tuition_jobs', [{ field: 'isDeleted', op: '!=', value: true }]);
  },

  async create(record: TuitionJobRecord) {
    return createDocument('tuition_jobs', record);
  },

  async update(id: string, data: Partial<TuitionJobRecord>) {
    return updateDocument('tuition_jobs', id, data);
  },

  async remove(id: string) {
    return deleteDocument('tuition_jobs', id);
  },

  async softDelete(id: string) {
    return updateDocument('tuition_jobs', id, { isDeleted: true });
  },
};

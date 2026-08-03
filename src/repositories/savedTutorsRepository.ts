import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface SavedTutorRecord {
  id?: string;
  guardianId?: string;
  studentId?: string;
  tutorId: string;
  createdAt?: string;
}

export const SavedTutorsRepository = {
  async getById(id: string) {
    return getDocument<SavedTutorRecord>('saved_tutors', id);
  },

  async getAll() {
    return listDocuments<SavedTutorRecord>('saved_tutors');
  },

  async listForGuardian(guardianId: string) {
    return listDocuments<SavedTutorRecord>('saved_tutors', [{ field: 'guardianId', op: '==', value: guardianId }]);
  },

  async listForStudent(studentId: string) {
    return listDocuments<SavedTutorRecord>('saved_tutors', [{ field: 'studentId', op: '==', value: studentId }]);
  },

  async create(record: SavedTutorRecord) {
    return createDocument('saved_tutors', record);
  },

  async remove(id: string) {
    return deleteDocument('saved_tutors', id);
  },
};

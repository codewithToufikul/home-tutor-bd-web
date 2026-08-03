import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface TutorRecord {
  id?: string;
  uid: string;
  name: string;
  email: string;
  university?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  subjects?: string[];
  preferredAreas?: string[];
  mediums?: string[];
  salary?: number;
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  isPremium?: boolean;
  bio?: string;
  gender?: 'Male' | 'Female';
  photoUrl?: string;
  location?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const TutorRepository = {
  async getById(id: string) {
    return getDocument<TutorRecord>('tutors', id);
  },

  async getByUid(uid: string) {
    const items = await listDocuments<TutorRecord>('tutors', [{ field: 'uid', op: '==', value: uid }]);
    return items[0] ?? null;
  },

  async getAll() {
    return listDocuments<TutorRecord>('tutors', [{ field: 'isDeleted', op: '!=', value: true }]);
  },

  async create(record: TutorRecord) {
    return createDocument('tutors', record);
  },

  async update(id: string, data: Partial<TutorRecord>) {
    return updateDocument('tutors', id, data);
  },

  async softDelete(id: string) {
    return updateDocument('tutors', id, { isDeleted: true });
  },

  async remove(id: string) {
    return deleteDocument('tutors', id);
  },
};

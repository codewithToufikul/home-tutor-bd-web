import { createDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export type UserRole = 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching';

export interface UserRecord {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  isApproved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const UserRepository = {
  async getByUid(uid: string) {
    return getDocument<UserRecord>('users', uid);
  },

  async getAll() {
    return listDocuments<UserRecord>('users');
  },

  async create(record: UserRecord) {
    return createDocument('users', record);
  },

  async update(uid: string, data: Partial<UserRecord>) {
    return updateDocument('users', uid, data);
  },
};

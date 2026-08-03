import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface GuardianProfileRecord {
  id?: string;
  uid: string;
  name?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  childName?: string;
  childClass?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const GuardianProfileRepository = {
  async getById(id: string) {
    return getDocument<GuardianProfileRecord>('guardian_profiles', id);
  },

  async getByUid(uid: string) {
    const items = await listDocuments<GuardianProfileRecord>('guardian_profiles', [{ field: 'uid', op: '==', value: uid }]);
    return items[0] ?? null;
  },

  async getAll() {
    return listDocuments<GuardianProfileRecord>('guardian_profiles');
  },

  async create(record: GuardianProfileRecord) {
    return createDocument('guardian_profiles', record);
  },

  async update(id: string, data: Partial<GuardianProfileRecord>) {
    return updateDocument('guardian_profiles', id, data);
  },

  async remove(id: string) {
    return deleteDocument('guardian_profiles', id);
  },
};

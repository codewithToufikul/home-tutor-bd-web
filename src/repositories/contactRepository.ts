import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface ContactRecord {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead?: boolean;
  createdAt?: string;
}

export const ContactRepository = {
  async getById(id: string) {
    return getDocument<ContactRecord>('contact_messages', id);
  },

  async getAll() {
    return listDocuments<ContactRecord>('contact_messages');
  },

  async create(record: ContactRecord) {
    return createDocument('contact_messages', record);
  },

  async update(id: string, data: Partial<ContactRecord>) {
    return updateDocument('contact_messages', id, data);
  },

  async remove(id: string) {
    return deleteDocument('contact_messages', id);
  },
};

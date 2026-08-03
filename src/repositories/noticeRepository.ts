import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface NoticeRecord {
  id?: string;
  title: string;
  message: string;
  authorId?: string;
  isRead?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const NoticeRepository = {
  async getById(id: string) {
    return getDocument<NoticeRecord>('system_notices', id);
  },

  async getAll() {
    return listDocuments<NoticeRecord>('system_notices');
  },

  async create(record: NoticeRecord) {
    return createDocument('system_notices', record);
  },

  async update(id: string, data: Partial<NoticeRecord>) {
    return updateDocument('system_notices', id, data);
  },

  async remove(id: string) {
    return deleteDocument('system_notices', id);
  },
};

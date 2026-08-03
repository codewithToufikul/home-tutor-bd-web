import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface DownloadRecord {
  id?: string;
  title: string;
  url?: string;
  category?: string;
  createdAt?: string;
}

export const DownloadRepository = {
  async getById(id: string) {
    return getDocument<DownloadRecord>('downloads', id);
  },

  async getAll() {
    return listDocuments<DownloadRecord>('downloads');
  },

  async create(record: DownloadRecord) {
    return createDocument('downloads', record);
  },

  async update(id: string, data: Partial<DownloadRecord>) {
    return updateDocument('downloads', id, data);
  },

  async remove(id: string) {
    return deleteDocument('downloads', id);
  },
};

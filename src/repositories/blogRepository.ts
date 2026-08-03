import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface BlogRecord {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  authorId?: string;
  isPublished?: boolean;
  createdAt?: string;
}

export const BlogRepository = {
  async getById(id: string) {
    return getDocument<BlogRecord>('blogs', id);
  },

  async getAll() {
    return listDocuments<BlogRecord>('blogs');
  },

  async create(record: BlogRecord) {
    return createDocument('blogs', record);
  },

  async update(id: string, data: Partial<BlogRecord>) {
    return updateDocument('blogs', id, data);
  },

  async remove(id: string) {
    return deleteDocument('blogs', id);
  },
};

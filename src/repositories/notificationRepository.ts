import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface NotificationRecord {
  id?: string;
  title: string;
  message: string;
  tutorId?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const NotificationRepository = {
  async getById(id: string) {
    return getDocument<NotificationRecord>('notifications', id);
  },

  async getAll() {
    return listDocuments<NotificationRecord>('notifications');
  },

  async getByTutor(tutorId: string) {
    return listDocuments<NotificationRecord>('notifications', [{ field: 'tutorId', op: '==', value: tutorId }], 'createdAt');
  },

  async create(record: NotificationRecord) {
    return createDocument('notifications', record);
  },

  async update(id: string, data: Partial<NotificationRecord>) {
    return updateDocument('notifications', id, data);
  },

  async remove(id: string) {
    return deleteDocument('notifications', id);
  },
};

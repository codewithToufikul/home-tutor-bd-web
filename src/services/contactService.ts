import { ContactRepository, ContactRecord } from '@/src/repositories/contactRepository';

export const ContactService = {
  async list() {
    return ContactRepository.getAll();
  },

  async get(id: string) {
    return ContactRepository.getById(id);
  },

  async create(payload: Partial<ContactRecord>) {
    return ContactRepository.create({ ...payload, createdAt: new Date().toISOString() } as ContactRecord);
  },

  async markRead(id: string) {
    return ContactRepository.update(id, { isRead: true });
  },
};

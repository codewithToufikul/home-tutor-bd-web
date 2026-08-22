import { ContactRepository, ContactRecord } from '@/src/repositories/contactRepository';

export const ContactService = {
  async list() { return ContactRepository.getAll(); },
  async getAll() { return ContactRepository.getAll(); },
  async get(id: string) { return ContactRepository.getById(id); },
  async getById(id: string) { return ContactRepository.getById(id); },
  async create(payload: Partial<ContactRecord>) { return ContactRepository.create(payload); },
  async markRead(id: string) { return ContactRepository.markRead(id); },
  async remove(id: string) { return ContactRepository.remove(id); },
};

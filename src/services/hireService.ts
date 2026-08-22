import { HireRepository, HireRequestRecord } from '@/src/repositories/hireRepository';

export const HireService = {
  async list() {
    return HireRepository.getAll();
  },

  async getAll() {
    return HireRepository.getAll();
  },

  async get(id: string) {
    return HireRepository.getById(id);
  },

  async getById(id: string) {
    return HireRepository.getById(id);
  },

  async create(payload: Partial<HireRequestRecord>) {
    return HireRepository.create({ ...payload, createdAt: new Date().toISOString(), status: 'pending' } as HireRequestRecord);
  },

  async updateStatus(id: string, status: string) {
    return HireRepository.updateStatus(id, status);
  },

  async remove(id: string) {
    return HireRepository.remove(id);
  },
};

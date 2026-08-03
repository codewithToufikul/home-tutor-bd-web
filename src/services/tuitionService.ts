import { TuitionRepository, TuitionJobRecord } from '@/src/repositories/tuitionRepository';

export const TuitionService = {
  async list() {
    return TuitionRepository.getAll();
  },

  async get(id: string) {
    return TuitionRepository.getById(id);
  },

  async create(payload: Partial<TuitionJobRecord>) {
    return TuitionRepository.create({
      ...payload,
      status: payload.status || 'Open',
      createdAt: payload.createdAt || new Date().toISOString(),
    } as TuitionJobRecord);
  },

  async update(id: string, data: Partial<TuitionJobRecord>) {
    return TuitionRepository.update(id, data);
  },

  async remove(id: string) {
    return TuitionRepository.remove(id);
  },
};

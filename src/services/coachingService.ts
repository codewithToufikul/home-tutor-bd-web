import { CoachingRepository, CoachingCenterRecord } from '@/src/repositories/coachingRepository.ts';

export const CoachingService = {
  async list() {
    return CoachingRepository.getAll();
  },

  async get(id: string) {
    return CoachingRepository.getById(id);
  },

  async create(payload: Partial<CoachingCenterRecord>) {
    return CoachingRepository.create({ ...payload, createdAt: new Date().toISOString() } as CoachingCenterRecord);
  },

  async update(id: string, data: Partial<CoachingCenterRecord>) {
    return CoachingRepository.update(id, data);
  },

  async remove(id: string) {
    return CoachingRepository.remove(id);
  },
};

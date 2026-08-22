import { ApplicationRepository, ApplicationRecord } from '@/src/repositories/applicationRepository';

export const ApplicationService = {
  async listForTutor(tutorId: string) {
    return ApplicationRepository.getByTutor(tutorId);
  },

  async get(id: string) {
    return ApplicationRepository.getById(id);
  },

  async create(payload: Partial<ApplicationRecord>) {
    return ApplicationRepository.create({
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ApplicationRecord);
  },

  async update(id: string, data: Partial<ApplicationRecord>) {
    return ApplicationRepository.update(id, data);
  },
};

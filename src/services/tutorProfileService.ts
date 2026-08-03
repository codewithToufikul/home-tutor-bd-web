import { TutorProfileRepository, TutorProfileRecord } from '@/src/repositories/tutorProfileRepository';

export const TutorProfileService = {
  async getById(id: string) {
    return TutorProfileRepository.getById(id);
  },

  async getByUid(uid: string) {
    return TutorProfileRepository.getByUid(uid);
  },

  async getAll() {
    return TutorProfileRepository.getAll();
  },

  async create(payload: Partial<TutorProfileRecord>) {
    return TutorProfileRepository.create(payload as TutorProfileRecord);
  },

  async update(id: string, data: Partial<TutorProfileRecord>) {
    return TutorProfileRepository.update(id, data);
  },

  async remove(id: string) {
    return TutorProfileRepository.remove(id);
  },
};

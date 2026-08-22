import { TutorProfileRepository, TutorProfileRecord } from '@/src/repositories/tutorProfileRepository';
import { getCachedList, getCachedDocument } from '@/src/services/cachedRepository';

export const TutorProfileService = {
  async getById(id: string) {
    return getCachedDocument<TutorProfileRecord>('tutor_profiles', id);
  },

  async getByUid(uid: string) {
    return TutorProfileRepository.getByUid(uid);
  },

  async getAll() {
    return getCachedList<TutorProfileRecord>('tutor_profiles');
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

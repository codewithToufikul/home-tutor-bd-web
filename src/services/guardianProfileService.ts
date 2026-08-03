import { GuardianProfileRepository, GuardianProfileRecord } from '@/src/repositories/guardianProfileRepository.ts';

export const GuardianProfileService = {
  async getByUid(uid: string) {
    return GuardianProfileRepository.getByUid(uid);
  },

  async get(id: string) {
    return GuardianProfileRepository.getById(id);
  },

  async create(payload: GuardianProfileRecord) {
    return GuardianProfileRepository.create(payload as GuardianProfileRecord);
  },

  async update(id: string, data: Partial<GuardianProfileRecord>) {
    return GuardianProfileRepository.update(id, data);
  },
};

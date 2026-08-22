import { CoachingRepository, CoachingProfileRecord, CoachingBatchRecord } from '@/src/repositories/coachingRepository';

export const CoachingService = {
  async getProfile() {
    return CoachingRepository.getProfile();
  },

  async updateProfile(payload: Partial<CoachingProfileRecord>) {
    return CoachingRepository.updateProfile(payload);
  },

  async getStats() {
    return CoachingRepository.getStats();
  },

  async createBatch(payload: Partial<CoachingBatchRecord>) {
    return CoachingRepository.createBatch(payload);
  },

  async deleteBatch(batchId: string) {
    return CoachingRepository.deleteBatch(batchId);
  },

  async list() {
    return CoachingRepository.getAll();
  },

  async remove(id: string) {
    return CoachingRepository.deleteBatch(id);
  },

  async updateStatus(id: string, status: string) {
    return CoachingRepository.updateProfile({ isVerified: status === 'approved' });
  },
};

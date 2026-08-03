import { SavedTutorsRepository, SavedTutorRecord } from '@/src/repositories/savedTutorsRepository.ts';

export const SavedTutorsService = {
  async listForGuardian(guardianId: string) {
    return SavedTutorsRepository.listForGuardian(guardianId);
  },

  async listForStudent(studentId: string) {
    return SavedTutorsRepository.listForStudent(studentId);
  },

  async create(payload: SavedTutorRecord) {
    return SavedTutorsRepository.create(payload as SavedTutorRecord);
  },

  async remove(id: string) {
    return SavedTutorsRepository.remove(id);
  },
};

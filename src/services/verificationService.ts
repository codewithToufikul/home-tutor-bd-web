import { VerificationRepository, VerificationRecord } from '@/src/repositories/verificationRepository';

export const VerificationService = {
  async listForTutor(uid: string) {
    const requests = await VerificationRepository.getAll();
    return requests.filter((req) => req.uid === uid);
  },

  async create(payload: Partial<VerificationRecord>) {
    return VerificationRepository.create({
      ...payload,
      createdAt: new Date().toISOString(),
      status: payload.status ?? 'pending',
    } as VerificationRecord);
  },

  async update(id: string, data: Partial<VerificationRecord>) {
    return VerificationRepository.update(id, data);
  },
};

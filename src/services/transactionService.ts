import { TransactionRepository, TransactionRecord } from '@/src/repositories/transactionRepository';

export const TransactionService = {
  async listForTutor(tutorId: string) {
    return TransactionRepository.getByTutor(tutorId);
  },

  async get(id: string) {
    return TransactionRepository.getById(id);
  },

  async create(payload: Partial<TransactionRecord>) {
    return TransactionRepository.create({
      ...payload,
      createdAt: new Date().toISOString(),
      status: payload.status ?? 'pending',
    } as TransactionRecord);
  },

  async update(id: string, data: Partial<TransactionRecord>) {
    return TransactionRepository.update(id, data);
  },
};

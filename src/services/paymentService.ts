import { PaymentRepository, PaymentRecord } from '@/src/repositories/paymentRepository';

export const PaymentService = {
  async list() {
    return PaymentRepository.getAll();
  },

  async get(id: string) {
    return PaymentRepository.getById(id);
  },

  async create(payload: Partial<PaymentRecord>) {
    return PaymentRepository.create({ ...payload, createdAt: new Date().toISOString(), status: payload.status ?? 'pending' } as PaymentRecord);
  },

  async update(id: string, data: Partial<PaymentRecord>) {
    return PaymentRepository.update(id, data);
  },
};

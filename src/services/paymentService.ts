import { PaymentRepository, PaymentRecord } from '@/src/repositories/paymentRepository';

export const PaymentService = {
  async list() {
    return PaymentRepository.list();
  },

  async getAll() {
    return PaymentRepository.getAll();
  },

  async get(id: string) {
    return PaymentRepository.get(id);
  },

  async getById(id: string) {
    return PaymentRepository.get(id);
  },

  async create(payload: Partial<PaymentRecord>) {
    return PaymentRepository.create({ ...payload, createdAt: new Date().toISOString(), status: payload.status ?? 'pending' } as PaymentRecord);
  },

  async update(id: string, _data: Partial<PaymentRecord>) {
    return PaymentRepository.get(id);
  },
};

import { PaymentRequestRepository, PaymentRequestRecord } from '@/src/repositories/paymentRequestRepository';

export const PaymentRequestService = {
  async listForTutor(tutorId: string) {
    return PaymentRequestRepository.getByTutor(tutorId);
  },

  async create(payload: Partial<PaymentRequestRecord>) {
    return PaymentRequestRepository.create({
      ...payload,
      createdAt: new Date().toISOString(),
      status: payload.status ?? 'pending',
    } as PaymentRequestRecord);
  },

  async update(id: string, data: Partial<PaymentRequestRecord>) {
    return PaymentRequestRepository.update(id, data);
  },
};

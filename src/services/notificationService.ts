import { NotificationRepository, NotificationRecord } from '@/src/repositories/notificationRepository';

export const NotificationService = {
  async listForTutor(tutorId: string) {
    return NotificationRepository.getByTutor(tutorId);
  },

  async markRead(id: string) {
    return NotificationRepository.update(id, { isRead: true });
  },

  async create(payload: Partial<NotificationRecord>) {
    return NotificationRepository.create({
      ...payload,
      isRead: payload.isRead ?? false,
      createdAt: new Date().toISOString(),
    } as NotificationRecord);
  },

  async remove(id: string) {
    return NotificationRepository.remove(id);
  },
};

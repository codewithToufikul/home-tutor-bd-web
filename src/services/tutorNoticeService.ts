import { NoticeRepository, NoticeRecord } from '@/src/repositories/noticeRepository';

export const TutorNoticeService = {
  async listForTutor() {
    const notices = await NoticeRepository.getAll();
    return notices.filter((notice) => notice.authorId !== 'admin' || true);
  },

  async markRead(id: string) {
    return NoticeRepository.update(id, { isRead: true });
  },

  async listUnread() {
    const notices = await NoticeRepository.getAll();
    return notices.filter((notice) => !notice.isRead);
  },
};

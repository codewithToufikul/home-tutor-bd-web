import { NoticeRepository, NoticeRecord } from '@/src/repositories/noticeRepository';

export const NoticeService = {
  async list() {
    return NoticeRepository.getAll();
  },

  async get(id: string) {
    return NoticeRepository.getById(id);
  },

  async create(payload: Partial<NoticeRecord>) {
    return NoticeRepository.create({ ...payload, createdAt: new Date().toISOString() } as NoticeRecord);
  },

  async update(id: string, data: Partial<NoticeRecord>) {
    return NoticeRepository.update(id, data);
  },

  async remove(id: string) {
    return NoticeRepository.remove(id);
  },
};

import { DownloadRepository, DownloadRecord } from '@/src/repositories/downloadRepository';

export const DownloadService = {
  async list() {
    return DownloadRepository.getAll();
  },

  async get(id: string) {
    return DownloadRepository.getById(id);
  },

  async create(payload: Partial<DownloadRecord>) {
    return DownloadRepository.create({ ...payload, createdAt: new Date().toISOString() } as DownloadRecord);
  },

  async update(id: string, data: Partial<DownloadRecord>) {
    return DownloadRepository.update(id, data);
  },

  async remove(id: string) {
    return DownloadRepository.remove(id);
  },
};

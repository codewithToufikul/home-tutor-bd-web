import { DownloadRepository, DownloadRecord } from '@/src/repositories/downloadRepository';

export const DownloadService = {
  async list() { return DownloadRepository.getAll(); },
  async getAll() { return DownloadRepository.getAll(); },
  async get(id: string) { return DownloadRepository.getById(id); },
  async getById(id: string) { return DownloadRepository.getById(id); },
  async create(payload: Partial<DownloadRecord>) { return DownloadRepository.create(payload); },
  async remove(id: string) { return DownloadRepository.remove(id); },
};

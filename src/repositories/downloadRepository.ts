import { apiGet } from './baseRepository';

export interface DownloadRecord {
  id?: string;
  _id?: string;
  title?: string;
  url?: string;
  [key: string]: unknown;
}

export const DownloadRepository = {
  async list() { return apiGet<DownloadRecord[]>('/downloads'); },
  async getAll() { return apiGet<DownloadRecord[]>('/downloads'); },
  async get(id: string) { return apiGet<DownloadRecord>(`/downloads/${id}`); },
  async getById(id: string) { return apiGet<DownloadRecord>(`/downloads/${id}`); },
  async create(data: Partial<DownloadRecord>) { return apiGet<DownloadRecord>('/downloads'); },
  async remove(id: string) { return apiGet<DownloadRecord>('/downloads'); },
};

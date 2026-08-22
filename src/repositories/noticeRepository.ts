import { apiDelete, apiGet, apiPost } from './baseRepository';

export interface NoticeRecord {
  id?: string;
  _id?: string;
  title?: string;
  content?: string;
  audience?: string;
  [key: string]: unknown;
}

export const NoticeRepository = {
  async list() { return apiGet<NoticeRecord[]>('/admin/notices'); },
  async getAll() { return apiGet<NoticeRecord[]>('/admin/notices'); },
  async get(id: string) { return apiGet<NoticeRecord>(`/admin/notices/${id}`); },
  async getById(id: string) { return apiGet<NoticeRecord>(`/admin/notices/${id}`); },
  async create(data: Partial<NoticeRecord>) { return apiPost<NoticeRecord>('/admin/notices', data); },
  async update(id: string, data: Partial<NoticeRecord>) { return apiPost<NoticeRecord>('/admin/notices', data); },
  async remove(id: string) { return apiDelete(`/admin/notices/${id}`); },
};

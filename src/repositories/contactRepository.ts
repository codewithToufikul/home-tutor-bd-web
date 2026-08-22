import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface ContactRecord {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  message?: string;
  isRead?: boolean;
  [key: string]: unknown;
}

export const ContactRepository = {
  async list() { return apiGet<ContactRecord[]>('/admin/contacts'); },
  async getAll() { return apiGet<ContactRecord[]>('/admin/contacts'); },
  async get(id: string) { return apiGet<ContactRecord>(`/admin/contacts/${id}`); },
  async getById(id: string) { return apiGet<ContactRecord>(`/admin/contacts/${id}`); },
  async create(data: Partial<ContactRecord>) { return apiPost<ContactRecord>('/contact', data); },
  async markRead(id: string) { return apiPatch(`/admin/contacts/${id}/read`, {}); },
  async update(id: string, data: Partial<ContactRecord>) { return apiPatch(`/admin/contacts/${id}`, data); },
  async remove(id: string) { return apiPatch(`/admin/contacts/${id}/read`, {}); },
};

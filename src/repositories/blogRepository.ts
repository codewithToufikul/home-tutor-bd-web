import { apiDelete, apiGet, apiPatch, apiPost } from './baseRepository';

export interface BlogRecord {
  id?: string;
  _id?: string;
  title?: string;
  content?: string;
  author?: string;
  status?: 'draft' | 'published' | 'Approved' | 'Pending' | string;
  [key: string]: unknown;
}

export const BlogRepository = {
  async list() { return apiGet<BlogRecord[]>('/blogs'); },
  async getAll() { return apiGet<BlogRecord[]>('/blogs'); },
  async get(id: string) { return apiGet<BlogRecord>(`/blogs/${id}`); },
  async getById(id: string) { return apiGet<BlogRecord>(`/blogs/${id}`); },
  async create(data: Partial<BlogRecord>) { return apiPost<BlogRecord>('/blogs', data); },
  async update(id: string, data: Partial<BlogRecord>) { return apiPatch<BlogRecord>(`/blogs/${id}`, data); },
  async remove(id: string) { return apiDelete(`/blogs/${id}`); },
};

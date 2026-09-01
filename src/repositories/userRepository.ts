import { apiGet, apiPatch } from './baseRepository';

export type UserRole = 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching';

export interface UserRecord {
  id?: string;
  _id?: string;
  uid?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: UserRole | string;
  status?: string;
  isApproved?: boolean;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  [key: string]: unknown;
}

export const UserRepository = {
  async get(id: string) { return apiGet<UserRecord>(`/users/${id}`); },
  async list() { return apiGet<UserRecord[]>('/admin/users'); },
  async getAll() { return apiGet<UserRecord[]>('/admin/users'); },
  async update(id: string, data: Partial<UserRecord>) { return apiPatch<UserRecord>(`/admin/users/${id}`, data); },
  async updateStatus(id: string, status: string) { return apiPatch<UserRecord>(`/admin/users/${id}/status`, { status }); },
};

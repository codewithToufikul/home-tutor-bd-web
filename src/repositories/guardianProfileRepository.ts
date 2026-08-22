import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface GuardianProfileRecord {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  [key: string]: unknown;
}

export const GuardianProfileRepository = {
  async get(id: string) { return apiGet<GuardianProfileRecord>(`/users/${id}`); },
  async getByUid(uid: string) { return apiGet<GuardianProfileRecord>(`/users/${uid}`); },
  async getById(id: string) { return apiGet<GuardianProfileRecord>(`/users/${id}`); },
  async create(data: Partial<GuardianProfileRecord>) { return apiPost<GuardianProfileRecord>('/users/profile', data); },
  async update(id: string, data: Partial<GuardianProfileRecord>) { return apiPatch<GuardianProfileRecord>(`/users/${id}`, data); },
};

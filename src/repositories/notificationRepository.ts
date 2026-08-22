import { apiGet, apiPatch, apiPost } from './baseRepository';

export interface NotificationRecord {
  id?: string;
  _id?: string;
  userId?: string;
  tutorId?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  type?: string;
  [key: string]: unknown;
}

export const NotificationRepository = {
  async getAll() {
    const res = await apiGet<any>('/notifications');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.notifications)) return res.notifications;
    return [];
  },
  async getByTutor(_tutorId?: string) { return apiGet<NotificationRecord[]>('/notifications'); },
  async create(record: Partial<NotificationRecord>) { return apiPost<NotificationRecord>('/notifications', record); },
  async update(id: string, data: Partial<NotificationRecord>) { return apiPatch(`/notifications/${id}`, data); },
  async markAllRead() { return apiPatch('/notifications/read-all', {}); },
  async remove(id: string) { return apiPatch(`/notifications/${id}/read`, {}); },
};

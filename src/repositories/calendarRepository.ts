import { apiDelete, apiGet, apiPost } from './baseRepository';

export interface CalendarEventRecord {
  id?: string;
  _id?: string;
  title?: string;
  date?: string;
  userId?: string;
  [key: string]: unknown;
}

export const CalendarRepository = {
  async list() { return apiGet<CalendarEventRecord[]>('/calendar'); },
  async getAll() { return apiGet<CalendarEventRecord[]>('/calendar'); },
  async getById(id: string) { return apiGet<CalendarEventRecord>(`/calendar/${id}`); },
  async create(data: Partial<CalendarEventRecord>) { return apiPost<CalendarEventRecord>('/calendar', data); },
  async update(id: string, data: Partial<CalendarEventRecord>) { return apiPost<CalendarEventRecord>(`/calendar`, data); },
  async remove(id: string) { return apiDelete(`/calendar/${id}`); },
};

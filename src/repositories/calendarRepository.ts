import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface EventRecord {
  id?: string;
  title: string;
  date: string;
  description?: string;
  location?: string;
  createdAt?: string;
}

export const CalendarRepository = {
  async getById(id: string) {
    return getDocument<EventRecord>('calendar_events', id);
  },

  async getAll() {
    return listDocuments<EventRecord>('calendar_events');
  },

  async create(record: EventRecord) {
    return createDocument('calendar_events', record);
  },

  async update(id: string, data: Partial<EventRecord>) {
    return updateDocument('calendar_events', id, data);
  },

  async remove(id: string) {
    return deleteDocument('calendar_events', id);
  },
};

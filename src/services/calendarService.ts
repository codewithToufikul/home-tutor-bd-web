import { CalendarRepository, EventRecord } from '@/src/repositories/calendarRepository';

export const CalendarService = {
  async list() {
    return CalendarRepository.getAll();
  },

  async get(id: string) {
    return CalendarRepository.getById(id);
  },

  async create(payload: Partial<EventRecord>) {
    return CalendarRepository.create({ ...payload, createdAt: new Date().toISOString() } as EventRecord);
  },

  async update(id: string, data: Partial<EventRecord>) {
    return CalendarRepository.update(id, data);
  },

  async remove(id: string) {
    return CalendarRepository.remove(id);
  },
};

import { TuitionRepository, TuitionJobRecord } from '@/src/repositories/tuitionRepository';

export const TuitionService = {
  async list() {
    return TuitionRepository.list().then(res => {
      const all = Array.isArray(res) ? res : (res as any)?.data ?? [];
      return all.filter((j: TuitionJobRecord) => !j['isDeleted']);
    });
  },

  async get(id: string) {
    return TuitionRepository.get(id);
  },

  async create(payload: Record<string, unknown>) {
    // Only send fields that the backend schema accepts
    const body: Record<string, unknown> = {
      studentClass: payload['studentClass'],
      subjects: payload['subjects'],
      location: payload['location'],
      salary: payload['salary'],
      medium: payload['medium'],
      genderPreference: payload['genderPreference'] || 'Any',
      tutoringDays: payload['tutoringDays'] || [],
      numStudents: payload['numStudents'] || 1,
      status: payload['status'] || 'Open',
    };
    // Remove undefined keys
    Object.keys(body).forEach(k => body[k] === undefined && delete body[k]);
    return TuitionRepository.create(body as any);
  },

  async update(id: string, data: Partial<TuitionJobRecord>) {
    return TuitionRepository.update(id, data);
  },

  async remove(id: string) {
    return TuitionRepository.remove(id);
  },
};

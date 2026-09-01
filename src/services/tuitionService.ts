import { TuitionRepository, TuitionJobRecord } from '@/src/repositories/tuitionRepository';

export const TuitionService = {
  async list() {
    return TuitionRepository.list().then(res => {
      const all = Array.isArray(res) ? res : (res as any)?.data ?? [];
      return all
        .filter((j: TuitionJobRecord) => !j['isDeleted'])
        .map((j: any) => ({
          ...j,
          id: j.id || j._id,
        }));
    });
  },

  async get(id: string) {
    return TuitionRepository.get(id);
  },

  async create(payload: Record<string, unknown> | any) {
    const location = typeof payload['location'] === 'object' && payload['location'] !== null
      ? payload['location']
      : {
          district: payload['district'] || payload['location'] || 'Dhaka',
          area: payload['area'] || 'All Areas',
        };

    const body: Record<string, unknown> = {
      studentClass: payload['studentClass'],
      subjects: payload['subjects'],
      location,
      salary: typeof payload['salary'] === 'number' ? payload['salary'] : parseInt(String(payload['salary'] || 5000), 10) || 5000,
      medium: payload['medium'],
      genderPreference: payload['genderPreference'] || 'Any',
      tutoringDays: Array.isArray(payload['tutoringDays']) ? payload['tutoringDays'] : (payload['tutoringDays'] ? [payload['tutoringDays']] : []),
      numStudents: payload['numStudents'] || 1,
      tuitionType: payload['tuitionType'] || 'Home Tuition',
      studentGender: payload['studentGender'] || 'Any',
      duration: payload['duration'] || '1.5 Hours',
      startTime: payload['startTime'] || 'Evening',
      schoolName: payload['schoolName'] || '',
      description: payload['description'] || '',
      phone: payload['phone'] || '',
      name: payload['name'] || '',
      status: payload['status'] || 'Open',
      approvalStatus: payload['approvalStatus'] || 'Approved',
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

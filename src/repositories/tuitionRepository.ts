import { apiDelete, apiGet, apiPatch, apiPost } from './baseRepository';

export interface TuitionJobRecord {
  id?: string;
  _id?: string;
  subjects?: string[];
  location?: { district?: string; area?: string };
  salary?: number;
  status?: string;
  postedBy?: string;
  [key: string]: unknown;
}

export const TuitionRepository = {
  async getAll() { return apiGet<TuitionJobRecord[]>('/tuition-jobs'); },
  async list(params?: Record<string, unknown>) {
    const qs = params ? '?' + new URLSearchParams(params as Record<string,string>).toString() : '';
    return apiGet<{ data: TuitionJobRecord[] }>(`/tuition-jobs${qs}`);
  },
  async get(id: string) { return apiGet<TuitionJobRecord>(`/tuition-jobs/${id}`); },
  async create(data: Partial<TuitionJobRecord>) { return apiPost<TuitionJobRecord>('/tuition-jobs', data); },
  async update(id: string, data: Partial<TuitionJobRecord>) { return apiPatch<TuitionJobRecord>(`/tuition-jobs/${id}`, data); },
  async remove(id: string) { return apiDelete(`/tuition-jobs/${id}`); },
  async apply(jobId: string, expectedSalary?: number) { return apiPost(`/tuition-jobs/${jobId}/apply`, { expectedSalary }); },
};

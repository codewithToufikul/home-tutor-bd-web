import { apiDelete, apiGet, apiPatch, apiPost } from './baseRepository';

export interface TuitionJobRecord {
  id?: string;
  _id?: string;
  customId?: string;
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
  async apply(jobId: string, payload?: { expectedSalary?: number; coverLetter?: string; availableTime?: string[] }) {
    return apiPost(`/tuition-jobs/${jobId}/apply`, payload || {});
  },
  async getShortlisted(jobId: string) {
    return apiGet<{ jobId: string; matchingRunAt: string; shortlistedTutors: any[] }>(`/tuition-jobs/${jobId}/shortlisted`);
  },
  async rematch(jobId: string) {
    return apiPost<{ message: string }>(`/tuition-jobs/${jobId}/rematch`, {});
  },
  async getApplications(jobId: string) {
    return apiGet<any[]>(`/applications/job/${jobId}`);
  },
  async withdrawApplication(applicationId: string) {
    return apiPatch(`/applications/${applicationId}/withdraw`, {});
  },
};

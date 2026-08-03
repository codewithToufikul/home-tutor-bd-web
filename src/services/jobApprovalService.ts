import { JobApprovalRepository, JobApprovalRecord } from '@/src/repositories/jobApprovalRepository';

export const JobApprovalService = {
  async list() {
    return JobApprovalRepository.getAll();
  },

  async get(id: string) {
    return JobApprovalRepository.getById(id);
  },

  async create(payload: Partial<JobApprovalRecord>) {
    return JobApprovalRepository.create({ ...payload, createdAt: new Date().toISOString(), status: 'pending' } as JobApprovalRecord);
  },

  async updateStatus(id: string, status: JobApprovalRecord['status']) {
    return JobApprovalRepository.update(id, { status });
  },
};

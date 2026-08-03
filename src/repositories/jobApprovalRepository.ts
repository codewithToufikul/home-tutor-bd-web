import { createDocument, deleteDocument, getDocument, listDocuments, updateDocument } from '@/src/repositories/baseRepository.ts';

export interface JobApprovalRecord {
  id?: string;
  jobId?: string;
  title?: string;
  parentId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'published' | 'archived';
  createdAt?: string;
}

export const JobApprovalRepository = {
  async getById(id: string) {
    return getDocument<JobApprovalRecord>('job_approvals', id);
  },

  async getAll() {
    return listDocuments<JobApprovalRecord>('job_approvals');
  },

  async create(record: JobApprovalRecord) {
    return createDocument('job_approvals', record);
  },

  async update(id: string, data: Partial<JobApprovalRecord>) {
    return updateDocument('job_approvals', id, data);
  },

  async remove(id: string) {
    return deleteDocument('job_approvals', id);
  },
};

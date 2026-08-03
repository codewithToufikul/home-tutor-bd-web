import { UserRepository } from '@/src/repositories/userRepository.ts';
import { TutorRepository } from '@/src/repositories/tutorRepository.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository.ts';
import { JobApprovalRepository } from '@/src/repositories/jobApprovalRepository.ts';
import { VerificationRepository } from '@/src/repositories/verificationRepository.ts';
import { ContactRepository } from '@/src/repositories/contactRepository.ts';
import { NoticeRepository } from '@/src/repositories/noticeRepository.ts';
import { BlogRepository } from '@/src/repositories/blogRepository.ts';
import { PaymentRepository } from '@/src/repositories/paymentRepository.ts';
import { CoachingRepository } from '@/src/repositories/coachingRepository.ts';

export const AdminService = {
  async totalUsers() {
    const users = await UserRepository.getAll();
    return users.length;
  },

  async totalTutors() {
    const tutors = await TutorRepository.getAll();
    return tutors.length;
  },

  async totalCoachingCenters() {
    const coachingCenters = await CoachingRepository.getAll();
    return coachingCenters.length;
  },

  async totalGuardians() {
    const users = await UserRepository.getAll();
    return users.filter(u => u.role === 'guardian').length;
  },

  async totalTuitionJobs() {
    const jobs = await TuitionRepository.getAll();
    return jobs.length;
  },

  async pendingApprovals() {
    const approvals = await JobApprovalRepository.getAll();
    return approvals.filter(a => (a as any).status === 'pending').length;
  },

  async verificationRequests() {
    const reqs = await VerificationRepository.getAll();
    return reqs.filter(r => (r as any).status === 'pending').length;
  },

  async unreadContactMessages() {
    const msgs = await ContactRepository.getAll();
    return msgs.filter(m => !(m as any).isRead).length;
  },

  async unreadNotifications() {
    const notifs = await NoticeRepository.getAll();
    return notifs.filter(n => !(n as any).isRead).length;
  },

  async totalBlogs() {
    const blogs = await BlogRepository.getAll();
    return blogs.length;
  },

  async pendingBlogs() {
    const blogs = await BlogRepository.getAll();
    return blogs.filter(blog => String((blog as any).status || '').toLowerCase() === 'pending').length;
  },

  async totalPayments() {
    const payments = await PaymentRepository.getAll();
    return payments.length;
  }
};

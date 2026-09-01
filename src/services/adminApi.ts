import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardStats: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['AdminStats', 'User', 'TuitionJob', 'Tutor'],
    }),
    getAdminUsers: builder.query({
      query: (params?: Record<string, unknown>) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/admin/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['User', 'AdminStats'],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'Tutor', 'AdminStats'],
    }),
    getPendingTutors: builder.query({
      query: () => '/admin/tutors/pending',
      providesTags: ['User', 'Tutor'],
    }),
    approveTutor: builder.mutation({
      query: ({ id, isApproved = true, rejectionReason }: { id: string; isApproved?: boolean; rejectionReason?: string }) => ({
        url: `/admin/tutors/${id}/approve`,
        method: 'PATCH',
        body: { isApproved, rejectionReason },
      }),
      invalidatesTags: ['User', 'Tutor', 'AdminStats'],
    }),
    getAllTuitionJobs: builder.query({
      query: (params?: Record<string, unknown>) => ({
        url: '/tuition-jobs',
        params: { approvalStatus: 'all', ...params },
      }),
      providesTags: ['TuitionJob'],
    }),
    getAdminApplications: builder.query({
      query: () => '/admin/applications',
      providesTags: ['Application', 'TuitionJob'],
    }),
    getPendingJobs: builder.query({
      query: () => '/admin/jobs/pending',
      providesTags: ['TuitionJob'],
    }),
    deleteJob: builder.mutation({
      query: (id: string) => ({
        url: `/tuition-jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TuitionJob', 'AdminStats'],
    }),
    updateJobStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/tuition-jobs/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['TuitionJob', 'AdminStats'],
    }),
    approveJob: builder.mutation({
      query: ({ id, approvalStatus = 'Approved' }: { id: string; approvalStatus?: string }) => ({
        url: `/admin/jobs/${id}/approve`,
        method: 'PATCH',
        body: { approvalStatus },
      }),
      invalidatesTags: ['TuitionJob', 'AdminStats'],
    }),
    getAdminVerifications: builder.query({
      query: () => '/admin/verifications',
      providesTags: ['Verification'],
    }),
    updateVerificationStatus: builder.mutation({
      query: ({ id, status, rejectionReason }: { id: string; status: string; rejectionReason?: string }) => ({
        url: `/admin/verifications/${id}`,
        method: 'PATCH',
        body: { status, rejectionReason },
      }),
      invalidatesTags: ['Verification', 'Tutor', 'AdminStats'],
    }),
    getAdminPayments: builder.query({
      query: () => '/admin/payments',
      providesTags: ['Payment'],
    }),
    updatePaymentStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: string }) => ({
        url: `/admin/payments/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Payment', 'AdminStats'],
    }),
    // Staff (Super Admin, Admin, Moderator) Management
    getStaff: builder.query({
      query: () => '/admin/staff',
      providesTags: ['User'],
    }),
    createStaff: builder.mutation({
      query: (body: {
        name: string;
        email: string;
        phone?: string;
        role: 'admin' | 'moderator';
        password: string;
        permissions?: string[];
      }) => ({
        url: '/admin/staff',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'AdminStats'],
    }),
    updateStaffStatus: builder.mutation({
      query: ({ id, status }: { id: string; status: 'active' | 'blocked' }) => ({
        url: `/admin/staff/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['User'],
    }),
    updateStaffPermissions: builder.mutation({
      query: ({ id, permissions }: { id: string; permissions: string[] }) => ({
        url: `/admin/staff/${id}/permissions`,
        method: 'PATCH',
        body: { permissions },
      }),
      invalidatesTags: ['User'],
    }),
    deleteStaff: builder.mutation({
      query: (id: string) => ({
        url: `/admin/staff/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User', 'AdminStats'],
    }),
    // Admin create tuition job (bypasses student requirement)
    createTuitionJob: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/tuition-jobs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TuitionJob', 'AdminStats'],
    }),
    acceptAdminApplication: builder.mutation({
      query: (id: string) => ({
        url: `/applications/${id}/accept`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Application', 'TuitionJob', 'AdminStats'],
    }),
    rejectAdminApplication: builder.mutation({
      query: (id: string) => ({
        url: `/applications/${id}/reject`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Application', 'TuitionJob', 'AdminStats'],
    }),
  }),
});

export const {
  useGetAdminDashboardStatsQuery,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetPendingTutorsQuery,
  useApproveTutorMutation,
  useGetAllTuitionJobsQuery,
  useGetAdminApplicationsQuery,
  useGetPendingJobsQuery,
  useApproveJobMutation,
  useUpdateJobStatusMutation,
  useDeleteJobMutation,
  useGetAdminVerificationsQuery,
  useUpdateVerificationStatusMutation,
  useGetAdminPaymentsQuery,
  useUpdatePaymentStatusMutation,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffPermissionsMutation,
  useDeleteStaffMutation,
  useCreateTuitionJobMutation,
  useAcceptAdminApplicationMutation,
  useRejectAdminApplicationMutation,
} = adminApi;

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
      query: ({ id, isApproved = true }: { id: string; isApproved?: boolean }) => ({
        url: `/admin/tutors/${id}/approve`,
        method: 'PATCH',
        body: { isApproved },
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
  useDeleteJobMutation,
  useGetAdminVerificationsQuery,
  useUpdateVerificationStatusMutation,
  useGetAdminPaymentsQuery,
  useUpdatePaymentStatusMutation,
} = adminApi;

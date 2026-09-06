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
    updateTuitionJob: builder.mutation({
      query: ({ id, ...data }: { id: string; [key: string]: any }) => ({
        url: `/tuition-jobs/${id}`,
        method: 'PATCH',
        body: data,
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
    // Notices Management & Display
    getNotices: builder.query({
      query: (params?: { audience?: string }) => ({
        url: '/notices',
        params,
      }),
      providesTags: ['Notice'],
    }),
    getAdminNotices: builder.query({
      query: () => '/notices/admin/all',
      providesTags: ['Notice'],
    }),
    createNotice: builder.mutation({
      query: (body: Record<string, any>) => ({
        url: '/notices',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notice'],
    }),
    updateNotice: builder.mutation({
      query: ({ id, ...body }: { id: string; [key: string]: any }) => ({
        url: `/notices/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Notice'],
    }),
    deleteNotice: builder.mutation({
      query: (id: string) => ({
        url: `/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notice'],
    }),
    // Blogs Management & Reading
    getBlogs: builder.query({
      query: (params?: Record<string, any>) => ({
        url: '/blogs',
        params,
      }),
      providesTags: ['Blog'],
    }),
    getBlogByIdOrSlug: builder.query({
      query: (idOrSlug: string) => `/blogs/${idOrSlug}`,
      providesTags: ['Blog'],
    }),
    getAdminBlogs: builder.query({
      query: (params?: Record<string, any>) => ({
        url: '/admin/blogs',
        params: { all: true, ...params },
      }),
      providesTags: ['Blog'],
    }),
    createBlog: builder.mutation({
      query: (body: Record<string, any>) => ({
        url: '/blogs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Blog'],
    }),
    updateBlog: builder.mutation({
      query: ({ id, ...body }: { id: string; [key: string]: any }) => ({
        url: `/blogs/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Blog'],
    }),
    deleteBlog: builder.mutation({
      query: (id: string) => ({
        url: `/blogs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Blog'],
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
  useUpdateTuitionJobMutation,
  useDeleteJobMutation,
  useGetAdminVerificationsQuery,
  useUpdateVerificationStatusMutation,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffStatusMutation,
  useUpdateStaffPermissionsMutation,
  useDeleteStaffMutation,
  useAcceptAdminApplicationMutation,
  useRejectAdminApplicationMutation,
  useGetNoticesQuery,
  useGetAdminNoticesQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  useGetBlogsQuery,
  useGetBlogByIdOrSlugQuery,
  useGetAdminBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = adminApi;

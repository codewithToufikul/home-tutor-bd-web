import { baseApi } from './baseApi';

export interface TuitionQueryParams {
  search?: string;
  jobId?: string;
  district?: string;
  area?: string;
  subject?: string;
  category?: string;
  medium?: string;
  studentClass?: string;
  tuitionType?: string;
  gender?: string;
  genderPreference?: string;
  minSalary?: number | string;
  maxSalary?: number | string;
  page?: number;
  limit?: number;
  cursor?: string;
}

export const tuitionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTuitionJobs: builder.query({
      query: (params: TuitionQueryParams) => ({
        url: '/tuition-jobs',
        params,
      }),
      providesTags: ['TuitionJob'],
    }),
    getTuitionJobById: builder.query({
      query: (id: string) => `/tuition-jobs/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TuitionJob', id }],
    }),
    createTuitionJob: builder.mutation({
      query: (body) => ({
        url: '/tuition-jobs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TuitionJob'],
    }),
    updateTuitionJob: builder.mutation({
      query: ({ id, ...body }: { id: string }) => ({
        url: `/tuition-jobs/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'TuitionJob', id }, 'TuitionJob'],
    }),
    deleteTuitionJob: builder.mutation({
      query: (id: string) => ({
        url: `/tuition-jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TuitionJob'],
    }),
    applyToTuitionJob: builder.mutation({
      query: ({ jobId, expectedSalary }: { jobId: string; expectedSalary?: number }) => ({
        url: `/tuition-jobs/${jobId}/apply`,
        method: 'POST',
        body: { expectedSalary },
      }),
      invalidatesTags: ['Application', 'TuitionJob'],
    }),
  }),
});

export const {
  useGetTuitionJobsQuery,
  useGetTuitionJobByIdQuery,
  useCreateTuitionJobMutation,
  useUpdateTuitionJobMutation,
  useDeleteTuitionJobMutation,
  useApplyToTuitionJobMutation,
} = tuitionApi;

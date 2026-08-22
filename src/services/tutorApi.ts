import { baseApi } from './baseApi';

export interface TutorQueryParams {
  subject?: string;
  district?: string;
  area?: string;
  medium?: string;
  minSalary?: number | string;
  maxSalary?: number | string;
  isVerified?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
  sortBy?: string;
}

export const tutorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTutors: builder.query({
      query: (params: TutorQueryParams) => ({
        url: '/tutors',
        params,
      }),
      providesTags: ['Tutor'],
    }),
    getTutorById: builder.query({
      query: (id: string) => `/tutors/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Tutor', id }],
    }),
    getMyTutorProfile: builder.query({
      query: () => '/tutors/me',
      providesTags: ['Tutor'],
    }),
    updateTutorProfile: builder.mutation({
      query: (body) => ({
        url: '/tutors/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Tutor'],
    }),
    addTutorReview: builder.mutation({
      query: ({ tutorId, rating }: { tutorId: string; rating: number }) => ({
        url: `/tutors/${tutorId}/reviews`,
        method: 'POST',
        body: { rating },
      }),
      invalidatesTags: (_result, _error, { tutorId }) => [
        { type: 'Tutor', id: tutorId },
        'Tutor',
      ],
    }),
  }),
});

export const {
  useGetTutorsQuery,
  useGetTutorByIdQuery,
  useGetMyTutorProfileQuery,
  useUpdateTutorProfileMutation,
  useAddTutorReviewMutation,
} = tutorApi;

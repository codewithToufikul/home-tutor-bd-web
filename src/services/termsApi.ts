import { baseApi } from './baseApi';

export type TermCategory = 'tutor' | 'student_guardian' | 'coaching' | 'general';

export interface TermItem {
  _id: string;
  category: TermCategory;
  title: string;
  content: string;
  order: number;
  isActive: boolean;
  updatedBy?: { name?: string; email?: string } | string;
  createdAt?: string;
  updatedAt?: string;
}

export const termsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public: get active terms
    getPublicTerms: builder.query<TermItem[], { category?: string } | void>({
      query: (params) => ({
        url: '/terms',
        params: params ? { category: params.category } : undefined,
      }),
      transformResponse: (response: any) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['Terms'],
    }),

    // Admin: get all terms including inactive
    getAdminTerms: builder.query<TermItem[], { category?: string } | void>({
      query: (params) => ({
        url: '/terms/admin/all',
        params: params ? { category: params.category } : undefined,
      }),
      transformResponse: (response: any) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['Terms'],
    }),

    // Admin: create a new term
    createTerm: builder.mutation<TermItem, Partial<TermItem>>({
      query: (body) => ({
        url: '/terms',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Terms'],
    }),

    // Admin: update a term
    updateTerm: builder.mutation<TermItem, { id: string; data: Partial<TermItem> }>({
      query: ({ id, data }) => ({
        url: `/terms/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Terms'],
    }),

    // Admin: bulk update
    bulkUpdateTerms: builder.mutation<TermItem[], { terms: Partial<TermItem>[] }>({
      query: (body) => ({
        url: '/terms/bulk',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Terms'],
    }),

    // Admin: delete a term
    deleteTerm: builder.mutation<void, string>({
      query: (id) => ({
        url: `/terms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Terms'],
    }),

    // Admin: reset to defaults
    resetTermsToDefault: builder.mutation<TermItem[], void>({
      query: () => ({
        url: '/terms/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Terms'],
    }),
  }),
});

export const {
  useGetPublicTermsQuery,
  useGetAdminTermsQuery,
  useCreateTermMutation,
  useUpdateTermMutation,
  useBulkUpdateTermsMutation,
  useDeleteTermMutation,
  useResetTermsToDefaultMutation,
} = termsApi;

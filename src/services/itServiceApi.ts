import { baseApi } from './baseApi';

export type ITServiceCategory =
  | 'web_development'
  | 'app_development'
  | 'ui_ux_design'
  | 'custom_software'
  | 'digital_marketing'
  | 'cloud_devops'
  | 'ai_data_solutions'
  | 'other';

export interface ITServiceItem {
  _id: string;
  title: string;
  slug: string;
  category: ITServiceCategory;
  shortDescription: string;
  fullDescription: string;
  icon?: string;
  thumbnail?: string;
  bannerImage?: string;
  startingPrice?: number;
  deliveryTime?: string;
  features: string[];
  technologies: string[];
  isActive: boolean;
  order: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const itServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query<{ success: boolean; data: ITServiceItem[] }, { category?: string; search?: string; isActive?: boolean } | void>({
      query: (params) => ({
        url: '/services',
        params: params || {},
      }),
      providesTags: ['Services'],
    }),

    getServiceById: builder.query<{ success: boolean; data: ITServiceItem }, string>({
      query: (idOrSlug) => `/services/${idOrSlug}`,
      providesTags: (_result, _error, idOrSlug) => [{ type: 'Services', id: idOrSlug }],
    }),

    createService: builder.mutation<{ success: boolean; data: ITServiceItem }, Partial<ITServiceItem>>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Services'],
    }),

    updateService: builder.mutation<{ success: boolean; data: ITServiceItem }, { id: string; data: Partial<ITServiceItem> }>({
      query: ({ id, data }) => ({
        url: `/services/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Services'],
    }),

    deleteService: builder.mutation<{ success: boolean; data: ITServiceItem }, string>({
      query: (id) => ({
        url: `/services/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Services'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = itServiceApi;

import { baseApi } from './baseApi';

export interface DownloadFile {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  publicId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  category: string;
  targetRoles: string[];
  uploadedBy?: { name?: string; email?: string; role?: string } | string;
  downloadsCount: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const downloadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User: get files filtered by own role
    getMyDownloads: builder.query<
      { files: DownloadFile[]; pagination: Record<string, number> },
      { category?: string; search?: string; page?: number }
    >({
      query: (params) => ({ url: '/downloads', params }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ['Download'],
    }),

    // Admin: get all files
    getAdminDownloads: builder.query<DownloadFile[], void>({
      query: () => '/downloads/admin/all',
      transformResponse: (response: any) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      providesTags: ['Download'],
    }),

    // Admin: upload a new file (multipart/form-data)
    uploadDownloadFile: builder.mutation<DownloadFile, FormData>({
      query: (formData) => ({
        url: '/downloads',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ['Download'],
    }),

    // Track download click
    trackDownload: builder.mutation<{ fileUrl: string; fileName: string }, string>({
      query: (id) => ({ url: `/downloads/${id}/download`, method: 'PATCH' }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ['Download'],
    }),

    // Admin: toggle published
    toggleDownloadPublished: builder.mutation<DownloadFile, string>({
      query: (id) => ({ url: `/downloads/${id}/toggle`, method: 'PATCH' }),
      transformResponse: (response: any) => response?.data || response,
      invalidatesTags: ['Download'],
    }),

    // Admin: delete file
    deleteDownloadFile: builder.mutation<void, string>({
      query: (id) => ({ url: `/downloads/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Download'],
    }),
  }),
});

export const {
  useGetMyDownloadsQuery,
  useGetAdminDownloadsQuery,
  useUploadDownloadFileMutation,
  useTrackDownloadMutation,
  useToggleDownloadPublishedMutation,
  useDeleteDownloadFileMutation,
} = downloadApi;

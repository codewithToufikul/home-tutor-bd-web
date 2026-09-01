import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import type { RootState } from '../app/store';
import { logout, setAccessToken } from '../features/auth/authSlice';

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const API_BASE_URL = metaEnv?.VITE_API_URL || 'http://localhost:5001/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.warn('⚠️ Access Token expired (401). Attempting automatic token refresh...');

    const refreshResult = (await rawBaseQuery(
      {
        url: '/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions,
    )) as { data?: { data?: { accessToken: string } } };

    if (refreshResult.data?.data?.accessToken) {
      const newAccessToken = refreshResult.data.data.accessToken;
      console.log('✅ Access Token refreshed successfully via RTK Query interceptor.');

      api.dispatch(setAccessToken(newAccessToken));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      console.error('❌ Refresh Token failed/expired. Logging out user...');
      api.dispatch(logout());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Tutor',
    'TuitionJob',
    'Application',
    'HireRequest',
    'Notification',
    'Chat',
    'AdminStats',
    'Verification',
    'Payment',
    'Services',
  ],
  endpoints: () => ({}),
});

import { baseApi } from './baseApi';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    role: 'student' | 'guardian' | 'tutor' | 'admin' | 'super_admin' | 'moderator' | 'coaching';
    avatar?: string;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isApproved: boolean;
  };
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    // Phone OTP verification (primary)
    verifyPhoneOtp: builder.mutation({
      query: (body: { phone?: string; email?: string; otp: string }) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
    // Legacy alias kept for backward compat
    verifyEmail: builder.mutation({
        query: (body: { phone?: string; email?: string; otp: string }) => ({
          url: '/auth/verify-otp',
          method: 'POST',
          body,
        }),
      }),
      // Resend OTP to phone
      resendOtp: builder.mutation({
        query: (body: { phone?: string; email?: string }) => ({
          url: '/auth/resend-otp',
          method: 'POST',
          body,
        }),
      }),
      login: builder.mutation<{ data: LoginResponse }, unknown>({
        query: (credentials) => ({
          url: '/auth/login',
          method: 'POST',
          body: credentials,
        }),
        invalidatesTags: ['User'],
      }),
      logoutUser: builder.mutation({
        query: () => ({
          url: '/auth/logout',
          method: 'POST',
        }),
        invalidatesTags: ['User'],
      }),
      getMe: builder.query({
        query: () => '/auth/me',
        providesTags: ['User'],
      }),
      updateProfile: builder.mutation({
        query: (body) => ({
          url: '/auth/me',
          method: 'PATCH',
          body,
        }),
        invalidatesTags: ['User'],
      }),
      // Forgot password — accepts phone (primary) or email (fallback)
      forgotPassword: builder.mutation({
          query: (body: { phone?: string; email?: string }) => ({
            url: '/auth/forgot-password',
            method: 'POST',
            body,
          }),
        }),
        // Reset password — accepts phone + otp + newPassword
        resetPassword: builder.mutation({
            query: (body: { phone?: string; email?: string; otp: string; newPassword: string }) => ({
              url: '/auth/reset-password',
              method: 'POST',
              body,
            }),
          }),
        }),
      });

      export const {
        useRegisterMutation,
        useVerifyPhoneOtpMutation,
        useVerifyEmailMutation,
        useResendOtpMutation,
        useLoginMutation,
        useLogoutUserMutation,
        useGetMeQuery,
        useUpdateProfileMutation,
        useForgotPasswordMutation,
        useResetPasswordMutation,
      } = authApi;

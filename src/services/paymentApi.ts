import { baseApi } from './baseApi';

export interface ActiveTuitionFeeItem {
  applicationId: string;
  jobId: string;
  jobIdCustom: string;
  title: string;
  studentClass?: string;
  subject?: string;
  location?: string;
  salary: number;
  platformFee: number;
  totalPaid: number;
  dueAmount: number;
  isPaid: boolean;
  hasPending: boolean;
  lastPaymentDate?: string | null;
}

export interface PaymentRecord {
  _id: string;
  userId: { _id?: string; name?: string; email?: string; phone?: string; avatar?: string } | string;
  tuitionJobId?: { _id?: string; title?: string; jobId?: string; class?: string; salary?: number; location?: string } | string | null;
  applicationId?: string | null;
  paymentType: 'tuition_fee' | 'verification_fee' | 'wallet_recharge';
  amount: number;
  payableAmount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank';
  senderNumber: string;
  transactionId: string;
  receiptUrl?: string | null;
  receiptPublicId?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  approvedBy?: { _id?: string; name?: string; role?: string } | string | null;
  approvedAt?: string | null;
  invoiceNumber: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tutor: Get active tuitions with calculated platform fee and dues
    getTutorActiveTuitions: builder.query<ActiveTuitionFeeItem[], void>({
      query: () => '/payments/tutor-active-tuitions',
      transformResponse: (response: any) => (Array.isArray(response?.data) ? response.data : []),
      providesTags: ['Payment', 'TuitionJob', 'Application'],
    }),

    // Tutor: Get my payment history
    getMyPayments: builder.query<PaymentRecord[], void>({
      query: () => '/payments/my-payments',
      transformResponse: (response: any) => (Array.isArray(response?.data) ? response.data : []),
      providesTags: ['Payment'],
    }),

    // Tutor: Submit payment request with receipt screenshot
    submitPayment: builder.mutation<PaymentRecord, FormData>({
      query: (formData) => ({
        url: '/payments/submit',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Payment', 'TuitionJob', 'Application'],
    }),

    // Admin: Get all payments with filters
    getAdminPayments: builder.query<
      { payments: PaymentRecord[]; pagination: { page: number; limit: number; total: number; pages: number } },
      { status?: string; method?: string; search?: string; page?: number; limit?: number } | void
    >({
      query: (params) => {
        // Strip undefined/null values so they don't pollute query string
        const cleanParams: Record<string, string | number> = {};
        if (params) {
          if (params.status) cleanParams.status = params.status;
          if (params.method) cleanParams.method = params.method;
          if (params.search) cleanParams.search = params.search;
          if (params.page) cleanParams.page = params.page;
          if (params.limit) cleanParams.limit = params.limit;
        }
        return {
          url: '/payments/admin/all',
          params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
        };
      },
      transformResponse: (response: any) => {
        const data = response?.data;
        if (data && Array.isArray(data.payments)) return data;
        // Handle case where backend returns array directly
        if (Array.isArray(data)) return { payments: data, pagination: { page: 1, limit: 50, total: data.length, pages: 1 } };
        return { payments: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } };
      },
      providesTags: ['Payment'],
    }),

    // Admin: Approve payment
    approvePayment: builder.mutation<PaymentRecord, string>({
      query: (id) => ({
        url: `/payments/admin/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Payment', 'TuitionJob', 'Application'],
    }),

    // Admin: Reject payment
    rejectPayment: builder.mutation<PaymentRecord, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/payments/admin/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['Payment', 'TuitionJob', 'Application'],
    }),

    // Get invoice / receipt
    getPaymentInvoice: builder.query<PaymentRecord, string>({
      query: (id) => `/payments/invoice/${id}`,
      transformResponse: (response: any) => response?.data || null,
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useGetTutorActiveTuitionsQuery,
  useGetMyPaymentsQuery,
  useSubmitPaymentMutation,
  useGetAdminPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  useGetPaymentInvoiceQuery,
} = paymentApi;

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, CreditCard, Filter, ChevronLeft, ChevronRight,
  Hash, Wallet, Check, X, CheckCircle2, XCircle, Clock,
  Building2, Eye, ShieldCheck, User, Phone, Mail, Receipt,
  AlertCircle, Loader2, ExternalLink, RefreshCw
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import PaymentReceiptModal from '@/src/components/PaymentReceiptModal.tsx';
import {
  useGetAdminPaymentsQuery,
  useApprovePaymentMutation,
  useRejectPaymentMutation,
  type PaymentRecord,
} from '@/src/services/paymentApi';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 8;

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Queries & Mutations
  const { data: rawData, isLoading, isError, isFetching, error, refetch } = useGetAdminPaymentsQuery(
    {
      status: statusFilter !== 'all' ? statusFilter : undefined,
      method: methodFilter !== 'all' ? methodFilter : undefined,
      search: searchQuery.trim() || undefined,
    },
    { refetchOnMountOrArgChange: true }
  );

  // ── DEBUG ──────────────────────────────────────────────────────────────────
  console.log('[AdminPayments] Query state:', { isLoading, isFetching, isError, error });
  console.log('[AdminPayments] rawData:', rawData);
  // ──────────────────────────────────────────────────────────────────────────

  const [approvePayment, { isLoading: isApproving }] = useApprovePaymentMutation();
  const [rejectPayment, { isLoading: isRejecting }] = useRejectPaymentMutation();

  const payments: PaymentRecord[] = useMemo(() => {
    if (!rawData) {
      console.log('[AdminPayments] rawData is null/undefined — returning []');
      return [];
    }
    console.log('[AdminPayments] rawData type:', typeof rawData, 'keys:', Object.keys(rawData as object));
    // rawData from transformResponse is { payments: [...], pagination: {...} }
    if (Array.isArray((rawData as any).payments)) {
      console.log('[AdminPayments] payments array length:', (rawData as any).payments.length);
      return (rawData as any).payments;
    }
    // Fallback: if rawData itself is array somehow
    if (Array.isArray(rawData)) return rawData as unknown as PaymentRecord[];
    return [];
  }, [rawData]);

  // Modals state
  const [selectedReviewPayment, setSelectedReviewPayment] = useState<PaymentRecord | null>(null);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);
  const [rejectModalPayment, setRejectModalPayment] = useState<PaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs
  const stats = useMemo(() => {
    const totalCount = payments.length;
    const totalAmount = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    const approvedAmount = payments
      .filter((p) => p.status === 'approved')
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    return { totalCount, totalAmount, pendingCount, approvedAmount };
  }, [payments]);

  // Handle Approve
  const handleApprove = async (paymentId: string) => {
    try {
      await approvePayment(paymentId).unwrap();
      setSelectedReviewPayment(null);
      showToast('✅ Payment approved successfully! Notification sent to tutor.');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to approve payment.', 'error');
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalPayment) return;
    try {
      await rejectPayment({
        id: rejectModalPayment._id,
        reason: rejectionReason.trim() || 'Transaction ID or payment screenshot could not be verified.',
      }).unwrap();

      setRejectModalPayment(null);
      setSelectedReviewPayment(null);
      setRejectionReason('');
      showToast('⚠️ Payment rejected. Tutor has been notified with the reason.');
      refetch();
    } catch (err: any) {
      showToast(err?.data?.message || 'Failed to reject payment.', 'error');
    }
  };

  // Pagination
  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return payments.slice(start, start + ITEMS_PER_PAGE);
  }, [payments, currentPage]);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-20 px-3 sm:px-0">

        {/* ── END DEBUG PANEL ── */}

        {/* Toast alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'fixed top-4 left-3 right-3 sm:left-auto sm:top-6 sm:right-6 z-50 px-4 sm:px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 border',
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
              )}
            >
              {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/60 shadow-lg shadow-ink/5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
              <CreditCard size={20} className="sm:hidden" />
              <CreditCard size={24} className="hidden sm:block" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-display font-black text-ink leading-tight">Payment Verification & Ledger</h1>
              <p className="text-[11px] sm:text-xs font-medium text-ink-muted mt-0.5">
                Verify tutor platform fees, approve MFS transactions, and issue receipts
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-ink/10 text-ink-muted active:text-primary active:bg-primary/5 transition-all text-xs font-bold cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/80 backdrop-blur p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/60 shadow-sm space-y-1">
            <span className="text-[9px] sm:text-[11px] font-bold text-ink-muted uppercase tracking-wider block">Total Collected</span>
            <div className="text-lg sm:text-2xl font-display font-black text-ink">৳ {stats.approvedAmount.toLocaleString()}</div>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-1">
            <span className="text-[9px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending Approvals</span>
            <div className="text-lg sm:text-2xl font-display font-black text-amber-800">{stats.pendingCount}</div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-1">
            <span className="text-[9px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total Submissions</span>
            <div className="text-lg sm:text-2xl font-display font-black text-emerald-800">{stats.totalCount}</div>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/60 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-1">
            <span className="text-[9px] sm:text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Approval Rate</span>
            <div className="text-lg sm:text-2xl font-display font-black text-purple-800">
              {stats.totalCount > 0 ? Math.round(((stats.totalCount - stats.pendingCount) / stats.totalCount) * 100) : 100}%
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/60 shadow-lg shadow-ink/5 flex flex-col gap-3 sm:gap-4 sticky top-2 z-10">
          {/* Search */}
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              inputMode="search"
              placeholder="Search by TrxID, sender number, invoice or tutor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-ink/5 rounded-2xl py-3 sm:py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5 -mx-0.5 px-0.5">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase transition-all cursor-pointer border shrink-0 active:scale-95',
                    statusFilter === st
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-slate-50 text-ink-muted border-ink/5 hover:border-primary/20 hover:text-ink'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full sm:w-auto sm:ml-auto bg-slate-50 border border-ink/5 rounded-xl py-2.5 sm:py-2 px-3 text-xs font-bold text-ink focus:outline-none"
            >
              <option value="all">All Methods</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
              <option value="bank">Bank</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 sm:py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-primary animate-spin" />
            <p className="text-xs font-bold text-ink-muted">Loading payments ledger...</p>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="py-14 sm:py-16 flex flex-col items-center justify-center gap-4 bg-rose-50/50 rounded-3xl border border-rose-200/60 px-4 text-center">
            <AlertCircle size={32} className="text-rose-500" />
            <div>
              <p className="font-bold text-rose-700 text-sm">Failed to load payment data</p>
              <p className="text-xs text-rose-500 mt-1">Check your connection or server status</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold active:bg-rose-700 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Payments — Mobile Card List / Desktop Table */}
        {!isLoading && !isError && (
          <>
            {paginatedPayments.length === 0 ? (
              <div className="py-16 text-center text-ink-muted text-xs bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60">
                No payments found matching your filter criteria.
              </div>
            ) : (
              <>
                {/* ---- Mobile: Card List (app-like) ---- */}
                <div className="md:hidden space-y-3">
                  {paginatedPayments.map((p) => {
                    const tutor = typeof p.userId === 'object' ? p.userId : null;
                    const tuition = typeof p.tuitionJobId === 'object' ? p.tuitionJobId : null;

                    return (
                      <div
                        key={p._id}
                        className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg shadow-ink/5 p-4 space-y-3 active:scale-[0.99] transition-transform"
                      >
                        {/* Top: tutor + status */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                              {tutor?.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-ink text-sm truncate">{tutor?.name || 'Tutor'}</p>
                              <p className="text-[10px] text-ink-muted">{p.senderNumber}</p>
                              <span className="text-[9px] text-slate-400">
                                {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase',
                              p.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'pending'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                            )}
                          >
                            {p.status}
                          </span>
                        </div>

                        {/* Tuition ref */}
                        <div className="pt-1 border-t border-ink/5">
                          <p className="font-bold text-ink text-xs line-clamp-1">{tuition?.title || 'General Fee'}</p>
                          <span className="text-[10px] font-bold text-primary">
                            {tuition?.jobId || 'ID: GENERAL'}
                          </span>
                        </div>

                        {/* Method / TrxID / Amount */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <span className="font-black uppercase text-[10px] text-ink block">{p.paymentMethod}</span>
                            <p className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {p.transactionId}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-display font-black text-ink text-sm block">৳ {p.amount.toLocaleString()}</span>
                            {p.payableAmount > 0 && (
                              <p className="text-[9px] text-ink-muted">Expected: ৳{p.payableAmount.toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setSelectedReviewPayment(p)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 active:bg-primary active:text-white transition-colors text-ink cursor-pointer flex items-center justify-center gap-1.5 text-[11px] font-bold"
                          >
                            <Eye size={13} /> Review
                          </button>

                          {p.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(p._id)}
                                disabled={isApproving}
                                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 active:bg-emerald-600 active:text-white transition-colors cursor-pointer"
                                title="1-Click Approve"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setRejectModalPayment(p)}
                                className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-rose-50 text-rose-600 active:bg-rose-600 active:text-white transition-colors cursor-pointer"
                                title="Reject with Reason"
                              >
                                <X size={16} />
                              </button>
                            </>
                          )}

                          {p.status === 'approved' && (
                            <button
                              onClick={() => setSelectedReceiptPayment(p)}
                              className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary active:bg-primary active:text-white transition-colors cursor-pointer"
                              title="View Money Receipt"
                            >
                              <Receipt size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ---- Desktop: Table ---- */}
                <div className="hidden md:block bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-ink/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-ink-muted border-b border-ink/5">
                        <tr>
                          <th className="py-4 px-6">Tutor & Date</th>
                          <th className="py-4 px-4">Tuition Reference</th>
                          <th className="py-4 px-4">Method & TrxID</th>
                          <th className="py-4 px-4 text-right">Amount Paid</th>
                          <th className="py-4 px-4 text-center">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5 font-medium">
                        {paginatedPayments.map((p) => {
                          const tutor = typeof p.userId === 'object' ? p.userId : null;
                          const tuition = typeof p.tuitionJobId === 'object' ? p.tuitionJobId : null;

                          return (
                            <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                              {/* Tutor */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs shrink-0">
                                    {tutor?.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-ink">{tutor?.name || 'Tutor'}</p>
                                    <p className="text-[10px] text-ink-muted">{p.senderNumber}</p>
                                    <span className="text-[9px] text-slate-400">
                                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Tuition */}
                              <td className="py-4 px-4">
                                <p className="font-bold text-ink line-clamp-1">{tuition?.title || 'General Fee'}</p>
                                <span className="text-[10px] font-bold text-primary">
                                  {tuition?.jobId || 'ID: GENERAL'}
                                </span>
                              </td>

                              {/* Method & TrxID */}
                              <td className="py-4 px-4">
                                <span className="font-black uppercase text-[11px] text-ink">{p.paymentMethod}</span>
                                <p className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                  {p.transactionId}
                                </p>
                              </td>

                              {/* Amount */}
                              <td className="py-4 px-4 text-right">
                                <span className="font-display font-black text-ink text-sm">৳ {p.amount.toLocaleString()}</span>
                                {p.payableAmount > 0 && (
                                  <p className="text-[9px] text-ink-muted">Expected: ৳{p.payableAmount.toLocaleString()}</p>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-4 px-4 text-center">
                                <span
                                  className={cn(
                                    'inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase',
                                    p.status === 'approved'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : p.status === 'pending'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  )}
                                >
                                  {p.status}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedReviewPayment(p)}
                                    className="p-2 rounded-xl bg-slate-100 hover:bg-primary hover:text-white transition-colors text-ink cursor-pointer"
                                    title="Review details & verify TrxID"
                                  >
                                    <Eye size={14} />
                                  </button>

                                  {p.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleApprove(p._id)}
                                        disabled={isApproving}
                                        className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                        title="1-Click Approve"
                                      >
                                        <Check size={14} />
                                      </button>
                                      <button
                                        onClick={() => setRejectModalPayment(p)}
                                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                                        title="Reject with Reason"
                                      >
                                        <X size={14} />
                                      </button>
                                    </>
                                  )}

                                  {p.status === 'approved' && (
                                    <button
                                      onClick={() => setSelectedReceiptPayment(p)}
                                      className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                                      title="View Money Receipt"
                                    >
                                      <Receipt size={14} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-none sm:bg-transparent border sm:border-0 border-ink/5 sm:border-t sm:border-t-ink/5 flex items-center justify-between text-xs text-ink-muted">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-ink/10 active:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border border-ink/10 active:bg-slate-50 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── MODAL: Review & Verification — bottom sheet on mobile ─── */}
        <AnimatePresence>
          {selectedReviewPayment && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 1, scale: 1, y: '100%' }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 1, scale: 1, y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-xl p-5 sm:p-8 space-y-5 sm:space-y-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
              >
                <div className="sm:hidden w-10 h-1.5 bg-ink/10 rounded-full mx-auto -mt-1 mb-1" />

                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-display font-black text-ink">Payment Verification</h3>
                      <p className="text-xs text-ink-muted truncate">Invoice: {selectedReviewPayment.invoiceNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedReviewPayment(null)}
                    className="p-2 active:bg-slate-100 rounded-xl text-ink-muted cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-4 text-xs">
                  {/* Tutor Info Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-ink-muted uppercase">Tutor Profile</span>
                    <p className="text-sm font-black text-ink">
                      {typeof selectedReviewPayment.userId === 'object' ? selectedReviewPayment.userId?.name : 'Tutor'}
                    </p>
                    <p className="text-ink-muted">Phone: {typeof selectedReviewPayment.userId === 'object' ? selectedReviewPayment.userId?.phone : selectedReviewPayment.senderNumber}</p>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Payment Method</span>
                      <span className="font-black text-sm text-primary uppercase">{selectedReviewPayment.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Amount Paid</span>
                      <span className="font-display font-black text-base text-ink">৳ {selectedReviewPayment.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Sender Phone</span>
                      <span className="font-bold text-ink">{selectedReviewPayment.senderNumber}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Transaction ID (TrxID)</span>
                      <span className="font-mono font-black text-sm text-ink bg-white px-2 py-0.5 rounded border border-ink/10 inline-block break-all">
                        {selectedReviewPayment.transactionId}
                      </span>
                    </div>
                  </div>

                  {/* Receipt Screenshot Preview */}
                  {selectedReviewPayment.receiptUrl ? (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Uploaded Payment Screenshot</span>
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-60 flex items-center justify-center">
                        <img
                          src={selectedReviewPayment.receiptUrl}
                          alt="Money Receipt"
                          className="w-full h-full object-contain cursor-pointer active:scale-105 transition-transform"
                          onClick={() => window.open(selectedReviewPayment.receiptUrl || '', '_blank')}
                        />
                      </div>
                      <p className="text-[10px] text-ink-muted text-center">Tap image to open full resolution in new tab</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-ink-muted text-[11px]">
                      No screenshot was attached with this submission.
                    </div>
                  )}

                  {/* Notes */}
                  {selectedReviewPayment.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-ink text-xs">
                      <span className="font-bold text-ink-muted block text-[10px] uppercase">Tutor Note:</span>
                      {selectedReviewPayment.notes}
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-ink/5">
                  <span className="text-xs font-bold text-ink-muted">
                    Status: <span className="uppercase text-ink font-black">{selectedReviewPayment.status}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {selectedReviewPayment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setRejectModalPayment(selectedReviewPayment)}
                          className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-rose-50 text-rose-600 active:bg-rose-100 rounded-xl font-bold text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleApprove(selectedReviewPayment._id)}
                          disabled={isApproving}
                          className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 bg-emerald-600 text-white active:bg-emerald-700 rounded-xl font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          Approve Payment
                        </button>
                      </>
                    )}
                    {selectedReviewPayment.status === 'approved' && (
                      <button
                        onClick={() => setSelectedReceiptPayment(selectedReviewPayment)}
                        className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-primary text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Receipt size={14} /> Print Receipt
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── MODAL: Reject Reason — bottom sheet on mobile ─── */}
        <AnimatePresence>
          {rejectModalPayment && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-ink/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 1, scale: 1, y: '100%' }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 1, scale: 1, y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-md p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
              >
                <div className="sm:hidden w-10 h-1.5 bg-ink/10 rounded-full mx-auto -mt-1 mb-1" />

                <div className="flex items-center gap-3 text-rose-600">
                  <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                    <XCircle size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-display font-black text-ink">Reject Payment Submission</h3>
                    <p className="text-xs text-ink-muted truncate">TrxID: {rejectModalPayment.transactionId}</p>
                  </div>
                </div>

                <form onSubmit={handleRejectSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Rejection Reason (টিউটরকে জানান)</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. Transaction ID টি সঠিক নয় / টাকা অ্যাকাউন্টে জমা পড়েনি..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full bg-slate-50 border border-ink/10 rounded-2xl p-3 text-sm sm:text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 pb-1">
                    <button
                      type="button"
                      onClick={() => setRejectModalPayment(null)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-ink/10 text-xs font-bold text-ink-muted cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRejecting}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 text-white active:bg-rose-700 font-black text-xs uppercase tracking-wider shadow-md shadow-rose-600/20 cursor-pointer"
                    >
                      {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ─── RECEIPT VOUCHER MODAL ─── */}
        <PaymentReceiptModal
          payment={selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
        />
      </div>
    </AdminLayout>
  );
}
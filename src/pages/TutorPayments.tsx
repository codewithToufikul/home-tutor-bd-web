import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet, CheckCircle2, AlertCircle, Search, Copy, Check,
  Send, X, CreditCard, Clock, FileText, ArrowRight, Upload,
  Loader2, ShieldCheck, Sparkles, BookOpen, Receipt, RefreshCw, Eye
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import PaymentReceiptModal from '@/src/components/PaymentReceiptModal.tsx';
import {
  useGetTutorActiveTuitionsQuery,
  useGetMyPaymentsQuery,
  useSubmitPaymentMutation,
  type ActiveTuitionFeeItem,
  type PaymentRecord,
} from '@/src/services/paymentApi';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function TutorPayments() {
  const { user } = useAuth();

  // Queries
  const { data: activeTuitions = [], isLoading: loadingTuitions, refetch: refetchTuitions } = useGetTutorActiveTuitionsQuery();
  const { data: transactions = [], isLoading: loadingPayments, refetch: refetchPayments } = useGetMyPaymentsQuery();
  const [submitPayment, { isLoading: isSubmitting }] = useSubmitPaymentMutation();

  // Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTuitionId, setSelectedTuitionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Receipt Modal State
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<PaymentRecord | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const paymentAccounts = {
    bkash: { name: 'bKash Personal (Send Money)', number: '01936456602', color: 'bg-pink-50 border-pink-200 text-pink-700' },
    nagad: { name: 'Nagad Personal (Send Money)', number: '01936456602', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    rocket: { name: 'Rocket Personal (Send Money)', number: '019364566028', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    bank: { name: 'Bank Transfer', number: 'Upcoming (Use MFS)', color: 'bg-slate-50 border-slate-200 text-slate-700' },
  };

  const handleCopy = (num: string) => {
    if (num.includes('Upcoming')) return;
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    showToast(`নম্বর কপি হয়েছে: ${num}`);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Open Payment Modal with specific Tuition
  const handleOpenPaymentForTuition = (tuition: ActiveTuitionFeeItem) => {
    setSelectedTuitionId(tuition.jobId);
    setAmount(String(tuition.dueAmount > 0 ? tuition.dueAmount : tuition.platformFee));
    setSenderNumber('');
    setTrxId('');
    setNotes(`Platform fee for ${tuition.title} (${tuition.jobIdCustom})`);
    setReceiptFile(null);
    setReceiptPreview(null);
    setShowPaymentModal(true);
  };

  // Open General Payment Modal
  const handleOpenGeneralPayment = () => {
    setSelectedTuitionId('');
    setAmount('');
    setSenderNumber('');
    setTrxId('');
    setNotes('');
    setReceiptFile(null);
    setReceiptPreview(null);
    setShowPaymentModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'bank') {
      showToast('ব্যাংক ট্রান্সফার অপশনটি শীঘ্রই আসছে! অনুগ্রহ করে বিকাশ অথবা নগদ ব্যবহার করুন।', 'error');
      return;
    }

    if (!senderNumber.trim() || !trxId.trim() || !amount.trim()) {
      showToast('অনুগ্রহ করে সেন্ডার নম্বর, TrxID এবং টাকার পরিমাণ পূরণ করুন!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('amount', amount.trim());
    formData.append('paymentMethod', paymentMethod);
    formData.append('senderNumber', senderNumber.trim());
    formData.append('transactionId', trxId.trim().toUpperCase());
    if (selectedTuitionId) formData.append('tuitionJobId', selectedTuitionId);
    if (notes.trim()) formData.append('notes', notes.trim());
    if (receiptFile) formData.append('receipt', receiptFile);

    try {
      await submitPayment(formData).unwrap();
      setShowPaymentModal(false);
      showToast('🎉 পেমেন্ট সফলভাবে জমা দেওয়া হয়েছে! অ্যাডমিন দ্রুত ভেরিফাই করে অনুমোদন করবেন।');
      refetchTuitions();
      refetchPayments();
    } catch (err: any) {
      showToast(err?.data?.message || 'পেমেন্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।', 'error');
    }
  };

  // KPIs
  const totalApproved = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'approved')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const totalPending = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'pending')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        t.transactionId?.toLowerCase().includes(q) ||
        t.senderNumber?.toLowerCase().includes(q) ||
        t.invoiceNumber?.toLowerCase().includes(q) ||
        t.paymentMethod?.toLowerCase().includes(q);

      const matchStatus = filterStatus === 'all' || t.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [transactions, searchTerm, filterStatus]);

  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-24">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                'fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 border',
                toastMessage.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
                  : 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
              )}
            >
              {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Stats Row - 2-Column Compact Grid on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-5">
          <div className="bg-white/90 backdrop-blur-xl p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/60 shadow-xs space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-ink-muted uppercase tracking-wider">Approved</span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs sm:text-base">
                ৳
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-display font-black text-ink">৳ {totalApproved.toLocaleString()}</div>
            <p className="text-[9px] sm:text-[10px] text-emerald-600 font-bold truncate">● Verified & cleared</p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-1 sm:space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-wider">Pending</span>
              <Clock size={15} className="text-amber-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="text-lg sm:text-2xl font-display font-black text-amber-800">৳ {totalPending.toLocaleString()}</div>
            <p className="text-[9px] sm:text-[10px] text-amber-700 font-medium truncate">Awaiting admin review</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-emerald-50/70 border border-emerald-200/60 p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs space-y-1 sm:space-y-1.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wider">Standing</span>
              <ShieldCheck size={16} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-display font-black text-emerald-800">Active Member</div>
              <p className="text-[9px] sm:text-[10px] text-emerald-700 font-medium">Eligible for tuition applications</p>
            </div>
          </div>
        </div>

        {/* ─── SECTION 1: Active Tuitions & Platform Fee Due ─── */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen size={16} className="text-primary sm:w-[18px] sm:h-[18px]" />
              <h2 className="text-sm sm:text-base font-display font-black text-ink">Active Tuitions & Service Charge</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenGeneralPayment}
                className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-primary text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider hover:bg-primary-dark transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              >
                <Send size={11} /> Submit TrxID
              </button>
              <button
                onClick={() => refetchTuitions()}
                className="text-xs font-bold text-ink-muted hover:text-primary flex items-center gap-1 cursor-pointer p-1"
                title="Refresh tuitions"
              >
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {loadingTuitions ? (
            <div className="py-10 flex flex-col items-center gap-2 text-ink-muted bg-white/60 rounded-2xl sm:rounded-3xl">
              <Loader2 size={22} className="animate-spin text-primary" />
              <p className="text-xs font-bold">Checking active tuitions...</p>
            </div>
          ) : activeTuitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {activeTuitions.map((tuit) => (
                <motion.div
                  key={tuit.jobId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs space-y-3 sm:space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        {tuit.jobIdCustom}
                      </span>
                      <h3 className="text-xs sm:text-sm font-black text-ink mt-1 line-clamp-1">{tuit.title}</h3>
                      <p className="text-[10px] sm:text-[11px] font-medium text-ink-muted truncate">{tuit.studentClass} • {tuit.subject}</p>
                    </div>

                    <span
                      className={cn(
                        'px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase shrink-0',
                        tuit.isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tuit.hasPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                      )}
                    >
                      {tuit.isPaid ? '✓ Fee Paid' : tuit.hasPending ? '⏳ Pending' : '⚠️ Fee Due'}
                    </span>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-50/90 p-2 sm:p-3 rounded-xl sm:rounded-2xl text-center text-[11px] sm:text-xs">
                    <div>
                      <span className="text-[8.5px] sm:text-[9px] font-bold text-ink-muted uppercase block">Salary</span>
                      <span className="font-bold text-ink">৳ {tuit.salary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] sm:text-[9px] font-bold text-ink-muted uppercase block">60% Fee</span>
                      <span className="font-bold text-primary">৳ {tuit.platformFee.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] sm:text-[9px] font-bold text-ink-muted uppercase block">Due Amount</span>
                      <span className={cn('font-black', tuit.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600')}>
                        ৳ {tuit.dueAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Pay Button */}
                  {!tuit.isPaid && (
                    <button
                      onClick={() => handleOpenPaymentForTuition(tuit)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 sm:py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-black text-[11px] sm:text-xs uppercase tracking-wider transition-all shadow-xs shadow-primary/20 cursor-pointer active:scale-95"
                    >
                      <CreditCard size={13} />
                      <span>{tuit.hasPending ? 'Submit Additional Payment' : `Pay Fee ৳ ${tuit.dueAmount.toLocaleString()}`}</span>
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 text-center space-y-1.5">
              <p className="text-xs font-bold text-ink-muted">You have no active tuitions requiring fee payment currently.</p>
              <p className="text-[11px] text-ink-muted">When an application is accepted or tuition confirmed, it will appear here.</p>
            </div>
          )}
        </div>

        {/* ─── SECTION 2: Official Payment Numbers & Instructions ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Numbers Card */}
          <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-600 sm:w-[18px] sm:h-[18px]" />
              <h3 className="text-xs sm:text-sm font-display font-black text-ink">Official Payment Numbers (Send Money)</h3>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {Object.entries(paymentAccounts).map(([key, acc]) => (
                <div
                  key={key}
                  className={cn('flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border text-xs font-bold', acc.color)}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-[9px] sm:text-[10px] uppercase font-black block truncate">{acc.name}</span>
                    <span className="font-mono text-xs sm:text-sm text-ink font-extrabold">{acc.number}</span>
                  </div>

                  {!acc.number.includes('Upcoming') && (
                    <button
                      onClick={() => handleCopy(acc.number)}
                      className="px-2.5 py-1.5 bg-white rounded-lg sm:rounded-xl shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1 text-[9.5px] sm:text-[10px] font-black text-ink cursor-pointer shrink-0 active:scale-95"
                    >
                      {copiedNumber === acc.number ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedNumber === acc.number ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Card */}
          <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-primary/20 shadow-xs space-y-2.5 sm:space-y-3 text-xs">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck size={16} className="sm:w-[18px] sm:h-[18px]" />
              <h3 className="text-xs sm:text-sm font-display font-black">পেমেন্ট করার সহজ নিয়মাবলী</h3>
            </div>

            <ul className="space-y-1.5 sm:space-y-2 text-ink-muted font-medium list-disc list-inside leading-relaxed text-[11px] sm:text-xs">
              <li>উপরে উল্লেখিত বিকাশ বা নগদ নম্বরে <strong>Send Money</strong> করুন।</li>
              <li>টাকা পাঠানোর পর বিকাশ/নগদের প্রাপ্ত <strong>Transaction ID (TrxID)</strong> কপি করুন।</li>
              <li><strong>"Submit TrxID"</strong> বাটনে ক্লিক করে ফর্মটি পূরণ করুন।</li>
              <li>পেমেন্ট স্লিপের একটি স্ক্রিনশট সংযুক্ত করলে দ্রুত ভেরিফাই সম্পন্ন হবে।</li>
              <li>অ্যাডমিন অনুমোদন করার পর তাৎক্ষণিক মানি রিসিট ও একাউন্ট ক্লিয়ারেন্স পাবেন।</li>
            </ul>
          </div>
        </div>

        {/* ─── SECTION 3: Recent Payment Submissions & History ─── */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs overflow-hidden space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-display font-black text-ink">Payment History & Vouchers</h2>
              <p className="text-[11px] sm:text-xs text-ink-muted">Track your submitted transactions and download money receipts</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search TrxID, invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-ink/10 rounded-xl py-1.5 sm:py-2 pl-8 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="bg-slate-50 border border-ink/10 rounded-xl py-1.5 sm:py-2 px-2 sm:px-3 text-xs font-bold text-ink focus:outline-none shrink-0"
              >
                <option value="all">All</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Mobile Card View (visible on < sm screens) */}
          <div className="block sm:hidden space-y-2.5 pt-1">
            {filteredTransactions.map((trx) => {
              const tuition = typeof trx.tuitionJobId === 'object' ? trx.tuitionJobId : null;
              return (
                <div
                  key={trx._id}
                  className="bg-slate-50/80 border border-ink/5 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-ink-muted block">{trx.invoiceNumber}</span>
                      <p className="font-bold text-xs text-ink line-clamp-1">{tuition?.title || 'Platform Fee'}</p>
                      <p className="text-[10px] text-ink-muted">
                        {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display font-black text-ink text-sm block">৳ {trx.amount.toLocaleString()}</span>
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase mt-0.5',
                          trx.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : trx.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        )}
                      >
                        {trx.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-ink/5 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">{trx.paymentMethod}</span>
                      <span className="font-mono text-slate-700 font-bold">{trx.transactionId}</span>
                    </div>

                    {trx.status === 'approved' && (
                      <button
                        onClick={() => setSelectedReceiptPayment(trx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-[10px] transition-all cursor-pointer active:scale-95"
                      >
                        <Receipt size={11} />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>

                  {trx.status === 'rejected' && trx.rejectionReason && (
                    <p className="text-[9.5px] text-rose-600 font-bold bg-rose-50 p-1.5 rounded-lg">{trx.rejectionReason}</p>
                  )}
                </div>
              );
            })}

            {filteredTransactions.length === 0 && (
              <div className="py-8 text-center text-ink-muted text-xs bg-slate-50 rounded-2xl">
                No payment transactions found.
              </div>
            )}
          </div>

          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden sm:block overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-[10px] font-black uppercase tracking-wider text-ink-muted border-y border-ink/5">
                <tr>
                  <th className="py-3 px-6">Date & Invoice</th>
                  <th className="py-3 px-4">Tuition / Purpose</th>
                  <th className="py-3 px-4">Method & TrxID</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 font-medium">
                {filteredTransactions.map((trx) => {
                  const tuition = typeof trx.tuitionJobId === 'object' ? trx.tuitionJobId : null;
                  return (
                    <tr key={trx._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-ink">
                          {new Date(trx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <span className="text-[10px] font-mono text-ink-muted">{trx.invoiceNumber}</span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-ink line-clamp-1">{tuition?.title || 'Platform Fee'}</p>
                        <span className="text-[10px] text-primary font-bold">
                          {tuition?.jobId ? `Code: ${tuition.jobId}` : 'General Tuition Fee'}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-black text-ink uppercase">{trx.paymentMethod}</p>
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                          {trx.transactionId}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <span className="font-display font-black text-ink text-sm">৳ {trx.amount.toLocaleString()}</span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={cn(
                            'inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase',
                            trx.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : trx.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                          )}
                        >
                          {trx.status}
                        </span>
                        {trx.status === 'rejected' && trx.rejectionReason && (
                          <p className="text-[9px] text-rose-600 font-bold mt-1 line-clamp-1">{trx.rejectionReason}</p>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        {trx.status === 'approved' ? (
                          <button
                            onClick={() => setSelectedReceiptPayment(trx)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-[11px] transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Receipt size={12} />
                            <span>Money Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-ink-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-ink-muted text-xs">
                      No payment transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── MODAL: Make Payment / Submit TrxID ─── */}
        <AnimatePresence>
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/40 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-white/60 w-full max-w-lg p-4 sm:p-8 space-y-4 sm:space-y-6 my-4 sm:my-8 max-h-[92vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-ink/5 pb-3 sm:pb-4">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Send size={16} className="sm:w-[20px] sm:h-[20px]" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-display font-black text-ink">Submit Payment TrxID</h3>
                      <p className="text-[10px] sm:text-xs text-ink-muted">Enter transaction details after sending money</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1.5 sm:p-2 hover:bg-ink/5 rounded-xl text-ink-muted cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Select Tuition */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Select Tuition (ঐচ্ছিক)</label>
                    <select
                      value={selectedTuitionId}
                      onChange={(e) => {
                        setSelectedTuitionId(e.target.value);
                        const selected = activeTuitions.find((t) => t.jobId === e.target.value);
                        if (selected) {
                          setAmount(String(selected.dueAmount > 0 ? selected.dueAmount : selected.platformFee));
                        }
                      }}
                      className="w-full bg-slate-50 border border-ink/10 rounded-2xl px-4 py-3 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">General Platform Fee Payment</option>
                      {activeTuitions.map((tuit) => (
                        <option key={tuit.jobId} value={tuit.jobId}>
                          {tuit.jobIdCustom} - {tuit.title} (Fee: ৳{tuit.platformFee}, Due: ৳{tuit.dueAmount})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['bkash', 'nagad', 'rocket'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={cn(
                            'py-2.5 px-3 rounded-2xl text-xs font-black uppercase border transition-all text-center cursor-pointer',
                            paymentMethod === method
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                              : 'bg-slate-50 text-ink-muted border-ink/5 hover:border-primary/20'
                          )}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account Copy Box */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-ink-muted font-bold uppercase block">
                        Send Money to this {paymentMethod.toUpperCase()} Number:
                      </span>
                      <span className="font-mono text-sm font-black text-ink">{paymentAccounts[paymentMethod]?.number}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentAccounts[paymentMethod]?.number)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>

                  {/* Paid Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Paid Amount (টাকার পরিমাণ)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-ink-muted">৳</span>
                      <input
                        type="number"
                        required
                        min="10"
                        placeholder="e.g. 3000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-50 border border-ink/10 rounded-2xl py-3 pl-8 pr-4 text-sm font-black text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {/* Sender Number & TrxID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">Sender Mobile No.</label>
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full bg-slate-50 border border-ink/10 rounded-2xl px-4 py-2.5 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink uppercase tracking-wider">Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BKT9821XA"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        className="w-full bg-slate-50 border border-ink/10 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                      />
                    </div>
                  </div>

                  {/* Money Receipt Screenshot Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink uppercase tracking-wider">Payment Screenshot (রিসিট ছবি - ঐচ্ছিক)</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-primary/50 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50"
                    >
                      {receiptPreview ? (
                        <div className="flex items-center justify-center gap-3">
                          <img src={receiptPreview} alt="Receipt" className="w-16 h-16 object-cover rounded-xl border" />
                          <div className="text-left text-xs">
                            <p className="font-bold text-ink">{receiptFile?.name}</p>
                            <span className="text-[10px] text-primary font-bold">Click to replace screenshot</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-ink-muted text-xs">
                          <Upload size={20} className="text-slate-400" />
                          <span className="font-bold text-ink">Click to upload payment screenshot</span>
                          <span className="text-[10px]">PNG, JPG up to 5MB</span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-ink/5">
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(false)}
                      className="px-5 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:bg-slate-50 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                      <span>Submit For Verification</span>
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
    </TutorLayout>
  );
}

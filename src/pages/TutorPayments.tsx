import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Banknote,
  History,
  Copy,
  Send,
  X
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { PaymentRequestService } from '@/src/services/paymentRequestService.ts';
import { NotificationService } from '@/src/services/notificationService.ts';

interface Transaction {
  id: string;
  type: 'payment' | 'withdrawal';
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'Approved' | 'Rejected';
  date: string;
  description: string;
  method?: string;
  trxId?: string;
}

export default function TutorPayments() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user?.uid) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const records = await PaymentRequestService.listForTutor(user.uid);
        const formatted: Transaction[] = records.map((p) => ({
          id: p.id || '',
          type: 'payment',
          amount: Number(p.amount ?? 0),
          status: p.status === 'approved' ? 'completed' : p.status === 'rejected' ? 'failed' : 'pending',
          date: p.createdAt?.split('T')[0] ?? new Date().toISOString().split('T')[0],
          description: `Fee Payment via ${String(p.method ?? '').toUpperCase()}`,
          method: p.method,
          trxId: p.trxId,
        }));

        setTransactions(formatted);
      } catch (error) {
        console.error('Failed to load payment requests:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  const paymentAccounts = {
    bkash: { name: 'bKash Personal (Send Money)', number: '01936456602' },
    nagad: { name: 'Nagad Personal (Send Money)', number: '01936456602' },
    bank: { name: 'Bank Transfer', number: 'Upcoming' }
  };

  const handleCopy = (num: string) => {
    if (num === 'Upcoming') return;
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'bank') {
      alert('ব্যাংক ট্রান্সফার অপশনটি শীঘ্রই আসছে (Upcoming)! দয়া করে বিকাশ অথবা নগদ ব্যবহার করুন।');
      return;
    }

    if (!senderNumber || !trxId || !amount) {
      alert('সবগুলো ফিল্ড সঠিকভাবে পূরণ করুন!');
      return;
    }

    if (!user?.uid) {
      alert('Unable to submit payment request without a logged in user.');
      return;
    }

    try {
      const requestId = await PaymentRequestService.create({
        tutorId: user.uid,
        method: paymentMethod,
        senderNumber,
        trxId,
        amount: Number(amount),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      await NotificationService.create({
        title: 'New Payment Submitted',
        message: `Tutor submitted ৳${amount} via ${paymentMethod.toUpperCase()} (TrxID: ${trxId})`,
        type: 'payment',
        tutorId: user.uid,
        isRead: false,
      });

      setTransactions((prev) => [
        {
          id: requestId || `PAY-${Date.now()}`,
          type: 'payment',
          amount: Number(amount),
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          description: `Platform Fee Payment (${paymentMethod.toUpperCase()})`,
          method: paymentMethod,
          trxId,
        },
        ...prev,
      ]);

      alert('আপনার পেমেন্ট রিকোয়েস্ট জমা হয়েছে! অ্যাডমিন যাচাই করে অ্যাপ্রুভ করে দেবে।');
      setShowPaymentModal(false);
      setSenderNumber('');
      setTrxId('');
      setAmount('');
    } catch (error) {
      console.error('Failed to submit payment request:', error);
      alert('Payment request could not be submitted. Please try again later.');
    }
  };

  const stats = [
    {
      label: 'Total Platform Payments',
      value: `৳ ${transactions.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0).toLocaleString()}`,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending Approvals',
      value: `৳ ${transactions.reduce((acc, t) => acc + (t.status === 'pending' ? t.amount : 0), 0).toLocaleString()}`,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Account Status',
      value: 'Active Member',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (txn.trxId && txn.trxId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || txn.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyles = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'failed':
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <TutorLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">Payments & Platform Fee</h1>
            <p className="text-sm text-ink-muted mt-1">Pay service fees or view payment history</p>
          </div>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 cursor-pointer"
          >
            <Banknote size={18} />
            Make Payment / Recharge
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface p-6 rounded-2xl border border-ink/5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor, stat.color)}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-muted">{stat.label}</p>
                  <p className="text-2xl font-display font-bold text-ink">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-2xl border border-ink/5 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-ink/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <History className="text-primary" size={20} />
                  <h2 className="text-lg font-display font-bold text-ink">Recent Payment Submissions</h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                    <input
                      type="text"
                      placeholder="Search TrxID, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-ink/5 bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-ink/5">
                {loading ? (
                  <div className="p-8 text-center text-sm text-ink-muted">Loading payment history…</div>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((txn) => (
                    <div key={txn.id} className="p-6 hover:bg-ink/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <ArrowDownLeft size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-ink leading-tight">{txn.description}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                              <span className="text-xs text-ink-muted flex items-center gap-1">
                                <Clock size={12} />
                                {txn.date}
                              </span>
                              <span className="text-xs text-ink-muted font-mono">{txn.id}</span>
                              {txn.trxId && (
                                <span className="text-xs text-purple-600 font-mono font-bold">
                                  TrxID: {txn.trxId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-display font-bold text-lg text-emerald-600">
                            ৳{txn.amount.toLocaleString()}
                          </p>
                          <span className={cn(
                            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mt-1 uppercase',
                            getStatusStyles(txn.status)
                          )}>
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto mb-4">
                      <AlertCircle size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-ink">No transactions found</h3>
                    <p className="text-sm text-ink-muted mt-1">Try adjusting your search terms</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Payment Numbers Info */}
            <div className="bg-surface p-6 rounded-2xl border border-ink/5 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-ink flex items-center gap-2">
                <Banknote className="text-primary" size={20} />
                Official Payment Numbers
              </h3>
              <div className="space-y-3">
                <div className="p-3.5 bg-ink/5 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-ink">bKash Personal (Send Money)</p>
                  <p className="text-sm font-bold text-primary font-mono">+880 1936-456602</p>
                </div>
                <div className="p-3.5 bg-ink/5 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-ink">Nagad Personal (Send Money)</p>
                  <p className="text-sm font-bold text-primary font-mono">+880 1936-456602</p>
                </div>
                <div className="p-3.5 bg-ink/5 rounded-xl space-y-1">
                  <p className="text-xs font-bold text-ink">Bank Transfer</p>
                  <p className="text-sm font-bold text-amber-600 font-mono">Upcoming</p>
                </div>
              </div>
            </div>

            {/* Quick Guidelines */}
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 space-y-4">
              <h3 className="font-display font-bold text-primary flex items-center gap-2">
                <AlertCircle size={20} />
                Payment Instructions
              </h3>
              <ul className="space-y-2.5 text-xs text-ink-muted leading-relaxed">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  উপরে উল্লিখিত বিকাশ/নগদ নম্বরে Send Money করুন।
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  টাকা পাঠানোর পর প্রাপ্ত Transaction ID (TrxID) ফর্মে সঠিক ভাবে লিখুন।
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  অ্যাডমিন ট্রানজেকশন ভেরিফাই করে ১০-৩০ মিনিটের মধ্যে অ্যাপ্রুভ করবে।
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Payment Form */}
        <AnimatePresence>
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-ink/10 relative space-y-6 max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-ink/5 text-ink-muted cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div>
                  <h2 className="text-xl font-bold text-ink">Make Payment / Service Fee</h2>
                  <p className="text-xs text-ink-muted mt-1">Select payment method and send TrxID</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(['bkash', 'nagad', 'bank'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={cn(
                        'p-3 rounded-xl border text-center font-bold text-xs uppercase transition-all cursor-pointer',
                        paymentMethod === m
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-ink/10 hover:border-ink/20 text-ink-muted'
                      )}
                    >
                      {m === 'bank' ? 'Bank (Soon)' : m}
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-ink/5 rounded-2xl space-y-2 border border-ink/5">
                  <p className="text-xs font-bold text-ink">{paymentAccounts[paymentMethod].name}</p>
                  <div className="flex items-center justify-between bg-background p-3 rounded-xl border border-ink/5">
                    <span className={cn(
                      'font-mono font-bold tracking-wider',
                      paymentMethod === 'bank' ? 'text-amber-600' : 'text-primary'
                    )}>
                      {paymentAccounts[paymentMethod].number}
                    </span>
                    {paymentMethod !== 'bank' && (
                      <button
                        type="button"
                        onClick={() => handleCopy(paymentAccounts[paymentMethod].number)}
                        className="p-1.5 hover:bg-ink/5 rounded-lg text-ink-muted cursor-pointer"
                        title="Copy"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                  {copied && <p className="text-[10px] text-emerald-600 font-bold">Copied to clipboard!</p>}
                </div>

                {paymentMethod === 'bank' ? (
                  <div className="p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-center space-y-2">
                    <AlertCircle size={28} className="mx-auto text-amber-600" />
                    <p className="text-sm font-bold">Bank Transfer is Upcoming</p>
                    <p className="text-xs">দয়া করে পেমেন্ট করার জন্য বিকাশ অথবা নগদ ব্যবহার করুন।</p>
                  </div>
                ) : (
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-ink uppercase">Sender Phone Number</label>
                      <input
                        type="text"
                        required
                        placeholder="017XXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full p-3 rounded-xl border border-ink/10 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-ink uppercase">Transaction ID (TrxID)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9J87X6K"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-ink/10 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-ink uppercase">Amount (BDT)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 1000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-3 rounded-xl border border-ink/10 bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
                    >
                      <Send size={18} />
                      Submit Payment Request
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </TutorLayout>
  );
}

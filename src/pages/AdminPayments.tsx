import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, CreditCard, Filter, ChevronLeft, ChevronRight, 
  Hash, Wallet, Check, X, CheckCircle2, XCircle, Clock, Building2
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { PaymentService } from '@/src/services/paymentService';
import { cn } from '@/src/lib/utils';

interface PaymentRecord {
  id: string;
  userName: string;
  email: string;
  payType: string;
  amount: string;
  trxId: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const TakaIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <span className={cn("inline-flex items-center justify-center font-bold", className)} style={{ fontSize: size }}>
    ৳
  </span>
);

const ITEMS_PER_PAGE = 5;

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [payTypeFilter, setPayTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await PaymentService.list();
        if (active) setPayments((items as any[]).map(i => ({
          id: i.id,
          userName: (i as any).userName || (i as any).name || '',
          email: (i as any).email || '',
          payType: (i as any).method || (i as any).payType || 'bKash',
          amount: String((i as any).amount || 0),
          trxId: (i as any).trxId || (i as any).id || '',
          date: (i as any).createdAt || '',
          status: (i as any).status === 'completed' ? 'Approved' : ((i as any).status || 'Pending') as any
        })));
      } catch (err) {
        console.error('Failed to load payments:', err);
        setPayments([]);
      }
    })();
    return () => { active = false };
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      await PaymentService.update(id, { status: newStatus === 'Approved' ? 'completed' : 'rejected' } as any);
      setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
  };

  // Filtering Logic
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           payment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           payment.trxId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = payTypeFilter === 'All' || payment.payType === payTypeFilter;
      const matchesStatus = statusFilter === 'All' || payment.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [payments, searchQuery, payTypeFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  return (
    <AdminLayout>
      <div className="space-y-8 relative pb-20">
        
        {/* Bank & Card Payment Banner (Upcoming Feature) */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-400/20">
                ⚡ Upcoming Feature
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-blue-400" /> Bank & Card Online Gateway
              </h3>
              <p className="text-xs text-white/70 max-w-md">
                Visa, Mastercard, City Bank, and Direct Bank Transfers will be integrated soon for instant automated balance recharge.
              </p>
            </div>

            <button 
              disabled 
              className="px-5 py-2.5 bg-white/10 text-white/50 border border-white/10 font-bold text-xs rounded-xl cursor-not-allowed shrink-0"
            >
              Coming Soon
            </button>
          </div>
        </div>

        {/* Sticky Topbar Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-4 shrink-0">
              {/* Title */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm md:text-base font-display font-black text-ink leading-none">
                  Payment Approvals & History
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search TRX / Name..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Pay Method Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={payTypeFilter}
                  onChange={(e) => {
                    setPayTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[90px]"
                >
                  <option value="All">All Methods</option>
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[90px]"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Total Payments */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
              <CreditCard size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredPayments.length}</span></span>
            </div>
          </div>
        </div>

        {/* Payments Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5 bg-primary/5">
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase">Serial</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase">User Name</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase">Email</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase">Method</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase">Amount</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase">TRX ID</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase text-center">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedPayments.map((payment, index) => (
                    <motion.tr 
                      key={payment.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      <td className="px-6 py-5 text-sm font-bold text-ink-muted">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-ink">{payment.userName}</span>
                      </td>
                      <td className="px-6 py-5 text-xs font-medium text-ink-muted">{payment.email}</td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                          payment.payType === 'bKash' ? "bg-pink-100 text-pink-600" : 
                          payment.payType === 'Nagad' ? "bg-orange-100 text-orange-600" :
                          "bg-purple-100 text-purple-600"
                        )}>
                          {payment.payType}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-primary">
                        ৳{payment.amount}
                      </td>
                      <td className="px-6 py-5 text-sm font-mono font-bold text-ink-muted">
                        {payment.trxId}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1",
                          payment.status === 'Approved' ? "bg-emerald-100 text-emerald-700" :
                          payment.status === 'Rejected' ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {payment.status === 'Approved' && <CheckCircle2 size={12} />}
                          {payment.status === 'Rejected' && <XCircle size={12} />}
                          {payment.status === 'Pending' && <Clock size={12} />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {payment.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleStatusChange(payment.id, 'Approved')}
                              className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                              title="Approve Payment"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(payment.id, 'Rejected')}
                              className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 active:scale-95"
                              title="Reject Payment"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-ink-muted/50 uppercase">Done</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          <AnimatePresence mode="popLayout">
            {paginatedPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1} • {payment.date}
                    </p>
                    <h3 className="text-lg font-black text-ink leading-tight">{payment.userName}</h3>
                    <p className="text-xs font-medium text-ink-muted">{payment.email}</p>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                    payment.payType === 'bKash' ? "bg-pink-100 text-pink-600" : 
                    payment.payType === 'Nagad' ? "bg-orange-100 text-orange-600" :
                    "bg-purple-100 text-purple-600"
                  )}>
                    {payment.payType}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 py-2 border-y border-ink/5">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Amount</p>
                    <p className="text-sm font-black text-primary">৳{payment.amount}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-ink-muted uppercase">TRX ID</p>
                    <p className="text-sm font-mono font-bold text-ink-muted">{payment.trxId}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    payment.status === 'Approved' ? "bg-emerald-100 text-emerald-700" :
                    payment.status === 'Rejected' ? "bg-rose-100 text-rose-700" :
                    "bg-amber-100 text-amber-700"
                  )}>
                    {payment.status}
                  </span>

                  {payment.status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStatusChange(payment.id, 'Approved')}
                        className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(payment.id, 'Rejected')}
                        className="px-4 py-2 bg-rose-500 text-white font-bold text-xs rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-md shadow-rose-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm">
              <span className="text-sm font-bold text-ink-muted">
                Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <Wallet size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No payments found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any payment records matching your current search or filter criteria.
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setPayTypeFilter('All');
                setStatusFilter('All');
              }}
              className="text-primary font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
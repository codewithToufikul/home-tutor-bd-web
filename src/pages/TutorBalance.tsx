import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownLeft, Wallet, CheckCircle2 } from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TransactionService } from '@/src/services/transactionService.ts';

interface Transaction {
  id: string;
  type: 'Credit' | 'Debit';
  title: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  method?: string;
  trxId?: string;
}

export default function TutorBalance() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.uid) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        const records = await TransactionService.listForTutor(user.uid);
        const formatted = records.map((record) => ({
          id: record.id || '',
          type: record.type,
          title: record.description ?? (record.type === 'Credit' ? 'Balance added' : 'Platform charge'),
          amount: Number(record.amount ?? 0),
          status: record.status ?? 'pending',
          date: record.date ?? record.createdAt?.split('T')[0] ?? '',
          method: record.method,
          trxId: record.trxId,
        }));

        setTransactions(formatted as any);
      } catch (error) {
        console.error('Failed to load tutor transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const totalCredits = transactions
    .filter((txn) => txn.type === 'Credit' && txn.status === 'completed')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const totalFees = transactions
    .filter((txn) => txn.type === 'Debit' && txn.status === 'completed')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const currentBalance = totalCredits - totalFees;

  return (
    <TutorLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">My Balance & Wallet</h1>
          <p className="text-xs text-ink-muted">View your current balance, earnings, and platform transaction history.</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-[#9D174D] to-[#831843] text-white p-6 rounded-3xl shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Current Balance</span>
              <Wallet size={20} />
            </div>
            <div className="text-3xl font-black">{currentBalance.toLocaleString()} ৳</div>
            <p className="text-[11px] opacity-70">Available for applying to tuition jobs</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between text-emerald-600">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Total Credits</span>
              <ArrowDownLeft size={20} />
            </div>
            <div className="text-3xl font-black text-[#001F3F]">{totalCredits.toLocaleString()} ৳</div>
            <p className="text-[11px] text-ink-muted">Total added balance to date</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between text-rose-500">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">Platform Fee Paid</span>
              <ArrowUpRight size={20} />
            </div>
            <div className="text-3xl font-black text-[#001F3F]">{totalFees.toLocaleString()} ৳</div>
            <p className="text-[11px] text-ink-muted">Spent on platform charges</p>
          </motion.div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-white rounded-3xl border border-ink/10 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-ink/5 pb-4">
            <h2 className="text-lg font-black text-[#001F3F]">Recent Transactions</h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{transactions.length} Activity</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-sm text-ink-muted">Loading transactions…</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink-muted">No transaction history yet.</div>
            ) : (
              transactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'Credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'}`}>
                      {txn.type === 'Credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#001F3F]">{txn.title}</h4>
                      <p className="text-[11px] font-medium text-ink-muted">{txn.id} • {txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${txn.type === 'Credit' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {txn.amount.toLocaleString()} ৳
                    </span>
                    <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 size={12} /> {txn.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}

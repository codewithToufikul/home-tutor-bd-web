import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, Printer, Download, X, Building2,
  Calendar, ShieldCheck, User, Phone, Mail, FileText, QrCode
} from 'lucide-react';
import type { PaymentRecord } from '@/src/services/paymentApi';
import logoImage from '@/src/lib/Home.png';
import { cn } from '@/src/lib/utils';

interface PaymentReceiptModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
}

export default function PaymentReceiptModal({ payment, onClose }: PaymentReceiptModalProps) {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const tutor = typeof payment.userId === 'object' ? payment.userId : null;
  const tuition = typeof payment.tuitionJobId === 'object' ? payment.tuitionJobId : null;
  const approvedBy = typeof payment.approvedBy === 'object' ? payment.approvedBy : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-white/60 w-full max-w-2xl overflow-hidden my-4 sm:my-8"
        >
          {/* Header Action Bar (Hidden on print) */}
          <div className="print:hidden p-3.5 sm:p-6 bg-slate-50 border-b border-ink/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-black text-ink uppercase tracking-wider">Official Money Receipt</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-wider hover:bg-primary-dark transition-all shadow-md shadow-primary/20 cursor-pointer active:scale-95"
              >
                <Printer size={13} className="sm:w-[14px] sm:h-[14px]" />
                <span>Print / PDF</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-slate-200 rounded-xl text-ink-muted transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Receipt Body */}
          <div id="printable-receipt" className="p-4 sm:p-8 md:p-10 space-y-4 sm:space-y-6 text-ink">
            {/* Top Brand Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-primary/20 pb-4 sm:pb-6 gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-primary p-0.5 sm:p-1 bg-white shadow-sm shrink-0">
                  <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-display font-black text-ink leading-tight">HOME TUTOR PROVIDER BD</h1>
                  <p className="text-[9.5px] sm:text-[11px] font-bold text-primary uppercase tracking-widest">Official Payment Voucher</p>
                  <p className="text-[9px] sm:text-[10px] text-ink-muted mt-0.5">Govt. Reg. Trusted Tuition Platform in Bangladesh</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="inline-block px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase">
                  ✓ {payment.status}
                </span>
                <p className="text-[11px] sm:text-xs font-black text-ink sm:mt-2">Voucher #{payment.invoiceNumber}</p>
                <p className="text-[9.5px] sm:text-[10px] text-ink-muted">{new Date(payment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Tutor & Payment Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-slate-50/80 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/60 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Payer Information (Tutor)</span>
                <p className="font-black text-ink text-xs sm:text-sm">{tutor?.name || 'Registered Tutor'}</p>
                <p className="text-[11px] text-ink-muted">{tutor?.phone || payment.senderNumber}</p>
                {tutor?.email && <p className="text-[11px] text-ink-muted">{tutor.email}</p>}
              </div>

              <div className="space-y-1 sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                <span className="text-[9px] sm:text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Transaction Details</span>
                <p className="font-bold text-ink text-[11px] sm:text-xs">Method: <span className="uppercase text-primary font-black">{payment.paymentMethod}</span></p>
                <p className="font-mono font-bold text-slate-700 text-[11px] sm:text-xs">TrxID: {payment.transactionId}</p>
                <p className="text-[11px] text-ink-muted">Sender: {payment.senderNumber}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] font-black uppercase tracking-wider text-ink-muted border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Particulars / Description</th>
                    <th className="p-3.5 text-center">Tuition Code</th>
                    <th className="p-3.5 text-right">Paid Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3.5">
                      <p className="font-bold text-ink">{tuition?.title || 'Platform Service Charge'}</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {tuition?.class ? `Class: ${tuition.class} • Location: ${tuition.location || 'Dhaka'}` : 'Platform Fee payment for verified tuition'}
                      </p>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-600">
                      {tuition?.jobId || 'GENERAL'}
                    </td>
                    <td className="p-3.5 text-right font-display font-black text-ink text-sm">
                      ৳ {payment.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 font-black border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="p-3.5 text-right text-xs uppercase tracking-wider text-ink-muted">Total Paid:</td>
                    <td className="p-3.5 text-right font-display text-base text-primary">৳ {payment.amount.toLocaleString()} BDT</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Seal & Verification Signature */}
            <div className="pt-6 flex items-end justify-between border-t border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="w-20 h-20 bg-primary/5 border border-primary/20 rounded-2xl flex flex-col items-center justify-center text-primary p-2">
                  <ShieldCheck size={28} />
                  <span className="text-[8px] font-black uppercase text-center mt-1">VERIFIED SEAL</span>
                </div>
                <p className="text-[9px] text-ink-muted">Authorized by {approvedBy?.name || 'Super Admin'}</p>
              </div>

              <div className="text-right space-y-1">
                <div className="w-32 border-b-2 border-slate-300 pb-1 text-center font-cursive text-primary font-bold">
                  Toufikul Islam
                </div>
                <p className="text-[10px] font-bold text-ink-muted uppercase">Authorized Signature</p>
                <p className="text-[9px] text-ink-muted">Home Tutor Provider BD</p>
              </div>
            </div>

            {/* Small Footer Notice */}
            <p className="text-[9px] text-center text-ink-muted pt-2">
              This is a computer generated official electronic receipt. For any queries, contact support@hometutorproviderbd.com
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

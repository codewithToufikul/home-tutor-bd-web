import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, X, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileCompletionResult } from '@/src/lib/profileCompletion';
import { cn } from '@/src/lib/utils';

interface TutorProfileIncompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  completion: ProfileCompletionResult;
}

export default function TutorProfileIncompleteModal({
  isOpen,
  onClose,
  completion,
}: TutorProfileIncompleteModalProps) {
  const navigate = useNavigate();

  if (!isOpen || completion.isComplete) return null;

  const handleGoToProfile = () => {
    onClose();
    navigate('/tutor/profile');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-ink/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-white/60 overflow-hidden z-10"
        >
          {/* Top Banner with vibrant alert gradient */}
          <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-primary p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner animate-pulse">
                  <ShieldAlert size={26} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-1">
                    <AlertTriangle size={12} /> Action Required
                  </div>
                  <h3 className="text-xl font-display font-black leading-tight">
                    প্রোফাইল ১০০% সম্পন্ন করুন!
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Progress Card */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" /> বর্তমান প্রোফাইল অগ্রগতি:
                </span>
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-black",
                  completion.percentage >= 80 ? "bg-emerald-100 text-emerald-700" :
                  completion.percentage >= 50 ? "bg-amber-100 text-amber-800" :
                  "bg-rose-100 text-rose-700"
                )}>
                  {completion.percentage}% Complete
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-white rounded-full overflow-hidden p-0.5 border border-amber-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion.percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    "h-full rounded-full transition-all",
                    completion.percentage >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-500" :
                    completion.percentage >= 50 ? "bg-gradient-to-r from-amber-500 to-orange-500" :
                    "bg-gradient-to-r from-rose-500 to-amber-500"
                  )}
                />
              </div>

              <p className="text-[11.5px] font-medium text-amber-950 leading-relaxed">
                আপনার প্রোফাইল ১০০% সম্পন্ন না হলে অভিভাবকরা আপনাকে শর্টলিস্ট করতে পারবে না এবং উপযুক্ত টিউশন নোটিফিকেশন মিস করতে পারেন।
              </p>
            </div>

            {/* Missing Sections Checklist */}
            {completion.missingItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-ink uppercase tracking-wider">
                  যা যা এখনো বাকি আছে ({completion.missingItems.length}টি বিষয়):
                </h4>
                <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                  {completion.missingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 text-xs font-bold text-ink-muted bg-gray-50/80 px-3.5 py-2.5 rounded-xl border border-ink/5"
                    >
                      <div className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                        <X size={10} strokeWidth={3} />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleGoToProfile}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-[#6B21A8] to-primary-dark text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck size={18} />
                এখনই প্রোফাইল ১০০% সম্পূর্ণ করুন
                <ArrowRight size={16} />
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 text-xs font-bold text-ink-muted hover:text-ink transition-colors cursor-pointer text-center"
              >
                পরে সম্পন্ন করব (Dashboard-এ যান)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

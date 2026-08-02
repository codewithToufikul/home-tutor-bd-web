import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft, GraduationCap, ShieldCheck } from 'lucide-react';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg text-center space-y-8 relative z-10"
      >
        <div className="space-y-6">
          <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl shadow-primary/10 flex items-center justify-center mx-auto relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-[40px] scale-110 blur-xl group-hover:scale-125 transition-transform duration-500" />
            <Clock size={48} className="text-primary relative z-10 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-black text-ink tracking-tight">
              Registration <span className="text-primary">Successful!</span>
            </h1>
            <p className="text-lg font-medium text-ink-muted">
              Your account is currently <span className="text-ink font-bold">Pending Approval</span>.
            </p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl p-10 rounded-[48px] border border-white/40 shadow-2xl shadow-ink/5 space-y-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink">Account Created</h3>
                <p className="text-xs font-medium text-ink-muted leading-relaxed">Your details have been securely saved in our system.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink">Admin Review</h3>
                <p className="text-xs font-medium text-ink-muted leading-relaxed">Our administrators are reviewing your profile to ensure platform safety.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-black text-ink">Wait Time</h3>
                <p className="text-xs font-medium text-ink-muted leading-relaxed">This usually takes 12-24 hours. You will be notified via email once approved.</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link 
              to="/"
              className="w-full py-5 rounded-[24px] bg-primary text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:bg-primary-dark"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-ink-muted">
          <GraduationCap size={16} className="text-primary" />
          <span>Home Tutor Provider BD • Quality Education for All</span>
        </div>
      </motion.div>
    </div>
  );
}

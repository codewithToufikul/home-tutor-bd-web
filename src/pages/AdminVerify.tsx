import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function AdminVerify() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  const { verifyEmail, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) return;

    setError(null);
    setIsSubmitting(true);
    
    try {
      await verifyEmail(fullCode);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black text-ink tracking-tight">Verify Email</h1>
            <p className="text-sm font-medium text-ink-muted leading-relaxed">
              We've sent a 6-digit verification code to <br />
              <span className="text-primary font-black">{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="bg-white/40 backdrop-blur-2xl p-10 rounded-[48px] border border-white/40 shadow-2xl shadow-ink/5 space-y-8">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-16 bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl text-center text-2xl font-black text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button 
                type="submit"
                disabled={isSubmitting || code.join('').length < 6}
                className="w-full py-5 rounded-[24px] bg-primary text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:bg-primary-dark disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><CheckCircle2 size={20} /> Verify Account</>
                )}
              </button>

              <div className="text-center">
                <button 
                  type="button"
                  disabled={resendTimer > 0}
                  onClick={() => setResendTimer(30)}
                  className="text-xs font-black text-ink-muted hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                >
                  <RefreshCw size={14} className={cn(resendTimer > 0 && "animate-spin-slow")} />
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend verification code"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/5 shrink-0">
            <Mail size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Demo Code</h4>
            <p className="text-xs font-medium text-ink-muted leading-relaxed">
              For this demonstration, please use the code <span className="font-black text-primary">123456</span> to complete your verification.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

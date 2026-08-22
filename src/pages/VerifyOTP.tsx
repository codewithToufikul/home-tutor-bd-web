import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, KeyRound, ChevronRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVerifyEmailMutation, useForgotPasswordMutation } from '../services/authApi';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { cn } from '../lib/utils';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

  // Get email passed from Register page state or query parameter
  const emailParam = (location.state as { email?: string })?.email || new URLSearchParams(location.search).get('email') || '';
  
  const [email] = useState(emailParam);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: isResending }] = useForgotPasswordMutation();

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle OTP Digit Input Change
  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1); // Only keep last typed digit
    setOtpDigits(newOtp);
    setError(null);

    // Auto-focus next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle KeyDown for Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Submit OTP Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP code');
      return;
    }

    try {
      const res = await verifyEmail({ email, otp: fullOtp }).unwrap() as { data?: { accessToken?: string; user?: any } };
      setSuccessMsg('Email verified successfully!');

      if (res?.data?.accessToken && res?.data?.user) {
        const u = res.data.user;
        dispatch(
          setCredentials({
            accessToken: res.data.accessToken,
            user: {
              _id: u._id,
              name: u.name,
              email: u.email,
              role: u.role,
              avatar: u.avatar,
              isEmailVerified: u.isEmailVerified,
              isApproved: u.isApproved,
            },
          })
        );

        setTimeout(() => {
          // Only tutor & coaching need admin approval. Student & Guardian are auto-approved.
          if (!u.isApproved && (u.role === 'tutor' || u.role === 'coaching')) {
            navigate('/pending-approval', { replace: true });
          } else if (u.role === 'guardian') navigate('/guardian/dashboard', { replace: true });
          else if (u.role === 'coaching') navigate('/coaching/dashboard', { replace: true });
          else if (u.role === 'tutor') navigate('/tutor/dashboard', { replace: true });
          else if (u.role === 'student') navigate('/student/dashboard', { replace: true });
          else navigate('/', { replace: true });
        }, 1000);
      } else {
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'OTP verification failed'
        : 'Invalid or expired OTP code';
      setError(msg);
    }
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setError(null);
    setSuccessMsg(null);

    try {
      await resendOtp({ email }).unwrap();
      setSuccessMsg('A new OTP has been sent to your email.');
      setResendTimer(60);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err.data as { message?: string })?.message || 'Failed to resend OTP'
        : 'Failed to resend OTP';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary/10 text-primary mb-4 shadow-inner">
          <KeyRound size={32} />
        </div>
        <h2 className="text-3xl font-display font-extrabold text-ink">
          Verify Your Email
        </h2>
        <p className="mt-2 text-sm text-ink-muted px-4">
          We have sent a 6-digit verification code to{' '}
          <span className="font-bold text-ink">{email || 'your email'}</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-surface py-10 px-6 shadow-2xl shadow-ink/5 sm:rounded-[2.5rem] border border-ink/5 sm:px-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold"
            >
              <AlertCircle size={18} className="shrink-0" />
              {error}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold"
            >
              <CheckCircle2 size={18} className="shrink-0" />
              {successMsg}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 6 Digit Input Boxes */}
            <div className="flex justify-between items-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold rounded-2xl border bg-background text-ink transition-all outline-none",
                    digit ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/5" : "border-ink/10 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  )}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || otpDigits.join('').length !== 6}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Verify Code
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-ink/5 text-center">
            <p className="text-sm text-ink-muted">
              Didn't receive the code?{' '}
              {resendTimer > 0 ? (
                <span className="font-bold text-ink-muted">
                  Resend in <span className="text-primary">{resendTimer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={14} className={isResending ? 'animate-spin' : ''} />
                  Resend Code
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}

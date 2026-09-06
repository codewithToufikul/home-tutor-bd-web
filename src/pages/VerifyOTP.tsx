import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, KeyRound, ChevronRight } from 'lucide-react';
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

  // Auto focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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
  const handleChange = (index: number, rawVal: string) => {
    const cleanDigits = rawVal.replace(/\D/g, '');
    
    if (!cleanDigits) {
      const newOtp = [...otpDigits];
      newOtp[index] = '';
      setOtpDigits(newOtp);
      return;
    }

    if (cleanDigits.length > 1) {
      // User pasted or typed multiple digits
      const newOtp = [...otpDigits];
      const chars = cleanDigits.split('');
      for (let i = 0; i < 6 && index + i < 6; i++) {
        if (chars[i]) {
          newOtp[index + i] = chars[i];
        }
      }
      setOtpDigits(newOtp);
      const nextFocus = Math.min(index + cleanDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    // Single digit input
    const newOtp = [...otpDigits];
    newOtp[index] = cleanDigits;
    setOtpDigits(newOtp);
    setError(null);

    // Auto-focus next input field
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle KeyDown for Backspace & Arrow navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const newOtp = [...otpDigits];
        newOtp[index - 1] = '';
        setOtpDigits(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpDigits];
        newOtp[index] = '';
        setOtpDigits(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Paste OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData) {
      const digits = pastedData.slice(0, 6).split('');
      const newOtp = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpDigits(newOtp);
      const focusIndex = Math.min(digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
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
          // Only coaching centers need admin approval. Tutors, Students & Guardians are auto-approved.
          if (!u.isApproved && u.role === 'coaching') {
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
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center py-6 sm:py-12 px-3.5 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-80 h-72 sm:h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-2">
        {/* Animated App Key Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-primary/10 text-primary mb-3 sm:mb-4 shadow-sm border border-primary/20">
          <KeyRound size={28} className="sm:w-8 sm:h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-ink tracking-tight">
          Verify Your Email
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-ink-muted max-w-xs mx-auto">
          We have sent a 6-digit verification code to
        </p>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-800 mt-2 shadow-xs">
          <span className="truncate max-w-[200px] sm:max-w-xs">{email || 'your email'}</span>
          <Link to="/register" className="text-primary hover:underline text-[11px] font-black shrink-0 ml-1">
            Change
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-6 px-4 sm:py-10 sm:px-10 shadow-xl sm:shadow-2xl shadow-ink/5 rounded-3xl sm:rounded-[2.5rem] border border-ink/5">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 sm:p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs sm:text-sm font-bold shadow-xs"
            >
              <AlertCircle size={18} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3.5 sm:p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs sm:text-sm font-bold shadow-xs"
            >
              <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* 6 Digit Input Boxes - Responsive Touch Friendly Grid */}
            <div className="flex justify-between items-center gap-1.5 sm:gap-2.5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  className={cn(
                    "w-11 h-13 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-xl sm:rounded-2xl border transition-all outline-none cursor-text",
                    digit 
                      ? "border-primary ring-2 ring-primary/25 bg-primary/5 text-primary shadow-sm" 
                      : "border-slate-200 bg-slate-50/80 text-ink focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white"
                  )}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || otpDigits.join('').length !== 6}
              className="w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 px-4 bg-primary hover:bg-primary-dark text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Proceed</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-ink-muted">
              Didn't receive the code?{' '}
              {resendTimer > 0 ? (
                <span className="font-bold text-slate-700 ml-1">
                  Resend in <span className="text-primary font-black">{resendTimer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer ml-1"
                >
                  <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
                  Resend Code
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Check,
  Loader2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForgotPasswordMutation, useResetPasswordMutation } from '@/src/services/authApi.ts';
import logoImage from '@/src/lib/Home.png';
import { cn } from '@/src/lib/utils';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initial email from location state or search params if available
  const initialEmail = (location.state as { email?: string })?.email || new URLSearchParams(location.search).get('email') || '';

  const [step, setStep] = useState<'email' | 'otp_reset' | 'success'>('email');
  const [email, setEmail] = useState(initialEmail);

  // OTP Digits
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // States
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(60);

  // RTK Query Mutations
  const [requestForgotOtp, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [submitResetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  // Resend Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0 && step === 'otp_reset') {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer, step]);

  // Focus first OTP input when transitioning to otp_reset step
  useEffect(() => {
    if (step === 'otp_reset') {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = getPasswordStrength(newPassword);

  // -------------------------------------------------------------
  // Step 1: Handle Send OTP
  // -------------------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস প্রদান করুন।');
      return;
    }

    try {
      const res: any = await requestForgotOtp({ email: cleanEmail }).unwrap();
      setSuccessMsg(res?.message || 'আপনার ইমেইলে ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে!');
      setResendTimer(60);
      setStep('otp_reset');
    } catch (err: any) {
      setError(err?.data?.message || 'পাসওয়ার্ড রিসেট কোড পাঠানো যায়নি! সঠিক ইমেইল দিন।');
    }
  };

  // -------------------------------------------------------------
  // Step 2: Handle Resend OTP
  // -------------------------------------------------------------
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res: any = await requestForgotOtp({ email: email.trim().toLowerCase() }).unwrap();
      setSuccessMsg('নতুন ওটিপি কোড পুনরায় পাঠানো হয়েছে!');
      setResendTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err?.data?.message || 'ওটিপি পুনরায় পাঠানো ব্যর্থ হয়েছে।');
    }
  };

  // -------------------------------------------------------------
  // OTP Digits Input Handlers
  // -------------------------------------------------------------
  const handleOtpChange = (index: number, rawVal: string) => {
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

    const newOtp = [...otpDigits];
    newOtp[index] = cleanDigits;
    setOtpDigits(newOtp);
    setError(null);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  // -------------------------------------------------------------
  // Step 2: Handle Reset Password Submit
  // -------------------------------------------------------------
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setError('অনুগ্রহ করে সম্পূর্ণ ৬ ডিজিটের ওটিপি কোডটি পূরণ করুন।');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    try {
      await submitResetPassword({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
        newPassword,
      }).unwrap();

      setStep('success');
    } catch (err: any) {
      setError(err?.data?.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে! ভুল বা মেয়াদোত্তীর্ণ ওটিপি কোড।');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#006A4E]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#9D174D]/10 blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-lg shadow-black/5 p-2 flex items-center justify-center border border-slate-100 group-hover:scale-105 transition-transform">
              <img src={logoImage} alt="Home Tutor Provider BD" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-[#001F3F] block leading-tight tracking-tight">
                Home Tutor <span className="text-[#006A4E]">BD</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Security & Account Recovery
              </span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-100 relative"
        >
          {/* STEP 1: ENTER EMAIL */}
          {step === 'email' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#006A4E]/10 text-[#006A4E] mx-auto flex items-center justify-center shadow-inner">
                  <KeyRound size={26} />
                </div>
                <h2 className="text-xl font-black text-[#001F3F]">পাসওয়ার্ড ভুলে গেছেন?</h2>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  আপনার অ্যাকাউন্টের রেজিস্টার্ড ইমেইলটি দিন। আমরা পাসওয়ার্ড রিসেটের জন্য একটি ৬ ডিজিটের ওটিপি পাঠাবো।
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    রেজিস্টার্ড ইমেইল অ্যাড্রেস*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-4 rounded-2xl bg-[#006A4E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#006A4E]/25 hover:bg-[#00523C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSendingOtp ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> কোড পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <span>ওটিপি কোড পাঠান</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#006A4E] transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>লগইন পেজে ফিরে যান</span>
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: OTP & NEW PASSWORD */}
          {step === 'otp_reset' && (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <div className="w-14 h-14 rounded-2xl bg-[#006A4E]/10 text-[#006A4E] mx-auto flex items-center justify-center shadow-inner">
                  <Lock size={26} />
                </div>
                <h2 className="text-xl font-black text-[#001F3F]">ইমেইল ওটিপি ও নতুন পাসওয়ার্ড</h2>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <span>কোড পাঠানো হয়েছে:</span>
                  <span className="font-bold text-[#001F3F]">{email}</span>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[#006A4E] font-bold underline text-[11px] ml-1 cursor-pointer"
                  >
                    বদলান
                  </button>
                </div>
              </div>

              {/* Success or Error Messages */}
              {successMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* 6-Digit OTP Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider text-center mb-2.5">
                    ৬ ডিজিটের ওটিপি কোড (OTP Code)*
                  </label>
                  <div className="flex justify-center gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className={cn(
                          'w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border bg-slate-50 text-[#001F3F] transition-all focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20',
                          digit ? 'border-[#006A4E] bg-emerald-50/50' : 'border-slate-200'
                        )}
                      />
                    ))}
                  </div>

                  {/* Resend Code Button & Timer */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400">কোড পাননি?</span>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isSendingOtp}
                      onClick={handleResendOtp}
                      className={cn(
                        'font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer',
                        resendTimer > 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-[#006A4E] hover:underline'
                      )}
                    >
                      <RefreshCw size={13} className={isSendingOtp ? 'animate-spin' : ''} />
                      {resendTimer > 0 ? `পুনরায় পাঠান (${resendTimer}s)` : 'পুনরায় কোড পাঠান'}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      নতুন পাসওয়ার্ড (New Password)*
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-400">পাসওয়ার্ড শক্তি:</span>
                          <span
                            className={cn(
                              passStrength <= 1 && 'text-rose-500',
                              passStrength === 2 && 'text-amber-500',
                              passStrength === 3 && 'text-blue-500',
                              passStrength >= 4 && 'text-emerald-600'
                            )}
                          >
                            {passStrength <= 1 && 'দুর্বল (Weak)'}
                            {passStrength === 2 && 'মোটামুটি (Fair)'}
                            {passStrength === 3 && 'ভালো (Strong)'}
                            {passStrength >= 4 && 'অত্যন্ত শক্তিশালী (Excellent)'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                          <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 1 ? 'bg-rose-500' : 'bg-transparent')} />
                          <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 2 ? 'bg-amber-500' : 'bg-transparent')} />
                          <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 3 ? 'bg-blue-500' : 'bg-transparent')} />
                          <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 4 ? 'bg-emerald-500' : 'bg-transparent')} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      কনফার্ম নতুন পাসওয়ার্ড (Confirm Password)*
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                        <AlertCircle size={12} /> পাসওয়ার্ড মিলছে না!
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full py-4 rounded-2xl bg-[#006A4E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#006A4E]/25 hover:bg-[#00523C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> পাসওয়ার্ড পরিবর্তন হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Check size={16} /> পাসওয়ার্ড রিসেট সম্পন্ন করুন
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#006A4E] transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>ইমেইল পরিবর্তন করতে আগের ধাপে যান</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/10">
                <CheckCircle2 size={40} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#001F3F]">অভিনন্দন! 🎉</h2>
                <h3 className="text-sm font-bold text-emerald-700">পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  আপনার নতুন পাসওয়ার্ডটি কার্যকর হয়েছে। এখন আপনি নতুন পাসওয়ার্ড দিয়ে অনায়াসে লগইন করতে পারবেন।
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-4 rounded-2xl bg-[#006A4E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#006A4E]/25 hover:bg-[#00523C] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>এখনই লগইন করুন</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Safety Info Card */}
        <div className="mt-8 text-center text-xs text-slate-400">
          <p className="inline-flex items-center gap-1.5 font-medium">
            <ShieldCheck size={14} className="text-[#006A4E]" />
            সুরক্ষিত ও এনক্রিপ্টেড OTP ভেরিফিকেশন সিস্টেম
          </p>
        </div>
      </div>
    </div>
  );
}

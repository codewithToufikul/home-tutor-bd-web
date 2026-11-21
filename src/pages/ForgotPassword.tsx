import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Phone,
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

  // Initial phone from location state or search params if available
  const initialPhone = (location.state as { phone?: string })?.phone || new URLSearchParams(location.search).get('phone') || '';

  const [step, setStep] = useState<'phone' | 'otp_reset' | 'success'>('phone');
  const [phone, setPhone] = useState(initialPhone);

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

  // Mask phone number for display: 017******78
  const maskPhone = (p: string) => {
    const clean = p.replace(/\D/g, '').replace(/^880/, '0');
    if (clean.length < 6) return p;
    return clean.slice(0, 3) + '******' + clean.slice(-2);
  };

  // Normalize phone to Bangladesh format
  const normalizePhone = (p: string) => {
    const digits = p.replace(/\D/g, '');
    if (digits.startsWith('880')) return '0' + digits.slice(3);
    if (digits.startsWith('0')) return digits;
    return '0' + digits;
  };

  // -------------------------------------------------------------
  // Step 1: Handle Send OTP
  // -------------------------------------------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

      const cleanPhone = phone.trim().replace(/\s+/g, '');
      const bdPhoneRegex = /^(?:\+?8801|8801|01)[3-9]\d{8}$/;
      if (!cleanPhone || !bdPhoneRegex.test(cleanPhone)) {
        setError('অনুগ্রহ করে একটি সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
        return;
      }

      try {
        const res: any = await requestForgotOtp({ phone: cleanPhone }).unwrap();
        setSuccessMsg(res?.message || 'আপনার মোবাইলে ৬ ডিজিটের OTP কোড পাঠানো হয়েছে!');
        setResendTimer(60);
        setStep('otp_reset');
      } catch (err: any) {
        setError(err?.data?.message || 'OTP পাঠানো যায়নি! সঠিক মোবাইল নম্বর দিন।');
      }
    };

    // -------------------------------------------------------------
    // Step 2: Handle Resend OTP
    // -------------------------------------------------------------
    const handleResendOtp = async () => {
      if (resendTimer > 0 || isSendingOtp) return;
      setError(null);
      setSuccessMsg(null);

      const cleanPhone = phone.trim().replace(/\s+/g, '');
      try {
        const res: any = await requestForgotOtp({ phone: cleanPhone }).unwrap();
        setSuccessMsg('নতুন OTP কোড পুনরায় পাঠানো হয়েছে!');
        setResendTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } catch (err: any) {
        setError(err?.data?.message || 'OTP পুনরায় পাঠানো ব্যর্থ হয়েছে।');
      }
    };

    // -------------------------------------------------------------
    // OTP Digits Input Handlers
    // -------------------------------------------------------------
        const handleOtpChange = (index: number, value: string) => {
          if (!/^\d*$/.test(value)) return;
          const newDigits = [...otpDigits];
          newDigits[index] = value.slice(-1);
          setOtpDigits(newDigits);
          if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
          }
        };

        const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
              inputRefs.current[index - 1]?.focus();
            }
          };

            const handleOtpPaste = (e: React.ClipboardEvent) => {
              e.preventDefault();
                const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                if (pasted.length === 6) {
                  setOtpDigits(pasted.split(''));
                  inputRefs.current[5]?.focus();
                }
              };

              const fullOtp = otpDigits.join('');

              // -------------------------------------------------------------
              // Step 2: Handle Reset Password
              // -------------------------------------------------------------
              const handleResetPassword = async (e: React.FormEvent) => {
                e.preventDefault();
                setError(null);
                setSuccessMsg(null);

                if (fullOtp.length < 6) {
                  setError('অনুগ্রহ করে সম্পূর্ণ ৬ ডিজিটের OTP কোড প্রবেশ করুন।');
                  return;
                }
                  if (newPassword.length < 6) {
                    setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setError('পাসওয়ার্ড দুটি মিলছে না। পুনরায় চেষ্টা করুন।');
                    return;
                  }

                  const cleanPhone = phone.trim().replace(/\s+/g, '');
                  try {
                    await submitResetPassword({ phone: cleanPhone, otp: fullOtp, newPassword }).unwrap();
                    setStep('success');
                  } catch (err: any) {
                    setError(err?.data?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে। OTP সঠিক কিনা যাচাই করুন।');
                  }
                };

                const strengthLabels = ['', 'দুর্বল', 'মাঝারি', 'ভালো', 'শক্তিশালী'];
                const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

                return (
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
                      {/* Background Blobs */}
                      <div className="absolute top-0 right-0 w-96 h-96 bg-[#006A4E]/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/8 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                            <div className="w-full max-w-sm relative z-10">
                              {/* Logo / Header */}
                              <div className="text-center mb-6">
                                <Link to="/" className="inline-block">
                                  <img src={logoImage} alt="Home Tutor BD" className="h-10 mx-auto mb-3 drop-shadow" />
                                </Link>
                                <p className="text-xs text-slate-400 font-medium">নিরাপদ পাসওয়ার্ড পুনরুদ্ধার</p>
                              </div>

                              <motion.div
                                className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100/80 p-6 sm:p-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                              >
                                    <AnimatePresence mode="wait">

                                          {/* ─── STEP 1: PHONE INPUT ─────────────────── */}
                                          {step === 'phone' && (
                                            <motion.div
                                              key="phone"
                                              initial={{ opacity: 0, x: -20 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              exit={{ opacity: 0, x: 20 }}
                                              transition={{ duration: 0.3 }}
                                              className="space-y-5"
                                            >
                                              {/* Header */}
                                              <div className="text-center space-y-2">
                                                <div className="w-14 h-14 rounded-2xl bg-[#006A4E]/10 text-[#006A4E] mx-auto flex items-center justify-center">
                                                  <KeyRound size={26} />
                                                </div>
                                                <h1 className="text-xl font-black text-[#001F3F]">পাসওয়ার্ড ভুলে গেছেন?</h1>
                                                <p className="text-xs text-slate-500 leading-relaxed">
                                                  রেজিস্টার্ড মোবাইল নম্বর দিন। আমরা একটি OTP কোড পাঠাব।
                                                </p>
                                              </div>

                                                      {/* Error / Success */}
                                                      {error && (
                                                        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700 font-medium">
                                                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                          <span>{error}</span>
                                                        </div>
                                                      )}
                                                      {successMsg && (
                                                        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-700 font-medium">
                                                          <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                                          <span>{successMsg}</span>
                                                        </div>
                                                      )}

                                                      {/* Form */}
                                                      <form onSubmit={handleSendOtp} className="space-y-4">
                                                        <div>
                                                          <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                            রেজিস্টার্ড মোবাইল নম্বর
                                                          </label>
                                                          <div className="relative">
                                                            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                            <input
                                                              type="tel"
                                                              value={phone}
                                                              onChange={(e) => setPhone(e.target.value)}
                                                              placeholder="017XXXXXXXX"
                                                              required
                                                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                                                            />
                                                          </div>
                                                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                                            📱 রেজিস্ট্রেশনে ব্যবহৃত মোবাইল নম্বর দিন
                                                          </p>
                                                        </div>

                                                        <button
                                                          type="submit"
                                                          disabled={isSendingOtp}
                                                          className="w-full py-4 rounded-2xl bg-[#006A4E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#006A4E]/25 hover:bg-[#00523C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                                        >
                                                          {isSendingOtp ? (
                                                            <>
                                                              <Loader2 size={16} className="animate-spin" /> OTP পাঠানো হচ্ছে...
                                                            </>
                                                          ) : (
                                                            <>
                                                              <Sparkles size={16} /> OTP কোড পাঠান
                                                              <ChevronRight size={16} />
                                                            </>
                                                          )}
                                                        </button>
                                                  </form>

                                                    <div className="pt-2 text-center border-t border-slate-100">
                                                      <Link
                                                        to="/login"
                                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#006A4E] transition-colors"
                                                      >
                                                        <ArrowLeft size={14} />
                                                        <span>লগইন পেজে ফিরে যান</span>
                                                      </Link>
                                                    </div>
                                                  </motion.div>
                                                )}

                                                    {/* ─── STEP 2: OTP + NEW PASSWORD ─────────────────── */}
                                                    {step === 'otp_reset' && (
                                                      <motion.div
                                                        key="otp_reset"
                                                        initial={{ opacity: 0, x: 20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -20 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-5"
                                                      >
                                                        {/* Header */}
                                                        <div className="text-center space-y-2">
                                                          <div className="w-14 h-14 rounded-2xl bg-[#006A4E]/10 text-[#006A4E] mx-auto flex items-center justify-center">
                                                            <ShieldCheck size={26} />
                                                          </div>
                                                          <h1 className="text-xl font-black text-[#001F3F]">মোবাইল OTP</h1>
                                                          <p className="text-xs text-slate-500 leading-relaxed">
                                                            <span className="font-bold text-slate-700">{maskPhone(phone)}</span> নম্বরে পাঠানো{' '}
                                                            ৬ ডিজিটের OTP ও নতুন পাসওয়ার্ড দিন।
                                                          </p>
                                                        </div>

                                                              {/* Error / Success */}
                                                              {error && (
                                                                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-700 font-medium">
                                                                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                                  <span>{error}</span>
                                                                </div>
                                                              )}
                                                              {successMsg && (
                                                                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-700 font-medium">
                                                                  <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                                                  <span>{successMsg}</span>
                                                                </div>
                                                              )}

                                                                      < form onSubmit = { handleResetPassword } className = "space-y-4" >
                                                                      {/* OTP Boxes */ }
                                                                      < div >
                    <label className="text-xs font-bold text-slate-700 mb-2 block text-center">
                      OTP কোড
                    </label>
                    <div
                      className="flex gap-2 justify-center"
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { inputRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className={cn(
                            'w-10 h-12 text-center text-base font-black border-2 rounded-xl outline-none transition-all',
                            digit
                              ? 'border-[#006A4E] bg-[#006A4E]/5 text-[#006A4E]'
                              : 'border-slate-200 bg-slate-50 text-slate-700',
                            'focus:border-[#006A4E] focus:ring-2 focus:ring-[#006A4E]/20'
                          )}
                        />
                      ))}
                    </div>
                    {/* Resend OTP */ }
                                                                    < div className = "text-center mt-2" >
                                                                      { resendTimer > 0 ? (
                                                                      <p className="text-[11px] text-slate-400 font-medium">
                                                                        পুনরায় OTP পাঠাতে{' '}
                                                                        <span className="font-bold text-[#006A4E]">{resendTimer}s</span> অপেক্ষা করুন
                                                                      </p>
                                                                    ) : (
                                                                      <button
                                                                        type="button"
                                                                        onClick={handleResendOtp}
                                                                        disabled={isSendingOtp}
                                                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#006A4E] hover:text-[#00523C] transition-colors disabled:opacity-50 cursor-pointer"
                                                                      >
                                                                        <RefreshCw size={12} className={isSendingOtp ? 'animate-spin' : ''} />
                                                                        OTP পুনরায় পাঠান
                                                                      </button>
                                                                    )}
                                                              </div>
                                                            </div>

                                                            {/* New Password */}
                                                            <div>
                                                                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                                  নতুন পাসওয়ার্ড
                                                                </label>
                                                                <div className="relative">
                                                                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                  <input
                                                                    type={showNewPass ? 'text' : 'password'}
                                                                    required
                                                                    value={newPassword}
                                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                                    placeholder="নতুন পাসওয়ার্ড"
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-10 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                                                                  />
                                                                  <button
                                                                    type="button"
                                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                                  >
                                                                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                  </button>
                                                                </div>
                                                                {/* Password Strength */}
                                                                {newPassword && (
                                                                  <div className="mt-2 space-y-1">
                                                                        <div className="flex gap-1">
                                                                          {[1, 2, 3, 4].map((level) => (
                                                                            <div
                                                                              key={level}
                                                                              className={cn(
                                                                                'h-1 flex-1 rounded-full transition-all',
                                                                                passStrength >= level ? strengthColors[passStrength] : 'bg-slate-200'
                                                                              )}
                                                                            />
                                                                          ))}
                                                                        </div>
                                                                        <p className="text-[10px] font-bold text-slate-500">
                                                                          পাসওয়ার্ড শক্তি:{' '}
                                                                          <span className={cn(
                                                                            passStrength <= 1 ? 'text-red-500' :
                                                                              passStrength === 2 ? 'text-yellow-500' :
                                                                                passStrength === 3 ? 'text-blue-500' : 'text-emerald-500'
                                                                          )}>
                                                                            {strengthLabels[passStrength] || ''}
                                                                          </span>
                                                                      </p>
                                                                    </div>
                    )}
                                                                  </div>

                                                                {/* Confirm Password */}
                                                                <div>
                                                                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                                                      পাসওয়ার্ড নিশ্চিত করুন
                                                                    </label>
                                                                    <div className="relative">
                                                                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                      <input
                                                                        type={showConfirmPass ? 'text' : 'password'}
                                                                        required
                                                                        value={confirmPassword}
                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                        placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 pl-10 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
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
                                                                        <AlertCircle size={12} /> পাসওয়ার্ড মিলছে না!
                                                                      </p>
                                                                    )}
                                                                </div>

                                                                <button
                                                                  type="submit"
                                                                  disabled={isResetting}
                                                                  className="w-full py-4 rounded-2xl bg-[#006A4E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#006A4E]/25 hover:bg-[#00523C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                                                >
                                                                  {isResetting ? (
                                                                    <>
                                                                      <Loader2 size={16} className="animate-spin" /> পাসওয়ার্ড পরিবর্তন হচ্ছে...
                                                                    </>
                                                                  ) : (
                                                                    <>
                                                                      <Check size={16} /> পাসওয়ার্ড রিসেট সম্পন্ন করুন
                                                                    </>
                                                                  )}
                                                                </button>
                                                              </form>

                                                              <div className="pt-2 text-center border-t border-slate-100">
                                                                <button
                                                                  type="button"
                                                                  onClick={() => setStep('phone')}
                                                                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#006A4E] transition-colors cursor-pointer"
                                                                >
                                                                  <ArrowLeft size={14} />
                                                                  <span>মোবাইল নম্বর পরিবর্তন করতে আগের ধাপে যান</span>
                                                                </button>
                                                              </div>
                                                            </motion.div>
            )}

                                                        {/* ─── STEP 3: SUCCESS ─────────────────── */}
                                                        {step === 'success' && (
                                                          <motion.div
                                                            key="success"
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ duration: 0.4 }}
                                                            className="text-center space-y-6 py-4"
                                                          >
                                                            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/10">
                                                              <CheckCircle2 size={40} />
                                                            </div>

                                                        <div className="space-y-2">
                                                          <h2 className="text-2xl font-black text-[#001F3F]">অভিনন্দন! 🎉</h2>
                                                          <h3 className="text-sm font-bold text-emerald-700">পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে</h3>
                                                          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                                            আপনার নতুন পাসওয়ার্ডটি কার্যকর হয়েছে। এখন আপনি নতুন পাসওয়ার্ড দিয়ে অনায়াসে লগইন করতে পারবেন।
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
                                                          </motion.div>
                                                        )}

                                                  </AnimatePresence>
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

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  GraduationCap,
  User,
  UserCircle,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function Login() {
  const [userType, setUserType] = useState<'tutor' | 'student' | 'guardian' | 'coaching'>('tutor');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter both email/phone and password');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email.trim(), formData.password, userType);

      if (userType === 'guardian') {
        navigate('/guardian/dashboard', { replace: true });
      } else if (userType === 'coaching') {
        navigate('/coaching/dashboard', { replace: true });
      } else if (userType === 'tutor') {
        navigate('/tutor/dashboard', { replace: true });
      } else if (userType === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Login failed';
      if (errMsg.toLowerCase().includes('not verified') || errMsg.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { state: { email: formData.email } });
        return;
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-ink/10 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white outline-none transition-all text-sm font-medium";
  const labelClasses = "text-xs font-bold text-slate-800 tracking-wide mb-1.5 block";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 blur-[140px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Main 2-Column Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ─── LEFT SIDE: Welcome Back & Trust Section ──────────────────────── */}
          <div className="lg:col-span-5 hidden lg:block space-y-8 text-center lg:text-left">
            <div>
              {/* Mini Brand Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 shadow-sm">
                <ShieldCheck size={15} />
                <span>#1 Verified Tutor Platform in Bangladesh</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-display font-black text-ink leading-tight">
                Welcome Back to Your <span className="text-primary bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">Learning</span> Portal.
              </h1>

              <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                Log in to manage your active tuitions, browse new teaching opportunities, chat in real-time, and track student progress.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3.5 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-ink/5 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Real-time Tuition Notifications</h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5">Receive instant alerts when new matched tuition jobs are posted near your area.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-ink/5 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Bank-Grade Secure Portal</h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5">Your personal information and communication are protected with 256-bit encryption.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-ink/5 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Direct Salary & Tracking</h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5">Direct guardian payment without middleman deductions or commission loss.</p>
                </div>
              </div>
            </div>

            {/* Testimonial Quote Box */}
            <div className="bg-gradient-to-br from-ink to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-3 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-white ml-2">Verified Tutor Review</span>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Home Tutor Provider BD transformed my tutoring career. I got hired for 3 regular tuitions in Dhanmondi within the first week of verification!"
              </p>
              <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-black text-white">
                  T
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Tanvir Ahmed</p>
                  <p className="text-[10px] text-slate-400">CSE Department, University of Dhaka</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDE: Login Form ─────────────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl shadow-ink/5 rounded-[2.5rem] border border-ink/10 relative">

              {/* Header Title */}
              <div className="text-center sm:text-left mb-6">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-ink">
                  Sign in to your account
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-ink-muted justify-center sm:justify-start">
                  <span>Don't have an account?</span>
                  <Link to="/register" className="font-bold text-primary hover:underline">
                    Create one for free
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link to="/admin/login" className="font-bold text-slate-500 hover:text-primary transition-colors">
                    Admin Login
                  </Link>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs sm:text-sm font-bold"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Role Toggle Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl mb-6 border border-ink/5">
                <button
                  type="button"
                  onClick={() => setUserType('tutor')}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    userType === 'tutor' ? "bg-white text-primary shadow-md shadow-primary/10 border border-primary/20" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <GraduationCap size={15} />
                  <span>Tutor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('student')}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    userType === 'student' ? "bg-white text-blue-600 shadow-md shadow-blue-600/10 border border-blue-200" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <User size={15} />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('guardian')}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    userType === 'guardian' ? "bg-white text-emerald-600 shadow-md shadow-emerald-600/10 border border-emerald-200" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <UserCircle size={15} />
                  <span>Guardian</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('coaching')}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    userType === 'coaching' ? "bg-white text-purple-600 shadow-md shadow-purple-600/10 border border-purple-200" : "text-ink-muted hover:text-ink"
                  )}
                >
                  <Building2 size={15} />
                  <span>Coaching</span>
                </button>
              </div>

              {/* Login Form */}
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                {/* Email or Phone Input */}
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Email Address or Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="text"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputClasses}
                      placeholder="e.g. name@example.com or 017XXXXXXXX"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-slate-800 tracking-wide">
                      Password *
                    </label>
                    <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className={cn(inputClasses, "pr-11")}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-300 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600">Remember this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-xl font-bold text-white text-sm transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer",
                      userType === 'tutor' ? "bg-primary hover:bg-primary-dark shadow-primary/25" :
                        userType === 'student' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25" :
                          userType === 'guardian' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25" :
                            "bg-purple-600 hover:bg-purple-700 shadow-purple-600/25"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In as {userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                {/* Security Footer Notice */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Protected by 256-bit Secure SSL Encryption</span>
                </div>
              </form>

            </div>
          </div>

        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-primary transition-colors">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
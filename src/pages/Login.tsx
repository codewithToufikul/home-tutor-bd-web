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
  ShieldCheck
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import authIllustration from '@/src/lib/auth-illustration.png';

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
      const loggedUser: any = await login(formData.email.trim(), formData.password, userType);

      // Determine true role from login response, falling back to selected userType
      const role = loggedUser?.role || userType;

      if (role === 'guardian') {
        navigate('/guardian/dashboard', { replace: true });
      } else if (role === 'coaching') {
        if (loggedUser && !loggedUser.isApproved) {
          navigate('/pending-approval', { replace: true });
        } else {
          navigate('/coaching/dashboard', { replace: true });
        }
      } else if (role === 'tutor') {
        navigate('/tutor/dashboard', { replace: true });
      } else if (role === 'student') {
        navigate('/student/dashboard', { replace: true });
      } else if (role === 'admin' || role === 'super_admin' || role === 'moderator') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
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

  const inputClasses = "block w-full pl-11 pr-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white outline-none transition-all text-sm font-medium";
  const labelClasses = "text-xs font-bold text-slate-700 tracking-wide mb-1.5 block";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center pt-4 sm:pt-8 pb-36 sm:pb-16 px-3.5 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-0 right-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-primary/10 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-teal-400/10 blur-[100px] sm:blur-[140px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-7xl w-full mx-auto relative z-10 px-0 sm:px-4">
        {/* Main 2-Column Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* ─── LEFT SIDE: Illustration (Desktop Only) ─────────────────────── */}
          <div className="lg:col-span-6 hidden lg:flex flex-col items-center justify-center p-0 lg:pr-4">
            <div className="relative w-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-teal-400/15 to-emerald-300/10 rounded-full blur-3xl -z-10 scale-100" />
              <img
                src={authIllustration}
                alt="Home Tutor Provider BD - Login Illustration"
                className="w-full max-w-[640px] 2xl:max-w-[720px] h-auto object-contain drop-shadow-md select-none pointer-events-none transition-transform hover:scale-[1.02] duration-500"
              />
            </div>
          </div>

          {/* ─── RIGHT SIDE: Login Form ─────────────────────────────────────────── */}
          <div className="lg:col-span-6 w-full max-w-xl mx-auto lg:mx-0">
            <div className="bg-white py-6 px-4 sm:py-8 sm:px-10 shadow-xl sm:shadow-2xl shadow-slate-900/5 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/80 relative">

              {/* Header Title */}
              <div className="text-center sm:text-left mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
                  Sign in to your account
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-500 justify-center sm:justify-start">
                  <span>Don't have an account?</span>
                  <Link to="/register" className="font-bold text-primary hover:underline">
                    Create one for free
                  </Link>
                  <span className="text-slate-300">•</span>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3.5 sm:p-4 bg-rose-50 border border-rose-100 rounded-xl sm:rounded-2xl flex items-center gap-2.5 text-rose-600 text-xs sm:text-sm font-bold shadow-2xs"
                >
                  <AlertCircle size={17} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Role Toggle Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl sm:rounded-2xl mb-5 sm:mb-6 border border-slate-200/60">
                {[
                  { id: 'tutor', label: 'Tutor', icon: GraduationCap, activeColor: 'text-emerald-700 border-emerald-400 shadow-emerald-600/10' },
                  { id: 'student', label: 'Student', icon: User, activeColor: 'text-blue-700 border-blue-400 shadow-blue-600/10' },
                  { id: 'guardian', label: 'Guardian', icon: UserCircle, activeColor: 'text-teal-700 border-teal-400 shadow-teal-600/10' },
                  { id: 'coaching', label: 'Coaching', icon: Building2, activeColor: 'text-purple-700 border-purple-400 shadow-purple-600/10' },
                ].map((role) => {
                  const Icon = role.icon;
                  const isActive = userType === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setUserType(role.id as any)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg sm:rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95",
                        isActive
                          ? `bg-white ${role.activeColor} shadow-xs border font-black`
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                      )}
                    >
                      <Icon size={14} className={isActive ? "shrink-0" : "opacity-70 shrink-0"} />
                      <span>{role.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Login Form */}
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                {/* Email or Phone Input */}
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Email Address or Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={17} />
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
                    <label htmlFor="password" className="text-xs font-bold text-slate-700 tracking-wide">
                      Password *
                    </label>
                    <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={17} />
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
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer active:scale-90 transition-transform"
                      title={showPassword ? "Hide password" : "Show password"}
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
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-300 cursor-pointer accent-primary"
                    />
                    <span className="text-xs font-medium text-slate-600">Remember this device</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-1 sm:pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full flex justify-center items-center gap-2 py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl shadow-lg font-bold text-white text-sm transition-all active:scale-98 disabled:opacity-50 cursor-pointer",
                      userType === 'tutor' ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-600/25" :
                        userType === 'student' ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-blue-600/25" :
                          userType === 'guardian' ? "bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 shadow-teal-600/25" :
                            "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-purple-600/25"
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
        <div className="mt-6 sm:mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition-colors py-1 px-3 rounded-lg hover:bg-slate-100">
            <ArrowLeft size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
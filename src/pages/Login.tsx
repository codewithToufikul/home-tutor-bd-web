import { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, User, UserCircle, Building2, Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function Login() {
  const [userType, setUserType] = useState<'tutor' | 'student' | 'guardian' | 'coaching'>('tutor');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // সঠিক userType ('coaching' সহ) পাস করা হলো
      await login(formData.email, formData.password, userType);
      
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

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <h2 className="text-center text-3xl font-display font-extrabold text-ink">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Create one for free
          </Link>
          <span className="mx-2">|</span>
          <Link to="/admin/login" className="font-bold text-ink-muted hover:text-primary transition-colors">
            Admin Login
          </Link>
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-surface py-10 px-6 shadow-2xl shadow-ink/5 sm:rounded-[2.5rem] border border-ink/5 sm:px-10">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          {/* User Type Toggle (4 Categories) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-ink/5 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => setUserType('tutor')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                userType === 'tutor' ? "bg-white text-primary shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              <GraduationCap size={16} />
              Tutor
            </button>
            <button
              type="button"
              onClick={() => setUserType('student')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                userType === 'student' ? "bg-white text-blue-600 shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              <User size={16} />
              Student
            </button>
            <button
              type="button"
              onClick={() => setUserType('guardian')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                userType === 'guardian' ? "bg-white text-emerald-600 shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              <UserCircle size={16} />
              Guardian
            </button>
            <button
              type="button"
              onClick={() => setUserType('coaching')}
              className={cn(
                "flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                userType === 'coaching' ? "bg-white text-purple-600 shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              <Building2 size={16} />
              Coaching
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-ink uppercase tracking-wider ml-1">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-ink-muted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-11 pr-4 py-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Enter your email or phone"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="text-xs font-bold text-ink uppercase tracking-wider">
                  Password
                </label>
                <Link to="#" className="text-xs font-bold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ink-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-11 pr-12 py-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-ink-muted hover:text-ink cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-ink/10 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-ink-muted cursor-pointer">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer",
                  userType === 'tutor' ? "bg-primary hover:bg-primary-dark shadow-primary/20" :
                  userType === 'student' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20" :
                  userType === 'guardian' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" :
                  "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in as {userType.charAt(0).toUpperCase() + userType.slice(1)}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
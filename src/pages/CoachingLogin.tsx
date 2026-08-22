// src/pages/CoachingLogin.tsx
import { useState } from 'react';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, Eye, EyeOff, ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function CoachingLogin() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(formData.email, formData.password, 'coaching');
      navigate('/coaching/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Coaching login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-primary flex items-center justify-center text-white shadow-xl shadow-purple-600/25">
            <Building2 size={32} />
          </div>
        </div>
        <h2 className="text-center text-3xl font-display font-extrabold text-ink">
          Coaching Center Portal
        </h2>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Sign in to manage your institute & batches
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-bold text-ink uppercase tracking-wider ml-1">
                Institute Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-ink-muted" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-11 pr-4 py-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-sm"
                  placeholder="coaching@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between ml-1">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">
                  Password
                </label>
                <Link to="#" className="text-xs font-bold text-purple-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-ink-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-11 pr-12 py-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all text-sm"
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
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-ink/10 rounded cursor-pointer"
              />
              <label className="ml-2 block text-sm text-ink-muted cursor-pointer">
                Remember me
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-purple-600/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in to Coaching Portal
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-ink-muted">
              Want to register your institute?{' '}
              <Link to="/register" className="font-bold text-purple-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
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
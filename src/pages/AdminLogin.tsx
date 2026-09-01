import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await login(email, password, 'admin');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
            <LayoutDashboard size={40} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black text-ink tracking-tight">Staff Login</h1>
            <p className="text-sm font-medium text-ink-muted">Enter your email or username to access the panel.</p>
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

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-ink-muted uppercase ml-1 tracking-widest">Email or Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hometutor.com or adm_name_1234"
                  required
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl py-4 pl-14 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-ink-muted uppercase ml-1 tracking-widest">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl py-4 pl-14 pr-14 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-5 flex items-center text-ink-muted/50 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-ink/10 text-primary focus:ring-primary/20" />
                <span className="text-xs font-bold text-ink-muted group-hover:text-ink transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-black text-primary hover:underline">Forgot Password?</button>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 rounded-[24px] bg-primary text-white font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 hover:bg-primary-dark disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><LogIn size={20} /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs font-bold text-ink-muted">
          Don't have an account? <button className="text-primary font-black hover:underline">Contact Super Admin</button>
          <span className="mx-2">|</span>
          <Link to="/login" className="text-ink-muted hover:text-primary transition-colors">User Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

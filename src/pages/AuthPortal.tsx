import { useAuth } from '@/src/context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Building2, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function AuthPortal() {
  const [role, setRole] = useState<'guardian' | 'coaching'>('guardian');
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  
  const navigate = useNavigate();

  const { login, register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(phone, password, role);
        if (role === 'guardian') navigate('/guardian/dashboard', { replace: true });
        else navigate('/coaching/dashboard', { replace: true });
      } else {
        await register(name, phone.includes('@') ? phone : `${phone}@coaching.com`, password, role);
        navigate('/verify-otp', { state: { email: phone.includes('@') ? phone : `${phone}@coaching.com` } });
      }
    } catch (err: any) {
      setError(err.message || 'Action failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-[32px] shadow-xl shadow-ink/5 border border-ink/5 p-8 max-w-md w-full space-y-6">
        
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-ink/5 p-1.5 rounded-2xl">
          <button 
            type="button"
            onClick={() => setRole('guardian')}
            className={cn("py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer", role === 'guardian' ? "bg-white text-primary shadow-sm" : "text-ink-muted hover:text-ink")}
          >
            Guardian Portal
          </button>
          <button 
            type="button"
            onClick={() => setRole('coaching')}
            className={cn("py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer", role === 'coaching' ? "bg-white text-purple-600 shadow-sm" : "text-ink-muted hover:text-ink")}
          >
            Coaching Center
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mx-auto font-black text-xl shadow-md", role === 'guardian' ? "bg-primary/10 text-primary" : "bg-purple-500/10 text-purple-600")}>
            {role === 'guardian' ? <User size={24} /> : <Building2 size={24} />}
          </div>
          <h1 className="text-2xl font-display font-black text-ink">
            {isLogin ? `${role === 'guardian' ? 'Guardian' : 'Coaching'} Login` : `${role === 'guardian' ? 'Guardian' : 'Coaching'} Registration`}
          </h1>
          <p className="text-xs text-ink-muted font-medium">
            {isLogin ? 'Enter your credentials to access your secure dashboard' : 'Submit your details securely to Admin for verification'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-ink-muted">{role === 'guardian' ? 'Guardian Name' : 'Institute Name'}</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3.5 text-ink-muted" />
                <input 
                  type="text" 
                  required
                  placeholder={role === 'guardian' ? "Enter your name" : "Enter coaching name"} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 text-xs focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          {!isLogin && role === 'coaching' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-ink-muted">Trade License Number (For Admin Verification)</label>
              <div className="relative">
                <FileText size={18} className="absolute left-3.5 top-3.5 text-ink-muted" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter Trade License No." 
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 text-xs focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-ink-muted">Phone Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3.5 top-3.5 text-ink-muted" />
              <input 
                type="text" 
                required
                placeholder="017XXXXXXXX" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-ink-muted">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-ink-muted" />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] font-bold text-amber-700 flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>Note: Your contact details and license will remain completely hidden from public/front-end and will only be approved by Admin.</span>
            </div>
          )}

          <button 
            type="submit"
            className={cn(
              "w-full py-3.5 rounded-xl font-black text-xs uppercase shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 text-white",
              role === 'guardian' ? "bg-primary shadow-primary/20 hover:bg-primary-dark" : "bg-purple-600 shadow-purple-600/20 hover:bg-purple-700"
            )}
          >
            {isLogin ? 'Login Securely' : 'Submit Registration to Admin'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-ink/5">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {isLogin ? "Don't have an account? Register here" : "Already registered? Login here"}
          </button>
        </div>

      </div>
    </div>
  );
}
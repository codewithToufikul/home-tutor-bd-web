import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  UserCircle, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function Register() {
  const [userType, setUserType] = useState<'tutor' | 'student' | 'guardian' | 'coaching'>('tutor');
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    phone: '',
    district: '',
    location: '',
    preferredArea: '',
    tradeLicense: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      // ফিক্স: এখানে guardian বা coaching-এর জন্য সঠিক রোল পাস করা হলো (coaching-এর ক্ষেত্রে আপাতত student বা coaching)
      await register(
        formData.name, 
        formData.email, 
        formData.password, 
        userType === 'coaching' ? 'student' : userType
      );
      
      // Trigger Admin Notification
      const newNotification = {
        id: `REG-${Date.now()}`,
        type: 'user_registration',
        title: `New ${userType.toUpperCase()} Registration`,
        message: `${formData.name} has registered as a ${userType}. ${formData.tradeLicense ? `Trade License: ${formData.tradeLicense}` : ''} (Pending Admin Approval).`,
        time: 'Just now',
        isRead: false
      };
      const existing = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      localStorage.setItem('admin_notifications', JSON.stringify([newNotification, ...existing]));

      if (userType === 'guardian') {
        navigate('/pending-approval');
      } else if (userType === 'coaching') {
        navigate('/coaching/dashboard');
      } else {
        navigate('/pending-approval');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full pl-11 pr-4 py-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all";
  const labelClasses = "text-xs font-bold text-ink uppercase tracking-wider ml-1 mb-1 block";

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <h2 className="text-center text-3xl font-display font-extrabold text-ink">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign in here
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

          {/* User Type Toggle */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className={labelClasses}>{userType === 'coaching' ? 'Institute Name *' : userType === 'guardian' ? 'Guardian Name *' : 'Full Name *'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {userType === 'coaching' ? <Building2 className="h-5 w-5 text-ink-muted" /> : <UserCircle className="h-5 w-5 text-ink-muted" />}
                  </div>
                  <input
                    type="text"
                    required
                    className={inputClasses}
                    placeholder={userType === 'coaching' ? "Enter institute name" : userType === 'guardian' ? "Enter guardian name" : "Enter your full name"}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* Trade License for Coaching */}
              {userType === 'coaching' && (
                <div className="md:col-span-2">
                  <label className={labelClasses}>Trade License Number (For Admin Verification) *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <input
                      type="text"
                      required
                      className={inputClasses}
                      placeholder="e.g. TRAD/SYL/1234/2026"
                      value={formData.tradeLicense}
                      onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                    />
                  </div>
                  <p className="text-[11px] text-ink-muted mt-1 ml-1 font-medium">Hidden from frontend and verified securely by Admin.</p>
                </div>
              )}

              {/* Tutor Specific Fields */}
              {userType === 'tutor' && (
                <div>
                  <label className={labelClasses}>Gender *</label>
                  <select
                    required
                    className={cn(inputClasses, "pl-4 appearance-none")}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}

              <div className={userType === 'tutor' ? '' : 'md:col-span-2'}>
                <label className={labelClasses}>Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    className={inputClasses}
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="md:col-span-2">
                <label className={labelClasses}>Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="tel"
                    required
                    className={inputClasses}
                    placeholder="017XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {userType === 'tutor' && (
                <>
                  <div>
                    <label className={labelClasses}>Tuition District *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-ink-muted" />
                      </div>
                      <input
                        type="text"
                        required
                        className={inputClasses}
                        placeholder="e.g. Dhaka"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Your Location *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-ink-muted" />
                      </div>
                      <input
                        type="text"
                        required
                        className={inputClasses}
                        placeholder="e.g. Dhanmondi"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClasses}>Preferred Tuition Area *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-ink-muted" />
                      </div>
                      <input
                        type="text"
                        required
                        className={inputClasses}
                        placeholder="e.g. Dhanmondi, Mohammadpur"
                        value={formData.preferredArea}
                        onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className={labelClasses}>Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    className={inputClasses}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClasses}>Re-Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    className={inputClasses}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl font-bold text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer",
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
                    Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}
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
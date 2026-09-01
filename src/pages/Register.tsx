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
  AlertCircle,
  Building2,
  FileText,
  ShieldCheck,
  Zap,
  Users,
  Star,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import { DISTRICT_WISE_AREAS } from '@/src/constants';

export default function Register() {
  const [userType, setUserType] = useState<'tutor' | 'student' | 'guardian' | 'coaching'>('tutor');
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    email: '',
    phone: '',
    district: 'Dhaka',
    location: '',
    preferredArea: '',
    tradeLicense: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const availableAreas = DISTRICT_WISE_AREAS[formData.district] || DISTRICT_WISE_AREAS['Dhaka'] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(
        formData.name.trim(), 
        formData.email.trim(), 
        formData.password, 
        userType,
        {
          phone: formData.phone.trim(),
          location: formData.location || formData.preferredArea || formData.district,
          gender: formData.gender,
        }
      );

      // Navigate to OTP Verification Page
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-ink/10 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white outline-none transition-all text-sm font-medium";
  const labelClasses = "text-xs font-bold text-slate-800 tracking-wide mb-1.5 block";

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/10 blur-[140px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Main 2-Column Split Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ─── LEFT SIDE: Platform Details & Trust Section ──────────────────────── */}
          <div className="lg:col-span-5 space-y-8 text-center lg:text-left">
            <div>
              {/* Mini Brand Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-4 shadow-sm">
                <ShieldCheck size={15} />
                <span>#1 Verified Tutor Platform in Bangladesh</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-4xl font-display font-black text-ink leading-tight">
                Unlock Your Academic <span className="text-primary bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">Excellence</span> Today.
              </h1>
              
              <p className="mt-3 text-sm sm:text-base text-ink-muted leading-relaxed max-w-md mx-auto lg:mx-0">
                Join thousands of verified tutors, students, and guardians across all 64 districts in Bangladesh for seamless home & online tutoring.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-4 text-left max-w-md mx-auto lg:mx-0">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-ink/5 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">100% Background Verified</h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5">Every tutor is vetted with academic certificates and NID identification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-ink/5 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Instant Auto-Matching</h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5">AI-powered algorithm matches the best qualified tutor for your exact syllabus.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 border border-ink/5 shadow-sm backdrop-blur-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-sm">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Zero Registration Fee</h4>
                  <p className="text-[11px] text-ink-muted leading-tight mt-0.5">Sign up for free and browse verified tuition jobs and tutor profiles instantly.</p>
                </div>
              </div>
            </div>

            {/* Live Social Proof / Testimonial Box */}
            <div className="bg-gradient-to-br from-ink to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-3 max-w-md mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
                <span className="text-xs font-bold text-white ml-2">4.9 / 5.0 Rating</span>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                "Found an outstanding Math & Physics teacher for my HSC child in Uttara within hours. The automated verification made us feel completely safe."
              </p>
              <div className="flex items-center gap-3 pt-1 border-t border-white/10">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs font-black text-white">
                  R
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Rehana Sultana</p>
                  <p className="text-[10px] text-slate-400">Guardian, Sector 7, Uttara, Dhaka</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT SIDE: Registration Form ──────────────────────────────────── */}
          <div className="lg:col-span-7">
            <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl shadow-ink/5 rounded-[2.5rem] border border-ink/10 relative">
              
              {/* Header Title */}
              <div className="text-center sm:text-left mb-6">
                <h2 className="text-2xl sm:text-3xl font-display font-black text-ink">
                  Create an account
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-ink-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-primary hover:underline">
                    Sign in here
                  </Link>
                </p>
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

              {/* Form Section */}
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>
                      {userType === 'coaching' ? 'Institute Name *' : userType === 'guardian' ? 'Guardian Full Name *' : 'Full Name *'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        {userType === 'coaching' ? <Building2 size={18} /> : <UserCircle size={18} />}
                      </div>
                      <input
                        type="text"
                        required
                        className={inputClasses}
                        placeholder={userType === 'coaching' ? "e.g. Master Coaching Center" : "e.g. Toufik Hasan"}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* ─── GENDER SELECTION (Exact match to screenshot) ───────────── */}
                  <div className="md:col-span-2">
                    <label className={labelClasses}>
                      Gender <span className="text-rose-500 font-black">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3.5 sm:gap-4">
                      
                      {/* Male Option Card */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: 'Male' })}
                        className={cn(
                          "relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left bg-white shadow-sm",
                          formData.gender === 'Male'
                            ? "border-teal-600 bg-teal-50/20 ring-2 ring-teal-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* Male Illustrated Cartoon Avatar (Matches Screenshot Exactly) */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F3E8FF] border border-purple-200/80 p-0.5 shrink-0 flex items-center justify-center shadow-inner">
                            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Background Circle */}
                              <circle cx="50" cy="50" r="48" fill="#F3E8FF" />
                              {/* Purple Shirt Body */}
                              <path d="M22 88C22 74 32 68 50 68C68 68 78 74 78 88V98H22V88Z" fill="#6D28D9" />
                              {/* Shirt Collar V */}
                              <path d="M44 68L50 76L56 68" stroke="#5B21B6" strokeWidth="2.5" strokeLinecap="round" />
                              {/* Neck */}
                              <rect x="43" y="54" width="14" height="16" rx="4" fill="#FBCFE8" />
                              {/* Head / Face */}
                              <ellipse cx="50" cy="42" rx="19" ry="20" fill="#FDE047" />
                              <ellipse cx="50" cy="42" rx="18.5" ry="19.5" fill="#FED7AA" />
                              {/* Ears */}
                              <circle cx="31" cy="43" r="4" fill="#FED7AA" />
                              <circle cx="69" cy="43" r="4" fill="#FED7AA" />
                              {/* Hair (Modern short black styled hair) */}
                              <path d="M31 38C31 27 38 21 50 21C62 21 69 27 69 38C69 33 66 26 50 25C34 26 31 33 31 38Z" fill="#1E1B4B" />
                              <path d="M31 38C31 30 35 23 48 22C63 21 69 28 69 38C69 31 64 26 50 26C37 26 32 32 31 38Z" fill="#1E1B4B" />
                              <path d="M32 36C36 29 44 26 52 26C60 26 67 30 68 36C65 31 59 28 51 28C42 28 35 32 32 36Z" fill="#0F172A" />
                              {/* Cheeks Blush */}
                              <circle cx="39" cy="46" r="3" fill="#F43F5E" opacity="0.25" />
                              <circle cx="61" cy="46" r="3" fill="#F43F5E" opacity="0.25" />
                              {/* Glasses (Black-rimmed like screenshot) */}
                              <rect x="36" y="36" width="11" height="9" rx="3" stroke="#1E1B4B" strokeWidth="2.2" fill="white" fillOpacity="0.4" />
                              <rect x="53" y="36" width="11" height="9" rx="3" stroke="#1E1B4B" strokeWidth="2.2" fill="white" fillOpacity="0.4" />
                              <path d="M47 40H53" stroke="#1E1B4B" strokeWidth="2.2" strokeLinecap="round" />
                              <path d="M31 39L36 39" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
                              <path d="M64 39L69 39" stroke="#1E1B4B" strokeWidth="2" strokeLinecap="round" />
                              {/* Eyes behind glasses */}
                              <circle cx="41.5" cy="40.5" r="1.8" fill="#1E1B4B" />
                              <circle cx="58.5" cy="40.5" r="1.8" fill="#1E1B4B" />
                              {/* Smile */}
                              <path d="M45 49C47 52 53 52 55 49" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </div>
                          <span className="text-base font-bold text-[#1e1e4b]">Male</span>
                        </div>

                        {/* Radio Dot (Matches Screenshot) */}
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0",
                          formData.gender === 'Male' 
                            ? "bg-teal-700 text-white shadow-sm ring-2 ring-teal-600/30" 
                            : "border-2 border-slate-300 bg-slate-50"
                        )}>
                          {formData.gender === 'Male' && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>

                      {/* Female Option Card */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: 'Female' })}
                        className={cn(
                          "relative flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-left bg-white shadow-sm",
                          formData.gender === 'Female'
                            ? "border-teal-600 bg-teal-50/20 ring-2 ring-teal-500/20"
                            : "border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {/* Female Illustrated Cartoon Avatar (Hijabi - Matches Screenshot) */}
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F3E8FF] border border-purple-200/80 p-0.5 shrink-0 flex items-center justify-center shadow-inner">
                            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {/* Background Circle */}
                              <circle cx="50" cy="50" r="48" fill="#F3E8FF" />
                              {/* Purple Hijab Cloak / Shoulders */}
                              <path d="M20 90C20 72 32 64 50 64C68 64 80 72 80 90V98H20V90Z" fill="#7C3AED" />
                              {/* Hijab Drape Wrap Around Head */}
                              <path d="M28 48C28 29 37 20 50 20C63 20 72 29 72 48C72 66 65 74 50 74C35 74 28 66 28 48Z" fill="#7C3AED" />
                              <path d="M30 48C30 31 38 23 50 23C62 23 70 31 70 48C70 64 63 71 50 71C37 71 30 64 30 48Z" fill="#6D28D9" />
                              {/* Under-Cap (Inner Scarf) */}
                              <path d="M36 34C39 29 44 27 50 27C56 27 61 29 64 34C59 32 53 31 50 31C47 31 41 32 36 34Z" fill="#EDE9FE" />
                              {/* Visible Face Oval */}
                              <ellipse cx="50" cy="46" rx="14.5" ry="16" fill="#FED7AA" />
                              {/* Cheeks Blush */}
                              <circle cx="41" cy="49" r="3" fill="#F43F5E" opacity="0.35" />
                              <circle cx="59" cy="49" r="3" fill="#F43F5E" opacity="0.35" />
                              {/* Eyebrows */}
                              <path d="M40 38C42 37 45 37 46 38" stroke="#581C87" strokeWidth="1.6" strokeLinecap="round" />
                              <path d="M54 38C55 37 58 37 60 38" stroke="#581C87" strokeWidth="1.6" strokeLinecap="round" />
                              {/* Feminine Eyes with Eyelashes */}
                              <circle cx="43" cy="42" r="2.2" fill="#1E1B4B" />
                              <circle cx="57" cy="42" r="2.2" fill="#1E1B4B" />
                              <circle cx="43.8" cy="41.2" r="0.7" fill="white" />
                              <circle cx="57.8" cy="41.2" r="0.7" fill="white" />
                              <path d="M39.5 40L41 41" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
                              <path d="M60.5 40L59 41" stroke="#1E1B4B" strokeWidth="1.2" strokeLinecap="round" />
                              {/* Cute Nose */}
                              <circle cx="50" cy="46" r="1" fill="#EA580C" opacity="0.6" />
                              {/* Cheerful Smile */}
                              <path d="M46 51C47.5 54 52.5 54 54 51" stroke="#E11D48" strokeWidth="1.8" strokeLinecap="round" />
                              {/* Hijab Pin / Detail */}
                              <circle cx="50" cy="67" r="2" fill="#FDE047" stroke="#CA8A04" strokeWidth="0.8" />
                            </svg>
                          </div>
                          <span className="text-base font-bold text-[#1e1e4b]">Female</span>
                        </div>

                        {/* Radio Dot (Matches Screenshot) */}
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center transition-all shrink-0",
                          formData.gender === 'Female' 
                            ? "bg-teal-700 text-white shadow-sm ring-2 ring-teal-600/30" 
                            : "border-2 border-slate-300 bg-slate-50"
                        )}>
                          {formData.gender === 'Female' && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </button>

                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClasses}>Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
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
                  <div>
                    <label className={labelClasses}>Phone Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Phone size={18} />
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

                  {/* Coaching Specific Field */}
                  {userType === 'coaching' && (
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Trade License / Registration Number *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-purple-600">
                          <FileText size={18} />
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
                      <p className="text-[11px] text-ink-muted mt-1 ml-1">Verified securely by administrators before activation.</p>
                    </div>
                  )}

                  {/* Location & District Fields for Tutors & Guardians */}
                  {(userType === 'tutor' || userType === 'guardian' || userType === 'student') && (
                    <>
                      <div>
                        <label className={labelClasses}>District *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <MapPin size={18} />
                          </div>
                          <select
                            required
                            className={cn(inputClasses, "cursor-pointer appearance-none pr-8")}
                            value={formData.district}
                            onChange={(e) => setFormData({ ...formData, district: e.target.value, preferredArea: '' })}
                          >
                            {Object.keys(DISTRICT_WISE_AREAS).map((dist) => (
                              <option key={dist} value={dist}>{dist}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={labelClasses}>Your Area / Location *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <MapPin size={18} />
                          </div>
                          <input
                            type="text"
                            required
                            list="area-suggestions"
                            className={inputClasses}
                            placeholder="e.g. Dhanmondi / Uttara"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          />
                          <datalist id="area-suggestions">
                            {availableAreas.map((a) => (
                              <option key={a} value={a} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Preferred Tuition Area for Tutors */}
                  {userType === 'tutor' && (
                    <div className="md:col-span-2">
                      <label className={labelClasses}>Preferred Tuition Areas (Comma separated) *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <MapPin size={18} />
                        </div>
                        <input
                          type="text"
                          required
                          className={inputClasses}
                          placeholder="e.g. Dhanmondi, Mohammadpur, Lalmatia"
                          value={formData.preferredArea}
                          onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className={labelClasses}>Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        className={cn(inputClasses, "pr-11")}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                  {/* Confirm Password */}
                  <div>
                    <label className={labelClasses}>Confirm Password *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className={cn(inputClasses, "pr-11")}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

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
                        <span>Register as {userType.charAt(0).toUpperCase() + userType.slice(1)}</span>
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>

                {/* Terms Notice */}
                <p className="text-center text-[11px] text-ink-muted">
                  By clicking Register, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                </p>
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
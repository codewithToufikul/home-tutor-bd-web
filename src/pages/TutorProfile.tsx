import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, MapPin, GraduationCap, 
  ChevronRight, ShieldCheck, BookOpen, Eye,
  Send, ArrowLeft
} from 'lucide-react';
import { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { HireService } from '@/src/services/hireService.ts';
import { RecommendationService } from '@/src/services/recommendationService.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';
import { DEFAULT_PROFILE_IMAGE, getAvatarUrl } from '@/src/constants';

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [suggestedTutors, setSuggestedTutors] = useState<TutorProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'tuition' | 'education' | 'reviews'>('tuition');

  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const safePhotoUrl = (tutor?.photoUrl ?? '').trim() || DEFAULT_PROFILE_IMAGE;
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      try {
        if (!id) {
          setTutor(null);
          setSuggestedTutors([]);
          return;
        }

        const profile = await TutorProfileService.getById(id);
        if (!profile) {
          setTutor(null);
          setSuggestedTutors([]);
          return;
        }

        setTutor(profile as unknown as TutorProfile);

        const all = await TutorProfileService.getAll();
        const suggestions = RecommendationService.getSimilarTutors(profile as unknown as TutorProfile, (all || []) as unknown as TutorProfile[]);
        const suggested = suggestions.slice(0, 3).map((entry) => entry.item);

        setSuggestedTutors(suggested);
      } catch (error) {
        console.error('Failed to load tutor profile:', error);
        setTutor(null);
        setSuggestedTutors([]);
      }
    };

    fetchTutor();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName || !guardianPhone || !tutor) return;

    const decision = can({
      user,
      permission: PERMISSIONS.HIRE_TUTOR,
      allowedRoles: ['guardian', 'student'],
    });

    if (!decision.ok) {
      if (decision.code === 'UNAUTHORIZED') {
        navigate('/login', { state: { from: location } });
      } else {
        alert(decision.message);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await HireService.create({
        tutorId: tutor.id,
        tutorName: tutor.name,
        guardianName,
        guardianPhone,
        requirements,
        status: 'pending',
      });

      setSubmitSuccess(true);
      setGuardianName('');
      setGuardianPhone('');
      setRequirements('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tutor) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-12 text-center space-y-4">
        <h2 className="text-2xl font-bold text-ink">Tutor Profile Not Found</h2>
        <button 
          onClick={() => navigate('/tutors')}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm cursor-pointer"
        >
          Back to Tutors List
        </button>
      </div>
    );
  }

  const locationStr = typeof tutor?.location === 'string'
    ? tutor.location
    : (tutor?.location ? [(tutor.location as any).area, (tutor.location as any).district].filter(Boolean).join(', ') : 'Dhaka');

  const displayName = (tutor as any).userId?.name || tutor.name || (tutor as any).fullName || 'Verified Tutor';
  const avatarUrl = getAvatarUrl(displayName || tutor.id, tutor.photoUrl || (tutor as any).userId?.avatar);

  const formattedSalary = (() => {
    const expSal = (tutor as any).expectedSalary;
    if (expSal && expSal !== 'Select One') return `${expSal} ৳`;
    if (!tutor.salary) return 'Negotiable';
    const str = String(tutor.salary).trim();
    if (str.length === 8 && str.startsWith('3000') && str.endsWith('5000')) return '3,000 - 5,000 ৳';
    if (str.length === 8 && str.startsWith('5000') && str.endsWith('8000')) return '5,000 - 8,000 ৳';
    if (str.length === 9 && str.startsWith('8000') && str.endsWith('12000')) return '8,000 - 12,000 ৳';
    if (str.includes('-')) return `${str} ৳`;
    const num = Number(tutor.salary);
    if (!isNaN(num) && num > 0) return `${num.toLocaleString()} ৳`;
    return str || 'Negotiable';
  })();

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation / Back Button */}
        <Link 
          to="/tutors" 
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-primary transition-colors bg-white px-4 py-2 rounded-xl border border-ink/5 shadow-sm"
        >
          <ArrowLeft size={16} />
          Back to Tutors List
        </Link>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Fixed / Sticky Profile Summary Card */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-ink/5 overflow-hidden sticky top-24">
              <div className="p-6 md:p-8 flex flex-col items-center text-center">
                
                {/* Photo with Badge */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-primary to-accent shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <img 
                        src={avatarUrl} 
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {tutor.isPremium && (
                    <div className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white">
                      <ShieldCheck size={20} />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-display font-bold text-[#001F3F] mb-1">
                  {displayName}
                </h1>
                <p className="text-xs md:text-sm font-bold text-primary mb-4">
                  {tutor.department || 'Tutor'} ({tutor.university || 'University'})
                </p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {tutor.isPremium && (
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-bold border border-amber-500/20">
                      Premium Tutor
                    </span>
                  )}
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold border border-primary/20">
                    Experienced
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                    {formattedSalary}/month
                  </span>
                </div>

                <div className="w-full h-px bg-ink/5 my-2" />

                <div className="w-full space-y-3 text-left">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Location:</span>
                    <span className="font-bold text-ink text-right">{locationStr}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">ID#:</span>
                    <span className="font-bold text-ink">{tutor.idNumber || tutor.id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Gender:</span>
                    <span className="font-bold text-ink">{tutor.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Qualification:</span>
                    <span className="font-bold text-ink text-right">{tutor.qualification || 'Pending'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-ink-muted text-xs">Area Covered:</span>
                    <p className="text-[10px] font-medium text-ink leading-relaxed">
                      {tutor.preferredAreas?.join(', ') || locationStr}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary py-3 text-center">
                <p className="text-white text-xs font-bold">Member Since: {tutor.memberSince || '2024'}</p>
              </div>
            </div>
          </div>

          {/* Middle Section: Main Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-ink/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <div className="p-6 md:p-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase mb-4">
                  Tutor Profile
                </div>
                <h2 className="text-xl md:text-3xl font-display font-bold text-[#001F3F] mb-3">
                  Everything you need before contacting this tutor
                </h2>
                <p className="text-xs md:text-sm text-ink-muted mb-6">
                  Explore tuition preferences, qualifications and trust signals using the highlighted tabs below.
                </p>

                <div className="space-y-3">
                  <div className="bg-background/50 p-3 md:p-4 rounded-2xl border border-ink/5 flex items-start gap-3">
                    <MapPin className="text-primary shrink-0" size={18} />
                    <p className="text-xs font-bold text-ink leading-relaxed">
                      {tutor.preferredAreas?.join(', ') || locationStr}
                    </p>
                  </div>
                  <div className="bg-background/50 p-3 md:p-4 rounded-2xl border border-ink/5 flex items-center gap-3 w-fit">
                    <Star className="text-primary shrink-0" size={18} />
                    <p className="text-xs font-bold text-ink">
                      {(tutor.rating || 5.0).toFixed(2)} rating - {tutor.reviewCount || 0} reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#001F3F] uppercase">Switch tabs to compare profile details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'tuition', label: 'Tuition Info', sub: 'Teaching style & schedule', icon: BookOpen },
                  { id: 'education', label: 'Education', sub: 'Academic background', icon: GraduationCap },
                  { id: 'reviews', label: 'Reviews', sub: 'Trust signals', icon: Star }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "p-3.5 md:p-4 rounded-2xl border transition-all text-left flex sm:flex-col items-center sm:items-start gap-3 group cursor-pointer",
                      activeTab === tab.id 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                        : "bg-white border-ink/5 text-ink hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0",
                      activeTab === tab.id ? "bg-white/20" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                    )}>
                      <tab.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-bold mb-0.5">{tab.label}</p>
                      <p className={cn(
                        "text-[10px] hidden sm:block",
                        activeTab === tab.id ? "text-white/70" : "text-ink-muted"
                      )}>{tab.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-ink/5 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'tuition' && (
                  <motion.div
                    key="tuition"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="divide-y divide-ink/5 text-xs md:text-sm"
                  >
                    <div className="p-4 md:p-6 flex justify-between items-center">
                      <span className="font-bold text-ink-muted">Expected Minimum Salary</span>
                      <span className="font-bold text-ink">{tutor.salary} ৳/Month</span>
                    </div>
                    <div className="p-4 md:p-6 flex justify-between items-center">
                      <span className="font-bold text-ink-muted">Current Status</span>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[11px] font-bold">Available</span>
                    </div>
                    <div className="p-4 md:p-6 flex justify-between items-center">
                      <span className="font-bold text-ink-muted">Days Per Week</span>
                      <span className="font-bold text-ink">3-4 Days/Week</span>
                    </div>
                    <div className="p-4 md:p-6 flex justify-between items-center">
                      <span className="font-bold text-ink-muted">Preferred Medium</span>
                      <span className="font-bold text-ink">{tutor.mediums?.join(', ')}</span>
                    </div>
                    <div className="p-4 md:p-6">
                      <span className="font-bold text-ink-muted block mb-3">Preferred Subjects</span>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects?.map(s => (
                          <span key={s} className="px-3 py-1 bg-background border border-ink/10 rounded-lg text-xs font-bold text-ink">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'education' && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 md:p-8 space-y-6"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                        <GraduationCap size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-ink text-sm md:text-base">{tutor.qualification}</h4>
                        <p className="text-xs md:text-sm text-ink-muted">{tutor.university}</p>
                        <p className="text-xs text-ink-muted mt-1">Department: {tutor.department || 'N/A'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-8 md:p-12 text-center space-y-4"
                  >
                    <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                      <Star size={28} />
                    </div>
                    <h4 className="text-base font-bold text-ink">No reviews yet</h4>
                    <p className="text-xs text-ink-muted max-w-xs mx-auto">This tutor hasn't received any reviews from students yet.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Sidebar: Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-ink/5 p-6 md:p-8 sticky lg:top-4">
              <h3 className="text-base md:text-lg font-display font-bold text-[#001F3F] mb-4 border-b border-ink/5 pb-3">
                Contact with this tutor
              </h3>
              
              {submitSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-center space-y-2">
                  <ShieldCheck size={32} className="mx-auto text-emerald-500" />
                  <p className="text-xs md:text-sm font-bold">Request Sent Successfully!</p>
                  <p className="text-xs">We will contact you shortly regarding this tutor.</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Name</label>
                    <input 
                      type="text" 
                      required
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-ink/10 text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-ink/10 text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink">Details Information</label>
                    <textarea 
                      rows={3}
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      placeholder="Tell us about your requirements..."
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-ink/10 text-xs md:text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-secondary text-white py-3.5 rounded-xl font-bold text-xs md:text-sm shadow-lg shadow-secondary/20 hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 uppercase"
                  >
                    <Send size={16} />
                    Submit Request
                  </button>
                </form>
              )}

              <div className="mt-6 p-3.5 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary shrink-0" size={18} />
                  <p className="text-[10px] font-bold text-primary leading-relaxed">
                    Your information is safe with us. We only share it with the tutor after verification.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Suggested Tutors Section */}
        {suggestedTutors.length > 0 && (
          <div className="mt-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px]">
                  <div className="w-6 h-0.5 bg-primary" />
                  Recommended for you
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-black text-[#001F3F]">
                  Suggested Tutors
                </h2>
                <p className="text-xs md:text-sm text-ink-muted font-medium max-w-xl">
                  Based on this tutor's location and teaching categories, here are other highly-rated educators.
                </p>
              </div>
              <Link 
                to="/tutors" 
                className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase hover:gap-3 transition-all"
              >
                View All Tutors
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedTutors.map((suggestedTutor) => (
                <motion.div
                  key={suggestedTutor.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-ink/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden group flex flex-col h-full"
                >
                  <div className="p-6 flex-grow space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {suggestedTutor.photoUrl ? (
                          <img
                            src={suggestedTutor.photoUrl}
                            alt={suggestedTutor.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-ink/5 flex items-center justify-center border-2 border-white shadow-md">
                            <div className="text-sm font-black text-ink-muted">{(suggestedTutor.name || '').split(' ').map(n => n[0]).slice(0,2).join('')}</div>
                          </div>
                        )}
                        {suggestedTutor.isPremium && (
                          <div className="absolute -top-1 -right-1 bg-primary text-white p-0.5 rounded-md shadow-sm">
                            <ShieldCheck size={10} />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-display font-black text-ink text-sm group-hover:text-primary transition-colors line-clamp-1">
                          {suggestedTutor.name}
                        </h4>
                        <div className="flex items-center gap-1 text-accent mt-0.5">
                          <Star size={12} className="fill-accent" />
                          <span className="text-[10px] font-black">{(suggestedTutor.rating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2.5 text-ink-muted">
                        <MapPin size={13} className="text-primary shrink-0" />
                        <span className="font-bold truncate">{typeof suggestedTutor.location === 'string' ? suggestedTutor.location : (suggestedTutor.location as any)?.district || 'Dhaka'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-ink-muted">
                        <GraduationCap size={13} className="text-primary shrink-0" />
                        <span className="font-bold truncate">{suggestedTutor.university}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3.5 bg-primary/5 border-t border-ink/5 flex items-center justify-between mt-auto">
                    <div className="text-xs font-black text-primary">
                      {suggestedTutor.salary} ৳<span className="text-[9px] font-medium opacity-70">/mo</span>
                    </div>
                    <Link 
                      to={`/tutor/${suggestedTutor.id}`}
                      className="text-[10px] font-black text-primary uppercase hover:underline"
                    >
                      View Profile
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
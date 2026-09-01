import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, MapPin, BookOpen, GraduationCap, 
  Calendar, Clock, ChevronLeft, Search, Filter, 
  PlayCircle, User, Layout, CheckSquare, Square, ChevronDown,
  ArrowLeft, Share2, Heart, AlertCircle, Phone, MessageSquare,
  CheckCircle2, Info, ShieldCheck, ShieldAlert, ArrowRight, Home,
  Eye, Send, Navigation, MousePointer2, Banknote, List,
  MessageCircle, Facebook, Twitter, Copy, Check, Sparkles, Building2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { TuitionJob } from '@/src/types';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { ApplicationService } from '@/src/services/applicationService.ts';
import { RecommendationService } from '@/src/services/recommendationService.ts';
import { useEffect, useMemo, useState } from 'react';
import JobApplyModal from './JobApplyModal';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false); 
  const [showVerificationRequiredModal, setShowVerificationRequiredModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [jobData, setJobData] = useState<TuitionJob | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<TuitionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      setLoading(true);
      try {
        const currentJob = await TuitionService.get(id || '');
        const allJobs = await TuitionService.list();

        setJobData((currentJob as unknown as TuitionJob) || null);
        const similar = RecommendationService.getSimilarJobs(currentJob as unknown as TuitionJob, (allJobs || []) as unknown as TuitionJob[]);
        setSuggestedJobs(similar.slice(0, 3).map((entry) => entry.item));

        if (user?.uid && id) {
          try {
            const myApps = await ApplicationService.listForTutor(user.uid);
            const exists = Array.isArray(myApps) && myApps.some((a: any) => String(a.jobId?._id || a.jobId || a.id) === String(id));
            if (exists) setHasApplied(true);
          } catch (err) {
            console.warn('Check application error:', err);
          }
        }
      } catch (error) {
        console.error('Failed to load job details:', error);
        setJobData(null);
        setSuggestedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, user]);

  const job = useMemo(() => {
    if (!jobData) return null;

    const rawId = String((jobData as any)._id || (jobData as any).id || id || '');
    const locArea = typeof (jobData as any).location === 'object' ? ((jobData as any).location?.area || '') : (jobData.area || '');
    const locDistrict = typeof (jobData as any).location === 'object' ? ((jobData as any).location?.district || '') : (typeof (jobData as any).location === 'string' ? (jobData as any).location : '');

    return {
      ...jobData,
      id: rawId,
      _id: rawId,
      location: locDistrict || 'Dhaka',
      area: locArea || 'Area N/A',
      views: 1,
      applications: 0,
      postedDate: new Date(jobData.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    };
  }, [jobData, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] pb-24 pt-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-lg shadow-primary/20" />
        <p className="text-sm font-bold text-ink-muted animate-pulse">Loading tuition job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] pb-24 pt-4 flex items-center justify-center">
        <div className="text-center space-y-3 bg-white p-10 rounded-3xl shadow-xl border border-ink/5">
          <h2 className="text-2xl font-black text-ink">Job Not Found</h2>
          <p className="text-xs text-ink-muted">The tuition job you are looking for does not exist or has been removed.</p>
          <Link to="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase">
            <ArrowLeft size={16} /> Back to All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const openMap = () => {
    const query = encodeURIComponent(`${job.area}, ${job.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleApplyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const decision = can({
      user,
      permission: PERMISSIONS.APPLY_TUITION,
      allowedRoles: ['tutor'],
    });

    if (!decision.ok) {
      if (decision.code === 'UNAUTHORIZED') {
        navigate('/login', { state: { from: location } });
      } else {
        alert(decision.message);
      }
      return;
    }

    // Strict Verification Guard for Tutors
    if (user.role === 'tutor' && !user.isApproved) {
      setShowVerificationRequiredModal(true);
      return;
    }

    setShowApplyModal(true);
  };

  const detailItemClasses = "flex items-center gap-4 p-4 bg-gray-50/80 hover:bg-white rounded-2xl transition-all group border border-ink/5 shadow-xs";
  const iconBoxClasses = "w-11 h-11 rounded-xl bg-white flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:bg-primary group-hover:text-white transition-all border border-ink/5";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-ink-muted mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/jobs" className="hover:text-primary transition-colors">Tuition Jobs</Link>
          <span>/</span>
          <span className="text-ink truncate max-w-[200px]">Job #{job.id?.slice(-8)}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 🌟 Main Content Section */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-[32px] shadow-xl shadow-ink/5 overflow-hidden border border-ink/5">
              
              {/* Header Section */}
              <div className="p-6 md:p-10 text-center space-y-6 border-b border-ink/5 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Status: {job.status || 'Active & Available'}
                </div>

                <h1 className="text-2xl md:text-4xl font-display font-black text-[#001F3F] leading-tight">
                  Tutor Need For {job.medium || 'Bangla Medium'}
                </h1>
                
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-bold text-ink-muted">
                  <span className="font-mono">Job ID: <strong className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-md">{job.customId || job.id}</strong></span>
                  <span className="w-1 h-1 rounded-full bg-ink/20" />
                  <span>Posted: <strong className="text-ink">{job.postedDate}</strong></span>
                </div>

                <div className="flex flex-col items-center gap-1.5 pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl border border-rose-100 text-rose-700 font-bold text-sm">
                    <MapPin size={18} className="text-rose-500 shrink-0" />
                    <span>{job.area ? `${job.area}, ` : ''}{job.location}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-6 md:p-10 space-y-8">
                
                {/* 9-Box Grid with robust fallbacks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  
                  {/* Medium */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Layout size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Medium</p>
                      <p className="text-sm font-black text-ink">{job.medium || 'Bangla Medium'}</p>
                    </div>
                  </div>

                  {/* Class */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><BookOpen size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Class / Grade</p>
                      <p className="text-sm font-black text-ink">{job.studentClass || 'Class 2'}</p>
                    </div>
                  </div>

                  {/* Student Gender */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><GraduationCap size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Student Gender</p>
                      <p className="text-sm font-black text-ink">{job.studentGender || 'Any (Male / Female)'}</p>
                    </div>
                  </div>

                  {/* Tutor Gender Preference */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Tutor Preference</p>
                      <p className="text-sm font-black text-primary">{job.genderPreference || 'Any Tutor'}</p>
                    </div>
                  </div>

                  {/* Tutoring Days */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Calendar size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Tutoring Days</p>
                      <p className="text-sm font-black text-ink">
                        {Array.isArray(job.tutoringDays) && job.tutoringDays.length > 0
                          ? job.tutoringDays.join(', ')
                          : (typeof job.tutoringDays === 'string' && job.tutoringDays ? job.tutoringDays : '3-4 Days / Week')}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Clock size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Tutoring Time</p>
                      <p className="text-sm font-black text-ink">{job.startTime || 'Negotiable (সন্ধ্যা / বিকাল)'}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Clock size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Class Duration</p>
                      <p className="text-sm font-black text-ink">{job.duration || '1.5 - 2 Hours / Class'}</p>
                    </div>
                  </div>

                  {/* Number of Students */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><GraduationCap size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Total Students</p>
                      <p className="text-sm font-black text-ink">{job.numStudents || 1} Student</p>
                    </div>
                  </div>

                  {/* Location Area */}
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><MapPin size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">District / City</p>
                      <p className="text-sm font-black text-ink">{job.location || 'Dhaka'}</p>
                    </div>
                  </div>

                </div>

                {/* Subjects Required */}
                <div className="p-6 bg-gray-50/80 rounded-2xl border border-ink/5 space-y-3">
                  <span className="text-xs font-black uppercase text-ink-muted tracking-wider block">Target Subjects:</span>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(job.subjects) ? job.subjects : []).filter(Boolean).length > 0 ? (
                      (Array.isArray(job.subjects) ? job.subjects : []).filter(Boolean).map((sub) => (
                        <span key={sub} className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                        All General Subjects
                      </span>
                    )}
                  </div>
                </div>

                {/* Salary Box */}
                <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-500/20 text-center sm:text-left">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-[#001F3F] rounded-2xl flex items-center justify-center text-emerald-400 shadow-xl shadow-ink/10 shrink-0">
                      <Banknote size={32} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-ink-muted uppercase tracking-wider">Offered Monthly Salary</p>
                      <p className="text-3xl font-display font-black text-emerald-700">
                        ৳{Number(job.salary || 0).toLocaleString()} <span className="text-xs font-bold text-ink-muted uppercase">/ Month</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleApplyClick}
                    disabled={hasApplied}
                    className={cn(
                      "px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0",
                      hasApplied
                        ? "bg-gray-200 text-gray-600 shadow-none cursor-default"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                    )}
                  >
                    {hasApplied ? <Check size={16} /> : <Send size={16} />}
                    {hasApplied ? 'Already Applied' : 'Apply For Tuition'}
                  </button>
                </div>

                {/* Other Requirements & Description */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-ink">
                    <List size={18} className="text-primary" />
                    <h2 className="text-base font-black uppercase tracking-wider">Job Description & Requirements</h2>
                  </div>
                  <div className="p-6 bg-gray-50/60 rounded-2xl border border-ink/5 space-y-3">
                    {job.requirements && job.requirements.length > 0 ? (
                      <ul className="space-y-2.5">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-ink font-semibold">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs sm:text-sm text-ink-muted font-medium leading-relaxed">
                        {job.description || 'অভিজ্ঞ এবং নিয়মিত পাঠদানকারী টিউটরদের আবেদন করার জন্য অনুরোধ করা হচ্ছে। টিউটরকে নিয়মিত ক্লাস নিতে হবে এবং আন্তরিকতার সাথে পড়াতে হবে।'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Back Button */}
                <div className="pt-4">
                  <Link 
                    to="/jobs"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-100 hover:bg-gray-200 rounded-2xl font-bold text-xs uppercase tracking-wider text-ink transition-all cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Back to All Tuition Jobs
                  </Link>
                </div>

              </div>
            </div>
          </div>

          {/* 📱 Sidebar Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-ink/5 border border-ink/5 space-y-4 sticky top-24">
              
              <button 
                onClick={handleApplyClick}
                disabled={hasApplied}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                  hasApplied 
                    ? "bg-gray-100 text-gray-500 shadow-none cursor-default" 
                    : "bg-emerald-600 text-white shadow-emerald-600/25 hover:bg-emerald-700"
                )}
              >
                {hasApplied ? (
                  <>
                    <Check size={18} />
                    Application Submitted
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Apply Now
                  </>
                )}
              </button>

              <button 
                onClick={openMap}
                className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-ink/10 hover:bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Navigation size={16} />
                View Location Map
              </button>

              {/* Share Section */}
              <div className="pt-6 space-y-3 border-t border-ink/5">
                <p className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={15} className="text-primary" />
                  Share This Job
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {/* Messenger */}
                  <a 
                    href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                    title="Share on Messenger"
                  >
                    <MessageSquare size={16} />
                  </a>
                  {/* WhatsApp */}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Tutor Needed For ${job.medium} in ${job.location} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 bg-gradient-to-tr from-emerald-500 to-green-500 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                  {/* Facebook Feed */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                    title="Share on Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                  {/* Twitter / X */}
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Tutor Needed For ${job.medium} in ${job.location}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 bg-gradient-to-tr from-sky-400 to-blue-500 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                    title="Share on Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                  {/* Copy Link */}
                  <button 
                    onClick={handleCopyLink}
                    className="h-10 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Safety & Guidelines Info */}
              <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2 text-[11px] text-amber-950">
                <p className="font-black flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck size={16} className="text-amber-600" /> এজেন্সির নির্দেশিকা
                </p>
                <p className="font-medium leading-relaxed">
                  টিউশনে আবেদনের পূর্বে সকল তথ্য মনোযোগ দিয়ে যাচাই করুন। আবেদনের পর অভিভাবকের সাথে যোগাযোগের সুযোগ প্রদান করা হবে।
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Suggested Jobs Section */}
      {suggestedJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px]">
                <Sparkles size={13} /> Recommended For You
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-black text-ink">
                Similar Tuition Jobs
              </h2>
            </div>
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase hover:gap-3 transition-all cursor-pointer"
            >
              Explore All Jobs
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestedJobs.map((suggestedJob) => {
              const sId = suggestedJob.id || (suggestedJob as any)._id;
              const sLocStr = typeof (suggestedJob as any).location === 'object'
                ? [(suggestedJob as any).location?.area, (suggestedJob as any).location?.district].filter(Boolean).join(', ')
                : [(suggestedJob as any).area, (suggestedJob as any).location].filter(Boolean).join(', ') || 'Location N/A';

              return (
                <motion.div
                  key={sId}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-ink/5 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg">Job #{String(sId).slice(-6)}</span>
                      <span className="text-emerald-600 font-bold">৳{Number(suggestedJob.salary || 0).toLocaleString()}</span>
                    </div>
                    <h3 className="text-base font-black text-ink line-clamp-1">
                      Tutor Needed For {suggestedJob.medium || 'Bangla Medium'}
                    </h3>
                    <p className="text-xs text-ink-muted flex items-center gap-1">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span className="truncate">{sLocStr}</span>
                    </p>
                  </div>

                  <Link
                    to={`/job/${sId}`}
                    className="w-full py-2.5 bg-gray-100 hover:bg-primary hover:text-white rounded-xl text-center text-xs font-black uppercase transition-all"
                  >
                    View Details
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Verification Required Modal */}
      <AnimatePresence>
        {showVerificationRequiredModal && (
          <div 
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowVerificationRequiredModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative max-w-md w-full bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl space-y-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
                <ShieldAlert size={34} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-ink">টিউটর ভেরিফিকেশন প্রয়োজন</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  অভিভাবকদের আস্থা ও শিক্ষার্থীদের নিরাপত্তা বজায় রাখতে টিউশন জবে আবেদন করার পূর্বে আপনার <strong className="text-slate-800">NID কার্ড</strong> এবং <strong className="text-slate-800">স্টুডেন্ট/টিউটর আইডি কার্ড</strong> আপলোড করে ভেরিফিকেশন সম্পন্ন করতে হবে।
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to="/tutor/verification"
                  className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} />
                  <span>Upload Documents & Verify Now</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowVerificationRequiredModal(false)}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Apply Modal */}
      {showApplyModal && (
        <JobApplyModal
          jobId={job.id}
          jobTitle={`Tutor Need For ${job.medium}`}
          salary={String(job.salary || '')}
          location={`${job.area ? `${job.area}, ` : ''}${job.location}`}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setHasApplied(true);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
}
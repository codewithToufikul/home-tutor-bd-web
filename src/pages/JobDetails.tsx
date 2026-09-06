import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Briefcase, MapPin, BookOpen, GraduationCap, 
  Calendar, Clock, Search, Filter, 
  User, Layout, ChevronRight,
  ArrowLeft, Share2, Heart, AlertCircle, Phone, MessageSquare,
  CheckCircle2, Info, ShieldCheck, ShieldAlert, ArrowRight, Home,
  Eye, Send, Navigation, Banknote, List,
  MessageCircle, Facebook, Twitter, Copy, Check, Sparkles, Building2,
  Monitor, Users, BadgeCheck, CheckSquare, Compass, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import type { TuitionJob } from '@/src/types';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { ApplicationService } from '@/src/services/applicationService.ts';
import { RecommendationService } from '@/src/services/recommendationService.ts';
import { useEffect, useMemo, useState } from 'react';
import JobApplyModal from './JobApplyModal';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';
import { useGetMyTutorProfileQuery } from '@/src/services/tutorApi.ts';

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
  const [copiedId, setCopiedId] = useState(false);

  // Fetch tutor profile only when logged in as a tutor (for verification check)
  const { data: myTutorProfileData } = useGetMyTutorProfileQuery(undefined, {
    skip: user?.role !== 'tutor',
  });
  const myTutorProfile = (myTutorProfileData as any)?.data;
  const isTutorVerified = Boolean(user?.isApproved || myTutorProfile?.isVerified);
  const tutorVerificationStatus: string = myTutorProfile?.verificationStatus || (isTutorVerified ? 'Approved' : 'Unsubmitted');

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, user]);

  const job = useMemo(() => {
    if (!jobData) return null;

    const rawId = String((jobData as any)._id || (jobData as any).id || id || '');
    const locObj = typeof (jobData as any).location === 'object' ? (jobData as any).location : null;
    const locArea = locObj?.area || (jobData as any).area || '';
    const locDistrict = locObj?.district || (typeof (jobData as any).location === 'string' ? (jobData as any).location : '') || 'Dhaka';
    const locDivision = locObj?.division || '';
    const locUpazila = locObj?.upazila || '';
    const locDetailed = locObj?.detailedAddress || '';

    return {
      ...jobData,
      id: rawId,
      _id: rawId,
      customId: jobData.customId || `JOB-${rawId.slice(-6).toUpperCase()}`,
      location: locDistrict,
      area: locArea || 'Area N/A',
      division: locDivision,
      upazila: locUpazila,
      detailedAddress: locDetailed,
      studentClass: jobData.studentClass || 'Not Specified',
      medium: jobData.medium || 'Bangla Medium',
      genderPreference: jobData.genderPreference || 'Any',
      tuitionType: jobData.tuitionType || 'Home Tuition',
      numStudents: jobData.numStudents || 1,
      studentGender: (jobData as any).studentGender || 'Any',
      salary: Number(jobData.salary || 0),
      tutoringDays: Array.isArray(jobData.tutoringDays)
        ? jobData.tutoringDays.join(', ')
        : (jobData.tutoringDays || '3-4 Days / Week'),
      startTime: (jobData as any).startTime || 'Negotiable (Time flexible)',
      duration: (jobData as any).duration || '1.5 - 2 Hours / Session',
      universityPreference: (jobData as any).universityPreference || '',
      tutorQualification: (jobData as any).tutorQualification || '',
      subjects: Array.isArray(jobData.subjects) && jobData.subjects.length > 0
        ? jobData.subjects
        : [(jobData as any).subject || 'All General Subjects'],
      requirements: Array.isArray(jobData.requirements) ? jobData.requirements : [],
      description: jobData.description || '',
      status: jobData.status || 'Active & Available',
      postedDate: new Date(jobData.createdAt || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
    };
  }, [jobData, id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyId = () => {
    if (!job) return;
    navigator.clipboard.writeText(job.customId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const openMapDirections = () => {
    if (!job) return;
    const destination = [job.detailedAddress, job.area, job.upazila, job.location, 'Bangladesh']
      .filter(Boolean)
      .join(', ');
    // Google Maps Direction URL: leaving origin empty automatically uses user's current location as starting point
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`, '_blank');
  };

  const openMapSearch = () => {
    if (!job) return;
    const query = [job.detailedAddress, job.area, job.location, 'Bangladesh']
      .filter(Boolean)
      .join(', ');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
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

    // Strict Verification Guard for Tutors:
    // Tutor must have documents submitted AND admin-approved to apply for jobs.
    if (user.role === 'tutor' && !isTutorVerified) {
      setShowVerificationRequiredModal(true);
      return;
    }

    setShowApplyModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-12 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen size={18} className="text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-sm font-black text-ink-muted tracking-wide animate-pulse">Loading Tuition Job Details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-12 flex items-center justify-center px-4">
        <div className="text-center space-y-4 bg-white p-8 sm:p-12 rounded-[32px] shadow-xl shadow-ink/5 border border-ink/5 max-w-md w-full">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-display font-black text-ink">Job Not Found</h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-medium">
            This tuition job listing does not exist or may have been filled and archived by the guardian.
          </p>
          <div className="pt-2">
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 transition-all active:scale-95"
            >
              <ArrowLeft size={16} /> Explore Other Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Colorful subject tag classes cycler
  const subjectTagColors = [
    'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    'bg-sky-50 text-sky-700 border-sky-200/70',
    'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    'bg-violet-50 text-violet-700 border-violet-200/70',
    'bg-amber-50 text-amber-800 border-amber-200/70',
    'bg-rose-50 text-rose-700 border-rose-200/70',
    'bg-teal-50 text-teal-700 border-teal-200/70',
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold text-ink-muted mb-6 overflow-x-auto whitespace-nowrap pb-1">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home size={13} />
            <span>Home</span>
          </Link>
          <ChevronRight size={13} className="text-ink/20 shrink-0" />
          <Link to="/jobs" className="hover:text-primary transition-colors">Tuition Jobs</Link>
          <ChevronRight size={13} className="text-ink/20 shrink-0" />
          <span className="text-ink font-black truncate max-w-[200px]">
            {job.customId}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 🌟 Main Content Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ─── Hero Card ────────────────────────────────────── */}
            <div className="bg-white rounded-[28px] sm:rounded-[36px] shadow-xl shadow-ink/5 overflow-hidden border border-ink/5">
              
              {/* Header Gradient Top Banner */}
              <div className="p-6 sm:p-8 md:p-10 border-b border-ink/5 bg-gradient-to-b from-primary/5 via-primary/[0.02] to-transparent space-y-5">
                
                {/* Status and Type Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200/70">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{job.status}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-50 text-sky-700 rounded-full text-xs font-black uppercase tracking-wider border border-sky-200/70">
                    {job.tuitionType?.toLowerCase().includes('online') ? (
                      <Monitor size={14} className="text-sky-600" />
                    ) : (
                      <Home size={14} className="text-sky-600" />
                    )}
                    <span>{job.tuitionType}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-black uppercase tracking-wider border border-purple-200/70">
                    <User size={14} className="text-purple-600" />
                    <span>{job.genderPreference} Tutor</span>
                  </div>
                </div>

                {/* Job Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-black text-ink leading-tight">
                  Tutor Needed For {job.studentClass} ({job.medium})
                </h1>

                {/* Meta details bar: ID, Date, Location */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 text-xs font-semibold text-ink-muted pt-1">
                  <button 
                    onClick={handleCopyId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-ink rounded-lg font-mono font-bold transition-all cursor-pointer group"
                    title="Click to copy Job ID"
                  >
                    <span>ID: <strong className="text-primary">{job.customId}</strong></span>
                    {copiedId ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} className="text-ink-muted group-hover:text-primary transition-colors" />}
                  </button>

                  <span className="w-1 h-1 rounded-full bg-ink/20 hidden sm:inline-block" />

                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-ink-muted shrink-0" />
                    <span>Posted: <strong className="text-ink font-bold">{job.postedDate}</strong></span>
                  </span>

                  <span className="w-1 h-1 rounded-full bg-ink/20 hidden sm:inline-block" />

                  <button 
                    onClick={openMapSearch}
                    className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer group"
                    title="View location on Google Maps"
                  >
                    <MapPin size={14} className="text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{job.area ? `${job.area}, ` : ''}{job.location}</span>
                  </button>
                </div>
              </div>

              {/* Salary & Quick Action Banner */}
              <div className="px-6 sm:px-8 md:px-10 py-6 bg-gradient-to-r from-emerald-500/[0.08] via-emerald-500/[0.03] to-transparent border-b border-ink/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 shrink-0">
                      <Banknote size={30} />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-black uppercase text-emerald-800 tracking-wider">Offered Monthly Salary</p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl sm:text-3xl font-display font-black text-emerald-700">
                          ৳{job.salary.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-ink-muted">/ month (Negotiable)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleApplyClick}
                    disabled={hasApplied}
                    className={cn(
                      "px-7 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0",
                      hasApplied
                        ? "bg-slate-200 text-slate-600 shadow-none cursor-default"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5"
                    )}
                  >
                    {hasApplied ? <Check size={16} /> : <Send size={16} />}
                    {hasApplied ? 'Already Applied' : 'Apply For Tuition'}
                  </button>
                </div>
              </div>

              {/* ─── Structured Specifications Grid ──────────────── */}
              <div className="p-6 sm:p-8 md:p-10 space-y-8">
                
                <div>
                  <h2 className="text-xs font-black uppercase text-ink-muted tracking-wider mb-4 flex items-center gap-2">
                    <Layout size={15} className="text-primary" />
                    Tuition Key Specifications
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    
                    {/* Medium */}
                    <SpecCard 
                      icon={<BookOpen size={18} />}
                      label="Medium / Curriculum"
                      value={job.medium}
                      accentColor="indigo"
                    />

                    {/* Class */}
                    <SpecCard 
                      icon={<GraduationCap size={18} />}
                      label="Class / Grade"
                      value={job.studentClass}
                      accentColor="sky"
                    />

                    {/* Tutor Preference */}
                    <SpecCard 
                      icon={<User size={18} />}
                      label="Tutor Gender Preference"
                      value={`${job.genderPreference} Tutor`}
                      accentColor="emerald"
                    />

                    {/* Tutoring Days */}
                    <SpecCard 
                      icon={<Calendar size={18} />}
                      label="Tutoring Days"
                      value={job.tutoringDays}
                      accentColor="amber"
                    />

                    {/* Tutoring Time */}
                    <SpecCard 
                      icon={<Clock size={18} />}
                      label="Tutoring Time"
                      value={job.startTime}
                      accentColor="rose"
                    />

                    {/* Duration */}
                    <SpecCard 
                      icon={<Clock size={18} />}
                      label="Daily Duration"
                      value={job.duration}
                      accentColor="violet"
                    />

                    {/* Number of Students */}
                    <SpecCard 
                      icon={<Users size={18} />}
                      label="Student Count & Gender"
                      value={`${job.numStudents} Student (${job.studentGender})`}
                      accentColor="teal"
                    />

                    {/* Tuition Type */}
                    <SpecCard 
                      icon={job.tuitionType?.toLowerCase().includes('online') ? <Monitor size={18} /> : <Home size={18} />}
                      label="Tuition Method"
                      value={job.tuitionType}
                      accentColor="blue"
                    />

                    {/* District */}
                    <SpecCard 
                      icon={<MapPin size={18} />}
                      label="District / City"
                      value={job.location}
                      accentColor="rose"
                    />

                    {/* University Preference if present */}
                    {job.universityPreference && (
                      <SpecCard 
                        icon={<Building2 size={18} />}
                        label="Preferred University / Inst."
                        value={job.universityPreference}
                        accentColor="purple"
                      />
                    )}

                    {/* Tutor Qualification if present */}
                    {job.tutorQualification && (
                      <SpecCard 
                        icon={<BadgeCheck size={18} />}
                        label="Desired Qualification"
                        value={job.tutorQualification}
                        accentColor="emerald"
                      />
                    )}
                  </div>
                </div>

                {/* ─── Target Subjects Section ──────────────────────── */}
                <div className="bg-slate-50/80 rounded-2xl sm:rounded-3xl p-6 border border-ink/5 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    <span className="text-xs font-black uppercase text-ink-muted tracking-wider">Subjects To Teach:</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {job.subjects.map((sub, idx) => {
                      const colorClass = subjectTagColors[idx % subjectTagColors.length];
                      return (
                        <span 
                          key={idx} 
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs sm:text-sm font-black tracking-wide border shadow-xs transition-transform hover:-translate-y-0.5",
                            colorClass
                          )}
                        >
                          {sub}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* ─── Job Requirements & Description ──────────────── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-ink">
                    <List size={18} className="text-primary" />
                    <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">
                      Requirements & Guardian Notes
                    </h2>
                  </div>

                  <div className="p-6 bg-slate-50/70 rounded-2xl sm:rounded-3xl border border-ink/5 space-y-4">
                    {job.requirements && job.requirements.length > 0 ? (
                      <div className="space-y-2.5">
                        <p className="text-[11px] font-black uppercase text-ink-muted tracking-wider">Special Requirements:</p>
                        <ul className="space-y-2.5">
                          {job.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-ink font-semibold">
                              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-black uppercase text-ink-muted tracking-wider">Description & Context:</p>
                      <p className="text-xs sm:text-sm text-ink-muted font-medium leading-relaxed">
                        {job.description || 'অভিজ্ঞ এবং নিয়মিত পাঠদানকারী টিউটরদের আবেদন করার জন্য অনুরোধ করা হচ্ছে। টিউটরকে নিয়মিত ক্লাস নিতে হবে এবং আন্তরিকতার সাথে পড়াতে হবে।'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ─── Location & Address Details ──────────────────── */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-ink">
                      <MapPin size={18} className="text-rose-500" />
                      <h2 className="text-sm sm:text-base font-black uppercase tracking-wider">
                        Tutoring Location
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={openMapSearch}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                        title="View pin on Google Maps"
                      >
                        <MapPin size={13} className="text-rose-500" />
                        <span>Open in Map</span>
                      </button>

                      <button 
                        onClick={openMapDirections}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                        title="Get live turn-by-turn route directions"
                      >
                        <Navigation size={13} />
                        <span>Get Directions</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-rose-50/40 rounded-2xl sm:rounded-3xl border border-rose-100 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">District</p>
                        <p className="text-sm font-black text-ink mt-0.5">{job.location}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Area / Upazila</p>
                        <p className="text-sm font-black text-ink mt-0.5">{job.area}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Tutoring Mode</p>
                        <p className="text-sm font-black text-ink mt-0.5">{job.tuitionType}</p>
                      </div>
                    </div>

                    {job.detailedAddress && (
                      <div className="pt-2 border-t border-rose-100/80">
                        <p className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Address Landmark</p>
                        <p className="text-xs sm:text-sm text-ink-muted font-medium mt-0.5">{job.detailedAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Back Button ─────────────────────────────────── */}
                <div className="pt-2">
                  <Link 
                    to="/jobs"
                    className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-wider text-ink transition-all cursor-pointer active:scale-98"
                  >
                    <ArrowLeft size={16} />
                    Back to All Tuition Jobs
                  </Link>
                </div>

              </div>
            </div>
          </div>

          {/* 📱 Sidebar Column (Sticky on Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              {/* Primary Action Card */}
              <div className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-7 shadow-xl shadow-ink/5 border border-ink/5 space-y-5">
                <div className="space-y-2 text-center pb-2 border-b border-ink/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full inline-block">
                    Job ID #{job.customId}
                  </span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-display font-black text-ink">৳{job.salary.toLocaleString()}</span>
                    <span className="text-xs font-bold text-ink-muted">/ month</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleApplyClick}
                    disabled={hasApplied}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95",
                      hasApplied 
                        ? "bg-slate-100 text-slate-500 shadow-none cursor-default" 
                        : "bg-emerald-600 text-white shadow-emerald-600/25 hover:bg-emerald-700 hover:shadow-emerald-600/35"
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
                    onClick={openMapDirections}
                    className="w-full bg-[#001F3F] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-ink/10 hover:bg-primary transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Navigation size={16} />
                    Get Route Directions
                  </button>

                  <button 
                    onClick={openMapSearch}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-ink py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <MapPin size={15} className="text-rose-500" />
                    Open Location in Map
                  </button>
                </div>

                {/* ─── Share Job Multi-channel ─────────────────────── */}
                <div className="pt-5 border-t border-ink/5 space-y-3">
                  <p className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Share2 size={14} className="text-primary" />
                      Share This Tuition
                    </span>
                    {copiedLink && (
                      <span className="text-[10px] font-bold text-emerald-600">Link Copied!</span>
                    )}
                  </p>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {/* Messenger */}
                    <a 
                      href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                      title="Share on Messenger"
                    >
                      <MessageSquare size={17} />
                    </a>

                    {/* WhatsApp */}
                    <a 
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Need ${job.genderPreference} Tutor For ${job.studentClass} (${job.medium}) in ${job.location} - Salary ৳${job.salary}: ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 bg-gradient-to-tr from-emerald-500 to-green-600 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                      title="Share on WhatsApp"
                    >
                      <MessageCircle size={17} />
                    </a>

                    {/* Facebook Feed */}
                    <a 
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                      title="Share on Facebook"
                    >
                      <Facebook size={17} />
                    </a>

                    {/* Twitter / X */}
                    <a 
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Tuition Job: ${job.studentClass} in ${job.location}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 bg-gradient-to-tr from-slate-700 to-slate-900 text-white rounded-xl flex items-center justify-center shadow-xs hover:scale-105 transition-transform"
                      title="Share on Twitter / X"
                    >
                      <Twitter size={17} />
                    </a>

                    {/* Copy Link */}
                    <button 
                      onClick={handleCopyLink}
                      className="h-11 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
                      title="Copy Job Link"
                    >
                      {copiedLink ? <Check size={17} className="text-emerald-600" /> : <Copy size={17} />}
                    </button>
                  </div>
                </div>

                {/* ─── Safety & Verification Notice ───────────────── */}
                <div className="p-4 bg-amber-50/90 rounded-2xl border border-amber-200/80 space-y-2 text-[11px] text-amber-950">
                  <p className="font-black flex items-center gap-1.5 text-amber-900">
                    <ShieldCheck size={16} className="text-amber-600 shrink-0" />
                    এজেন্সির নিরাপত্তা নির্দেশিকা
                  </p>
                  <p className="font-medium leading-relaxed text-amber-900/90">
                    টিউশনে আবেদনের পূর্বে বিষয় ও স্থান মনোযোগ দিয়ে দেখে নিন। আবেদনের পর শর্টলিস্ট হলে প্ল্যাটফর্ম থেকে নোটিফিকেশন পাবেন।
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ─── Recommended / Similar Jobs Section ──────────────────── */}
      {suggestedJobs.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-6 border-t border-ink/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-primary font-black uppercase text-[11px] tracking-wider">
                <Sparkles size={14} /> Matching Opportunities
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-ink">
                Similar Tuition Jobs
              </h2>
            </div>
            <Link 
              to="/jobs" 
              className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider hover:gap-3 transition-all cursor-pointer"
            >
              Explore All Jobs
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestedJobs.map((suggestedJob) => {
              const sId = String(suggestedJob.id || (suggestedJob as any)._id);
              const sCustomId = suggestedJob.customId || `JOB-${sId.slice(-6).toUpperCase()}`;
              const sLocStr = typeof (suggestedJob as any).location === 'object'
                ? [(suggestedJob as any).location?.area, (suggestedJob as any).location?.district].filter(Boolean).join(', ')
                : [(suggestedJob as any).area, (suggestedJob as any).location].filter(Boolean).join(', ') || 'Location N/A';

              return (
                <motion.div
                  key={sId}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-3xl border border-ink/5 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-mono">{sCustomId}</span>
                      <span className="text-emerald-600 font-bold text-sm">৳{Number(suggestedJob.salary || 0).toLocaleString()}</span>
                    </div>

                    <h3 className="text-base font-black text-ink line-clamp-1">
                      Tutor Needed For {suggestedJob.studentClass || 'Class'} ({suggestedJob.medium || 'Bangla Medium'})
                    </h3>

                    <p className="text-xs text-ink-muted flex items-center gap-1.5 font-medium">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span className="truncate">{sLocStr}</span>
                    </p>
                  </div>

                  <Link
                    to={`/job/${sId}`}
                    className="w-full py-3 bg-slate-100 hover:bg-primary hover:text-white rounded-xl text-center text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>View Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Floating Action Bar on Mobile ──────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-ink/10 p-3 sm:hidden z-40 shadow-2xl">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div className="leading-tight">
            <p className="text-[10px] font-black text-ink-muted uppercase">Salary</p>
            <p className="text-lg font-display font-black text-emerald-700">৳{job.salary.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-3 bg-slate-100 text-ink rounded-xl active:scale-95 transition-all"
              title="Copy Link"
            >
              {copiedLink ? <Check size={18} className="text-emerald-600" /> : <Share2 size={18} />}
            </button>

            <button
              onClick={handleApplyClick}
              disabled={hasApplied}
              className={cn(
                "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 active:scale-95 transition-all",
                hasApplied
                  ? "bg-slate-200 text-slate-600 shadow-none"
                  : "bg-emerald-600 text-white shadow-emerald-600/25"
              )}
            >
              {hasApplied ? <Check size={16} /> : <Send size={16} />}
              <span>{hasApplied ? 'Applied' : 'Apply Now'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Verification Required Modal ────────────────────────── */}
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
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-md",
                tutorVerificationStatus === 'Pending'
                  ? "bg-sky-100 text-sky-600 shadow-sky-500/10"
                  : tutorVerificationStatus === 'Rejected'
                  ? "bg-rose-100 text-rose-600 shadow-rose-500/10"
                  : "bg-amber-100 text-amber-600 shadow-amber-500/10"
              )}>
                {tutorVerificationStatus === 'Pending' ? (
                  <Clock size={34} />
                ) : (
                  <ShieldAlert size={34} />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-ink">
                  {tutorVerificationStatus === 'Pending'
                    ? 'ভেরিফিকেশন পর্যালোচনায় রয়েছে (Pending)'
                    : tutorVerificationStatus === 'Rejected'
                    ? 'ভেরিফিকেশন সম্পন্ন হয়নি (Rejected)'
                    : 'টিউটর ভেরিফিকেশন প্রয়োজন'}
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  {tutorVerificationStatus === 'Pending' ? (
                    <>
                      আপনার <strong className="text-slate-800">NID কার্ড</strong> ও <strong className="text-slate-800">স্টুডেন্ট আইডি কার্ড</strong> সফলভাবে জমা দেওয়া হয়েছে এবং বর্তমানে অ্যাডমিন পর্যালোচনায় রয়েছে। অ্যাডমিন অনুমোদন দিলেই আপনি সরাসরি টিউশন জবে আবেদন করতে পারবেন।
                    </>
                  ) : tutorVerificationStatus === 'Rejected' ? (
                    <>
                      আপনার পূর্ববর্তী ভেরিফিকেশন আবেদনটি বাতিল করা হয়েছে। টিউশন জবে আবেদন করতে দয়া করে সঠিক <strong className="text-slate-800">NID কার্ড</strong> ও <strong className="text-slate-800">স্টুডেন্ট আইডি কার্ড</strong> পুনরায় আপলোড করুন।
                    </>
                  ) : (
                    <>
                      অভিভাবকদের আস্থা ও শিক্ষার্থীদের নিরাপত্তা বজায় রাখতে টিউশন জবে আবেদন করার পূর্বে আপনার <strong className="text-slate-800">NID কার্ড</strong> এবং <strong className="text-slate-800">স্টুডেন্ট/টিউটর আইডি কার্ড</strong> আপলোড করে অ্যাডমিন ভেরিফিকেশন সম্পন্ন করতে হবে।
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to="/tutor/verification"
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2",
                    tutorVerificationStatus === 'Pending'
                      ? "bg-sky-600 hover:bg-sky-700 shadow-sky-600/25"
                      : "bg-primary hover:bg-primary-dark shadow-primary/25"
                  )}
                >
                  <ShieldCheck size={16} />
                  <span>
                    {tutorVerificationStatus === 'Pending'
                      ? 'Check Verification Status'
                      : tutorVerificationStatus === 'Rejected'
                      ? 'Re-upload Documents'
                      : 'Upload Documents & Verify Now'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowVerificationRequiredModal(false)}
                  className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Apply Modal ────────────────────────────────────────── */}
      {showApplyModal && (
        <JobApplyModal
          jobId={job.id}
          jobTitle={`Tutor Need For ${job.studentClass} (${job.medium})`}
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

/** 
 * Reusable Clean Specification Card with Vector Icon 
 */
function SpecCard({
  icon,
  label,
  value,
  accentColor = 'indigo'
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accentColor?: 'indigo' | 'sky' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal' | 'blue' | 'purple';
}) {
  const iconBgMap = {
    indigo: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white',
    sky: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
    rose: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white',
    violet: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
    teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
  };

  return (
    <div className="flex items-center gap-3.5 p-3.5 sm:p-4 bg-slate-50/70 hover:bg-white rounded-2xl transition-all group border border-ink/5 shadow-2xs hover:shadow-sm">
      <div className={cn(
        "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all border border-ink/5 shadow-2xs",
        iconBgMap[accentColor] || iconBgMap.indigo
      )}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider truncate">{label}</p>
        <p className="text-xs sm:text-sm font-black text-ink truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}
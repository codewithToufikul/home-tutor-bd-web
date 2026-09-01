import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
  MapPin,
  ChevronRight,
  Star,
  BookOpen,
  Users,
  Bell,
  Settings,
  ArrowRight,
  AlertTriangle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  UserCheck,
  Sparkles
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import TutorProfileIncompleteModal from '@/src/components/TutorProfileIncompleteModal.tsx';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { TuitionJob, TutorProfile } from '@/src/types';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { ApplicationService } from '@/src/services/applicationService.ts';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TransactionService } from '@/src/services/transactionService.ts';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import { RecommendationService } from '@/src/services/recommendationService.ts';
import { calculateTutorProfileCompletion, ProfileCompletionResult } from '@/src/lib/profileCompletion.ts';

export default function TutorDashboard() {
  const { user } = useAuth();
  const [matchedJobs, setMatchedJobs] = useState<TuitionJob[]>([]);
  const [activeTuitions, setActiveTuitions] = useState<any[]>([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [activeTuitionsCount, setActiveTuitionsCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'matched' | 'active' | 'applications'>('matched');
  const [loading, setLoading] = useState(true);

  // Profile completion state & popup alert
  const [completion, setCompletion] = useState<ProfileCompletionResult>({
    percentage: 0,
    isComplete: false,
    missingItems: [],
  });
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) {
        setMatchedJobs([]);
        setApplicationsCount(0);
        setActiveTuitionsCount(0);
        setTotalEarnings(0);
        setRecentApps([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch tutor profile — null if not yet created (new tutor)
        let profile: any = null;
        try {
          profile = await TutorProfileService.getByUid(user.uid);
        } catch {
          profile = null;
        }

        const allJobs = await TuitionService.list();

        // Calculate profile completion percentage
        const completionResult = calculateTutorProfileCompletion(profile);
        setCompletion(completionResult);

        // If profile is not 100% complete, trigger popup alert on dashboard entry
        if (!completionResult.isComplete) {
          setShowIncompleteModal(true);
        }

        if (profile) {
          // Invalidate stale cache so newly posted jobs always appear
          RecommendationService.invalidateRecommendationCache();
          const rankedJobs = RecommendationService.getTutorJobRecommendations(profile as unknown as TutorProfile, (allJobs as unknown as TuitionJob[]) || []);
          // Only show true matched jobs with positive score matching location/criteria
          const positiveScored = rankedJobs.filter((entry: any) => entry.score > 0);
          const toShow = positiveScored.slice(0, 6);
          setMatchedJobs(toShow.map((entry: any) => entry.item) || []);
        } else {
          setMatchedJobs([]);
        }

        const applications = await ApplicationService.listForTutor(user.uid);
        const appList = Array.isArray(applications) ? applications : [];
        setApplicationsCount(appList.length);
        setActiveTuitionsCount(appList.filter((a: any) => a.status?.toLowerCase() === 'accepted').length);

        // Track all jobIds tutor has applied to (for Already Applied badge)
        const appliedIds = new Set<string>(
          appList.map((a: any) => {
            const rawJobId = typeof a.jobId === 'object' ? (a.jobId?._id || a.jobId?.id || '') : (a.jobId || '');
            return String(rawJobId);
          }).filter(Boolean)
        );
        setAppliedJobIds(appliedIds);

        // Build recent applications with job info when available
        // Build a lookup by both _id and id so we can find jobs from applications
        const jobsById: Record<string, any> = {};
        ((allJobs as any[]) || []).forEach((j: any) => {
          if (j?._id) jobsById[j._id] = j;
          if (j?.id) jobsById[j.id] = j;
        });

        // Build active tuitions list from accepted applications
        const acceptedList = appList.filter((a: any) => a.status?.toLowerCase() === 'accepted');
        const mappedActive = acceptedList.map((a: any) => {
          const rawJobId = typeof a.jobId === 'object' ? (a.jobId?._id || a.jobId?.id) : a.jobId;
          const populatedJob = typeof a.jobId === 'object' ? a.jobId : null;
          const job = populatedJob || jobsById[rawJobId] || null;

          const postedBy = job?.postedBy || {};
          const guardianName = postedBy.name || 'Guardian';
          const guardianPhone = postedBy.phone || '';
          const guardianEmail = postedBy.email || '';
          const guardianAvatar = postedBy.avatar || '';

          const locArea = typeof job?.location === 'object' ? job?.location?.area : job?.area;
          const locDist = typeof job?.location === 'object' ? job?.location?.district : (typeof job?.location === 'string' ? job?.location : '');
          const locStr = [locArea, locDist].filter(Boolean).join(', ') || 'Dhaka';

          const salaryNum = job?.salary ? Number(job.salary) : 0;
          const platformFeePercent = (job as any)?.platformFeePercent || 50;
          const platformFeeAmount = Math.round((salaryNum * platformFeePercent) / 100);

          return {
            id: String(rawJobId || a._id || ''),
            appId: String(a._id || a.id || ''),
            title: job?.medium ? `Tutor Needed For ${job.medium}` : (Array.isArray(job?.subjects) ? `Tutor for ${job.subjects.join(', ')}` : 'Active Tuition'),
            subjects: Array.isArray(job?.subjects) ? job.subjects.join(', ') : (job?.subjects || 'General'),
            studentClass: job?.studentClass || 'N/A',
            location: locStr,
            salary: salaryNum,
            salaryFormatted: salaryNum ? `${salaryNum.toLocaleString()} ৳/mo` : 'Negotiable',
            daysPerWeek: Array.isArray(job?.tutoringDays) ? job.tutoringDays.join(', ') : (job?.tutoringDays || '3-4 Days/Week'),
            platformFeePercent,
            platformFeeAmount,
            guardianName,
            guardianPhone,
            guardianEmail,
            guardianAvatar,
            confirmedDate: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('bn-BD') : 'Recently',
          };
        });
        setActiveTuitions(mappedActive);

        const recent = appList.slice().reverse().slice(0, 6).map((a: any) => {
          const rawJobId = typeof a.jobId === 'object' ? (a.jobId?._id || a.jobId?.id) : a.jobId;
          const populatedJob = typeof a.jobId === 'object' ? a.jobId : null;
          const job = populatedJob || jobsById[rawJobId] || jobsById[a.tuitionId] || null;
          // location is a nested object { district, area } on backend
          const locStr = job
            ? [job.location?.area || job.preferredArea, job.location?.district].filter(Boolean).join(', ')
            : 'Unknown';
          return {
            id: String(rawJobId || a._id || a.id || `APP-${a.createdAt}`),
            title: job
              ? `${Array.isArray(job.subjects) ? job.subjects.slice(0,2).join(', ') : (job.subjects || 'Tuition')} (${job.medium || ''})`
              : 'Tuition Opportunity',
            location: locStr,
            salary: job ? `${job.salary ?? 'N/A'} ৳/mo` : 'N/A',
            status: a.status ?? 'pending',
            date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('bn-BD') : '',
          };
        });
        setRecentApps(recent);

        const transactions = await TransactionService.listForTutor(user.uid);
        const txList = Array.isArray(transactions) ? transactions : [];
        const earnings = txList
          .filter((t: any) => t.type === 'Credit' && (t.status === 'completed' || t.status === 'Approved'))
          .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
        setTotalEarnings(earnings);
      } catch (error) {
        console.error('Failed to load tutor dashboard data:', error);
        setMatchedJobs([]);
        setApplicationsCount(0);
        setActiveTuitionsCount(0);
        setTotalEarnings(0);
        setRecentApps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats = [
    { label: 'Applied Jobs', value: String(applicationsCount), icon: Briefcase, color: 'bg-blue-500', trend: '+2 this week' },
    { label: 'Active Tuitions', value: String(activeTuitionsCount), icon: BookOpen, color: 'bg-emerald-500', trend: 'Stable' },
    { label: 'Total Earnings', value: `৳${totalEarnings.toLocaleString()}`, icon: CreditCard, color: 'bg-purple-500', trend: '+৳0' },
    { label: 'Profile Views', value: '—', icon: Users, color: 'bg-amber-500', trend: '+0%' },
  ];

  return (
    <TutorLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink">
              Tutor Dashboard
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              Welcome back! Here's what's happening with your profile today.
            </p>
          </div>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <TrendingUp size={18} />
            Boost Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const isTabAction = stat.label === 'Applied Jobs' || stat.label === 'Active Tuitions';
            const targetTab = stat.label === 'Applied Jobs' ? 'applications' : 'active';

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (isTabAction) {
                    setActiveTab(targetTab as any);
                  } else if (stat.label === 'Total Earnings') {
                    window.location.href = '/tutor/payments';
                  }
                }}
                className={cn(
                  "bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 group hover:bg-white transition-all cursor-pointer h-full",
                  isTabAction && activeTab === targetTab && "ring-2 ring-primary/40 bg-white shadow-primary/10"
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                    {stat.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-ink">{stat.value}</p>
                  <p className="text-xs font-bold text-ink-muted uppercase">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* 🌟 Dynamic Dashboard Tabbar 🌟 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-ink/10 pb-4">
          <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-x-auto w-full sm:w-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('matched')}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'matched'
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-ink-muted hover:text-ink hover:bg-white/80"
              )}
            >
              <Sparkles size={15} />
              Auto-Matched
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === 'matched' ? "bg-white/20 text-white" : "bg-ink/5 text-ink-muted"
              )}>
                {matchedJobs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'active'
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-ink-muted hover:text-ink hover:bg-white/80"
              )}
            >
              <CheckCircle2 size={15} />
              Active Tuitions
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === 'active' ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"
              )}>
                {activeTuitions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                activeTab === 'applications'
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-ink-muted hover:text-ink hover:bg-white/80"
              )}
            >
              <Briefcase size={15} />
              Recent Applications
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === 'applications' ? "bg-white/20 text-white" : "bg-ink/5 text-ink-muted"
              )}>
                {recentApps.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {activeTab === 'matched' && (
              <Link to="/jobs" className="text-xs font-black text-primary hover:underline flex items-center gap-1">
                Browse All Jobs <ArrowRight size={13} />
              </Link>
            )}
            {activeTab === 'applications' && (
              <Link to="/tutor/applied" className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1">
                Full Application List <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Tab Content Column (Span 2) */}
          <div className="lg:col-span-2 space-y-6">

            {/* TAB 1: Auto-Matched Jobs */}
            {activeTab === 'matched' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-display font-black text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                    AI Auto-Matched Tuitions
                  </h2>
                  <span className="text-xs font-bold text-ink-muted">{matchedJobs.length} matches found</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matchedJobs.length > 0 ? (
                    matchedJobs.map((job) => (
                      <motion.div
                        key={job.id}
                        whileHover={{ y: -4 }}
                        className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg">
                              Recommended
                            </span>
                            <span className="text-xs font-black text-primary">{job.salary} ৳/mo</span>
                          </div>
                          <h3 className="font-display font-black text-ink text-base">
                            Tutor Needed For {Array.isArray(job.subjects) ? job.subjects.slice(0,2).join(', ') : (job.medium || 'Tuition')}
                          </h3>
                          <div className="space-y-1.5 text-xs font-bold text-ink-muted">
                            <p className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-primary" />
                              {[(job as any).location?.area || (typeof (job as any).location === 'string' ? (job as any).location : ''), (job as any).location?.district || ''].filter(Boolean).join(', ') || 'Location N/A'}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <BookOpen size={14} className="text-primary" /> Class: {(job as any).studentClass || 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {appliedJobIds.has(String(job.id || (job as any)._id)) ? (
                          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-600 py-3 rounded-2xl font-black text-xs uppercase text-center flex items-center justify-center gap-2">
                            <CheckCircle2 size={14} />
                            Already Applied
                          </div>
                        ) : (
                          <Link 
                            to={`/job/${job.id || (job as any)._id}`} 
                            className="w-full bg-primary/10 text-primary py-3 rounded-2xl font-black text-xs uppercase text-center hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                          >
                            View Details
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-2 p-12 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 text-center space-y-3">
                      <div className="w-14 h-14 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto">
                        <Sparkles size={28} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-black text-ink">No Exact Matches Right Now</h3>
                        <p className="text-xs font-medium text-ink-muted">Update your profile subjects & preferred areas to get more accurate auto matches.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Active Tuitions */}
            {activeTab === 'active' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-display font-black text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Confirmed Tuitions (চলতি টিউশন)
                  </h2>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {activeTuitions.length} Active
                  </span>
                </div>

                {activeTuitions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {activeTuitions.map((tuition, idx) => (
                      <motion.div
                        key={tuition.id || idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-br from-white via-emerald-50/20 to-white backdrop-blur-xl p-7 rounded-[32px] border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/5 hover:border-emerald-500/40 transition-all space-y-6 relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                              <CheckCircle2 size={13} />
                              Active & Confirmed
                            </div>
                            <h3 className="text-lg font-black text-ink pt-1">{tuition.title}</h3>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-black text-emerald-600">{tuition.salary}</p>
                            <p className="text-[10px] font-bold text-ink-muted uppercase">Salary</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/80 text-xs font-bold text-ink">
                          <div className="flex items-center gap-2">
                            <BookOpen size={15} className="text-emerald-600 shrink-0" />
                            <span>Class: <span className="font-black text-emerald-700">{tuition.studentClass}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={15} className="text-emerald-600 shrink-0" />
                            <span>{tuition.daysPerWeek}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <MapPin size={15} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{tuition.location}</span>
                          </div>
                        </div>

                        {/* Platform Fee Notice */}
                        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-rose-600">Platform Fee ({tuition.platformFeePercent}%):</span>
                            <p className="font-black text-rose-700">৳{tuition.platformFeeAmount?.toLocaleString()}</p>
                          </div>
                          <Link
                            to="/tutor/active-tuitions"
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase shadow-sm transition-all"
                          >
                            Pay / Details
                          </Link>
                        </div>

                        <div className="p-4 bg-white rounded-2xl border border-ink/5 shadow-sm space-y-3">
                          <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">Guardian / Student Information</p>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                                {tuition.guardianName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-black text-ink">{tuition.guardianName}</p>
                                <p className="text-xs font-medium text-ink-muted">
                                  {tuition.guardianPhone || 'Phone available on confirmation'}
                                </p>
                              </div>
                            </div>

                            {tuition.guardianPhone ? (
                              <a
                                href={`tel:${tuition.guardianPhone}`}
                                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                              >
                                <Phone size={14} />
                                Call Now
                              </a>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <Link
                            to={`/job/${tuition.id}`}
                            className="flex-1 py-3 bg-ink/5 hover:bg-ink hover:text-white text-ink rounded-xl font-black text-xs uppercase text-center transition-all flex items-center justify-center gap-2"
                          >
                            View Tuition Details
                            <ArrowRight size={14} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-sm text-center space-y-3">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto">
                      <BookOpen size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-ink">এখনো কোনো Active Tuition নেই</h3>
                      <p className="text-xs font-medium text-ink-muted max-w-md mx-auto">
                        Auto-Matched টিউশনে Apply করুন। Guardian আপনার আবেদন Accept করলে তা এখানে যুক্ত হবে।
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Recent Applications */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-xl font-display font-black text-ink flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    Applied Tuition History
                  </h2>
                  <Link to="/tutor/applied" className="text-xs font-black text-blue-600 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 overflow-hidden">
                  <div className="divide-y divide-ink/5">
                    {recentApps.length > 0 ? recentApps.map((job) => (
                      <div key={job.id} className="p-6 hover:bg-white/40 transition-colors group">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <Briefcase size={24} />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-black text-ink group-hover:text-primary transition-colors">{job.title}</h3>
                              <div className="flex items-center gap-3 text-xs font-bold text-ink-muted">
                                <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {job.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm font-black text-primary">{job.salary}</p>
                              <p className="text-[10px] font-bold text-ink-muted uppercase">{job.id}</p>
                            </div>
                            <span className={cn(
                              "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase",
                              job.status === 'pending' ? "bg-amber-50 text-amber-500" :
                              job.status === 'accepted' ? "bg-emerald-50 text-emerald-500" :
                              job.status === 'shortlisted' ? "bg-emerald-50 text-emerald-600 font-black border border-emerald-200" :
                              "bg-rose-50 text-rose-500"
                            )}>
                              {job.status}
                            </span>
                            <Link to={`/job/${job.id}`} className="p-2 text-ink-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
                              <ChevronRight size={20} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-sm text-ink-muted">No applications found yet.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Profile Strength & Quick Actions (Span 1) */}
          <div className="space-y-8">
            <div className="bg-primary rounded-[32px] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-black">Profile Strength</h3>
                    <span className={cn(
                      "text-[11px] font-black px-2.5 py-0.5 rounded-full",
                      completion.isComplete ? "bg-emerald-400 text-ink" : "bg-amber-400 text-ink"
                    )}>
                      {completion.isComplete ? '100% Verified' : `${completion.percentage}% Done`}
                    </span>
                  </div>
                  <p className="text-sm text-white/80 font-medium">
                    {completion.isComplete 
                      ? 'Congratulations! Your profile is 100% complete.' 
                      : 'Complete your profile to 100% to get 3x more tuition offers.'}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span>Progress</span>
                    <span>{completion.percentage}%</span>
                  </div>
                  <div className="h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${completion.percentage}%` }}
                      transition={{ duration: 0.8 }}
                      className={cn(
                        "h-full rounded-full",
                        completion.isComplete ? "bg-emerald-400" : "bg-white"
                      )}
                    />
                  </div>
                </div>
                <Link
                  to="/tutor/profile"
                  className="w-full bg-white text-primary py-4 rounded-2xl font-black text-sm uppercase shadow-lg hover:bg-ink hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 block text-center"
                >
                  {completion.isComplete ? 'Edit Profile' : 'Complete 100% Profile'}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 space-y-6">
              <h3 className="text-lg font-display font-black text-ink">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/tutor/profile" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer text-center">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <UserCheck size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Profile</span>
                </Link>
                <Link 
                  to="/tutor/notifications"
                  className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group w-full cursor-pointer text-center"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Bell size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Alerts</span>
                </Link>
                <Link to="/tutor/applied" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer text-center">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Briefcase size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Status</span>
                </Link>
                <Link to="/tutor/settings" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer text-center">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Settings size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Incomplete Popup Modal Alert */}
      <TutorProfileIncompleteModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        completion={completion}
      />
    </TutorLayout>
  );
}
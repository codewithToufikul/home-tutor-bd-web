import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Briefcase, Trash2, ChevronLeft, ChevronRight, 
  MapPin, Clock, BookOpen, GraduationCap, Users, 
  CheckCircle2, XCircle, AlertCircle, Eye, ToggleLeft, 
  ToggleRight, Phone, Mail, Calendar, Sparkles, 
  ExternalLink, Filter, ShieldCheck, Star, MessageSquare, 
  Check, X, Loader2, ArrowRight, UserCheck
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { 
  useGetAllTuitionJobsQuery, 
  useUpdateJobStatusMutation, 
  useDeleteJobMutation 
} from '@/src/services/adminApi.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository.ts';
import { DEFAULT_PROFILE_IMAGE } from '@/src/constants';

const ITEMS_PER_PAGE = 8;

export default function AdminJobsApprove() {
  const [searchQuery, setSearchQuery] = useState('');
  // Three core tabs as requested: 'all', 'Active', 'Open', 'Closed'
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Open' | 'Closed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Inspector Modal State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [jobApplicants, setJobApplicants] = useState<any[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [shortlistedTutors, setShortlistedTutors] = useState<any[]>([]);

  // Preloaded confirmed tutors map: jobId -> tutor details
  const [acceptedTutorsMap, setAcceptedTutorsMap] = useState<Record<string, any>>({});

  const { data: jobsData, isLoading, refetch } = useGetAllTuitionJobsQuery(undefined);
  const [updateJobStatus, { isLoading: isUpdatingStatus }] = useUpdateJobStatusMutation();
  const [deleteJobMutation, { isLoading: isDeleting }] = useDeleteJobMutation();

  // Normalize backend jobs to rich view models
  const allJobs: any[] = useMemo(() => {
    const items = (jobsData as any)?.data ?? jobsData ?? [];
    if (!Array.isArray(items)) return [];

    return items.map((j: any) => {
      const jobId = String(j._id || j.id || '');
      const poster = j.postedByUser || (typeof j.postedBy === 'object' ? j.postedBy : {});
      const posterName = poster?.name || j.parentName || 'Unknown Poster';
      const posterPhone = poster?.phone || j.phone || 'N/A';
      const posterEmail = poster?.email || j.email || 'N/A';
      const posterAvatar = poster?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(posterName)}`;

      const locArea = typeof j.location === 'object' ? j.location?.area : j.area;
      const locDist = typeof j.location === 'object' ? j.location?.district : (typeof j.location === 'string' ? j.location : '');
      const locStr = [locArea, locDist].filter(Boolean).join(', ') || 'Dhaka';

      const rawPosterRole = poster?.role || '';
      const isAdminPoster = ['admin', 'super_admin', 'moderator'].includes(rawPosterRole);
      const posterRoleLabel = rawPosterRole === 'moderator' ? 'Moderator'
        : rawPosterRole === 'super_admin' ? 'Super Admin'
        : rawPosterRole === 'admin' ? 'Admin'
        : rawPosterRole === 'guardian' ? 'অভিভাবক'
        : 'শিক্ষার্থী';
      const posterRole = posterRoleLabel;

      const appsList = Array.isArray(j.applications) ? j.applications : [];
      const acceptedApp = appsList.find((a: any) => a.status?.toLowerCase() === 'accepted');


      const rawStatus = (j.status || 'Open').toLowerCase();
      const hasAccepted = Boolean(acceptedApp) || Boolean(acceptedTutorsMap[jobId]);
      const isActive = hasAccepted || rawStatus === 'matched' || rawStatus === 'hired' || rawStatus === 'active';
      const isClosed = !isActive && (rawStatus === 'closed' || rawStatus === 'cancelled' || rawStatus === 'rejected');
      const isOpen = !isActive && !isClosed;

      const normalizedStatus = isActive ? 'Active' : isClosed ? 'Closed' : 'Open';

      // Confirmed tutor info
      const tutorObj = acceptedApp?.tutor || (typeof acceptedApp?.tutorId === 'object' ? acceptedApp.tutorId : null);
      const tutorFromMap = acceptedTutorsMap[jobId];
      const confirmedTutor = (tutorObj || tutorFromMap) ? {
        name: tutorObj?.name || tutorFromMap?.name || 'Verified Tutor',
        phone: tutorObj?.phone || tutorFromMap?.phone || '০১৭১২-৩৪৫৬৭৮',
        email: tutorObj?.email || tutorFromMap?.email || 'tutor@gmail.com',
        avatar: tutorObj?.avatar || tutorFromMap?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorObj?.name || 'tutor')}`,
        university: tutorFromMap?.university || 'Uttara University',
        department: tutorFromMap?.department || 'CSE',
        confirmedDate: acceptedApp?.updatedAt ? new Date(acceptedApp.updatedAt).toLocaleDateString('bn-BD') : (tutorFromMap?.confirmedDate || 'সম্প্রতি'),
      } : (isActive ? {
        name: 'test tutor',
        phone: '০১৭১২-৩৪৫৬৭৮',
        email: 'testutor@gmail.com',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=testtutor`,
        university: 'Uttara University',
        department: 'CSE',
        confirmedDate: '২৮/৮/২০২৬',
      } : null);

      return {
        ...j,
        id: jobId,
        customId: j.customId || '',
        jobCode: j.customId || `JOB-${jobId.slice(-6).toUpperCase()}`,
        posterName,
        posterPhone,
        posterEmail,
        posterAvatar,
        posterRole,
        isAdminPoster,
        locationStr: locStr,
        salaryNum: j.salary ? Number(j.salary) : 0,
        salaryFormatted: j.salary ? `৳${Number(j.salary).toLocaleString()}` : 'Negotiable',
        daysPerWeek: Array.isArray(j.tutoringDays) ? j.tutoringDays.join(', ') : (j.tutoringDays || '3 Days/Week'),
        studentClass: j.studentClass || 'N/A',
        subjectsList: Array.isArray(j.subjects) ? j.subjects : (j.subjects ? [j.subjects] : ['General']),
        medium: j.medium || 'Bangla',
        genderPreference: j.genderPreference || 'Any',
        status: normalizedStatus,
        rawStatus: j.status,
        confirmedTutor,
        applicationsCount: appsList.length,
        createdAtFormatted: j.createdAt 
          ? new Date(j.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'সম্প্রতি',
        createdAtFull: j.createdAt ? new Date(j.createdAt).toLocaleString('bn-BD') : 'সম্প্রতি',
      };
    });
  }, [jobsData, acceptedTutorsMap]);

  // Load accepted tutors for any jobs dynamically
  useEffect(() => {
    allJobs.forEach(async (job) => {
      if (acceptedTutorsMap[job.id]) return;
      try {
        const apps: any = await TuitionRepository.getApplications(job.id);
        const appList = Array.isArray(apps) ? apps : ((apps as any)?.data || []);
        const acceptedApp = appList.find((a: any) => a.status?.toLowerCase() === 'accepted');
        if (acceptedApp) {
          const tutorUser = typeof acceptedApp.tutorId === 'object' ? acceptedApp.tutorId : {};
          const tutorProfile = acceptedApp.tutorProfile || {};
          const name = tutorUser.name || 'Verified Tutor';
          setAcceptedTutorsMap(prev => ({
            ...prev,
            [job.id]: {
              name,
              phone: tutorUser.phone || '01712-345678',
              email: tutorUser.email || 'tutor@gmail.com',
              avatar: tutorUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
              university: tutorProfile.university || 'Uttara University',
              department: tutorProfile.department || 'CSE',
              confirmedDate: acceptedApp.updatedAt ? new Date(acceptedApp.updatedAt).toLocaleDateString('bn-BD') : 'সম্প্রতি',
            }
          }));
        }
      } catch (err) {
        console.warn('Failed to load accepted tutor for job', job.id);
      }
    });
  }, [allJobs.length]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: allJobs.length,
      active: allJobs.filter(j => j.status === 'Active').length,
      open: allJobs.filter(j => j.status === 'Open').length,
      closed: allJobs.filter(j => j.status === 'Closed').length,
    };
  }, [allJobs]);

  // Filter & Search
  const filteredJobs = useMemo(() => {
    return allJobs.filter(job => {
      const q = searchQuery.toLowerCase();
      const confirmedTutor = acceptedTutorsMap[job.id];
      const tutorName = confirmedTutor?.name?.toLowerCase() || '';

      const matchesSearch =
        job.jobCode.toLowerCase().includes(q) ||
        job.posterName.toLowerCase().includes(q) ||
        job.posterPhone.toLowerCase().includes(q) ||
        job.locationStr.toLowerCase().includes(q) ||
        job.studentClass.toLowerCase().includes(q) ||
        job.medium.toLowerCase().includes(q) ||
        job.subjectsList.join(', ').toLowerCase().includes(q) ||
        tutorName.includes(q);

      const matchesStatus = 
        statusFilter === 'all' || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allJobs, searchQuery, statusFilter, acceptedTutorsMap]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  // Toggle Job Status (Open ⇄ Closed)
  const handleToggleStatus = async (job: any) => {
    const nextStatus = job.status === 'Open' ? 'Closed' : 'Open';
    try {
      await updateJobStatus({ id: job.id, status: nextStatus }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  // Change Specific Status (Open / Matched / Closed)
  const handleChangeStatus = async (jobId: string, newStatus: string) => {
    try {
      await updateJobStatus({ id: jobId, status: newStatus }).unwrap();
      refetch();
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob({ ...selectedJob, status: newStatus === 'Matched' ? 'Active' : newStatus });
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  // Confirm Delete Job
  const confirmDelete = async () => {
    if (jobToDelete) {
      try {
        await deleteJobMutation(jobToDelete).unwrap();
        refetch();
        if (selectedJob?.id === jobToDelete) setSelectedJob(null);
      } catch (err) {
        console.error('Delete failed:', err);
      }
      setJobToDelete(null);
    }
  };

  // Open Inspector Modal & Load Applicants
  const handleOpenInspector = async (job: any) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    setJobApplicants([]);
    setShortlistedTutors([]);

    try {
      const [apps, shortlistedRes] = await Promise.all([
        TuitionRepository.getApplications(job.id).catch(() => []),
        TuitionRepository.getShortlisted(job.id).catch(() => null),
      ]);

      const appList = Array.isArray(apps) ? apps : ((apps as any)?.data || []);
      setJobApplicants(appList);
      setShortlistedTutors(shortlistedRes?.shortlistedTutors || job.shortlistedTutors || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoadingApplicants(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-24">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5">
                <Briefcase size={24} />
              </div>
              Manage Tuition Jobs (টিউশন জব ম্যানেজমেন্ট)
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              চলতি অ্যাক্টিভ টিউশন (Active), নতুন জব (Open) এবং বন্ধ হওয়া টিউশন (Closed) সহজে তদারকি ও পরিচালনা করুন।
            </p>
          </div>

          <Link
            to="/admin/create-job"
            className="px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Briefcase size={16} />
            Post New Job (Admin)
          </Link>
        </div>

        {/* 📊 Fast Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Jobs */}
          <div 
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4 cursor-pointer hover:border-primary/30 transition-all"
          >
            <div className="w-13 h-13 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-500/20">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">সর্বমোট জব</p>
              <p className="text-2xl font-black text-ink">{stats.total} টি</p>
            </div>
          </div>

          {/* 🟢 Active Tuitions (Confirmed & Running) */}
          <div 
            onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50/50 backdrop-blur-xl p-5 rounded-[28px] border-2 border-emerald-200 shadow-xl shadow-emerald-500/5 flex items-center gap-4 cursor-pointer hover:border-emerald-400 transition-all"
          >
            <div className="w-13 h-13 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black text-emerald-700 uppercase">Active (চলতি/কনফার্মড)</p>
              <p className="text-2xl font-black text-emerald-600">{stats.active} টি</p>
            </div>
          </div>

          {/* 🔵 Open Tuitions (Hiring) */}
          <div 
            onClick={() => { setStatusFilter('Open'); setCurrentPage(1); }}
            className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4 cursor-pointer hover:border-sky-300 transition-all"
          >
            <div className="w-13 h-13 bg-sky-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-sky-500/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">Open (চলতি আবেদন)</p>
              <p className="text-2xl font-black text-sky-600">{stats.open} টি</p>
            </div>
          </div>

          {/* ⚫ Closed Tuitions (Cancelled/Deleted) */}
          <div 
            onClick={() => { setStatusFilter('Closed'); setCurrentPage(1); }}
            className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4 cursor-pointer hover:border-gray-300 transition-all"
          >
            <div className="w-13 h-13 bg-gray-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-gray-500/20">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">Closed (বন্ধ/বাতিল)</p>
              <p className="text-2xl font-black text-gray-600">{stats.closed} টি</p>
            </div>
          </div>
        </div>

        {/* 🎛️ Filter & Search Control Bar */}
        <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
            {[
              { label: 'সব জব (All)', value: 'all', count: stats.total },
              { label: '🟢 Active (চলতি/কনফার্মড)', value: 'Active', count: stats.active },
              { label: '🔵 Open (আবেদন চলছে)', value: 'Open', count: stats.open },
              { label: '⚫ Closed (বন্ধ/বাতিল)', value: 'Closed', count: stats.closed },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value as any); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
                  statusFilter === tab.value
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px]",
                  statusFilter === tab.value ? "bg-primary/10 text-primary font-black" : "bg-ink/5 text-ink-muted"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input
              type="text"
              placeholder="Search by Job ID, Student, Tutor..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* 📋 Jobs List */}
        {isLoading ? (
          <div className="py-24 text-center space-y-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[32px]">
            <Loader2 className="animate-spin text-primary mx-auto" size={36} />
            <p className="text-xs font-bold text-ink-muted">টিউশন জব ডাটাবেজ লোড হচ্ছে...</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-5">
            {paginatedJobs.map((job) => {
              const confirmedTutor = job.confirmedTutor || acceptedTutorsMap[job.id];
              const isActive = job.status === 'Active';

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-7 rounded-[32px] border transition-all space-y-5",
                    isActive
                      ? "bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 border-2 border-emerald-300 shadow-xl shadow-emerald-500/5"
                      : job.status === 'Closed'
                        ? "bg-white/60 border-gray-200 shadow-sm opacity-85"
                        : "bg-white/80 backdrop-blur-xl border-white/60 shadow-lg shadow-ink/5 hover:border-primary/30"
                  )}
                >
                  {/* Top Bar: Badges, Job Code, Specs & Quick Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ink/5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black bg-ink/5 text-ink uppercase tracking-wider">
                        {job.jobCode}
                      </span>

                      <span className={cn(
                        "px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-xs",
                        isActive
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : job.status === 'Closed'
                            ? "bg-gray-100 text-gray-700 border-gray-300"
                            : "bg-sky-100 text-sky-800 border-sky-300"
                      )}>
                        <span className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          isActive ? "bg-emerald-600" : job.status === 'Closed' ? "bg-gray-500" : "bg-sky-500"
                        )} />
                        {isActive ? "Active (চলতি টিউশন)" : job.status === 'Closed' ? "Closed (বন্ধ/বাতিল)" : "Open (আবেদন চলছে)"}
                      </span>

                      <span className="text-xs text-ink-muted font-medium flex items-center gap-1">
                        <Calendar size={13} /> {job.createdAtFormatted}
                      </span>
                    </div>

                    {/* Salary & Routine Preview */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-600">{job.salaryFormatted} <span className="text-xs text-ink-muted font-normal">/ মাস</span></p>
                        <p className="text-[11px] font-bold text-ink-muted">{job.daysPerWeek}</p>
                      </div>

                      {/* Quick Toggle Status (Disabled for Active Tuitions) */}
                      <button
                        onClick={() => !isActive && handleToggleStatus(job)}
                        disabled={isActive}
                        title={
                          isActive 
                            ? 'চলতি কনফার্মড টিউশনের স্ট্যাটাস লক করা আছে' 
                            : (job.status === 'Open' ? 'Click to Close Job' : 'Click to Open Job')
                        }
                        className={cn(
                          "p-2.5 rounded-xl border transition-all flex items-center justify-center shadow-xs",
                          isActive
                            ? "bg-emerald-100/50 text-emerald-800 border-emerald-200 cursor-not-allowed opacity-75"
                            : job.status === 'Open'
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 cursor-pointer"
                        )}
                      >
                        {isActive ? (
                          <ToggleRight size={22} className="text-emerald-700" />
                        ) : job.status === 'Open' ? (
                          <ToggleRight size={22} className="text-emerald-600" />
                        ) : (
                          <ToggleLeft size={22} className="text-gray-500" />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setJobToDelete(job.id)}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Middle Content Grid: Job Info + Confirmed Tutor / Student Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Column 1: Tuition Subject & Requirements */}
                    <div className="space-y-2 lg:border-r border-ink/5 pr-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">টিউশন বিবরণ</p>
                        <h4 className="text-base font-black text-ink">
                          {job.studentClass} • <span className="text-primary">{job.subjectsList.join(', ')}</span>
                        </h4>
                        <p className="text-xs font-bold text-ink-muted">মিডিয়াম: {job.medium} • জেন্ডার পছন্দ: {job.genderPreference}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-ink font-medium pt-1">
                        <MapPin size={14} className="text-emerald-600 shrink-0" />
                        <span>{job.locationStr}</span>
                      </div>
                    </div>

                    {/* Column 2: Posted By (Student / Guardian OR Admin / Moderator) */}
                    <div className={cn(
                      "p-4 rounded-2xl border space-y-2 shadow-xs",
                      job.isAdminPoster
                        ? "bg-gradient-to-br from-violet-50 to-indigo-50/60 border-violet-200"
                        : "bg-white/90 border-ink/5"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[10px] font-black uppercase",
                          job.isAdminPoster ? "text-violet-700" : "text-ink-muted"
                        )}>
                          {job.isAdminPoster ? '📋 Staff Posted Job' : 'শিক্ষার্থী / অভিভাবক'}
                        </span>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1",
                          job.isAdminPoster
                            ? "text-violet-700 bg-violet-100 border border-violet-200"
                            : "text-sky-700 bg-sky-50"
                        )}>
                          {job.isAdminPoster ? (
                            <><ShieldCheck size={9} /> {job.posterRole}</>
                          ) : 'পোস্টকারী'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={job.posterAvatar}
                            alt={job.posterName}
                            className={cn(
                              "w-11 h-11 rounded-xl object-cover border",
                              job.isAdminPoster ? "border-violet-300" : "border-ink/10"
                            )}
                          />
                          {job.isAdminPoster && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                              <ShieldCheck size={9} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className={cn(
                            "text-sm font-black truncate",
                            job.isAdminPoster ? "text-violet-900" : "text-ink"
                          )}>{job.posterName}</p>
                          <p className="text-xs font-bold text-ink-muted">{job.posterPhone !== 'N/A' ? job.posterPhone : job.posterEmail}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        {job.posterPhone && job.posterPhone !== 'N/A' && (
                          <a
                            href={`tel:${job.posterPhone.replace(/[^0-9+]/g, '')}`}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg font-black text-[10px] uppercase text-center border transition-all flex items-center justify-center gap-1",
                              job.isAdminPoster
                                ? "bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200"
                                : "bg-gray-50 hover:bg-gray-100 text-ink border-ink/5"
                            )}
                          >
                            <Phone size={11} className={job.isAdminPoster ? "text-violet-600" : "text-emerald-600"} /> Call
                          </a>
                        )}
                        {job.posterEmail && job.posterEmail !== 'N/A' && (
                          <a
                            href={`mailto:${job.posterEmail}`}
                            className={cn(
                              "flex-1 py-1.5 rounded-lg font-black text-[10px] uppercase text-center border transition-all flex items-center justify-center gap-1",
                              job.isAdminPoster
                                ? "bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-200"
                                : "bg-gray-50 hover:bg-gray-100 text-ink border-ink/5"
                            )}
                          >
                            <Mail size={11} className={job.isAdminPoster ? "text-violet-600" : "text-blue-600"} /> Email
                          </a>
                        )}
                      </div>
                    </div>


                    {/* Column 3: 👨‍🏫 Confirmed Tutor (If Active) OR Applicants Quick Button */}
                    {isActive && confirmedTutor ? (
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-800 uppercase">নিযুক্ত টিউটর (Active Tutor)</span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 size={10} /> Confirmed
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <img
                            src={confirmedTutor.avatar}
                            alt={confirmedTutor.name}
                            className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-300 shrink-0"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-sm font-black text-ink truncate">{confirmedTutor.name}</p>
                            <p className="text-xs font-bold text-emerald-800 truncate">{confirmedTutor.university}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <a
                            href={`tel:${(confirmedTutor.phone || '').replace(/[^0-9+]/g, '')}`}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] uppercase text-center shadow-xs transition-all flex items-center justify-center gap-1"
                          >
                            <Phone size={11} /> Call Tutor
                          </a>
                          <a
                            href={`https://wa.me/${(confirmedTutor.phone || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-black text-[10px] uppercase text-center border border-emerald-300 transition-all flex items-center justify-center gap-1"
                          >
                            <MessageSquare size={11} /> WhatsApp
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/90 rounded-2xl border border-ink/5 flex flex-col justify-between space-y-3">
                        <div>
                          <p className="text-[10px] font-black text-ink-muted uppercase">আবেদন ও টিউটর স্ট্যাটাস</p>
                          <p className="text-xs font-bold text-ink pt-1">
                            {job.status === 'Closed' ? 'জবটি স্থগিত / বন্ধ করা হয়েছে।' : 'টিউটর খোঁজা চলছে — আবেদন গ্রহণ করা হচ্ছে।'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenInspector(job)}
                          className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          <Users size={14} /> আবেদনকারী ও ম্যাচিং দেখুন
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer: Full Inspector Trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-ink/5 text-xs">
                    <span className="text-ink-muted font-medium">
                      পোস্ট তারিখ: {job.createdAtFull}
                    </span>

                    <button
                      onClick={() => handleOpenInspector(job)}
                      className="text-primary hover:text-primary-dark font-black flex items-center gap-1.5 cursor-pointer underline"
                    >
                      সম্পূর্ণ আবেদন তালিকা ও বিস্তারিত <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 px-2">
              <span className="text-xs font-bold text-ink-muted">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} of {filteredJobs.length} Jobs
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 bg-white border border-ink/10 rounded-xl disabled:opacity-40 hover:bg-ink/5 transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black px-3 py-1 bg-white border border-ink/10 rounded-xl">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 bg-white border border-ink/10 rounded-xl disabled:opacity-40 hover:bg-ink/5 transition-all cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 bg-white/60 backdrop-blur-xl rounded-[36px] border border-white/40 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Briefcase size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-ink">কোনো টিউশন জব পাওয়া যায়নি</h3>
              <p className="text-xs font-medium text-ink-muted max-w-md mx-auto">
                আপনার দেওয়া সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো জব নেই।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 🔍 Comprehensive Job & Applicants Inspector Modal 🔍 */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[36px] shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Top Header */}
              <div className="bg-gradient-to-r from-ink to-slate-800 text-white p-7 space-y-3 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-wider">
                        {selectedJob.jobCode}
                      </span>
                      <span className="text-xs text-white/70 font-medium">
                        পোস্ট তারিখ: {selectedJob.createdAtFull}
                      </span>
                    </div>
                    <h3 className="text-2xl font-display font-black">
                      {selectedJob.studentClass} ({selectedJob.medium}) • {selectedJob.subjectsList.join(', ')}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedJob(null)}
                    className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Quick Status Control Inside Modal */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-white/70 font-bold">বর্তমান স্ট্যাটাস পরিবর্তন:</span>
                    <select
                      value={selectedJob.status === 'Active' ? 'Matched' : selectedJob.status}
                      onChange={(e) => handleChangeStatus(selectedJob.id, e.target.value)}
                      className="bg-white/10 border border-white/20 text-white font-black px-3 py-1.5 rounded-xl text-xs outline-none cursor-pointer"
                    >
                      <option value="Open" className="text-ink">🔵 Open (আবেদন চলছে)</option>
                      <option value="Matched" className="text-ink">🟢 Active (ম্যাচড/কনফার্মড)</option>
                      <option value="Closed" className="text-ink">⚫ Closed (বন্ধ/বাতিল)</option>
                    </select>
                  </div>

                  <Link
                    to={`/job/${selectedJob.id}`}
                    target="_blank"
                    className="text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1.5 underline"
                  >
                    View on Public Board <ExternalLink size={13} />
                  </Link>
                </div>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-7 space-y-6 overflow-y-auto">
                {/* 1. Job & Student Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-2xl border border-ink/5 text-xs">
                  <div className="space-y-2">
                    <p className="font-black text-ink uppercase text-[10px] text-ink-muted">পোস্টকারী শিক্ষার্থী/অভিভাবক</p>
                    <p className="font-bold text-ink text-sm">{selectedJob.posterName}</p>
                    <p className="text-ink-muted">📞 {selectedJob.posterPhone}</p>
                    <p className="text-ink-muted">✉️ {selectedJob.posterEmail}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-black text-ink uppercase text-[10px] text-ink-muted">টিউশন স্পেসিফিকেশন</p>
                    <p>📍 <strong>ঠিকানা:</strong> {selectedJob.locationStr}</p>
                    <p>💰 <strong>বেতন:</strong> <span className="text-emerald-600 font-bold">{selectedJob.salaryFormatted} / মাস</span></p>
                    <p>📅 <strong>রুটিন:</strong> {selectedJob.daysPerWeek}</p>
                    <p>👥 <strong>জেন্ডার পছন্দ:</strong> {selectedJob.genderPreference}</p>
                  </div>
                </div>

                {/* 2. Applicants Inspector Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-black text-ink flex items-center gap-2">
                      <Users size={18} className="text-primary" />
                      আবেদনকারী টিউটরগণ ({jobApplicants.length} জন)
                    </h4>
                  </div>

                  {loadingApplicants ? (
                    <div className="py-12 text-center space-y-2">
                      <Loader2 className="animate-spin text-primary mx-auto" size={28} />
                      <p className="text-xs text-ink-muted font-bold">আবেদনপত্র লোড হচ্ছে...</p>
                    </div>
                  ) : jobApplicants.length > 0 ? (
                    <div className="space-y-3">
                      {jobApplicants.map((app: any, idx: number) => {
                        const tutorUser = typeof app.tutorId === 'object' ? app.tutorId : {};
                        const tutorProfile = app.tutorProfile || {};
                        const tutorName = tutorUser.name || 'Candidate Tutor';
                        const tutorPhone = tutorUser.phone || '01712-345678';
                        const tutorEmail = tutorUser.email || 'tutor@gmail.com';
                        const tutorAvatar = tutorUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName)}`;

                        const isAccepted = app.status?.toLowerCase() === 'accepted';

                        return (
                          <div
                            key={app._id || idx}
                            className={cn(
                              "p-5 rounded-2xl border transition-all space-y-3",
                              isAccepted
                                ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                                : "bg-white border-ink/10 hover:border-primary/30"
                            )}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={tutorAvatar}
                                  alt={tutorName}
                                  className="w-12 h-12 rounded-xl object-cover border border-ink/10"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-sm font-black text-ink">{tutorName}</h5>
                                    {isAccepted && (
                                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-600 text-white uppercase">
                                        ✓ Confirmed Tutor
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-ink-muted">
                                    {tutorProfile.university || 'University'} • {tutorProfile.department || 'Department'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                  isAccepted
                                    ? "bg-emerald-100 text-emerald-800"
                                    : app.status === 'Rejected'
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-blue-100 text-blue-800"
                                )}>
                                  Status: {app.status || 'Pending'}
                                </span>
                              </div>
                            </div>

                            {/* Contact Details & Actions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-ink/5 text-xs text-ink-muted">
                              <div className="flex items-center gap-2">
                                <Phone size={13} className="text-emerald-600" />
                                <span>{tutorPhone}</span>
                                <a
                                  href={`tel:${tutorPhone}`}
                                  className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black text-[10px] uppercase ml-auto"
                                >
                                  Call
                                </a>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail size={13} className="text-blue-600" />
                                <span className="truncate">{tutorEmail}</span>
                              </div>
                            </div>

                            {app.coverLetter && (
                              <div className="p-3 bg-gray-50 rounded-xl text-xs text-ink font-medium border border-ink/5">
                                <strong className="text-[10px] text-ink-muted uppercase block mb-1">আবেদন বার্তা (Cover Letter):</strong>
                                "{app.coverLetter}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 bg-gray-50 rounded-2xl border border-ink/5 text-center text-xs text-ink-muted font-medium">
                      এখনো কোনো টিউটর এই জবে ম্যানুয়ালি Apply করেনি।
                    </div>
                  )}
                </div>

                {/* 3. AI Auto-Matched Tutors */}
                {shortlistedTutors.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-ink/10">
                    <h4 className="text-sm font-black text-ink flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      AI Auto-Matched Shortlisted Tutors ({shortlistedTutors.length} জন)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {shortlistedTutors.map((st: any, i: number) => (
                        <div key={i} className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-ink">Match #{i + 1}</span>
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full font-black text-[10px]">
                              Score: {st.score || 85}%
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-muted">Tutor ID: #{String(st.tutorId?._id || st.tutorId || '').slice(-6).toUpperCase()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {jobToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-7 space-y-5 text-center"
            >
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-ink">জব মুছে ফেলতে চান?</h3>
                <p className="text-xs text-ink-muted font-medium">
                  এই টিউশন জবটি ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হবে।
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setJobToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  {isDeleting ? 'মুছছি...' : 'মুছে ফেলুন'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

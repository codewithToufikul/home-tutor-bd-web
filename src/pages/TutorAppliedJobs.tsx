import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Briefcase, Clock, MapPin, ChevronRight, Search,
  Calendar, DollarSign, CheckCircle2, XCircle, AlertCircle,
  BookOpen, Users, User, Phone, Sparkles, Filter, ExternalLink,
  ChevronDown, ChevronUp, MessageSquare, ArrowRight, ShieldCheck,
  Check, X, Eye, CreditCard, FileText
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { ApplicationService } from '@/src/services/applicationService.ts';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionJob } from '@/src/types';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 6;

export default function TutorAppliedJobs() {
  const { user } = useAuth();
  const [activeStatusFilter, setActiveStatusFilter] = useState('All');
  const [activeMediumFilter, setActiveMediumFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals / Expanded cards
  const [expandedCoverLetters, setExpandedCoverLetters] = useState<Record<string, boolean>>({});
  const [selectedJobDetails, setSelectedJobDetails] = useState<any | null>(null);

  useEffect(() => {
    const fetchApplied = async () => {
      if (!user?.uid) {
        setAppliedJobs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const apps = await ApplicationService.listForTutor(user.uid);
        const allJobs = await TuitionService.list();
        const jobsById: Record<string, TuitionJob> = {};
        ((allJobs as unknown as TuitionJob[]) || []).forEach((j) => {
          if (j && (j.id || (j as any)._id)) {
            jobsById[j.id || (j as any)._id] = j;
          }
        });

        const mapped = (Array.isArray(apps) ? apps : []).map((a: any) => {
          const rawJobId = typeof a.jobId === 'object' ? (a.jobId?._id || a.jobId?.id) : a.jobId;
          const populatedJob = typeof a.jobId === 'object' ? a.jobId : null;
          const job: any = populatedJob || jobsById[rawJobId] || jobsById[a.id] || {};

          // Location parsing
          const locArea = typeof job?.location === 'object' ? job?.location?.area : job?.area;
          const locDist = typeof job?.location === 'object' ? job?.location?.district : (typeof job?.location === 'string' ? job?.location : '');
          const locStr = locArea || locDist ? `${locArea || ''}${locArea && locDist ? ', ' : ''}${locDist || ''}` : 'Dhaka';

          // Subjects parsing
          let subjectsList: string[] = [];
          if (Array.isArray(job?.subjects)) subjectsList = job.subjects;
          else if (Array.isArray(job?.subject)) subjectsList = job.subject;
          else if (typeof job?.subject === 'string') subjectsList = [job.subject];
          else if (typeof job?.subjects === 'string') subjectsList = [job.subjects];
          else if (a.subjects) subjectsList = Array.isArray(a.subjects) ? a.subjects : [a.subjects];

          // Job ID format
          const formattedJobId = job?.jobId || `JOB-${String(rawJobId || a.id || '').slice(-6).toUpperCase()}`;

          // Status normalization
          const rawStatus = (a.status || 'pending').toLowerCase();
          let normalizedStatus: 'pending' | 'shortlisted' | 'accepted' | 'hired' | 'rejected' = 'pending';
          if (rawStatus === 'shortlisted') normalizedStatus = 'shortlisted';
          else if (rawStatus === 'accepted' || rawStatus === 'approved') normalizedStatus = 'accepted';
          else if (rawStatus === 'hired') normalizedStatus = 'hired';
          else if (rawStatus === 'rejected') normalizedStatus = 'rejected';

          return {
            id: String(rawJobId || a.id || ''),
            applicationId: String(a._id || a.id || ''),
            customId: formattedJobId,
            title: job?.title || (job?.medium ? `Tutor Needed For ${job.medium}` : (a.title || 'Tuition Opportunity')),
            studentClass: job?.studentClass || job?.class || 'Not specified',
            medium: job?.medium || a.category || 'General',
            subjects: subjectsList.length ? subjectsList : ['All Subjects'],
            location: locStr,
            salaryNumber: Number(job?.salary || a.expectedSalary || 0),
            salary: job?.salary ? `৳ ${Number(job.salary).toLocaleString()}` : (a.expectedSalary ? `৳ ${Number(a.expectedSalary).toLocaleString()}` : 'Negotiable'),
            expectedSalary: a.expectedSalary ? `৳ ${Number(a.expectedSalary).toLocaleString()}` : null,
            status: normalizedStatus,
            appliedDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
            appliedTimestamp: a.createdAt ? new Date(a.createdAt).getTime() : 0,
            daysPerWeek: Array.isArray(job?.tutoringDays) ? job.tutoringDays.join(', ') : (job?.tutoringDays || job?.daysPerWeek || '3 Days/Week'),
            tutoringTime: job?.tutoringTime || job?.time || 'Evening Shift',
            genderPref: job?.genderPreference || job?.preferredTutorGender || 'Any Gender',
            studentGender: job?.studentGender || 'Student',
            numStudents: job?.numberOfStudents || 1,
            coverLetter: a.coverLetter || a.message || '',
            fullJob: job,
          };
        });

        // Sort by newest applied
        mapped.sort((x, y) => y.appliedTimestamp - x.appliedTimestamp);
        setAppliedJobs(mapped);
      } catch (error) {
        console.error('Failed to load applied jobs:', error);
        setAppliedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplied();
  }, [user]);

  // Toggle Cover Letter expanded
  const toggleCoverLetter = (appId: string) => {
    setExpandedCoverLetters((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  // KPIs
  const stats = useMemo(() => {
    const total = appliedJobs.length;
    const pending = appliedJobs.filter((j) => j.status === 'pending').length;
    const shortlisted = appliedJobs.filter((j) => j.status === 'shortlisted').length;
    const accepted = appliedJobs.filter((j) => j.status === 'accepted' || j.status === 'hired').length;
    const rejected = appliedJobs.filter((j) => j.status === 'rejected').length;
    return { total, pending, shortlisted, accepted, rejected };
  }, [appliedJobs]);

  // Filtering
  const filteredJobs = useMemo(() => {
    return appliedJobs.filter((job) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        job.title.toLowerCase().includes(q) ||
        job.customId.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.studentClass.toLowerCase().includes(q) ||
        job.subjects.some((s: string) => s.toLowerCase().includes(q));

      const matchesStatus =
        activeStatusFilter === 'All' ||
        (activeStatusFilter === 'Pending' && job.status === 'pending') ||
        (activeStatusFilter === 'Shortlisted' && job.status === 'shortlisted') ||
        (activeStatusFilter === 'Accepted' && (job.status === 'accepted' || job.status === 'hired')) ||
        (activeStatusFilter === 'Rejected' && job.status === 'rejected');

      const matchesMedium =
        activeMediumFilter === 'All' ||
        job.medium.toLowerCase().includes(activeMediumFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMedium;
    });
  }, [appliedJobs, searchQuery, activeStatusFilter, activeMediumFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const STATUS_FILTERS = [
    { key: 'All', label: 'All Applications', count: stats.total },
    { key: 'Pending', label: 'Pending Review', count: stats.pending },
    { key: 'Shortlisted', label: 'Shortlisted', count: stats.shortlisted },
    { key: 'Accepted', label: 'Accepted / Hired', count: stats.accepted },
    { key: 'Rejected', label: 'Rejected', count: stats.rejected },
  ];

  const MEDIUM_FILTERS = ['All', 'Bangla Medium', 'English Medium', 'English Version', 'Madrasah'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending Review',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Clock,
          desc: 'Guardian or Admin is reviewing your profile',
        };
      case 'shortlisted':
        return {
          label: 'Shortlisted ★',
          color: 'bg-purple-50 text-purple-700 border-purple-200 font-black',
          icon: Sparkles,
          desc: 'You are on the shortlist! Be ready for demo class',
        };
      case 'accepted':
      case 'hired':
        return {
          label: 'Accepted / Hired 🎉',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-black',
          icon: CheckCircle2,
          desc: 'Selected! Please follow up or pay platform fee',
        };
      case 'rejected':
        return {
          label: 'Not Selected',
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          desc: 'Another tutor was selected for this job',
        };
      default:
        return {
          label: status,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: AlertCircle,
          desc: '',
        };
    }
  };

  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-24 sm:pb-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 bg-white/80 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-white/60 shadow-lg shadow-ink/5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider">Tutor Application Tracker</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-black text-ink">
              My Applied Jobs & Status
            </h1>
            <p className="text-xs sm:text-sm font-medium text-ink-muted">
              Live tracking of all your job submissions, interview invites & demo selections
            </p>
          </div>

          <Link
            to="/jobs"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-primary text-white hover:bg-primary-dark font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-primary/25 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Browse More Jobs</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Analytics KPIs Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white/80 backdrop-blur p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/60 shadow-sm space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-ink-muted uppercase tracking-wider block truncate">Total Applied</span>
            <div className="text-xl sm:text-2xl font-display font-black text-ink">{stats.total}</div>
            <p className="text-[9px] sm:text-[10px] text-ink-muted truncate">All-time applications</p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider block truncate">In Review</span>
            <div className="text-xl sm:text-2xl font-display font-black text-amber-800">{stats.pending}</div>
            <p className="text-[9px] sm:text-[10px] text-amber-700 truncate">Waiting for selection</p>
          </div>

          <div className="bg-purple-50/70 border border-purple-200/60 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-purple-800 uppercase tracking-wider block truncate">Shortlisted</span>
            <div className="text-xl sm:text-2xl font-display font-black text-purple-800">{stats.shortlisted}</div>
            <p className="text-[9px] sm:text-[10px] text-purple-700 truncate">Priority consideration</p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/60 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm space-y-0.5 sm:space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 uppercase tracking-wider block truncate">Confirmed Hired</span>
            <div className="text-xl sm:text-2xl font-display font-black text-emerald-800">{stats.accepted}</div>
            <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold truncate">Active tuitions</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/60 shadow-lg shadow-ink/5 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search by job title, ID, class, location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-ink/5 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-9 sm:pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Medium Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={activeMediumFilter}
                onChange={(e) => {
                  setActiveMediumFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto bg-slate-50 border border-ink/5 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3 sm:px-4 text-xs font-bold text-ink focus:outline-none cursor-pointer"
              >
                {MEDIUM_FILTERS.map((m) => (
                  <option key={m} value={m}>{m === 'All' ? 'All Mediums' : m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Tabs Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
            {STATUS_FILTERS.map((filter) => {
              const isActive = activeStatusFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => {
                    setActiveStatusFilter(filter.key);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'snap-start flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs transition-all whitespace-nowrap border cursor-pointer active:scale-95',
                    isActive
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-slate-50/80 text-ink-muted border-ink/5 hover:border-primary/20 hover:text-ink'
                  )}
                >
                  <span>{filter.label}</span>
                  <span className={cn(
                    'px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold',
                    isActive ? 'bg-white/20 text-white' : 'bg-ink/5 text-ink-muted'
                  )}>
                    {filter.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-ink-muted">Loading your applied jobs...</p>
          </div>
        )}

        {/* Jobs List Grid */}
        {!loading && (
          <div className="space-y-4 sm:space-y-5">
            <AnimatePresence mode="popLayout">
              {paginatedJobs.map((job, index) => {
                const badge = getStatusBadge(job.status);
                const BadgeIcon = badge.icon;
                const isCoverExpanded = Boolean(expandedCoverLetters[job.applicationId]);

                return (
                  <motion.div
                    key={job.applicationId || job.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      'group bg-white/85 backdrop-blur-xl p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-[32px] border shadow-lg sm:shadow-xl shadow-ink/5 hover:shadow-2xl hover:shadow-ink/10 transition-all duration-300 space-y-4 sm:space-y-5',
                      job.status === 'accepted' || job.status === 'hired'
                        ? 'border-emerald-300/80 bg-gradient-to-r from-emerald-50/30 via-white to-white'
                        : job.status === 'shortlisted'
                        ? 'border-purple-300/80 bg-gradient-to-r from-purple-50/20 via-white to-white'
                        : 'border-white/60'
                    )}
                  >
                    {/* Top Row: Job ID & Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-ink/5 pb-3 sm:pb-4">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="px-2.5 py-0.5 bg-ink/5 text-ink font-mono font-black text-[11px] sm:text-xs rounded-lg sm:rounded-xl border border-ink/5">
                          {job.customId}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-primary bg-primary/10 px-2 sm:px-2.5 py-0.5 rounded-lg sm:rounded-xl">
                          {job.medium}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-bold text-ink-muted bg-slate-100 px-2 sm:px-2.5 py-0.5 rounded-lg sm:rounded-xl truncate max-w-[120px] sm:max-w-none">
                          Class: {job.studentClass}
                        </span>
                      </div>

                      <div className="flex items-center self-start sm:self-auto">
                        <span className={cn(
                          'px-2.5 sm:px-3.5 py-1 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase border flex items-center gap-1.5 shadow-xs',
                          badge.color
                        )}>
                          <BadgeIcon size={13} />
                          <span>{badge.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Main Information Block */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-inner">
                          <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-base sm:text-xl font-display font-black text-ink group-hover:text-primary transition-colors leading-snug">
                            {job.title}
                          </h2>
                          <p className="text-xs font-medium text-ink-muted mt-0.5 flex items-center gap-1">
                            <MapPin size={12} className="text-primary shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Subjects Pills */}
                      <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider mr-1">Subjects:</span>
                        {job.subjects.map((subj: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 sm:px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md sm:rounded-lg text-[10px] sm:text-[11px] font-bold"
                          >
                            {subj}
                          </span>
                        ))}
                      </div>

                      {/* Metadata Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                        <div className="p-2 sm:p-2.5 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100 space-y-0.5">
                          <span className="text-[9px] font-bold text-ink-muted uppercase block">Schedule</span>
                          <span className="font-bold text-ink truncate block flex items-center gap-1 text-[11px] sm:text-xs">
                            <Calendar size={11} className="text-primary shrink-0" /> <span className="truncate">{job.daysPerWeek}</span>
                          </span>
                        </div>

                        <div className="p-2 sm:p-2.5 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100 space-y-0.5">
                          <span className="text-[9px] font-bold text-ink-muted uppercase block">Shift/Time</span>
                          <span className="font-bold text-ink truncate block flex items-center gap-1 text-[11px] sm:text-xs">
                            <Clock size={11} className="text-primary shrink-0" /> <span className="truncate">{job.tutoringTime}</span>
                          </span>
                        </div>

                        <div className="p-2 sm:p-2.5 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100 space-y-0.5">
                          <span className="text-[9px] font-bold text-ink-muted uppercase block">Gender Pref</span>
                          <span className="font-bold text-ink truncate block flex items-center gap-1 text-[11px] sm:text-xs">
                            <User size={11} className="text-primary shrink-0" /> <span className="truncate">{job.genderPref}</span>
                          </span>
                        </div>

                        <div className="p-2 sm:p-2.5 bg-slate-50/80 rounded-xl sm:rounded-2xl border border-slate-100 space-y-0.5">
                          <span className="text-[9px] font-bold text-ink-muted uppercase block">Applied On</span>
                          <span className="font-bold text-ink truncate block text-[11px] sm:text-xs">
                            {job.appliedDate}
                          </span>
                        </div>
                      </div>

                      {/* Salary & Action Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50/90 rounded-xl sm:rounded-2xl border border-slate-100">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">Offered Salary</span>
                          <p className="text-lg sm:text-2xl font-display font-black text-primary leading-tight">
                            {job.salary}
                          </p>
                          {job.expectedSalary && (
                            <span className="text-[10px] font-bold text-ink-muted block">
                              Your Bid: <strong className="text-ink">{job.expectedSalary}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {job.applicationId && (
                            <button
                              type="button"
                              onClick={() => {
                                const baseUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api/v1').replace(/\/$/, '');
                                window.open(`${baseUrl}/applications/${job.applicationId}/contract-deed`, '_blank');
                              }}
                              className="flex-1 sm:flex-none px-3 py-2 sm:py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
                              title="View your electronically signed digital legal deed"
                            >
                              <FileText size={12} className="text-amber-400" />
                              <span>Signed Deed</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedJobDetails(job)}
                            className="flex-1 sm:flex-none px-3.5 py-2 sm:py-2.5 bg-white border border-slate-200 hover:border-primary/40 text-ink rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
                          >
                            <Eye size={13} />
                            <span>Job Details</span>
                          </button>

                          {(job.status === 'accepted' || job.status === 'hired') && (
                            <Link
                              to="/tutor/payments"
                              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer text-center"
                            >
                              <CreditCard size={13} />
                              <span>Pay Fee</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Application Cover Letter / Note (Collapsible) */}
                    {job.coverLetter && (
                      <div className="pt-2 border-t border-ink/5">
                        <button
                          onClick={() => toggleCoverLetter(job.applicationId)}
                          className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer active:scale-95"
                        >
                          <MessageSquare size={13} />
                          <span>{isCoverExpanded ? 'Hide Cover Letter' : 'View Submitted Cover Letter / Note'}</span>
                          {isCoverExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <AnimatePresence>
                          {isCoverExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3.5 sm:p-4 bg-primary/5 rounded-xl sm:rounded-2xl border border-primary/15 text-xs font-medium text-ink-muted leading-relaxed mt-2 whitespace-pre-wrap">
                                {job.coverLetter}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Status Progress Timeline Bar */}
                    <div className="p-3 sm:p-4 bg-slate-50/90 rounded-xl sm:rounded-2xl border border-slate-200/60 space-y-1.5 sm:space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5 text-[11px] font-bold text-ink">
                        <span>Application Progress Tracker</span>
                        <span className="text-ink-muted text-[10px] truncate">{badge.desc}</span>
                      </div>

                      <div className="grid grid-cols-4 gap-1 sm:gap-1.5 pt-1">
                        {/* Step 1: Applied */}
                        <div className="space-y-1 text-center">
                          <div className="h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-[8.5px] sm:text-[9px] font-bold text-emerald-700 block truncate">1. Applied</span>
                        </div>

                        {/* Step 2: Under Review */}
                        <div className="space-y-1 text-center">
                          <div className={cn('h-1.5 rounded-full', job.status !== 'rejected' ? 'bg-emerald-500' : 'bg-rose-300')} />
                          <span className="text-[8.5px] sm:text-[9px] font-bold text-ink-muted block truncate">2. In Review</span>
                        </div>

                        {/* Step 3: Shortlisted */}
                        <div className="space-y-1 text-center">
                          <div className={cn(
                            'h-1.5 rounded-full',
                            job.status === 'shortlisted' || job.status === 'accepted' || job.status === 'hired'
                              ? 'bg-purple-500'
                              : 'bg-slate-200'
                          )} />
                          <span className={cn('text-[8.5px] sm:text-[9px] font-bold block truncate', job.status === 'shortlisted' ? 'text-purple-700 font-black' : 'text-ink-muted')}>
                            3. Shortlisted
                          </span>
                        </div>

                        {/* Step 4: Confirmed / Hired */}
                        <div className="space-y-1 text-center">
                          <div className={cn(
                            'h-1.5 rounded-full',
                            job.status === 'accepted' || job.status === 'hired'
                              ? 'bg-emerald-600'
                              : 'bg-slate-200'
                          )} />
                          <span className={cn('text-[8.5px] sm:text-[9px] font-bold block truncate', job.status === 'accepted' || job.status === 'hired' ? 'text-emerald-700 font-black' : 'text-ink-muted')}>
                            4. Hired & Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-16 rounded-2xl sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 text-center space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                  <Briefcase className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-display font-black text-ink">No applied jobs found</h3>
                  <p className="text-xs text-ink-muted max-w-sm mx-auto">
                    {searchQuery
                      ? `No applications matched "${searchQuery}". Try a different search term.`
                      : 'You have not submitted any applications in this status category yet.'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveStatusFilter('All');
                    setActiveMediumFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-white transition-colors cursor-pointer active:scale-95"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl border border-ink/5 bg-white flex items-center justify-center text-ink-muted hover:text-primary transition-all disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-10 h-10 rounded-xl font-black text-xs transition-all cursor-pointer',
                  currentPage === page
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                    : 'bg-white border border-ink/5 text-ink hover:bg-primary/5 hover:text-primary'
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl border border-ink/5 bg-white flex items-center justify-center text-ink-muted hover:text-primary transition-all disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* ─── QUICK MODAL: Full Job Details ─── */}
        <AnimatePresence>
          {selectedJobDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[32px] shadow-2xl border border-white/60 w-full max-w-xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-8"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary font-mono">{selectedJobDetails.customId}</span>
                      <h3 className="text-base font-display font-black text-ink leading-tight">{selectedJobDetails.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedJobDetails(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-ink-muted cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Specs */}
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Class & Medium</span>
                      <p className="font-bold text-ink">{selectedJobDetails.studentClass} • {selectedJobDetails.medium}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Offered Salary</span>
                      <p className="font-display font-black text-base text-primary">{selectedJobDetails.salary} / mo</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Location</span>
                      <p className="font-bold text-ink">{selectedJobDetails.location}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-muted uppercase block">Schedule</span>
                      <p className="font-bold text-ink">{selectedJobDetails.daysPerWeek} ({selectedJobDetails.tutoringTime})</p>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-ink-muted uppercase block">Required Subjects</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJobDetails.subjects.map((s: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Additional Preferences */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-ink-muted font-bold block">Tutor Preference</span>
                      <span className="font-bold text-ink">{selectedJobDetails.genderPref}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-[10px] text-ink-muted font-bold block">Student Details</span>
                      <span className="font-bold text-ink">{selectedJobDetails.numStudents} Student ({selectedJobDetails.studentGender})</span>
                    </div>
                  </div>

                  {/* Guardian / Job Requirements note */}
                  {selectedJobDetails.fullJob?.requirements && (
                    <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase block">Special Requirements from Guardian</span>
                      <p className="text-xs font-medium text-amber-900 leading-relaxed">
                        {selectedJobDetails.fullJob.requirements}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Link to Public Job Page */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5">
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/job/${selectedJobDetails.id}`}
                      target="_blank"
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Open Public Job Page</span>
                      <ExternalLink size={12} />
                    </Link>

                    {selectedJobDetails.applicationId && (
                      <button
                        type="button"
                        onClick={() => {
                          const baseUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api/v1').replace(/\/$/, '');
                          window.open(`${baseUrl}/applications/${selectedJobDetails.applicationId}/contract-deed`, '_blank');
                        }}
                        className="text-xs font-black text-slate-800 hover:text-primary flex items-center gap-1 cursor-pointer"
                      >
                        <FileText size={12} className="text-amber-500" />
                        <span>View Signed Deed (আইনি দলিল)</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedJobDetails(null)}
                    className="px-5 py-2.5 bg-ink text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </TutorLayout>
  );
}

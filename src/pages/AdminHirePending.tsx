import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Clock, Filter, ChevronLeft, ChevronRight,
  User, Phone, MapPin, BookOpen, Calendar,
  CheckCircle2, AlertCircle, X, Sparkles, Eye,
  GraduationCap, Mail, Banknote, Briefcase,
  FileText, Check, ExternalLink, RefreshCw, Send,
  UserCheck, Shield, Bookmark, Inbox, Copy, ArrowRight,
  UserCircle, CheckCheck, XCircle, MessageSquare, PlusCircle,
  Loader2, ShieldCheck, Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { 
  useGetAdminApplicationsQuery, 
  useAcceptAdminApplicationMutation, 
  useRejectAdminApplicationMutation 
} from '@/src/services/adminApi';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 8;

export default function AdminHirePending() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'my_requests'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const { data: appsData, isLoading, refetch, isFetching } = useGetAdminApplicationsQuery(undefined);
  const [acceptApplication, { isLoading: isAccepting }] = useAcceptAdminApplicationMutation();
  const [rejectApplication, { isLoading: isRejecting }] = useRejectAdminApplicationMutation();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Handle Accept / Hire Application
  const handleAcceptApp = async (appId: string) => {
    try {
      await acceptApplication(appId).unwrap();
      setActionSuccessMsg('Tutor application accepted and tuition matched successfully! 🎉');
      refetch();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: 'accepted', rawStatus: 'Accepted' });
      }
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to accept application.');
    }
  };

  // Handle Reject Application
  const handleRejectApp = async (appId: string) => {
    if (!window.confirm('Are you sure you want to reject this tutor application?')) return;
    try {
      await rejectApplication(appId).unwrap();
      setActionSuccessMsg('Application has been rejected.');
      refetch();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: 'rejected', rawStatus: 'Rejected' });
      }
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to reject application.');
    }
  };

  // Normalize Applications Data with full student & tutor contact information
  const applications = useMemo(() => {
    const rawApps = (appsData as any)?.data ?? appsData ?? [];
    if (!Array.isArray(rawApps)) return [];

    return rawApps.map((a: any) => {
      const tutor = typeof a.tutorId === 'object' && a.tutorId !== null ? a.tutorId : {};
      const job = typeof a.jobId === 'object' && a.jobId !== null ? a.jobId : {};
      const postedBy = typeof job.postedBy === 'object' && job.postedBy !== null ? job.postedBy : {};

      const jobLoc = typeof job.location === 'object'
        ? [job.location?.area, job.location?.district].filter(Boolean).join(', ')
        : (job.location || 'Dhaka');

      const posterRole = String(postedBy.role || '').toLowerCase();
      const isAdminPosted = ['admin', 'super_admin', 'moderator'].includes(posterRole) ||
        (user && String(postedBy._id || postedBy.id) === String((user as any)?._id || (user as any)?.id));

      const rawStatus = String(a.status || 'Pending').toLowerCase();
      let normalizedStatus: 'pending' | 'accepted' | 'rejected' | 'shortlisted' = 'pending';
      if (rawStatus === 'accepted' || rawStatus === 'approved' || rawStatus === 'matched') {
        normalizedStatus = 'accepted';
      } else if (rawStatus === 'rejected' || rawStatus === 'cancelled') {
        normalizedStatus = 'rejected';
      } else if (rawStatus === 'shortlisted') {
        normalizedStatus = 'shortlisted';
      }

      return {
        id: String(a._id || a.id || ''),
        status: normalizedStatus,
        rawStatus: a.status || 'Pending',
        expectedSalary: a.expectedSalary || job.salary || 0,
        coverLetter: a.coverLetter || '',
        availableTime: Array.isArray(a.availableTime) ? a.availableTime : [],
        createdAt: a.createdAt,
        appliedAtFormatted: a.createdAt
          ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : 'Recent',
        isAdminPosted,
        posterRole: postedBy.role || 'student',

        // Tutor (Applicant) Details
        tutor: {
          id: String(tutor._id || tutor.id || 'TUTOR'),
          name: tutor.name || 'Registered Tutor',
          email: tutor.email || 'N/A',
          phone: tutor.phone || 'N/A',
          avatar: tutor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutor.name || tutor.email || 'tutor')}`,
          location: tutor.location || 'Dhaka',
        },

        // Student / Guardian & Tuition Job Details
        student: {
          id: String(postedBy._id || postedBy.id || 'STUDENT'),
          name: postedBy.name || (isAdminPosted ? 'Staff (Admin Job)' : 'Student Poster'),
          email: postedBy.email || 'N/A',
          phone: postedBy.phone || 'N/A',
          role: postedBy.role || (isAdminPosted ? 'admin' : 'student'),
          avatar: postedBy.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(postedBy.name || postedBy.email || 'student')}`,
          location: jobLoc,
          area: job.location?.area || job.area || 'Area N/A',
          district: job.location?.district || job.district || 'Dhaka',
        },

        job: {
          id: String(job._id || job.id || ''),
          title: `Tutor Need For ${job.medium || 'Tuition'}`,
          medium: job.medium || 'Bangla Medium',
          studentClass: job.studentClass || 'Class 2',
          subjects: Array.isArray(job.subjects) ? job.subjects : (job.subject ? [job.subject] : ['General Subjects']),
          offeredSalary: job.salary || 0,
          location: jobLoc,
          area: job.location?.area || job.area || 'Area N/A',
          district: job.location?.district || job.district || 'Dhaka',
          tutoringDays: job.tutoringDays || '3-4 Days/Week',
        },
      };
    });
  }, [appsData, user]);

  // Tab Counts
  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(a => a.status === 'pending' || a.status === 'shortlisted').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      myRequests: applications.filter(a => a.isAdminPosted).length,
    };
  }, [applications]);

  // Filtering Logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesTab =
        activeTab === 'all' ? true :
          activeTab === 'pending' ? (app.status === 'pending' || app.status === 'shortlisted') :
            activeTab === 'accepted' ? (app.status === 'accepted') :
              activeTab === 'my_requests' ? app.isAdminPosted :
                true;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        app.tutor.name.toLowerCase().includes(q) ||
        app.tutor.email.toLowerCase().includes(q) ||
        app.tutor.phone.toLowerCase().includes(q) ||
        app.student.name.toLowerCase().includes(q) ||
        app.student.phone.toLowerCase().includes(q) ||
        app.student.email.toLowerCase().includes(q) ||
        app.job.id.toLowerCase().includes(q) ||
        app.job.medium.toLowerCase().includes(q) ||
        app.job.subjects.some((s: string) => s.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [applications, activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / ITEMS_PER_PAGE));
  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredApplications, currentPage]);

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20 px-1 sm:px-0">

        {/* 🌟 1. Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              Application Intelligence & Contact Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-ink tracking-tight">
              Tutor Applications & Hiring Activity
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-medium">
              Monitor live tutor applications on student tuition posts with full contact intelligence for both tutors and students.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-ink rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            title="Refresh Applications"
          >
            <RefreshCw size={15} className={cn(isFetching && "animate-spin text-primary")} />
            <span>Sync Feeds</span>
          </button>
        </div>

        {/* 📊 2. KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { id: 'all', label: 'All Applications', count: counts.all, icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-200/60' },
            { id: 'pending', label: 'Student Reviewing', count: counts.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200/60' },
            { id: 'accepted', label: 'Accepted & Matched', count: counts.accepted, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' },
            { id: 'my_requests', label: 'My Tuition Requests', count: counts.myRequests, icon: Inbox, color: 'text-purple-600 bg-purple-50 border-purple-200/60', badge: '' },
          ].map((card) => {
            const isSelected = activeTab === card.id;
            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setActiveTab(card.id as any);
                  setCurrentPage(1);
                }}
                className={cn(
                  "p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden",
                  isSelected
                    ? "bg-white ring-2 ring-primary border-primary shadow-lg shadow-primary/10"
                    : "bg-white/80 hover:bg-white border-white/60 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", card.color)}>
                    <card.icon size={18} />
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-[9px] font-black uppercase">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider truncate">{card.label}</p>
                  <p className="text-2xl font-display font-black text-ink tabular-nums">{card.count}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 🔍 3. Tabs Navigation & Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-[28px] border border-white/60 shadow-lg shadow-ink/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            {/* Custom Tab Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl overflow-x-auto scrollbar-hide">
              <button
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'all'
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                All Applications ({counts.all})
              </button>

              <button
                onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'pending'
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Reviewing ({counts.pending})
              </button>

              <button
                onClick={() => { setActiveTab('accepted'); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'accepted'
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Accepted / Matched ({counts.accepted})
              </button>

              <button
                onClick={() => { setActiveTab('my_requests'); setCurrentPage(1); }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                  activeTab === 'my_requests'
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Bookmark size={13} />
                My Tuition Requests
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 group">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search tutor, student, phone, or job..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50/80 focus:bg-white border border-ink/10 focus:border-primary/30 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-bold text-ink focus:outline-none transition-all placeholder:text-ink-muted/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-ink-muted hover:text-ink"
                >
                  <X size={15} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* 🔔 Action Success Message Banner */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-between font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📋 4. Main Applications Audit Table */}
        {activeTab === 'my_requests' && filteredApplications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 text-center space-y-4">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Inbox size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-ink">No Applications on Admin-Posted Jobs Yet</h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto">
                When you post tuition jobs as an Admin or Moderator, all tutor applications for those jobs will appear here for direct hiring and management.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/create-job"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                <PlusCircle size={15} />
                Post a Tuition Job Now
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5 bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Applicant (Tutor)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Posted By</th>
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Tuition Post</th>
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Salary & Timing</th>
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Hiring Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  <AnimatePresence mode="popLayout">
                    {paginatedApplications.length > 0 ? (
                      paginatedApplications.map((app, index) => {
                        const isAccepted = app.status === 'accepted';
                        const isPending = app.status === 'pending' || app.status === 'shortlisted';
                        const isStaffJob = app.isAdminPosted;

                        return (
                          <motion.tr
                            key={app.id || index}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                              "group transition-colors",
                              isStaffJob ? "hover:bg-violet-50/30 bg-violet-50/10" : "hover:bg-blue-50/30"
                            )}
                          >
                            {/* Serial */}
                            <td className="px-6 py-4 text-xs font-bold text-ink-muted">
                              {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                            </td>

                            {/* Tutor Profile & Contacts */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0 shadow-xs">
                                  <img
                                    src={app.tutor.avatar}
                                    alt={app.tutor.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <span className="text-sm font-black text-ink truncate block max-w-[160px]">{app.tutor.name}</span>
                                  {app.tutor.phone && app.tutor.phone !== 'N/A' && (
                                    <a
                                      href={`tel:${app.tutor.phone}`}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                                      title="Call Tutor"
                                    >
                                      <Phone size={10} className="shrink-0" />
                                      <span>{app.tutor.phone}</span>
                                    </a>
                                  )}
                                  <span className="text-[10px] text-ink-muted block truncate max-w-[150px]">
                                    {app.tutor.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Student / Staff Poster */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-2xl overflow-hidden shrink-0 shadow-xs border flex items-center justify-center",
                                  isStaffJob ? "bg-violet-100 border-violet-300" : "bg-amber-50 border-amber-200/60"
                                )}>
                                  <img
                                    src={app.student.avatar}
                                    alt={app.student.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-black text-ink truncate block max-w-[140px]">{app.student.name}</span>
                                    <span className={cn(
                                      "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase",
                                      isStaffJob ? "bg-violet-100 text-violet-700 border border-violet-200" : "bg-gray-100 text-ink-muted"
                                    )}>
                                      {isStaffJob ? 'Staff Post' : app.student.role}
                                    </span>
                                  </div>
                                  {app.student.phone && app.student.phone !== 'N/A' && (
                                    <a
                                      href={`tel:${app.student.phone}`}
                                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                                      title="Call Poster"
                                    >
                                      <Phone size={10} className="shrink-0" />
                                      <span>{app.student.phone}</span>
                                    </a>
                                  )}
                                  <div className="flex items-center gap-1 text-[10px] text-ink-muted truncate max-w-[150px]">
                                    <MapPin size={10} className="text-rose-500 shrink-0" />
                                    <span className="truncate">{app.student.location}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Job Post & Subjects */}
                            <td className="px-6 py-4">
                              <div className="space-y-1 max-w-[180px]">
                                <Link
                                  to={`/job/${app.job.id}`}
                                  target="_blank"
                                  className="text-xs font-black text-primary hover:underline flex items-center gap-1 leading-snug"
                                >
                                  <span>{app.job.title}</span>
                                  <ExternalLink size={11} className="shrink-0" />
                                </Link>
                                <div className="flex flex-wrap gap-1">
                                  {app.job.subjects.slice(0, 2).map((sub: string) => (
                                    <span key={sub} className="px-2 py-0.5 bg-gray-100 text-ink rounded-md text-[9px] font-bold uppercase truncate max-w-[90px]">
                                      {sub}
                                    </span>
                                  ))}
                                  {app.job.subjects.length > 2 && (
                                    <span className="px-1.5 py-0.5 bg-gray-100 text-ink-muted rounded-md text-[9px] font-bold">
                                      +{app.job.subjects.length - 2}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-ink-muted font-medium truncate">
                                  {app.job.studentClass} • Budget: ৳{app.job.offeredSalary}
                                </p>
                              </div>
                            </td>

                            {/* Salary & Application Date */}
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span className="text-xs font-black text-emerald-700 block">
                                  ৳{Number(app.expectedSalary).toLocaleString()} <span className="text-[9px] text-ink-muted font-normal">/ mo</span>
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-ink-muted font-medium">
                                  <Calendar size={10} className="shrink-0" />
                                  <span>{app.appliedAtFormatted}</span>
                                </div>
                              </div>
                            </td>

                            {/* Hiring Status */}
                            <td className="px-6 py-4">
                              <div className="space-y-1.5">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border",
                                  isAccepted
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : isPending
                                      ? (isStaffJob ? "bg-violet-50 text-violet-800 border-violet-200" : "bg-amber-50 text-amber-800 border-amber-200")
                                      : "bg-rose-50 text-rose-800 border-rose-200"
                                )}>
                                  <span className={cn("w-1.5 h-1.5 rounded-full", isAccepted ? "bg-emerald-500" : isPending ? (isStaffJob ? "bg-violet-500 animate-pulse" : "bg-amber-500 animate-pulse") : "bg-rose-500")} />
                                  {isAccepted ? 'Accepted / Hired' : isPending ? (isStaffJob ? 'Staff Reviewing' : 'Student Reviewing') : 'Rejected'}
                                </span>
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isStaffJob && isPending && (
                                  <>
                                    <button
                                      onClick={() => handleAcceptApp(app.id)}
                                      disabled={isAccepting}
                                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      title="Accept & Hire this Tutor"
                                    >
                                      <Check size={11} />
                                      <span>Hire</span>
                                    </button>

                                    <button
                                      onClick={() => handleRejectApp(app.id)}
                                      disabled={isRejecting}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                      title="Reject Application"
                                    >
                                      <X size={11} />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => setSelectedApp(app)}
                                  className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-ink rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <Eye size={12} />
                                  <span>Inspect</span>
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-ink-muted">
                          No tutor applications match your current filters.
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 📱 5. Mobile Cards View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {paginatedApplications.map((app, index) => {
            const isAccepted = app.status === 'accepted';
            const isPending = app.status === 'pending' || app.status === 'shortlisted';
            const isStaffJob = app.isAdminPosted;

            return (
              <div
                key={app.id || index}
                className={cn(
                  "p-5 rounded-3xl border shadow-lg space-y-4",
                  isStaffJob ? "bg-violet-50/30 border-violet-200" : "bg-white/80 border-white/60 shadow-ink/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0">
                      <img
                        src={app.tutor.avatar}
                        alt={app.tutor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-ink leading-tight">{app.tutor.name}</h4>
                      <p className="text-xs font-bold text-emerald-600">৳{Number(app.expectedSalary).toLocaleString()} Expected</p>
                      <p className="text-[10px] text-ink-muted">{app.appliedAtFormatted}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shrink-0 border",
                    isAccepted
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : isPending
                        ? (isStaffJob ? "bg-violet-100 text-violet-800 border-violet-200" : "bg-amber-100 text-amber-800 border-amber-200")
                        : "bg-rose-100 text-rose-800 border-rose-200"
                  )}>
                    {isAccepted ? 'Accepted' : isPending ? (isStaffJob ? 'Staff Review' : 'Pending') : 'Rejected'}
                  </span>
                </div>

                {/* Student / Staff Poster Card in Mobile */}
                <div className={cn(
                  "p-3 rounded-2xl border space-y-1 text-xs",
                  isStaffJob ? "bg-violet-100/50 border-violet-200" : "bg-amber-50/70 border-amber-100"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-ink">{isStaffJob ? 'Staff Post' : `Student: ${app.student.name}`}</span>
                    {app.student.phone && app.student.phone !== 'N/A' && (
                      <a href={`tel:${app.student.phone}`} className="text-blue-600 font-bold flex items-center gap-1">
                        <Phone size={11} /> {app.student.phone}
                      </a>
                    )}
                  </div>
                  <p className="text-ink-muted text-[11px]">{app.job.title} • {app.student.location}</p>
                </div>

                {/* Mobile Action Buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-ink/5 gap-2">
                  {isStaffJob && isPending ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptApp(app.id)}
                        disabled={isAccepting}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase flex items-center gap-1"
                      >
                        <Check size={12} /> Hire
                      </button>
                      <button
                        onClick={() => handleRejectApp(app.id)}
                        disabled={isRejecting}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <Link
                      to={`/job/${app.job.id}`}
                      target="_blank"
                      className="text-xs font-bold text-primary flex items-center gap-1"
                    >
                      <span>View Job</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}

                  <button
                    onClick={() => setSelectedApp(app)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-bold"
                  >
                    Inspect Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🔢 6. Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-xs font-bold text-ink-muted">
              Showing page <span className="text-ink font-black">{currentPage}</span> of <span className="text-ink font-black">{totalPages}</span> ({filteredApplications.length} total applications)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-black px-2">{currentPage}</div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 🔍 7. Detailed Side-by-Side Audit Modal */}
        <AnimatePresence>
          {selectedApp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedApp(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[36px] shadow-2xl border border-white/40 max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b border-ink/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-primary/10 text-primary rounded-md">
                        Application #{selectedApp.id.slice(-8)}
                      </span>
                      {selectedApp.isAdminPosted && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-violet-100 text-violet-700 rounded-md flex items-center gap-1">
                          <ShieldCheck size={11} /> Admin Posted Job
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-display font-black text-ink mt-2">Application & Hiring Intelligence</h3>
                    <p className="text-xs text-ink-muted">Submitted on {selectedApp.appliedAtFormatted}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-ink-muted transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 👑 Staff Decision Action Banner for Admin-Posted Jobs */}
                {selectedApp.isAdminPosted && (
                  <div className="p-4 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-600 text-white rounded-xl flex items-center justify-center">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-violet-900">Direct Staff Hiring Authority</p>
                          <p className="text-[10px] text-violet-700">You have authority to accept or reject applicants on this staff tuition post.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {selectedApp.status === 'pending' || selectedApp.status === 'shortlisted' ? (
                        <>
                          <button
                            onClick={() => handleAcceptApp(selectedApp.id)}
                            disabled={isAccepting}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isAccepting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            <span>Accept & Hire Tutor</span>
                          </button>

                          <button
                            onClick={() => handleRejectApp(selectedApp.id)}
                            disabled={isRejecting}
                            className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : selectedApp.status === 'accepted' ? (
                        <div className="w-full p-2.5 bg-emerald-100/70 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-700" />
                          <span>This Tutor was Approved & Matched for this Job</span>
                        </div>
                      ) : (
                        <div className="w-full p-2.5 bg-rose-100/70 border border-rose-300 text-rose-800 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                          <XCircle size={16} className="text-rose-700" />
                          <span>This Application was Rejected</span>
                        </div>
                      )}

                      {/* Direct WhatsApp Contact Button */}
                      {selectedApp.tutor.phone && selectedApp.tutor.phone !== 'N/A' && (
                        <a
                          href={`https://wa.me/${selectedApp.tutor.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <MessageSquare size={13} className="text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                  {/* Student / Poster Profile Box */}
                  <div className={cn(
                    "p-5 rounded-3xl space-y-3 border",
                    selectedApp.isAdminPosted ? "bg-violet-50/70 border-violet-200" : "bg-amber-50/70 border-amber-200/80"
                  )}>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        selectedApp.isAdminPosted ? "text-violet-900" : "text-amber-900"
                      )}>
                        {selectedApp.isAdminPosted ? '🛡️ Staff Post Details' : '🎓 Student / Guardian'}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase",
                        selectedApp.isAdminPosted ? "bg-violet-200 text-violet-900" : "bg-amber-200 text-amber-900"
                      )}>
                        {selectedApp.student.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border shrink-0 shadow-xs">
                        <img src={selectedApp.student.avatar} alt={selectedApp.student.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink">{selectedApp.student.name}</p>
                        <p className="text-xs text-ink-muted">{selectedApp.student.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-ink/5">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted font-bold">Contact Phone:</span>
                        {selectedApp.student.phone && selectedApp.student.phone !== 'N/A' ? (
                          <a
                            href={`tel:${selectedApp.student.phone}`}
                            className="font-black text-blue-700 hover:underline flex items-center gap-1"
                          >
                            <Phone size={12} /> {selectedApp.student.phone}
                          </a>
                        ) : (
                          <span className="text-ink-muted">N/A</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted font-bold">Location Area:</span>
                        <span className="font-bold text-ink">{selectedApp.student.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor (Applicant) Box */}
                  <div className="p-5 bg-blue-50/70 border border-blue-200/80 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">👨‍🏫 Tutor (Applicant)</span>
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-md text-[9px] font-black uppercase">
                        Tutor
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-blue-200 shrink-0 shadow-xs">
                        <img src={selectedApp.tutor.avatar} alt={selectedApp.tutor.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink">{selectedApp.tutor.name}</p>
                        <p className="text-xs text-ink-muted">{selectedApp.tutor.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-blue-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted font-bold">Contact Phone:</span>
                        {selectedApp.tutor.phone && selectedApp.tutor.phone !== 'N/A' ? (
                          <a
                            href={`tel:${selectedApp.tutor.phone}`}
                            className="font-black text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <Phone size={12} /> {selectedApp.tutor.phone}
                          </a>
                        ) : (
                          <span className="text-ink-muted">N/A</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted font-bold">Tutor City:</span>
                        <span className="font-bold text-ink">{selectedApp.tutor.location}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Tuition Job Details Card */}
                <div className="p-5 bg-gray-50 rounded-3xl space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider">📋 Tuition Post Details</span>
                    <Link
                      to={`/job/${selectedApp.job.id}`}
                      target="_blank"
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      View Live Job Post <ExternalLink size={12} />
                    </Link>
                  </div>
                  <h4 className="text-sm font-black text-ink">{selectedApp.job.title}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-ink/5">
                      <p className="text-[9px] font-bold text-ink-muted uppercase">Medium</p>
                      <p className="font-black text-ink">{selectedApp.job.medium}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-ink/5">
                      <p className="text-[9px] font-bold text-ink-muted uppercase">Class</p>
                      <p className="font-black text-ink">{selectedApp.job.studentClass}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-ink/5">
                      <p className="text-[9px] font-bold text-ink-muted uppercase">Days/Week</p>
                      <p className="font-black text-ink">{selectedApp.job.tutoringDays}</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-ink/5">
                      <p className="text-[9px] font-bold text-ink-muted uppercase">Offered Budget</p>
                      <p className="font-black text-primary">৳{selectedApp.job.offeredSalary}</p>
                    </div>
                  </div>
                </div>

                {/* Expected Salary & Cover Letter */}
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-emerald-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-emerald-800 uppercase">Tutor's Expected Salary</p>
                      <p className="text-lg font-black text-emerald-700">৳{Number(selectedApp.expectedSalary).toLocaleString()} <span className="text-[10px] font-normal">/ month</span></p>
                    </div>
                    <div className="p-3.5 bg-blue-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-blue-800 uppercase">Available Time Slots</p>
                      <p className="text-xs font-black text-blue-700 capitalize">
                        {selectedApp.availableTime.length > 0 ? selectedApp.availableTime.join(', ') : 'Flexible Time'}
                      </p>
                    </div>
                  </div>

                  {selectedApp.coverLetter && (
                    <div className="p-4 bg-gray-50 rounded-2xl space-y-1.5">
                      <p className="text-[10px] font-black uppercase text-ink-muted tracking-wider">Tutor's Note to Student / Agency</p>
                      <p className="text-xs text-ink font-medium leading-relaxed bg-white p-3 rounded-xl border border-ink/5">
                        "{selectedApp.coverLetter}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-ink/5">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                    selectedApp.status === 'accepted' ? "bg-emerald-100 text-emerald-800" :
                      selectedApp.status === 'pending' ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                  )}>
                    Status: {selectedApp.rawStatus}
                  </span>

                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}

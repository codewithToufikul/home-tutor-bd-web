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
  Loader2, ShieldCheck, Star, Globe, MessageCircle
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
  const [activeTab, setActiveTab] = useState<'all' | 'guest_requests' | 'pending' | 'accepted' | 'my_requests'>('all');
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

  const openLawPdf = (appId: string) => {
    const rawApiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api/v1';
    const baseUrl = rawApiUrl.replace(/\/$/, '');
    window.open(`${baseUrl}/applications/${appId}/contract-deed`, '_blank');
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

      // Check if job was submitted via Homepage without prior login (Guest Request)
      const isGuestRequest = !isAdminPosted && (
        posterRole === 'guardian' ||
        String(postedBy.email || '').startsWith('guardian_') ||
        String(postedBy.name || '').toLowerCase().includes('guardian') ||
        String(job.description || '').includes('Contact Phone') ||
        String(job.description || '').includes('Location:')
      );

      // Extract contact details & university preference from job description
      const descPhoneMatch = (job.description || '').match(/Contact Phone:\s*([0-9+\s-]+)/i) || (job.description || '').match(/Contact:\s*([0-9+\s-]+)/i);
      const descWhatsAppMatch = (job.description || '').match(/WhatsApp:\s*([0-9+\s-]+)/i);
      const descUniMatch = (job.description || '').match(/University Preference:\s*([^.]+)/i);
      const descDetailsMatch = (job.description || '').match(/Details:\s*([^)]+)/i);

      const guardianPhone = postedBy.phone || (descPhoneMatch ? descPhoneMatch[1].trim() : '') || 'N/A';
      const cleanGuardianPhone = guardianPhone.replace(/[^0-9]/g, '');
      const guardianWhatsApp = (descWhatsAppMatch ? descWhatsAppMatch[1].trim() : '') || guardianPhone;
      const cleanGuardianWhatsApp = guardianWhatsApp.replace(/[^0-9]/g, '');
      const universityPreference = descUniMatch ? descUniMatch[1].trim() : (job.tutorQualification || '');
      const detailedAddress = descDetailsMatch ? descDetailsMatch[1].trim() : (job.location?.detailedAddress || '');

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
        isGuestRequest,
        posterRole: postedBy.role || (isGuestRequest ? 'guardian' : 'student'),
        universityPreference,
        detailedAddress,

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
          name: postedBy.name || (isAdminPosted ? 'Staff (Admin Job)' : isGuestRequest ? 'Guest Guardian (Home Request)' : 'Student Poster'),
          email: (postedBy.email && !postedBy.email.startsWith('guardian_') && !postedBy.email.endsWith('@hometutorbd.com')) ? postedBy.email : 'N/A',
          phone: guardianPhone,
          cleanPhone: cleanGuardianPhone,
          whatsapp: guardianWhatsApp,
          cleanWhatsApp: cleanGuardianWhatsApp,
          role: postedBy.role || (isAdminPosted ? 'admin' : isGuestRequest ? 'guardian' : 'student'),
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
          description: job.description || '',
        },
      };
    });
  }, [appsData, user]);

  // Tab Counts
  const counts = useMemo(() => {
    return {
      all: applications.length,
      guestRequests: applications.filter(a => a.isGuestRequest).length,
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
          activeTab === 'guest_requests' ? app.isGuestRequest :
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
      <div className="space-y-5 sm:space-y-8 max-w-7xl mx-auto pb-24 sm:pb-20 px-2.5 sm:px-0">

        {/* 🌟 1. Top Header Banner */}
        <div className="flex flex-col gap-4 bg-white/70 backdrop-blur-xl p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} />
              <span className="truncate">Application Intelligence & Contact Hub</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-display font-black text-ink tracking-tight leading-tight">
              Tutor Applications & Hiring Activity
            </h1>
            <p className="text-[11px] sm:text-sm text-ink-muted font-medium leading-relaxed">
              Monitor live tutor applications on student tuition posts with full contact intelligence for both tutors and students.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-full sm:w-auto self-stretch sm:self-auto px-4 py-3 bg-gray-100 active:bg-gray-200 hover:bg-gray-200 text-ink rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            title="Refresh Applications"
          >
            <RefreshCw size={15} className={cn(isFetching && "animate-spin text-primary")} />
            <span>Sync Feeds</span>
          </button>
        </div>

        {/* 📊 2. KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {[
            { id: 'all', label: 'All Applications', count: counts.all, icon: Briefcase, color: 'text-blue-600 bg-blue-50 border-blue-200/60' },
            { id: 'guest_requests', label: 'Guest / Direct Requests', count: counts.guestRequests, icon: Globe, color: 'text-teal-700 bg-teal-50 border-teal-200/80', badge: 'Homepage' },
            { id: 'pending', label: 'Student Reviewing', count: counts.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200/60' },
            { id: 'accepted', label: 'Accepted & Matched', count: counts.accepted, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' },
            { id: 'my_requests', label: 'My Tuition Posts', count: counts.myRequests, icon: Inbox, color: 'text-purple-600 bg-purple-50 border-purple-200/60', badge: 'Staff' },
          ].map((card) => {
            const isSelected = activeTab === card.id;
            return (
              <motion.div
                key={card.id}
                whileTap={{ scale: 0.97 }}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setActiveTab(card.id as any);
                  setCurrentPage(1);
                }}
                className={cn(
                  "p-3.5 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 sm:space-y-3 relative overflow-hidden",
                  isSelected
                    ? "bg-white ring-2 ring-primary border-primary shadow-lg shadow-primary/10"
                    : "bg-white/80 hover:bg-white border-white/60 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center", card.color)}>
                    <card.icon size={16} className="sm:hidden" />
                    <card.icon size={18} className="hidden sm:block" />
                  </div>
                  {card.badge && (
                    <span className={cn(
                      "px-1.5 sm:px-2 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase border",
                      card.id === 'guest_requests' ? "bg-teal-100 text-teal-800 border-teal-200" : "bg-purple-100 text-purple-700 border-purple-200"
                    )}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-ink-muted uppercase tracking-wider truncate">{card.label}</p>
                  <p className="text-xl sm:text-2xl font-display font-black text-ink tabular-nums">{card.count}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 🔍 3. Tabs Navigation & Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-5 rounded-[22px] sm:rounded-[28px] border border-white/60 shadow-lg shadow-ink/5 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">

            {/* Custom Tab Pills */}
            <div
              className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-2xl overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-3 px-3 sm:mx-0 sm:px-1"
            >
              <button
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
                className={cn(
                  "snap-start shrink-0 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'all'
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                All ({counts.all})
              </button>

              <button
                onClick={() => { setActiveTab('guest_requests'); setCurrentPage(1); }}
                className={cn(
                  "snap-start shrink-0 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                  activeTab === 'guest_requests'
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-teal-800 hover:text-teal-900 bg-teal-50/60"
                )}
              >
                <Globe size={13} />
                <span>Guest / Direct Requests ({counts.guestRequests})</span>
              </button>

              <button
                onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                className={cn(
                  "snap-start shrink-0 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
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
                  "snap-start shrink-0 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                  activeTab === 'accepted'
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                Accepted ({counts.accepted})
              </button>

              <button
                onClick={() => { setActiveTab('my_requests'); setCurrentPage(1); }}
                className={cn(
                  "snap-start shrink-0 px-3.5 py-2.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                  activeTab === 'my_requests'
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <Bookmark size={13} />
                <span>My Posts ({counts.myRequests})</span>
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
                className="w-full bg-gray-50/80 focus:bg-white border border-ink/10 focus:border-primary/30 rounded-2xl py-3 sm:py-2.5 pl-10 pr-4 text-xs font-bold text-ink focus:outline-none transition-all placeholder:text-ink-muted/50"
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
              className="p-3.5 sm:p-4 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-between font-bold text-xs sm:text-sm gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="truncate">{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📋 4. Main Applications Audit Table */}
        {activeTab === 'guest_requests' && filteredApplications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[24px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-50 text-teal-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Globe size={28} className="sm:hidden" />
              <Globe size={32} className="hidden sm:block" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-display font-black text-ink">কোনো গেস্ট টিউশন আবেদন নেই</h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                হোমপেজ থেকে অভিভাবক যে টিউশন রিকোয়েস্ট পাঠাবে, সেগুলোতে টিউটররা আবেদন করলে সরাসরি এই ট্যাবে এসে জমা হবে এবং অ্যাডমিন হিসেবে আপনি সরাসরি ম্যাচ ও ম্যানেজ করতে পারবেন।
              </p>
            </div>
          </div>
        ) : activeTab === 'my_requests' && filteredApplications.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[24px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Inbox size={28} className="sm:hidden" />
              <Inbox size={32} className="hidden sm:block" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-display font-black text-ink">No Applications on Admin-Posted Jobs Yet</h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                When you post tuition jobs as an Admin or Moderator, all tutor applications for those jobs will appear here for direct hiring and management.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/admin/create-job"
                className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                <PlusCircle size={15} />
                Post a Tuition Job Now
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* 📋 Desktop Table View */}
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
                                    isStaffJob
                                      ? "bg-violet-100 border-violet-300"
                                      : app.isGuestRequest
                                        ? "bg-teal-50 border-teal-300 text-teal-800"
                                        : "bg-amber-50 border-amber-200/60"
                                  )}>
                                    <img
                                      src={app.student.avatar}
                                      alt={app.student.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-sm font-black text-ink truncate block max-w-[140px]">{app.student.name}</span>
                                      <span className={cn(
                                        "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase",
                                        isStaffJob
                                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                                          : app.isGuestRequest
                                            ? "bg-teal-100 text-teal-800 border-teal-200"
                                            : "bg-gray-100 text-ink-muted"
                                      )}>
                                        {isStaffJob ? 'Staff Post' : app.isGuestRequest ? '🌐 Guest Post' : app.student.role}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {app.student.phone && app.student.phone !== 'N/A' && (
                                        <a
                                          href={`tel:${app.student.phone}`}
                                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline"
                                          title="Call Guardian/Student"
                                        >
                                          <Phone size={10} className="shrink-0" />
                                          <span>{app.student.phone}</span>
                                        </a>
                                      )}
                                      {app.student.cleanWhatsApp && (
                                        <a
                                          href={`https://wa.me/880${app.student.cleanWhatsApp.slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${app.student.name || 'অভিভাবক'}, Home Tutor BD থেকে আপনার ${app.job.studentClass} (${app.job.medium}) টিউশন রিকোয়েস্টের জন্য একজন ভেরিফাইড টিউটর (${app.tutor.name}) আবেদন করেছেন।`)}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-700 hover:underline bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
                                          title="Chat with Guardian on WhatsApp"
                                        >
                                          <MessageCircle size={10} className="text-emerald-600" />
                                          <span>WA</span>
                                        </a>
                                      )}
                                    </div>
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
                                        ? (isStaffJob ? "bg-violet-50 text-violet-800 border-violet-200" : app.isGuestRequest ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-amber-50 text-amber-800 border-amber-200")
                                        : "bg-rose-50 text-rose-800 border-rose-200"
                                  )}>
                                    <span className={cn("w-1.5 h-1.5 rounded-full", isAccepted ? "bg-emerald-500" : isPending ? (isStaffJob ? "bg-violet-500 animate-pulse" : app.isGuestRequest ? "bg-teal-500 animate-pulse" : "bg-amber-500 animate-pulse") : "bg-rose-500")} />
                                    {isAccepted ? 'Accepted / Hired' : isPending ? (isStaffJob ? 'Staff Reviewing' : app.isGuestRequest ? 'Guest Job Reviewing' : 'Student Reviewing') : 'Rejected'}
                                  </span>
                                </div>
                              </td>

                              {/* Actions Column */}
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {(isStaffJob || app.isGuestRequest) && isPending && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptApp(app.id)}
                                        disabled={isAccepting}
                                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                        title="Accept & Match this Tutor for Guardian"
                                      >
                                        <Check size={11} />
                                        <span>Match</span>
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
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openLawPdf(app.id);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                    title="Print Official Legal Contract Deed (আইনি দলিল)"
                                  >
                                    <FileText size={12} className="text-amber-400" />
                                    <span>Law PDF</span>
                                  </button>

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

            {/* 📱 5. Mobile Cards View */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {paginatedApplications.length > 0 ? (
                paginatedApplications.map((app, index) => {
                  const isAccepted = app.status === 'accepted';
                  const isPending = app.status === 'pending' || app.status === 'shortlisted';
                  const isStaffJob = app.isAdminPosted;

                  return (
                    <motion.div
                      key={app.id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "p-4 rounded-3xl border shadow-lg space-y-3.5 active:scale-[0.99] transition-transform",
                        isStaffJob ? "bg-violet-50/30 border-violet-200" : "bg-white/80 border-white/60 shadow-ink/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0">
                            <img
                              src={app.tutor.avatar}
                              alt={app.tutor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-ink leading-tight truncate">{app.tutor.name}</h4>
                            <p className="text-xs font-bold text-emerald-600">৳{Number(app.expectedSalary).toLocaleString()} Expected</p>
                            <p className="text-[10px] text-ink-muted">{app.appliedAtFormatted}</p>
                          </div>
                        </div>

                        <span className={cn(
                          "px-2 py-1 rounded-xl text-[9px] font-black uppercase shrink-0 border whitespace-nowrap",
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
                        "p-3 rounded-2xl border space-y-1.5 text-xs",
                        isStaffJob ? "bg-violet-100/50 border-violet-200" : "bg-amber-50/70 border-amber-100"
                      )}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-ink truncate">{isStaffJob ? 'Staff Post' : `${app.student.name}`}</span>
                          {app.student.phone && app.student.phone !== 'N/A' && (
                            <a href={`tel:${app.student.phone}`} className="text-blue-600 font-bold flex items-center gap-1 shrink-0">
                              <Phone size={11} /> {app.student.phone}
                            </a>
                          )}
                        </div>
                        <p className="text-ink-muted text-[11px] truncate">{app.job.title} • {app.student.location}</p>
                      </div>

                      {/* Mobile Action Buttons — app-style full-width rows */}
                      <div className="pt-1 border-t border-ink/5 space-y-2">
                        {isStaffJob && isPending && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleAcceptApp(app.id)}
                              disabled={isAccepting}
                              className="py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {isAccepting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              <span>Hire</span>
                            </button>
                            <button
                              onClick={() => handleRejectApp(app.id)}
                              disabled={isRejecting}
                              className="py-2.5 bg-rose-50 active:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openLawPdf(app.id)}
                            className="py-2.5 bg-slate-900 active:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <FileText size={13} className="text-amber-400" />
                            <span>Law PDF</span>
                          </button>

                          <button
                            onClick={() => setSelectedApp(app)}
                            className="py-2.5 bg-gray-100 active:bg-gray-200 text-ink rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <Eye size={13} />
                            <span>Inspect</span>
                          </button>
                        </div>

                        {!isStaffJob && (
                          <Link
                            to={`/job/${app.job.id}`}
                            target="_blank"
                            className="w-full py-2 text-xs font-bold text-primary flex items-center justify-center gap-1"
                          >
                            <span>View Job Post</span>
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[24px] border border-white/60 shadow-xl shadow-ink/5 text-center text-xs font-bold text-ink-muted">
                  No tutor applications match your current filters.
                </div>
              )}
            </div>
          </>
        )}

        {/* 🔢 6. Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[11px] sm:text-xs font-bold text-ink-muted text-center sm:text-left">
              Showing page <span className="text-ink font-black">{currentPage}</span> of <span className="text-ink font-black">{totalPages}</span> ({filteredApplications.length} total applications)
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2.5 sm:p-2 rounded-xl bg-gray-100 active:bg-gray-200 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="text-xs font-black px-2 min-w-[2rem] text-center">{currentPage}</div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2.5 sm:p-2 rounded-xl bg-gray-100 active:bg-gray-200 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* 🔍 7. Detailed Side-by-Side Audit Modal — bottom-sheet style on mobile */}
        <AnimatePresence>
          {selectedApp && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedApp(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative bg-white rounded-t-[28px] sm:rounded-[36px] shadow-2xl border border-white/40 max-w-2xl w-full p-5 pb-8 sm:p-8 z-10 space-y-5 sm:space-y-6 overflow-hidden max-h-[94vh] sm:max-h-[92vh] overflow-y-auto"
              >
                {/* Drag handle for mobile */}
                <div className="sm:hidden w-10 h-1.5 bg-gray-200 rounded-full mx-auto -mt-1 mb-1" />

                {/* Header */}
                <div className="flex items-start justify-between border-b border-ink/5 pb-4 gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-primary/10 text-primary rounded-md">
                        Application #{selectedApp.id.slice(-8)}
                      </span>
                      {selectedApp.isAdminPosted && (
                        <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-violet-100 text-violet-700 rounded-md flex items-center gap-1">
                          <ShieldCheck size={11} /> Admin Posted Job
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-display font-black text-ink mt-2 leading-tight">Application & Hiring Intelligence</h3>
                    <p className="text-xs text-ink-muted">Submitted on {selectedApp.appliedAtFormatted}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-ink-muted transition-all cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* 👑 Decision & Contact Action Banner for Staff Posts & Guest Homepage Requests */}
                {(selectedApp.isAdminPosted || selectedApp.isGuestRequest) && (
                  <div className={cn(
                    "p-4 sm:p-5 rounded-3xl space-y-3.5 border shadow-sm",
                    selectedApp.isAdminPosted
                      ? "bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border-violet-200"
                      : "bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 border-teal-200"
                  )}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0",
                          selectedApp.isAdminPosted ? "bg-violet-600" : "bg-teal-600"
                        )}>
                          {selectedApp.isAdminPosted ? <ShieldCheck size={18} /> : <Globe size={18} />}
                        </div>
                        <div>
                          <p className={cn(
                            "text-xs font-black",
                            selectedApp.isAdminPosted ? "text-violet-900" : "text-teal-900"
                          )}>
                            {selectedApp.isAdminPosted ? '🛡️ Direct Staff Hiring Authority' : '🌐 Guest / Direct Tuition Management'}
                          </p>
                          <p className={cn(
                            "text-[10px] font-medium leading-relaxed",
                            selectedApp.isAdminPosted ? "text-violet-700" : "text-teal-700"
                          )}>
                            {selectedApp.isAdminPosted
                              ? 'You have direct authority to accept or reject applicants on this staff tuition post.'
                              : 'This request was submitted from the homepage without login. Review applicants, contact the guardian, and confirm the match.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Guardian Contact Bar */}
                    {selectedApp.isGuestRequest && (
                      <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-200/80 flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="text-[10px] font-black uppercase text-teal-800 tracking-wider">অভিভাবক যোগাযোগ নম্বর</p>
                          <p className="text-xs font-black text-ink">{selectedApp.student.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedApp.student.phone && selectedApp.student.phone !== 'N/A' && (
                            <a
                              href={`tel:${selectedApp.student.phone}`}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Phone size={12} />
                              <span>কল করুন</span>
                            </a>
                          )}
                          {selectedApp.student.cleanWhatsApp && (
                            <a
                              href={`https://wa.me/880${selectedApp.student.cleanWhatsApp.slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${selectedApp.student.name || 'সম্মানিত অভিভাবক'}, Home Tutor BD থেকে বলছি। আপনার ${selectedApp.job.studentClass} (${selectedApp.job.medium}) টিউশন রিকোয়েস্টের জন্য একজন ভেরিফাইড টিউটর (${selectedApp.tutor.name}) আবেদন করেছেন। বিস্তারিত আলোচনা করতে আমাদের জানান।`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                            >
                              <MessageCircle size={12} />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 pt-1">
                      {selectedApp.status === 'pending' || selectedApp.status === 'shortlisted' ? (
                        <>
                          <button
                            onClick={() => handleAcceptApp(selectedApp.id)}
                            disabled={isAccepting}
                            className="col-span-2 sm:col-span-1 sm:flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                          >
                            {isAccepting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            <span>Accept & Match Tutor</span>
                          </button>

                          <button
                            onClick={() => handleRejectApp(selectedApp.id)}
                            disabled={isRejecting}
                            className="col-span-2 sm:col-span-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : selectedApp.status === 'accepted' ? (
                        <div className="col-span-2 w-full p-2.5 bg-emerald-100/70 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-700" />
                          <span>This Tutor was Approved & Matched for this Tuition</span>
                        </div>
                      ) : (
                        <div className="col-span-2 w-full p-2.5 bg-rose-100/70 border border-rose-300 text-rose-800 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                          <XCircle size={16} className="text-rose-700" />
                          <span>This Application was Rejected</span>
                        </div>
                      )}

                      {/* Print Law PDF Button */}
                      <button
                        type="button"
                        onClick={() => openLawPdf(selectedApp.id)}
                        className="col-span-2 sm:col-span-1 py-2.5 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <FileText size={14} className="text-amber-400" />
                        <span>Print Official Law PDF</span>
                      </button>

                      {/* Direct WhatsApp Contact Tutor Button */}
                      {selectedApp.tutor.phone && selectedApp.tutor.phone !== 'N/A' && (
                        <a
                          href={`https://wa.me/880${selectedApp.tutor.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${selectedApp.tutor.name}, Home Tutor BD থেকে আপনার আবেদনকৃত টিউশন (${selectedApp.job.studentClass} - ${selectedApp.job.medium}) সংক্রান্ত বিষয়ে যোগাযোগ করা হচ্ছে।`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="col-span-2 sm:col-span-1 py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare size={13} className="text-emerald-600" />
                          <span>WhatsApp Tutor</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Student / Poster Profile Box */}
                  <div className={cn(
                    "p-4 sm:p-5 rounded-3xl space-y-3 border",
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

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border shrink-0 shadow-xs">
                        <img src={selectedApp.student.avatar} alt={selectedApp.student.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-ink truncate">{selectedApp.student.name}</p>
                        <p className="text-xs text-ink-muted truncate">{selectedApp.student.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-ink/5">
                      <div className="flex items-center justify-between gap-2">
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-ink-muted font-bold">Location Area:</span>
                        <span className="font-bold text-ink truncate">{selectedApp.student.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor (Applicant) Box */}
                  <div className="p-4 sm:p-5 bg-blue-50/70 border border-blue-200/80 rounded-3xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider">👨‍🏫 Tutor (Applicant)</span>
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded-md text-[9px] font-black uppercase">
                        Tutor
                      </span>
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-blue-200 shrink-0 shadow-xs">
                        <img src={selectedApp.tutor.avatar} alt={selectedApp.tutor.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-ink truncate">{selectedApp.tutor.name}</p>
                        <p className="text-xs text-ink-muted truncate">{selectedApp.tutor.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-blue-200/60">
                      <div className="flex items-center justify-between gap-2">
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-ink-muted font-bold">Tutor City:</span>
                        <span className="font-bold text-ink truncate">{selectedApp.tutor.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tuition Job Details Card */}
                <div className="p-4 sm:p-5 bg-gray-50 rounded-3xl space-y-3 text-xs">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
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
                      <p className="text-base sm:text-lg font-black text-emerald-700">৳{Number(selectedApp.expectedSalary).toLocaleString()} <span className="text-[10px] font-normal">/ month</span></p>
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

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-ink/5">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                    selectedApp.status === 'accepted' ? "bg-emerald-100 text-emerald-800" :
                      selectedApp.status === 'pending' ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                  )}>
                    Status: {selectedApp.rawStatus}
                  </span>

                  <button
                    onClick={() => setSelectedApp(null)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-bold cursor-pointer"
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
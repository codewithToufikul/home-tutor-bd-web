import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, UserCheck, Ban, Trash2, ShieldCheck, Filter,
  ChevronLeft, ChevronRight, Phone, MapPin, Mail,
  GraduationCap, BookOpen, AlertCircle, CheckCircle2, Check,
  Eye, FileText, X, ExternalLink, XCircle, Clock,
  MessageSquare, Star, Sparkles, Award, User, DollarSign,
  Download, Calendar, Shield, School, Briefcase, CheckCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useApproveTutorMutation
} from '@/src/services/adminApi';

const ITEMS_PER_PAGE = 8;

export default function AdminAllTutors() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState<'All' | 'Pending' | 'Verified' | 'Unsubmitted' | 'Rejected'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [tutorToDelete, setTutorToDelete] = useState<string | null>(null);

  // Inspector & Document Review Modal
  const [selectedTutorForModal, setSelectedTutorForModal] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'academic' | 'documents'>('overview');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const { data: usersData, isLoading, refetch } = useGetAdminUsersQuery({ role: 'tutor' });
  const [updateUserStatusMutation] = useUpdateUserStatusMutation();
  const [deleteUserMutation] = useDeleteUserMutation();
  const [approveTutorMutation, { isLoading: isApproving }] = useApproveTutorMutation();

  const tutors = useMemo(() => {
    const raw = (usersData as { data?: unknown[] } | undefined)?.data ?? [];
    return (raw as any[]).map((u) => {
      const tutorProfile = u.tutorProfile || {};
      const nidCard = u.nidCard || tutorProfile.nidCard || '';
      const studentIdCard = u.studentIdCard || tutorProfile.studentIdCard || '';
      const hasDocs = Boolean(nidCard || studentIdCard);
      const isApproved = Boolean(u.isApproved || tutorProfile.isVerified || u.isVerified);
      const rawVerifStatus = u.verificationStatus || tutorProfile.verificationStatus || (isApproved ? 'Approved' : hasDocs ? 'Pending' : 'Unsubmitted');

      const loc = u.location || tutorProfile.location || {};
      const district = loc.district || u.district || tutorProfile.district || 'Dhaka';
      const area = loc.area || u.area || tutorProfile.area || 'All Areas';

      const uni = u.university || tutorProfile.university || '';
      const dept = u.department || tutorProfile.department || '';
      const qual = u.qualification || tutorProfile.qualification || 'Graduate';
      const exp = u.experience || tutorProfile.experience || '1+ Year';

      const subs = Array.isArray(u.subjects) && u.subjects.length > 0
        ? u.subjects
        : Array.isArray(tutorProfile.subjects) && tutorProfile.subjects.length > 0
          ? tutorProfile.subjects
          : ['General'];

      const mediums = Array.isArray(u.mediums) && u.mediums.length > 0
        ? u.mediums
        : Array.isArray(tutorProfile.mediums) && tutorProfile.mediums.length > 0
          ? tutorProfile.mediums
          : ['Bangla Medium'];

      const prefClasses = Array.isArray(u.preferredClasses) && u.preferredClasses.length > 0
        ? u.preferredClasses
        : Array.isArray(tutorProfile.preferredClasses) && tutorProfile.preferredClasses.length > 0
          ? tutorProfile.preferredClasses
          : ['All Classes'];

      const prefAreas = Array.isArray(u.preferredAreas) && u.preferredAreas.length > 0
        ? u.preferredAreas
        : Array.isArray(tutorProfile.preferredAreas) && tutorProfile.preferredAreas.length > 0
          ? tutorProfile.preferredAreas
          : [area];

      const salary = u.salary || tutorProfile.salary || 0;
      const rating = u.rating ?? tutorProfile.rating ?? 5.0;
      const reviewCount = u.reviewCount ?? tutorProfile.reviewCount ?? 0;
      const totalTuitions = u.totalTuitionsCompleted ?? tutorProfile.totalTuitionsCompleted ?? 0;
      const isPremium = Boolean(u.isPremium || tutorProfile.isPremium);
      const bio = u.bio || tutorProfile.bio || 'Dedicated and experienced tutor focused on concept building.';

      return {
        id: String(u._id || u.id),
        tutorCode: `TUT-${String(u._id || u.id).slice(-6).toUpperCase()}`,
        name: u.name || 'Tutor',
        email: u.email || 'N/A',
        phone: u.phone || 'N/A',
        cleanPhone: (u.phone || '').replace(/[^0-9+]/g, ''),
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || u.email || 'tutor')}`,
        district,
        area,
        university: uni || 'Uttara University',
        hasSetUniversity: Boolean(uni),
        department: dept || 'CSE',
        hasSetDepartment: Boolean(dept),
        qualification: qual,
        experience: exp,
        subjects: subs,
        mediums,
        preferredClasses: prefClasses,
        preferredAreas: prefAreas,
        salary,
        salaryFormatted: salary > 0 ? `৳${Number(salary).toLocaleString()}` : 'Negotiable',
        gender: u.gender || tutorProfile.gender || 'Male',
        rating,
        reviewCount,
        totalTuitions,
        isPremium,
        bio,
        status: u.status === 'blocked' ? 'blocked' : 'active',
        isApproved,
        nidNumber: u.nid || tutorProfile.nid || 'N/A',
        nidCard,
        studentIdCard,
        certificates: u.certificates || tutorProfile.certificates || [],
        cv: u.cv || tutorProfile.cv || '',
        hasDocs,
        verificationStatus: isApproved ? 'Approved' : rawVerifStatus === 'Rejected' ? 'Rejected' : hasDocs ? 'Pending' : 'Unsubmitted',
        rejectionReason: u.rejectionReason || tutorProfile.rejectionReason || '',
        submittedAt: u.submittedAt || tutorProfile.submittedAt || null,
        memberSince: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'সম্প্রতি',
      };
    });
  }, [usersData]);

  // Fast Metrics
  const stats = useMemo(() => {
    const total = tutors.length;
    const verified = tutors.filter(t => t.isApproved).length;
    const pending = tutors.filter(t => !t.isApproved && t.hasDocs).length;
    const active = tutors.filter(t => t.status === 'active').length;
    const unsubmitted = tutors.filter(t => !t.isApproved && !t.hasDocs).length;
    const rejected = tutors.filter(t => t.verificationStatus === 'Rejected').length;
    return { total, verified, pending, active, unsubmitted, rejected };
  }, [tutors]);

  // Filtering Logic
  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        tutor.name.toLowerCase().includes(q) ||
        tutor.id.toLowerCase().includes(q) ||
        tutor.tutorCode.toLowerCase().includes(q) ||
        tutor.email.toLowerCase().includes(q) ||
        tutor.phone.includes(q) ||
        tutor.university.toLowerCase().includes(q) ||
        tutor.department.toLowerCase().includes(q) ||
        tutor.district.toLowerCase().includes(q) ||
        tutor.area.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || tutor.status === statusFilter;

      let matchesVerification = true;
      if (verificationFilter === 'Verified') matchesVerification = tutor.isApproved;
      if (verificationFilter === 'Pending') matchesVerification = !tutor.isApproved && tutor.hasDocs;
      if (verificationFilter === 'Unsubmitted') matchesVerification = !tutor.isApproved && !tutor.hasDocs;
      if (verificationFilter === 'Rejected') matchesVerification = tutor.verificationStatus === 'Rejected';

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [tutors, searchQuery, statusFilter, verificationFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredTutors.length / ITEMS_PER_PAGE));
  const paginatedTutors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTutors.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTutors, currentPage]);

  const toggleBan = async (tutorId: string) => {
    const target = tutors.find(t => t.id === tutorId);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'blocked' : 'active';
    try {
      await updateUserStatusMutation({ id: tutorId, status: nextStatus }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleApprove = async (tutorId: string, isApproved: boolean, reason?: string) => {
    try {
      await approveTutorMutation({
        id: tutorId,
        isApproved,
        rejectionReason: reason || undefined,
      }).unwrap();

      setActionSuccessMsg(isApproved ? 'টিউটর সফলভাবে ভেরিফাই ও অনুমোদিত হয়েছে!' : 'ভেরিফিকেশন আবেদন প্রত্যাখ্যাত হয়েছে।');
      setTimeout(() => setActionSuccessMsg(null), 4000);

      setSelectedTutorForModal(null);
      setShowRejectInput(false);
      setRejectionReason('');
      refetch();
    } catch (err) {
      console.error('Failed to approve tutor:', err);
    }
  };

  const confirmDelete = async () => {
    if (tutorToDelete) {
      try {
        await deleteUserMutation(tutorToDelete).unwrap();
        refetch();
      } catch (err) {
        console.error('Failed to delete tutor:', err);
      } finally {
        setTutorToDelete(null);
      }
    }
  };

  const openInspector = (tutor: any, tab: 'overview' | 'academic' | 'documents' = 'overview') => {
    setSelectedTutorForModal(tutor);
    setModalTab(tab);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-7 relative pb-24 sm:pb-20 px-2.5 sm:px-0 max-w-7xl mx-auto font-sans">

        {/* 🏷️ 1. Page Header */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-[22px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  🛡️ Verified Hub
                </span>
                <span className="text-[11px] sm:text-xs text-ink-muted font-bold">
                  Total {tutors.length} Registered Tutors
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-display font-black text-ink tracking-tight leading-tight">
                Tutor Management & Verification
              </h1>
              <p className="text-[11px] sm:text-xs text-ink-muted font-medium pt-0.5 leading-relaxed">
                সকল নিবন্ধিত টিউটরের প্রোফাইল, সার্টিফিকেট, NID কার্ড যাচাই ও লাইভ অ্যাকাউন্টিং নিয়ন্ত্রণ করুন।
              </p>
            </div>
          </div>
        </div>

        {/* 📊 2. Fast Metrics Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Total Tutors */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => { setVerificationFilter('All'); setCurrentPage(1); }}
            className={cn(
              "p-3.5 sm:p-5 rounded-2xl sm:rounded-[26px] border backdrop-blur-xl transition-all cursor-pointer shadow-md flex items-center gap-3 sm:gap-4",
              verificationFilter === 'All' ? "bg-white border-primary ring-2 ring-primary/20 shadow-primary/10" : "bg-white/80 border-white/80 hover:border-primary/20"
            )}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20 shrink-0">
              <User size={20} className="sm:hidden" />
              <User size={22} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-ink-muted uppercase tracking-wider truncate">সর্বমোট টিউটর</p>
              <p className="text-lg sm:text-2xl font-black text-ink tabular-nums">{stats.total} <span className="text-[10px] sm:text-xs text-ink-muted font-normal">জন</span></p>
            </div>
          </motion.div>

          {/* Verified Tutors */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => { setVerificationFilter('Verified'); setCurrentPage(1); }}
            className={cn(
              "p-3.5 sm:p-5 rounded-2xl sm:rounded-[26px] border backdrop-blur-xl transition-all cursor-pointer shadow-md flex items-center gap-3 sm:gap-4",
              verificationFilter === 'Verified' ? "bg-emerald-50/95 border-emerald-500 ring-2 ring-emerald-300" : "bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border-emerald-200 hover:border-emerald-300"
            )}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20 shrink-0">
              <ShieldCheck size={20} className="sm:hidden" />
              <ShieldCheck size={22} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-emerald-800 uppercase tracking-wider truncate">ভেরিফাইড টিউটর</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-700 tabular-nums">{stats.verified} <span className="text-[10px] sm:text-xs text-emerald-800 font-normal">জন</span></p>
            </div>
          </motion.div>

          {/* Pending Verification */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => { setVerificationFilter('Pending'); setCurrentPage(1); }}
            className={cn(
              "p-3.5 sm:p-5 rounded-2xl sm:rounded-[26px] border backdrop-blur-xl transition-all cursor-pointer shadow-md flex items-center gap-3 sm:gap-4",
              verificationFilter === 'Pending' ? "bg-amber-50/95 border-amber-500 ring-2 ring-amber-300" : "bg-gradient-to-br from-amber-50/70 to-orange-50/40 border-amber-200 hover:border-amber-300"
            )}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0 relative">
              <Clock size={20} className="sm:hidden" />
              <Clock size={22} className="hidden sm:block" />
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-amber-800 uppercase tracking-wider truncate">যাচাই বাকি (PENDING)</p>
              <p className="text-lg sm:text-2xl font-black text-amber-700 tabular-nums">{stats.pending} <span className="text-[10px] sm:text-xs text-amber-800 font-normal">জন</span></p>
            </div>
          </motion.div>

          {/* Active Tutors */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onClick={() => { setVerificationFilter('All'); setStatusFilter('active'); setCurrentPage(1); }}
            className="bg-white/80 backdrop-blur-xl p-3.5 sm:p-5 rounded-2xl sm:rounded-[26px] border border-white/80 shadow-md flex items-center gap-3 sm:gap-4 cursor-pointer hover:border-primary/20 transition-all"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black shadow-md shadow-violet-600/20 shrink-0">
              <CheckCheck size={20} className="sm:hidden" />
              <CheckCheck size={22} className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black text-ink-muted uppercase tracking-wider truncate">সক্রিয় টিউটর</p>
              <p className="text-lg sm:text-2xl font-black text-ink tabular-nums">{stats.active} <span className="text-[10px] sm:text-xs text-ink-muted font-normal">জন</span></p>
            </div>
          </motion.div>
        </div>

        {/* 🔔 Success Alert Notification */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2.5 shadow-xs"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔍 3. Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-4 rounded-[22px] sm:rounded-[28px] border border-white/60 shadow-lg space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-ink-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search tutor by Name, University, Phone, Email, Area..."
              className="w-full bg-gray-50/80 border border-ink/10 rounded-xl sm:rounded-2xl py-2.5 pl-10 pr-8 text-xs font-bold text-ink focus:outline-none focus:bg-white focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter Tabs with Smooth Touch Scrolling */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl w-full sm:w-auto overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1 sm:mx-0 sm:px-0">
            {[
              { label: 'All', value: 'All', count: stats.total },
              { label: 'Pending Review', value: 'Pending', count: stats.pending },
              { label: 'Verified', value: 'Verified', count: stats.verified },
              { label: 'Unsubmitted', value: 'Unsubmitted', count: stats.unsubmitted },
              { label: 'Rejected', value: 'Rejected', count: stats.rejected },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => { setVerificationFilter(tab.value as any); setCurrentPage(1); }}
                className={cn(
                  "snap-start shrink-0 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95",
                  verificationFilter === tab.value
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px]",
                  verificationFilter === tab.value
                    ? (tab.value === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary')
                    : "bg-ink/5 text-ink-muted"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 📋 4. Main Tutors View: Desktop Table + Mobile Cards */}
        {isLoading ? (
          <div className="py-24 bg-white/60 rounded-[32px] border border-ink/5 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-xs font-bold text-ink-muted">টিউটরদের তথ্য লোড হচ্ছে...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table (hidden on mobile) */}
            <div className="bg-white rounded-[32px] border border-ink/10 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink/5 bg-gray-50/80">
                      <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">টিউটর প্রোফাইল (Tutor)</th>
                      <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">বিশ্ববিদ্যালয় ও বিষয় (Academic)</th>
                      <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">পড়ানোর তথ্য (Teaching)</th>
                      <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">ডকুমেন্ট ও ভেরিফিকেশন</th>
                      <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">স্ট্যাটাস</th>
                      <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider text-center">অ্যাকশন (Actions)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5 text-xs">
                    <AnimatePresence mode="popLayout">
                      {paginatedTutors.map((tutor) => (
                        <motion.tr
                          key={tutor.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* 1. Tutor Profile */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="relative shrink-0">
                                <img
                                  src={tutor.avatar}
                                  alt={tutor.name}
                                  className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                                />
                                {tutor.isApproved && (
                                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Verified Tutor">
                                    <Check size={9} strokeWidth={3} />
                                  </span>
                                )}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-sm text-ink truncate cursor-pointer hover:text-primary transition-colors" onClick={() => openInspector(tutor, 'overview')}>
                                    {tutor.name}
                                  </span>
                                  {tutor.isPremium && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                                      ★ Pro
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-ink-muted truncate font-medium flex items-center gap-1">
                                  <Mail size={11} className="text-slate-400" /> {tutor.email}
                                </p>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                                    <Phone size={10} className="text-emerald-600" /> {tutor.phone}
                                  </span>
                                  <span className="text-[9px] text-ink-muted bg-gray-100 px-1.5 py-0.2 rounded font-mono">
                                    {tutor.tutorCode}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. University / Dept */}
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <GraduationCap size={14} className="text-primary shrink-0" />
                              <p className="font-black text-ink leading-tight">
                                {tutor.university}
                              </p>
                            </div>
                            <p className="text-[11px] font-bold text-ink-muted pl-5">
                              {tutor.department} • {tutor.qualification}
                            </p>
                            <div className="flex items-center gap-1 pl-5 pt-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                                <MapPin size={10} className="text-rose-500" /> {tutor.area}, {tutor.district}
                              </span>
                            </div>
                          </td>

                          {/* 3. Teaching Info */}
                          <td className="px-6 py-4 space-y-1.5 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {tutor.subjects.slice(0, 3).map((sub: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-800 rounded-md font-bold text-[10px] border border-violet-100">
                                  {sub}
                                </span>
                              ))}
                              {tutor.subjects.length > 3 && (
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold">
                                  +{tutor.subjects.length - 3}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-black text-emerald-600">{tutor.salaryFormatted}</span>
                              <span className="text-amber-500 font-black flex items-center gap-0.5">
                                <Star size={11} fill="currentColor" /> {tutor.rating.toFixed(1)} ({tutor.totalTuitions} jobs)
                              </span>
                            </div>
                          </td>

                          {/* 4. Verification & Documents */}
                          <td className="px-6 py-4 space-y-1.5">
                            {tutor.isApproved ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 size={13} className="text-emerald-700" />
                                <span>Verified Tutor</span>
                              </span>
                            ) : tutor.verificationStatus === 'Rejected' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300" title={tutor.rejectionReason || 'Documents rejected'}>
                                <XCircle size={13} className="text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            ) : tutor.hasDocs ? (
                              <button
                                type="button"
                                onClick={() => openInspector(tutor, 'documents')}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer shadow-xs animate-pulse"
                              >
                                <Clock size={13} className="text-amber-700" />
                                <span>Review Docs</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                <span>Unsubmitted</span>
                              </span>
                            )}

                            {tutor.hasDocs && (
                              <p className="text-[10px] text-ink-muted flex items-center gap-1">
                                <FileText size={10} className="text-primary" />
                                <span>Uploaded: {[tutor.nidCard && 'NID', tutor.studentIdCard && 'Student ID'].filter(Boolean).join(' + ')}</span>
                              </p>
                            )}
                          </td>

                          {/* 5. Account Status */}
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                              tutor.status === 'active'
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            )}>
                              {tutor.status}
                            </span>
                          </td>

                          {/* 6. Action Controls */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openInspector(tutor, 'overview')}
                                className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                title="View Full Tutor Profile & Details"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/inbox?userId=${tutor.id}`)}
                                className="p-2 bg-violet-100 hover:bg-violet-600 text-violet-700 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                title="Send Real-time Message in Inbox"
                              >
                                <MessageSquare size={15} />
                              </button>
                              <button
                                onClick={() => handleApprove(tutor.id, !tutor.isApproved)}
                                className={cn(
                                  "p-2 rounded-xl text-white transition-all shadow-xs cursor-pointer",
                                  tutor.isApproved ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                                )}
                                title={tutor.isApproved ? "Unverify Tutor" : "Approve & Mark Verified"}
                              >
                                {tutor.isApproved ? <XCircle size={15} /> : <Check size={15} />}
                              </button>
                              <button
                                onClick={() => toggleBan(tutor.id)}
                                className={cn(
                                  "p-2 rounded-xl text-white transition-all shadow-xs cursor-pointer",
                                  tutor.status === 'active' ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-600 hover:bg-emerald-700"
                                )}
                                title={tutor.status === 'active' ? "Ban / Block Tutor" : "Unban Tutor"}
                              >
                                <Ban size={15} />
                              </button>
                              <button
                                onClick={() => setTutorToDelete(tutor.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-xs"
                                title="Delete Tutor Account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 📱 Mobile Cards View (App-like layout for mobile) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {paginatedTutors.map((tutor) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-lg space-y-3.5"
                >
                  {/* Tutor Header Row */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={tutor.avatar}
                          alt={tutor.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                        />
                        {tutor.isApproved && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-black text-ink truncate leading-tight">{tutor.name}</h4>
                          {tutor.isPremium && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                              Pro
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-500 truncate">{tutor.university}</p>
                        <p className="text-[10px] text-ink-muted">{tutor.department} • {tutor.qualification}</p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      {tutor.isApproved ? (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Verified
                        </span>
                      ) : tutor.hasDocs ? (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          Pending Review
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                          Unsubmitted
                        </span>
                      )}
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[8px] font-black uppercase",
                        tutor.status === 'active' ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {tutor.status}
                      </span>
                    </div>
                  </div>

                  {/* Academic & Teaching Info Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">বেতন প্রত্যাশা</span>
                      <span className="font-black text-emerald-700 text-xs">{tutor.salaryFormatted}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">রেটিং ও সম্পন্ন</span>
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1">
                        <Star size={11} className="text-amber-500 fill-amber-500" /> {tutor.rating.toFixed(1)} ({tutor.totalTuitions} jobs)
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block">এলাকা</span>
                      <span className="font-bold text-slate-700 text-xs flex items-center gap-1 truncate">
                        <MapPin size={10} className="text-rose-500 shrink-0" /> {tutor.area}, {tutor.district}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">বিষয়সমূহ</span>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((sub: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-white text-violet-800 border border-violet-200 rounded-md font-bold text-[9px]">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick Contact Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
                    <a
                      href={`tel:${tutor.cleanPhone}`}
                      className="flex-1 py-2 bg-emerald-50 active:bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center justify-center gap-1 border border-emerald-200"
                    >
                      <Phone size={12} /> <span>কল</span>
                    </a>
                    <a
                      href={`https://wa.me/${tutor.cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 bg-[#25D366]/10 active:bg-[#25D366]/20 text-[#128C7E] rounded-xl font-bold flex items-center justify-center gap-1 border border-[#25D366]/30"
                    >
                      <MessageSquare size={12} /> <span>WhatsApp</span>
                    </a>
                    <button
                      onClick={() => navigate(`/admin/inbox?userId=${tutor.id}`)}
                      className="flex-1 py-2 bg-violet-50 active:bg-violet-100 text-violet-800 rounded-xl font-bold flex items-center justify-center gap-1 border border-violet-200"
                    >
                      <MessageSquare size={12} /> <span>Inbox</span>
                    </button>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => openInspector(tutor, tutor.hasDocs ? 'documents' : 'overview')}
                      className="py-2.5 bg-slate-900 active:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Eye size={13} />
                      <span>{tutor.hasDocs ? 'Review Docs' : 'Inspect Profile'}</span>
                    </button>

                    <button
                      onClick={() => handleApprove(tutor.id, !tutor.isApproved)}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5",
                        tutor.isApproved ? "bg-amber-600 active:bg-amber-700" : "bg-emerald-600 active:bg-emerald-700"
                      )}
                    >
                      {tutor.isApproved ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                      <span>{tutor.isApproved ? 'Unverify' : 'Verify Tutor'}</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* 🔢 5. Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 bg-white border border-ink/10 rounded-xl shadow-xs text-xs font-black text-ink-muted">
              Page <span className="text-primary">{currentPage}</span> of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {filteredTutors.length === 0 && !isLoading && (
          <div className="py-20 bg-white/80 rounded-3xl border border-ink/10 flex flex-col items-center justify-center text-center space-y-3 p-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Search size={28} />
            </div>
            <h3 className="text-base font-black text-ink">কোনো টিউটর পাওয়া যায়নি</h3>
            <p className="text-xs text-ink-muted">সার্চ কিওয়ার্ড পরিবর্তন করে অথবা ফিল্টার রিসেট করে আবার চেষ্টা করুন।</p>
          </div>
        )}

      </div>

      {/* 🔍 COMPREHENSIVE TUTOR PROFILE & VERIFICATION INSPECTOR MODAL — Bottom-sheet on Mobile 🔍 */}
      <AnimatePresence>
        {selectedTutorForModal && (
          <div
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setSelectedTutorForModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative max-w-4xl w-full bg-white rounded-t-[28px] sm:rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[92vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden w-10 h-1.5 bg-slate-300 rounded-full mx-auto mt-2.5 mb-1" />

              {/* Top Banner & Profile Header */}
              <div className="bg-gradient-to-r from-ink via-slate-900 to-slate-800 text-white p-4 sm:p-7 shrink-0 space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <img
                      src={selectedTutorForModal.avatar}
                      alt={selectedTutorForModal.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
                    />
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h2 className="text-base sm:text-xl font-display font-black truncate">{selectedTutorForModal.name}</h2>
                        <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[9px] sm:text-[10px] font-mono font-bold">
                          {selectedTutorForModal.tutorCode}
                        </span>
                        {selectedTutorForModal.isApproved ? (
                          <span className="px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1">
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-500 text-white flex items-center gap-1">
                            <Clock size={10} /> Pending
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-300 font-medium flex items-center gap-2 sm:gap-3 flex-wrap">
                        <span className="truncate">🎓 {selectedTutorForModal.university}</span>
                        <span className="truncate">📍 {selectedTutorForModal.area}, {selectedTutorForModal.district}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTutorForModal(null)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Direct Action Contacts Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`tel:${selectedTutorForModal.cleanPhone}`}
                      className="px-2.5 py-1.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 text-[11px] shadow-xs"
                    >
                      <Phone size={11} /> Call ({selectedTutorForModal.phone})
                    </a>
                    <a
                      href={`https://wa.me/${selectedTutorForModal.cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1.5 bg-emerald-100 active:bg-emerald-200 text-emerald-900 rounded-xl font-bold flex items-center gap-1 text-[11px] shadow-xs"
                    >
                      <MessageSquare size={11} /> WhatsApp
                    </a>
                    <button
                      onClick={() => {
                        setSelectedTutorForModal(null);
                        navigate(`/admin/inbox?userId=${selectedTutorForModal.id}`);
                      }}
                      className="px-2.5 py-1.5 bg-violet-600 active:bg-violet-700 text-white rounded-xl font-bold flex items-center gap-1 text-[11px] shadow-xs cursor-pointer"
                    >
                      <MessageSquare size={11} /> Chat in App
                    </button>
                  </div>

                  <span className="text-[10px] sm:text-[11px] text-slate-400">
                    নিবন্ধন: {selectedTutorForModal.memberSince}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs in Modal with Touch Scroll */}
              <div className="px-4 sm:px-7 pt-3 border-b border-ink/5 flex items-center gap-1.5 bg-gray-50/70 shrink-0 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button
                  onClick={() => setModalTab('overview')}
                  className={cn(
                    "snap-start px-3.5 py-2 rounded-t-xl font-black text-xs transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap",
                    modalTab === 'overview'
                      ? "border-primary text-primary bg-white shadow-xs"
                      : "border-transparent text-ink-muted hover:text-ink"
                  )}
                >
                  <User size={13} />
                  <span>প্রোফাইল (Overview)</span>
                </button>
                <button
                  onClick={() => setModalTab('academic')}
                  className={cn(
                    "snap-start px-3.5 py-2 rounded-t-xl font-black text-xs transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap",
                    modalTab === 'academic'
                      ? "border-primary text-primary bg-white shadow-xs"
                      : "border-transparent text-ink-muted hover:text-ink"
                  )}
                >
                  <GraduationCap size={13} />
                  <span>যোগ্যতা (Academic)</span>
                </button>
                <button
                  onClick={() => setModalTab('documents')}
                  className={cn(
                    "snap-start px-3.5 py-2 rounded-t-xl font-black text-xs transition-all cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap",
                    modalTab === 'documents'
                      ? "border-primary text-primary bg-white shadow-xs"
                      : "border-transparent text-ink-muted hover:text-ink"
                  )}
                >
                  <ShieldCheck size={13} />
                  <span>ডকুমেন্টস (NID / ID)</span>
                  {selectedTutorForModal.hasDocs && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping ml-1" />
                  )}
                </button>
              </div>

              {/* Modal Content Body (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 sm:space-y-6">

                {/* ── TAB 1: Overview & Teaching Info ────────────────────────── */}
                {modalTab === 'overview' && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Bio Box */}
                    <div className="p-3.5 sm:p-4 bg-gray-50/80 rounded-2xl border border-ink/5 space-y-1">
                      <h4 className="text-xs font-black text-ink uppercase flex items-center gap-1.5">
                        <Award size={14} className="text-primary" /> টিউটর সম্পর্কে (About Bio)
                      </h4>
                      <p className="text-xs font-medium text-ink-muted leading-relaxed">
                        "{selectedTutorForModal.bio}"
                      </p>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[9px] font-black text-emerald-800 uppercase">বেতন প্রত্যাশা</p>
                        <p className="text-sm sm:text-base font-black text-emerald-700">{selectedTutorForModal.salaryFormatted}</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[9px] font-black text-amber-800 uppercase">অভিজ্ঞতা</p>
                        <p className="text-sm sm:text-base font-black text-amber-700">{selectedTutorForModal.experience}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                        <p className="text-[9px] font-black text-blue-800 uppercase">রেটিং</p>
                        <p className="text-sm sm:text-base font-black text-blue-700">★ {selectedTutorForModal.rating.toFixed(1)} / 5</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                        <p className="text-[9px] font-black text-purple-800 uppercase">সম্পন্ন টিউশন</p>
                        <p className="text-sm sm:text-base font-black text-purple-700">{selectedTutorForModal.totalTuitions} টি</p>
                      </div>
                    </div>

                    {/* Subjects & Mediums */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">পড়ানোর বিষয়সমূহ (Subjects):</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTutorForModal.subjects.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-violet-100 text-violet-900 rounded-lg text-[11px] font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">কারিকুলাম ও মাধ্যম (Mediums):</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTutorForModal.mediums.map((m: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-lg text-[11px] font-bold">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-ink-muted uppercase mb-1">পছন্দের এলাকা (Preferred Areas):</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTutorForModal.preferredAreas.map((a: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1">
                              <MapPin size={10} className="text-rose-500" /> {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: Academic & Qualifications ──────────────────────── */}
                {modalTab === 'academic' && (
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={18} className="text-primary" />
                        <h4 className="text-xs sm:text-sm font-black text-ink">উচ্চশিক্ষা ও প্রাতিষ্ঠানিক তথ্য</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] font-black text-ink-muted uppercase block">বিশ্ববিদ্যালয় / প্রতিষ্ঠান:</span>
                          <p className="font-bold text-ink text-xs sm:text-sm pt-0.5">{selectedTutorForModal.university}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-ink-muted uppercase block">বিভাগ / সাবজেক্ট:</span>
                          <p className="font-bold text-ink text-xs sm:text-sm pt-0.5">{selectedTutorForModal.department}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-ink-muted uppercase block">সর্বোচ্চ ডিগ্রি / যোগ্যতা:</span>
                          <p className="font-bold text-ink text-xs sm:text-sm pt-0.5">{selectedTutorForModal.qualification}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-ink-muted uppercase block">জাতীয় পরিচয়পত্র (NID) নম্বর:</span>
                          <p className="font-bold text-ink text-xs sm:text-sm pt-0.5">{selectedTutorForModal.nidNumber}</p>
                        </div>
                      </div>
                    </div>

                    {selectedTutorForModal.cv && (
                      <div className="p-3.5 bg-gray-50 rounded-2xl border border-ink/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText size={18} className="text-primary" />
                          <div>
                            <p className="text-xs font-black text-ink">Tutor Curriculum Vitae (CV)</p>
                            <p className="text-[10px] text-ink-muted">PDF / Document</p>
                          </div>
                        </div>
                        <a
                          href={selectedTutorForModal.cv}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5"
                        >
                          <Download size={12} /> দেখুন
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 3: Documents Review (NID & Student ID) ────────────── */}
                {modalTab === 'documents' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. NID Card Document */}
                      <div className="space-y-2 p-3.5 bg-gray-50 rounded-2xl border border-ink/5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-ink uppercase flex items-center gap-1.5">
                            <Shield size={14} className="text-emerald-600" /> ১. NID কার্ড
                          </h4>
                          {selectedTutorForModal.nidCard && (
                            <a
                              href={selectedTutorForModal.nidCard}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={11} /> বড় করে দেখুন
                            </a>
                          )}
                        </div>

                        <div className="border border-ink/10 rounded-2xl p-2 bg-white min-h-[180px] sm:min-h-[220px] flex items-center justify-center overflow-hidden">
                          {selectedTutorForModal.nidCard ? (
                            <img
                              src={selectedTutorForModal.nidCard}
                              alt="NID Card"
                              className="w-full h-auto max-h-[220px] sm:max-h-[260px] object-contain rounded-xl shadow-xs"
                            />
                          ) : (
                            <p className="text-xs text-slate-400 font-medium italic">NID কার্ড আপলোড করা হয়নি</p>
                          )}
                        </div>
                      </div>

                      {/* 2. Student ID Card Document */}
                      <div className="space-y-2 p-3.5 bg-gray-50 rounded-2xl border border-ink/5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-ink uppercase flex items-center gap-1.5">
                            <School size={14} className="text-blue-600" /> ২. স্টুডেন্ট / টিউটর আইডি কার্ড
                          </h4>
                          {selectedTutorForModal.studentIdCard && (
                            <a
                              href={selectedTutorForModal.studentIdCard}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={11} /> বড় করে দেখুন
                            </a>
                          )}
                        </div>

                        <div className="border border-ink/10 rounded-2xl p-2 bg-white min-h-[180px] sm:min-h-[220px] flex items-center justify-center overflow-hidden">
                          {selectedTutorForModal.studentIdCard ? (
                            <img
                              src={selectedTutorForModal.studentIdCard}
                              alt="Student ID Card"
                              className="w-full h-auto max-h-[220px] sm:max-h-[260px] object-contain rounded-xl shadow-xs"
                            />
                          ) : (
                            <p className="text-xs text-slate-400 font-medium italic">আইডি কার্ড আপলোড করা হয়নি</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason Form */}
                    {showRejectInput && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                        <label className="block text-xs font-bold text-rose-900">
                          প্রত্যাখ্যানের কারণ (টিউটর এটি ড্যাশবোর্ডে দেখতে পাবেন):
                        </label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. NID কার্ডের ছবি অস্পষ্ট বা মেয়াদোত্তীর্ণ। পরিষ্কার কপি জমা দিন।"
                          className="w-full bg-white border border-rose-300 rounded-xl p-2.5 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Modal Bottom Actions Bar */}
              <div className="px-4 sm:px-6 py-3.5 border-t border-ink/5 bg-gray-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedTutorForModal(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-ink/10 text-xs font-bold text-ink-muted hover:text-ink cursor-pointer shadow-xs text-center"
                >
                  বন্ধ করুন (Close)
                </button>

                <div className="flex items-center gap-2">
                  {!showRejectInput ? (
                    <button
                      type="button"
                      onClick={() => {
                        setModalTab('documents');
                        setShowRejectInput(true);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-100 active:bg-rose-200 text-rose-800 text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>রিজেক্ট</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isApproving || !rejectionReason.trim()}
                      onClick={() => handleApprove(selectedTutorForModal.id, false, rejectionReason)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-600 text-white active:bg-rose-700 text-xs font-black transition-all cursor-pointer disabled:opacity-50 text-center"
                    >
                      রিজেকশন কনফার্ম
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove(selectedTutorForModal.id, true)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} />
                    <span>{selectedTutorForModal.isApproved ? 'নবায়ন করুন' : 'অ্যাপ্রুভ ও ভেরিফাই'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🗑️ Delete Tutor Modal Confirmation */}
      <AnimatePresence>
        {tutorToDelete && (
          <div
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setTutorToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="max-w-md w-full bg-white rounded-t-[28px] sm:rounded-[32px] shadow-2xl p-5 sm:p-7 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base sm:text-lg font-black text-ink">টিউটর অ্যাকাউন্ট মুছে ফেলতে চান?</h3>
                <p className="text-xs text-ink-muted font-medium">
                  এই টিউটরের প্রোফাইল ও সমস্ত ডেটা স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলা হবে।
                </p>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setTutorToDelete(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-xs font-bold text-ink-muted hover:text-ink cursor-pointer text-center"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black hover:bg-rose-700 shadow-md shadow-rose-600/20 cursor-pointer text-center"
                >
                  মুছে ফেলুন
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}

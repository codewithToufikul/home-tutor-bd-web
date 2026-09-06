import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, School, Trash2, ChevronLeft, ChevronRight,
  MapPin, Users, Calendar, BookOpen, GraduationCap,
  Image as ImageIcon, AlertCircle, ExternalLink, X,
  ShieldCheck, CheckCircle2, Clock, Ban, Check,
  MessageSquare, Phone, Mail, Eye, Download, Shield,
  Sparkles, Award, User, DollarSign, Layers, PlusCircle,
  AlertTriangle, RefreshCw
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

interface BatchItem {
  _id?: string;
  id?: string;
  batchName: string;
  className: string;
  subject: string;
  schedule?: string;
  fee?: number;
  maxStudents?: number;
  enrolledCount?: number;
  status?: 'Active' | 'Completed' | 'Upcoming';
  instructorName?: string;
  createdAt?: string;
}

interface CoachingCenterItem {
  id: string;
  coachingCode: string;
  name: string;
  instituteName: string;
  email: string;
  phone: string;
  cleanPhone: string;
  avatar: string;
  district: string;
  address: string;
  about: string;
  tradeLicense: string;
  batches: BatchItem[];
  totalBatches: number;
  activeBatches: number;
  totalStudents: number;
  batchClasses: string[];
  batchSubjects: string[];
  feeRange: string;
  status: 'active' | 'blocked';
  isApproved: boolean;
  hasDocs: boolean;
  verificationStatus: 'Approved' | 'Pending' | 'Unsubmitted' | 'Rejected';
  rejectionReason: string;
  submittedAt: string | null;
  createdAt: string;
  memberSince: string;
}

export default function AdminCoachingCenter() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'blocked'>('All');
  const [verificationFilter, setVerificationFilter] = useState<'All' | 'Approved' | 'Pending' | 'Unsubmitted' | 'Rejected'>('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawers
  const [selectedCoaching, setSelectedCoaching] = useState<CoachingCenterItem | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'batches' | 'license'>('overview');
  const [selectedLicensePhoto, setSelectedLicensePhoto] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // API Hooks
  const { data: usersData, isLoading, refetch } = useGetAdminUsersQuery({ role: 'coaching' });
  const [updateUserStatusMutation] = useUpdateUserStatusMutation();
  const [deleteUserMutation] = useDeleteUserMutation();
  const [approveTutorMutation, { isLoading: isApproving }] = useApproveTutorMutation();

  // Normalized Coaching Centers List
  const coachingList: CoachingCenterItem[] = useMemo(() => {
    const raw = (usersData as { data?: unknown[] } | undefined)?.data ?? [];
    return (raw as any[]).map((u) => {
      const coachingProfile = u.coachingProfile || {};
      const batches: BatchItem[] = Array.isArray(u.batches) && u.batches.length > 0
        ? u.batches
        : Array.isArray(coachingProfile.batches) && coachingProfile.batches.length > 0
          ? coachingProfile.batches
          : [];

      const tradeLicense = u.tradeLicense || coachingProfile.tradeLicense || '';
      const isApproved = Boolean(u.isApproved || coachingProfile.isVerified || u.isVerified);
      const hasDocs = Boolean(tradeLicense);
      const rawVerifStatus = u.verificationStatus || (isApproved ? 'Approved' : hasDocs ? 'Pending' : 'Unsubmitted');

      const activeBatchesCount = batches.filter((b) => b.status === 'Active').length;
      const totalStudentsCount = batches.reduce((sum, b) => sum + (Number(b.enrolledCount) || 0), 0);
      const classesList = Array.from(new Set(batches.map((b) => b.className).filter(Boolean)));
      const subjectsList = Array.from(new Set(batches.map((b) => b.subject).filter(Boolean)));
      const fees = batches.map((b) => Number(b.fee) || 0).filter((f) => f > 0);
      const feeRangeStr = fees.length > 0
        ? (Math.min(...fees) === Math.max(...fees) ? `৳${Math.min(...fees)}` : `৳${Math.min(...fees)} - ৳${Math.max(...fees)}`)
        : 'N/A';

      const district = u.district || coachingProfile.district || (typeof u.location === 'object' ? u.location?.district : u.location) || 'Dhaka';
      const address = coachingProfile.location || u.address || (typeof u.location === 'object' ? u.location?.area : u.location) || 'Dhaka, Bangladesh';

      const instituteName = coachingProfile.instituteName || u.name || 'Coaching Institute';

      return {
        id: String(u._id || u.id),
        coachingCode: `CCH-${String(u._id || u.id).slice(-6).toUpperCase()}`,
        name: u.name || 'Coaching Owner',
        instituteName,
        email: u.email || 'N/A',
        phone: u.phone || coachingProfile.phone || 'N/A',
        cleanPhone: (u.phone || coachingProfile.phone || '').replace(/[^0-9+]/g, ''),
        avatar: u.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(instituteName || u.name || 'coaching')}`,
        district,
        address,
        about: coachingProfile.about || u.bio || 'Professional coaching center providing quality education.',
        tradeLicense,
        batches,
        totalBatches: batches.length,
        activeBatches: activeBatchesCount,
        totalStudents: totalStudentsCount,
        batchClasses: classesList.length > 0 ? classesList : ['All Classes'],
        batchSubjects: subjectsList.length > 0 ? subjectsList : ['All Subjects'],
        feeRange: feeRangeStr,
        status: u.status === 'blocked' ? 'blocked' : 'active',
        isApproved,
        hasDocs,
        verificationStatus: isApproved ? 'Approved' : rawVerifStatus === 'Rejected' ? 'Rejected' : hasDocs ? 'Pending' : 'Unsubmitted',
        rejectionReason: u.rejectionReason || coachingProfile.rejectionReason || '',
        submittedAt: u.submittedAt || coachingProfile.createdAt || null,
        createdAt: u.createdAt || new Date().toISOString(),
        memberSince: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Recently',
      };
    });
  }, [usersData]);

  // Fast Aggregate Metrics
  const stats = useMemo(() => {
    const total = coachingList.length;
    const verified = coachingList.filter((c) => c.isApproved).length;
    const pending = coachingList.filter((c) => !c.isApproved && c.hasDocs).length;
    const active = coachingList.filter((c) => c.status === 'active').length;
    const totalBatches = coachingList.reduce((sum, c) => sum + c.totalBatches, 0);
    const totalStudents = coachingList.reduce((sum, c) => sum + c.totalStudents, 0);
    return { total, verified, pending, active, totalBatches, totalStudents };
  }, [coachingList]);

  // Unique Districts for Dropdown
  const availableDistricts = useMemo(() => {
    const set = new Set<string>();
    coachingList.forEach((c) => {
      if (c.district && c.district !== 'N/A') set.add(c.district);
    });
    return Array.from(set).sort();
  }, [coachingList]);

  // Filtering Logic
  const filteredCoaching = useMemo(() => {
    return coachingList.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.instituteName.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.coachingCode.toLowerCase().includes(q) ||
        item.batchSubjects.some((s) => s.toLowerCase().includes(q)) ||
        item.batchClasses.some((c) => c.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'All' || item.status === statusFilter;

      const matchesVerification =
        verificationFilter === 'All' || item.verificationStatus === verificationFilter;

      const matchesDistrict =
        districtFilter === 'All' || item.district === districtFilter;

      return matchesSearch && matchesStatus && matchesVerification && matchesDistrict;
    });
  }, [coachingList, searchQuery, statusFilter, verificationFilter, districtFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCoaching.length / ITEMS_PER_PAGE));
  const paginatedCoaching = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCoaching.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCoaching, currentPage]);

  // Message / Chat Deep-Link
  const handleOpenChat = (coaching: CoachingCenterItem) => {
    navigate(`/admin/inbox?userId=${coaching.id}`);
  };

  // Status Toggle (Active / Blocked)
  const handleToggleStatus = async (item: CoachingCenterItem) => {
    const nextStatus = item.status === 'active' ? 'blocked' : 'active';
    try {
      await updateUserStatusMutation({ id: item.id, status: nextStatus }).unwrap();
      setActionSuccessMsg(`Coaching center status set to ${nextStatus.toUpperCase()}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to update status.');
    }
  };

  // Verification Approval / Rejection
  const handleApprove = async (coachingId: string, approve: boolean) => {
    try {
      await approveTutorMutation({
        id: coachingId,
        isApproved: approve,
        rejectionReason: !approve ? rejectionReason : undefined,
      }).unwrap();

      setActionSuccessMsg(approve ? 'Coaching Center verified successfully! 🎉' : 'Verification application rejected.');
      setShowRejectInput(false);
      setRejectionReason('');
      if (selectedCoaching?.id === coachingId) {
        setSelectedCoaching((prev) => prev ? {
          ...prev,
          isApproved: approve,
          verificationStatus: approve ? 'Approved' : 'Rejected',
          rejectionReason: !approve ? rejectionReason : '',
        } : null);
      }
      setTimeout(() => setActionSuccessMsg(null), 3500);
      refetch();
    } catch (err: any) {
      console.error('Failed to approve/reject:', err);
      alert(err?.data?.message || 'Verification update failed.');
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteUserMutation(itemToDelete).unwrap();
      setActionSuccessMsg('Coaching center deleted successfully.');
      setItemToDelete(null);
      if (selectedCoaching?.id === itemToDelete) {
        setSelectedCoaching(null);
      }
      setTimeout(() => setActionSuccessMsg(null), 3000);
      refetch();
    } catch (err) {
      console.error('Failed to delete coaching center:', err);
      alert('Failed to delete coaching center.');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative pb-20 max-w-7xl mx-auto">
        {/* Sticky Header Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title & Quick Stats */}
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-7 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <div>
                <h2 className="text-base md:text-lg font-display font-black text-ink leading-tight flex items-center gap-2">
                  Coaching Center Management
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {coachingList.length} Registered
                  </span>
                </h2>
                <p className="text-[11px] font-medium text-ink-muted">
                  Oversee verified coaching institutions, live batches, enrolled students & trade licenses
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                className="p-2 rounded-xl bg-white border border-ink/10 text-ink-muted hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-95"
                title="Refresh List"
              >
                <RefreshCw size={15} className={isLoading ? 'animate-spin text-primary' : ''} />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 text-[11px] font-bold">
                <ShieldCheck size={14} />
                <span>{stats.verified} Verified</span>
              </div>
              {stats.pending > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-600 text-[11px] font-bold animate-pulse">
                  <Clock size={14} />
                  <span>{stats.pending} Pending Review</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Toast Notification */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-between text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Centers</span>
              <School size={16} className="text-primary" />
            </div>
            <p className="text-xl font-black text-ink">{stats.total}</p>
            <p className="text-[10px] font-semibold text-emerald-600">All registered institutes</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Verified</span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <p className="text-xl font-black text-emerald-600">{stats.verified}</p>
            <p className="text-[10px] font-semibold text-ink-muted">License approved</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Pending Review</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <p className="text-xl font-black text-amber-600">{stats.pending}</p>
            <p className="text-[10px] font-semibold text-amber-500">License uploaded</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Active Status</span>
              <CheckCircle2 size={16} className="text-teal-500" />
            </div>
            <p className="text-xl font-black text-teal-600">{stats.active}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Non-blocked centers</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Live Batches</span>
              <Layers size={16} className="text-blue-500" />
            </div>
            <p className="text-xl font-black text-blue-600">{stats.totalBatches}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Active programs</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-ink-muted">
              <span className="text-[10px] font-black uppercase tracking-wider">Total Students</span>
              <Users size={16} className="text-purple-500" />
            </div>
            <p className="text-xl font-black text-purple-600">{stats.totalStudents}</p>
            <p className="text-[10px] font-semibold text-ink-muted">Enrolled in batches</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative group">
              <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                <Search size={15} />
              </div>
              <input
                type="text"
                placeholder="Search by Institute Name, Owner, Email, Phone, District, Subject..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/70 border border-ink/10 rounded-xl py-2 pl-10 pr-3 text-xs font-medium text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-ink-muted hover:text-ink text-xs"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Verification Status Filter */}
            <div className="md:col-span-3">
              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/70 border border-ink/10 rounded-xl py-2 px-3 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm"
              >
                <option value="All">All Verification ({coachingList.length})</option>
                <option value="Approved">Verified ({coachingList.filter((c) => c.isApproved).length})</option>
                <option value="Pending">Pending Review ({coachingList.filter((c) => !c.isApproved && c.hasDocs).length})</option>
                <option value="Unsubmitted">Unsubmitted ({coachingList.filter((c) => !c.isApproved && !c.hasDocs).length})</option>
                <option value="Rejected">Rejected ({coachingList.filter((c) => c.verificationStatus === 'Rejected').length})</option>
              </select>
            </div>

            {/* Account Status Filter */}
            <div className="md:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/70 border border-ink/10 rounded-xl py-2 px-3 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="blocked">Blocked Only</option>
              </select>
            </div>

            {/* District Filter */}
            <div className="md:col-span-2">
              <select
                value={districtFilter}
                onChange={(e) => {
                  setDistrictFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white/70 border border-ink/10 rounded-xl py-2 px-3 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm"
              >
                <option value="All">All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Active Filter Badges */}
          {(searchQuery || statusFilter !== 'All' || verificationFilter !== 'All' || districtFilter !== 'All') && (
            <div className="flex items-center gap-2 pt-2 border-t border-ink/5 flex-wrap">
              <span className="text-[10px] font-bold text-ink-muted uppercase">Active Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                  "{searchQuery}" <X size={11} className="cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
              {verificationFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  {verificationFilter} <X size={11} className="cursor-pointer" onClick={() => setVerificationFilter('All')} />
                </span>
              )}
              {statusFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold">
                  {statusFilter} <X size={11} className="cursor-pointer" onClick={() => setStatusFilter('All')} />
                </span>
              )}
              {districtFilter !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                  {districtFilter} <X size={11} className="cursor-pointer" onClick={() => setDistrictFilter('All')} />
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setVerificationFilter('All');
                  setDistrictFilter('All');
                  setCurrentPage(1);
                }}
                className="text-[10px] font-bold text-rose-500 hover:underline ml-auto"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Coaching Centers Table (Desktop View) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white select-none">
                  <th className="px-4 py-4 text-[10px] font-black uppercase text-center w-12">#</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Coaching Institute</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Location</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Batches & Capacity</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">Fee Range</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Trade License</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Status</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Contact & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-ink-muted">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-primary" />
                        <span className="text-xs font-bold">Loading coaching centers...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedCoaching.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-14 h-14 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
                          <School size={28} />
                        </div>
                        <h4 className="text-sm font-black text-ink">No Coaching Centers Found</h4>
                        <p className="text-xs text-ink-muted max-w-sm">
                          Try tweaking your search keywords or adjusting the verification / status filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCoaching.map((item, index) => (
                    <tr
                      key={item.id}
                      className="group hover:bg-white/60 transition-colors"
                    >
                      {/* Index */}
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted text-center">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>

                      {/* Institute & Owner */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={item.avatar}
                              alt={item.instituteName}
                              className="w-10 h-10 rounded-xl object-cover border border-ink/10 shadow-sm bg-white"
                              referrerPolicy="no-referrer"
                            />
                            {item.isApproved && (
                              <div
                                className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white"
                                title="Verified Coaching Center"
                              >
                                <Check size={9} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                onClick={() => {
                                  setSelectedCoaching(item);
                                  setModalTab('overview');
                                }}
                                className="text-xs font-black text-ink hover:text-primary cursor-pointer transition-colors leading-tight"
                              >
                                {item.instituteName}
                              </span>
                              <span className="text-[9px] font-bold text-ink-muted px-1.5 py-0.2 rounded bg-ink/5 font-mono">
                                {item.coachingCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-ink-muted">
                              <span className="flex items-center gap-1 truncate max-w-[130px]">
                                <User size={10} className="text-primary/70 shrink-0" />
                                {item.name}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[140px]">{item.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-xs font-bold text-ink">
                            <MapPin size={12} className="text-primary shrink-0" />
                            <span>{item.district}</span>
                          </div>
                          <p className="text-[10px] text-ink-muted max-w-[150px] truncate" title={item.address}>
                            {item.address}
                          </p>
                        </div>
                      </td>

                      {/* Batches & Capacity */}
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black">
                              {item.totalBatches} {item.totalBatches === 1 ? 'Batch' : 'Batches'}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700">
                              <Users size={12} />
                              {item.totalStudents} Students
                            </span>
                          </div>
                          <p className="text-[10px] text-ink-muted truncate max-w-[160px]" title={item.batchSubjects.join(', ')}>
                            {item.batchSubjects.slice(0, 3).join(', ')}
                            {item.batchSubjects.length > 3 ? ` +${item.batchSubjects.length - 3}` : ''}
                          </p>
                        </div>
                      </td>

                      {/* Fee Structure */}
                      <td className="px-4 py-4">
                        <span className="text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                          {item.feeRange}
                        </span>
                      </td>

                      {/* Trade License & Verification */}
                      <td className="px-4 py-4 text-center">
                        {item.tradeLicense ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              onClick={() => setSelectedLicensePhoto(item.tradeLicense)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase hover:bg-primary/20 transition-all active:scale-95 border border-primary/20"
                            >
                              <ImageIcon size={11} /> View License
                            </button>
                            {item.isApproved ? (
                              <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5">
                                <CheckCircle2 size={10} /> Verified
                              </span>
                            ) : (
                              <span className="text-[9px] font-black text-amber-600 flex items-center gap-0.5">
                                <Clock size={10} /> Pending
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-ink-muted/60 italic">
                            Not Uploaded
                          </span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={cn(
                            'px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm inline-flex items-center gap-1',
                            item.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          )}
                          title="Click to toggle status"
                        >
                          {item.status === 'active' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </>
                          ) : (
                            <>
                              <Ban size={10} />
                              Blocked
                            </>
                          )}
                        </button>
                      </td>

                      {/* Contact & Action Buttons */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Direct In-App Chat */}
                          <button
                            onClick={() => handleOpenChat(item)}
                            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                            title="Direct In-App Message"
                          >
                            <MessageSquare size={14} />
                          </button>

                          {/* WhatsApp / Phone */}
                          {item.cleanPhone && item.cleanPhone !== 'NA' && (
                            <a
                              href={`https://wa.me/${item.cleanPhone.replace('+', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                              title="Open WhatsApp Chat"
                            >
                              <Phone size={14} />
                            </a>
                          )}

                          {/* Full Inspector Modal */}
                          <button
                            onClick={() => {
                              setSelectedCoaching(item);
                              setModalTab('overview');
                            }}
                            className="p-2 rounded-xl bg-ink/5 text-ink hover:bg-ink hover:text-white transition-all shadow-sm active:scale-95"
                            title="Inspect Details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Delete Action */}
                          <button
                            onClick={() => setItemToDelete(item.id)}
                            className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                            title="Delete Coaching Center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {isLoading ? (
            <div className="py-12 text-center text-ink-muted">
              <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-2" />
              <p className="text-xs font-bold">Loading coaching centers...</p>
            </div>
          ) : paginatedCoaching.length === 0 ? (
            <div className="bg-white/80 p-8 rounded-3xl text-center space-y-2">
              <School size={32} className="mx-auto text-ink-muted" />
              <h4 className="text-sm font-black text-ink">No Coaching Centers Found</h4>
              <p className="text-xs text-ink-muted">Adjust your search or active filters.</p>
            </div>
          ) : (
            paginatedCoaching.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-lg space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.instituteName}
                      className="w-12 h-12 rounded-2xl object-cover border border-ink/10 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-black text-ink leading-tight">{item.instituteName}</h4>
                        {item.isApproved && (
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-ink-muted">{item.name} • {item.district}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-ink/5 text-ink-muted">
                    {item.coachingCode}
                  </span>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-ink/5 text-center">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-ink-muted">Batches</p>
                    <p className="text-xs font-black text-blue-600">{item.totalBatches}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-ink-muted">Students</p>
                    <p className="text-xs font-black text-purple-600">{item.totalStudents}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase text-ink-muted">Fee Range</p>
                    <p className="text-xs font-black text-primary truncate">{item.feeRange}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedCoaching(item);
                      setModalTab('overview');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-ink/5 text-ink text-xs font-black uppercase flex items-center justify-center gap-1.5 hover:bg-ink/10"
                  >
                    <Eye size={13} /> View Full
                  </button>
                  <button
                    onClick={() => handleOpenChat(item)}
                    className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                    title="Message"
                  >
                    <MessageSquare size={16} />
                  </button>
                  {item.tradeLicense && (
                    <button
                      onClick={() => setSelectedLicensePhoto(item.tradeLicense)}
                      className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                      title="View License"
                    >
                      <ImageIcon size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => setItemToDelete(item.id)}
                    className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 py-4 px-2">
            <p className="text-xs font-medium text-ink-muted">
              Showing <span className="font-bold text-ink">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
              <span className="font-bold text-ink">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredCoaching.length)}
              </span>{' '}
              of <span className="font-bold text-ink">{filteredCoaching.length}</span> coaching centers
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-ink/10 text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="px-3 py-1.5 bg-white border border-ink/10 rounded-xl text-xs font-bold text-ink shadow-sm">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-ink/10 text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Coaching Center Inspector Modal */}
      <AnimatePresence>
        {selectedCoaching && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCoaching(null)}
              className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl border border-white/60 overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCoaching.avatar}
                    alt={selectedCoaching.instituteName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 bg-white"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black leading-tight">{selectedCoaching.instituteName}</h3>
                      {selectedCoaching.isApproved ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 size={11} /> Verified Center
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black flex items-center gap-1">
                          <Clock size={11} /> Verification Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Owner: <span className="text-white font-bold">{selectedCoaching.name}</span> • Code:{' '}
                      <span className="font-mono text-primary">{selectedCoaching.coachingCode}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCoaching(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs Bar */}
              <div className="flex border-b border-ink/10 bg-slate-50 px-6 shrink-0">
                <button
                  onClick={() => setModalTab('overview')}
                  className={cn(
                    'py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5',
                    modalTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  )}
                >
                  <School size={14} /> Overview & Bio
                </button>
                <button
                  onClick={() => setModalTab('batches')}
                  className={cn(
                    'py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5',
                    modalTab === 'batches'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  )}
                >
                  <Layers size={14} /> Batches ({selectedCoaching.batches.length})
                </button>
                <button
                  onClick={() => setModalTab('license')}
                  className={cn(
                    'py-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5',
                    modalTab === 'license'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  )}
                >
                  <ImageIcon size={14} /> Trade License
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {modalTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Key Stat Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-ink/5 text-center">
                        <p className="text-[10px] font-black uppercase text-ink-muted">Total Batches</p>
                        <p className="text-base font-black text-ink">{selectedCoaching.totalBatches}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-ink/5 text-center">
                        <p className="text-[10px] font-black uppercase text-ink-muted">Active Students</p>
                        <p className="text-base font-black text-purple-600">{selectedCoaching.totalStudents}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-ink/5 text-center">
                        <p className="text-[10px] font-black uppercase text-ink-muted">Account Status</p>
                        <p className={cn("text-base font-black capitalize", selectedCoaching.status === 'active' ? 'text-emerald-600' : 'text-rose-600')}>
                          {selectedCoaching.status}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-ink/5 text-center">
                        <p className="text-[10px] font-black uppercase text-ink-muted">Member Since</p>
                        <p className="text-base font-black text-ink">{selectedCoaching.memberSince}</p>
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-primary">About / Institute Bio</h4>
                      <p className="text-xs text-ink leading-relaxed whitespace-pre-wrap">
                        {selectedCoaching.about || 'No detailed biography provided.'}
                      </p>
                    </div>

                    {/* Contact & Location Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-ink/5 space-y-3">
                        <h4 className="text-xs font-black uppercase text-ink tracking-wider">Contact Details</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-primary" />
                            <span className="font-bold text-ink">{selectedCoaching.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-primary" />
                            <span className="font-medium text-ink-muted">{selectedCoaching.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-ink/5 space-y-3">
                        <h4 className="text-xs font-black uppercase text-ink tracking-wider">Location & Address</h4>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-primary" />
                            <span className="font-bold text-ink">{selectedCoaching.district}</span>
                          </div>
                          <p className="text-xs text-ink-muted pl-6">{selectedCoaching.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Direct Chat / WhatsApp Quick Trigger */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleOpenChat(selectedCoaching)}
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                      >
                        <MessageSquare size={15} /> Direct Chat In Inbox
                      </button>
                      {selectedCoaching.cleanPhone && (
                        <a
                          href={`https://wa.me/${selectedCoaching.cleanPhone.replace('+', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-3 px-5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                        >
                          <Phone size={15} /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {modalTab === 'batches' && (
                  <div className="space-y-4">
                    {selectedCoaching.batches.length === 0 ? (
                      <div className="py-12 text-center text-ink-muted space-y-2">
                        <Layers size={32} className="mx-auto text-ink-muted/50" />
                        <p className="text-xs font-bold">No batches created yet by this coaching center.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedCoaching.batches.map((batch, idx) => (
                          <div
                            key={batch._id || batch.id || idx}
                            className="p-4 bg-slate-50 rounded-2xl border border-ink/5 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-xs font-black text-ink">{batch.batchName}</h5>
                                <p className="text-[11px] font-medium text-ink-muted">
                                  {batch.className} • {batch.subject}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded-full text-[9px] font-black uppercase',
                                  batch.status === 'Active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : batch.status === 'Upcoming'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-slate-200 text-slate-700'
                                )}
                              >
                                {batch.status || 'Active'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>
                                <span className="text-ink-muted">Fee: </span>
                                <span className="font-bold text-primary">
                                  {batch.fee ? `৳${batch.fee}` : 'Free'}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-muted">Schedule: </span>
                                <span className="font-medium text-ink">{batch.schedule || 'Regular'}</span>
                              </div>
                              <div>
                                <span className="text-ink-muted">Enrolled: </span>
                                <span className="font-bold text-purple-600">
                                  {batch.enrolledCount || 0} / {batch.maxStudents || 30}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-muted">Instructor: </span>
                                <span className="font-medium text-ink truncate">{batch.instructorName || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {modalTab === 'license' && (
                  <div className="space-y-4">
                    {selectedCoaching.tradeLicense ? (
                      <div className="space-y-3">
                        <div className="relative rounded-2xl overflow-hidden border border-ink/10 shadow-sm bg-slate-100 max-h-96 flex items-center justify-center">
                          <img
                            src={selectedCoaching.tradeLicense}
                            alt="Trade License"
                            className="w-full h-auto max-h-96 object-contain cursor-zoom-in"
                            onClick={() => setSelectedLicensePhoto(selectedCoaching.tradeLicense)}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-ink-muted">
                            Uploaded Document (Click image to view in full resolution)
                          </span>
                          <a
                            href={selectedCoaching.tradeLicense}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-ink transition-colors"
                          >
                            <ExternalLink size={13} /> Open Original
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-ink-muted space-y-2">
                        <ImageIcon size={32} className="mx-auto text-ink-muted/50" />
                        <p className="text-xs font-bold">No Trade License document has been uploaded yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Decision & Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!selectedCoaching.isApproved ? (
                    <button
                      onClick={() => handleApprove(selectedCoaching.id, true)}
                      disabled={isApproving}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                    >
                      <Check size={14} strokeWidth={3} /> Approve Verification
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(selectedCoaching.id, false)}
                      disabled={isApproving}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-black text-xs uppercase flex items-center justify-center gap-1.5 hover:bg-slate-300 transition-all"
                    >
                      Revoke Verification
                    </button>
                  )}

                  {!selectedCoaching.isApproved && !showRejectInput && (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs uppercase hover:bg-rose-100 transition-all"
                    >
                      Reject With Reason
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleToggleStatus(selectedCoaching)}
                    className={cn(
                      'px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all',
                      selectedCoaching.status === 'active'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    )}
                  >
                    {selectedCoaching.status === 'active' ? 'Block Center' : 'Unblock Center'}
                  </button>
                  <button
                    onClick={() => setSelectedCoaching(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs uppercase hover:bg-slate-300 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Reject Reason Form Drawer */}
              {showRejectInput && (
                <div className="p-4 bg-rose-50 border-t border-rose-200 space-y-2">
                  <p className="text-xs font-black text-rose-800">
                    Specify Reason for Rejection (will be sent as in-app notification to the coaching owner):
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Trade license photo is blurry / expired..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="flex-1 bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                    <button
                      onClick={() => handleApprove(selectedCoaching.id, false)}
                      disabled={!rejectionReason.trim()}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black uppercase hover:bg-rose-700 disabled:opacity-50"
                    >
                      Submit Rejection
                    </button>
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Trade License Lightbox */}
      <AnimatePresence>
        {selectedLicensePhoto && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLicensePhoto(null)}
              className="absolute inset-0 bg-ink/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <h4 className="text-sm font-black flex items-center gap-2">
                  <ImageIcon size={16} className="text-primary" /> Trade License Preview
                </h4>
                <button
                  onClick={() => setSelectedLicensePhoto(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-300"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[75vh] flex items-center justify-center bg-slate-100">
                <img
                  src={selectedLicensePhoto}
                  alt="License"
                  className="w-auto h-auto max-w-full max-h-[70vh] rounded-xl object-contain shadow"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-4 bg-white border-t border-ink/5 flex justify-between items-center">
                <a
                  href={selectedLicensePhoto}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-ink inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={14} /> Open Full Size
                </a>
                <button
                  onClick={() => setSelectedLicensePhoto(null)}
                  className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/60 p-6 text-center space-y-4 z-10"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-black text-ink">Delete Coaching Center?</h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Are you sure you want to permanently delete this coaching center and its batch records? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-ink font-bold text-xs hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-black text-xs uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

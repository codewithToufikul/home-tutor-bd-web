import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, UserCheck, Ban, Trash2, ShieldCheck, Filter, 
  ChevronLeft, ChevronRight, Phone, MapPin, Mail,
  GraduationCap, BookOpen, AlertCircle, CheckCircle2, Check,
  Eye, FileText, X, ExternalLink, XCircle, Clock
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [tutorToDelete, setTutorToDelete] = useState<string | null>(null);

  // Document Viewer & Review Modal state
  const [selectedTutorForDoc, setSelectedTutorForDoc] = useState<any | null>(null);
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
      const isApproved = Boolean(u.isApproved || tutorProfile.isVerified);

      return {
        id: u._id || u.id,
        name: u.name || 'Tutor',
        email: u.email || '',
        phone: u.phone || 'N/A',
        area: u.district || u.area || 'Dhaka',
        university: u.university || tutorProfile.university || 'N/A',
        department: u.department || tutorProfile.department || 'N/A',
        status: u.status === 'blocked' ? 'banned' : 'active',
        isApproved,
        nidNumber: u.nid || tutorProfile.nid || 'N/A',
        nidCard,
        studentIdCard,
        hasDocs,
        verificationStatus: isApproved ? 'Approved' : hasDocs ? 'Pending' : 'Unsubmitted',
        rejectionReason: tutorProfile.rejectionReason || '',
      };
    });
  }, [usersData]);

  // Filtering Logic
  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor => {
      const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tutor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'All' || tutor.status === statusFilter;
      
      let matchesVerification = true;
      if (verificationFilter === 'Verified') matchesVerification = tutor.isApproved;
      if (verificationFilter === 'Pending') matchesVerification = !tutor.isApproved && tutor.hasDocs;
      if (verificationFilter === 'Unsubmitted') matchesVerification = !tutor.isApproved && !tutor.hasDocs;

      return matchesSearch && matchesStatus && matchesVerification;
    });
  }, [tutors, searchQuery, statusFilter, verificationFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTutors.length / ITEMS_PER_PAGE);
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
      setTimeout(() => setActionSuccessMsg(null), 3000);
      
      setSelectedTutorForDoc(null);
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

  return (
    <AdminLayout>
      <div className="space-y-8 relative pb-20">
        
        {/* Topbar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-ink">Tutor Management & Verification</h1>
            <p className="text-sm font-medium text-ink-muted">
              Review uploaded NID & Student ID cards, mark verified, and manage tutor access.
            </p>
          </div>

          {/* Verification Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl border border-ink/10 shadow-xs flex-wrap">
            <button
              onClick={() => { setVerificationFilter('All'); setCurrentPage(1); }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                verificationFilter === 'All' ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              All ({tutors.length})
            </button>
            <button
              onClick={() => { setVerificationFilter('Pending'); setCurrentPage(1); }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                verificationFilter === 'Pending' ? "bg-amber-500 text-white shadow-sm" : "text-amber-700 hover:text-amber-900"
              )}
            >
              <Clock size={13} />
              <span>Pending Review ({tutors.filter(t => !t.isApproved && t.hasDocs).length})</span>
            </button>
            <button
              onClick={() => { setVerificationFilter('Verified'); setCurrentPage(1); }}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                verificationFilter === 'Verified' ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-700 hover:text-emerald-900"
              )}
            >
              <CheckCircle2 size={13} />
              <span>Verified ({tutors.filter(t => t.isApproved).length})</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </motion.div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted">
            <Search size={18} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search tutor by name, email, phone, university, or ID..."
            className="w-full bg-white border border-ink/10 rounded-2xl py-4 pl-14 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all shadow-xs"
          />
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-ink/10 shadow-xl shadow-ink/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5 bg-slate-50">
                    <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">Tutor Info</th>
                    <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">University / Dept</th>
                    <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">Verification</th>
                    <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black text-ink-muted uppercase tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 text-sm">
                  <AnimatePresence mode="popLayout">
                    {paginatedTutors.map((tutor, index) => (
                      <motion.tr 
                        key={tutor.id || index}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        {/* 1. Tutor Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
                              {tutor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-ink leading-tight">{tutor.name}</p>
                              <p className="text-xs text-ink-muted mt-0.5">{tutor.email}</p>
                              <p className="text-xs text-slate-500 font-semibold">{tutor.phone}</p>
                            </div>
                          </div>
                        </td>

                        {/* 2. University / Dept */}
                        <td className="px-6 py-4 text-xs">
                          <p className="font-bold text-slate-800 leading-tight">{tutor.university}</p>
                          <p className="text-[11px] text-ink-muted mt-0.5">{tutor.department}</p>
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <MapPin size={10} /> {tutor.area}
                          </span>
                        </td>

                        {/* 3. Uploaded Documents */}
                        <td className="px-6 py-4">
                          {tutor.hasDocs ? (
                            <button
                              type="button"
                              onClick={() => setSelectedTutorForDoc(tutor)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer border border-primary/20 shadow-xs"
                            >
                              <Eye size={14} />
                              <span>View Docs ({[tutor.nidCard && 'NID', tutor.studentIdCard && 'Student ID'].filter(Boolean).join(', ')})</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">
                              No docs uploaded
                            </span>
                          )}
                        </td>

                        {/* 4. Verification Badge */}
                        <td className="px-6 py-4">
                          {tutor.isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>Verified</span>
                            </span>
                          ) : tutor.hasDocs ? (
                            <button
                              type="button"
                              onClick={() => setSelectedTutorForDoc(tutor)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer"
                            >
                              <Clock size={13} className="text-amber-600" />
                              <span>Review Needed</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Unsubmitted</span>
                            </span>
                          )}
                        </td>

                        {/* 5. User Account Status */}
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase",
                            tutor.status === 'active' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                          )}>
                            {tutor.status}
                          </span>
                        </td>

                        {/* 6. Action Buttons */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Review/Approve Quick Trigger */}
                            {tutor.hasDocs && (
                              <button
                                onClick={() => setSelectedTutorForDoc(tutor)}
                                className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                title="Review Documents"
                              >
                                <Eye size={15} />
                              </button>
                            )}

                            {/* Direct Verify/Unverify Toggle */}
                            <button
                              onClick={() => handleApprove(tutor.id, !tutor.isApproved)}
                              className={cn(
                                "p-2 rounded-xl text-white transition-all shadow-xs active:scale-95 cursor-pointer",
                                tutor.isApproved ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-600 hover:bg-emerald-700"
                              )}
                              title={tutor.isApproved ? "Unverify Tutor" : "Mark as Verified"}
                            >
                              {tutor.isApproved ? <XCircle size={15} /> : <Check size={15} />}
                            </button>

                            {/* Ban/Unban */}
                            <button
                              onClick={() => toggleBan(tutor.id)}
                              className={cn(
                                "p-2 rounded-xl text-white transition-all shadow-xs active:scale-95 cursor-pointer",
                                tutor.status === 'active' ? "bg-slate-700 hover:bg-slate-800" : "bg-emerald-600 hover:bg-emerald-700"
                              )}
                              title={tutor.status === 'active' ? "Ban Tutor" : "Unban Tutor"}
                            >
                              <Ban size={15} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setTutorToDelete(tutor.id)}
                              className="p-2 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl transition-all active:scale-95 cursor-pointer"
                              title="Delete Tutor"
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
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 bg-white border border-ink/10 rounded-xl shadow-xs text-xs font-bold text-ink-muted">
              Page <span className="text-primary">{currentPage}</span> of {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-ink/10 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {filteredTutors.length === 0 && !isLoading && (
          <div className="py-16 bg-white rounded-3xl border border-ink/10 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Search size={28} />
            </div>
            <h3 className="text-base font-bold text-ink">No tutors found</h3>
            <p className="text-xs text-ink-muted">Try adjusting your search query or filter criteria.</p>
          </div>
        )}

      </div>

      {/* ─── DOCUMENT REVIEW MODAL ───────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTutorForDoc && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedTutorForDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-ink/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                    <ShieldCheck size={14} /> Tutor Document Verification Review
                  </div>
                  <h2 className="text-2xl font-black text-ink">{selectedTutorForDoc.name}</h2>
                  <p className="text-xs text-ink-muted">
                    {selectedTutorForDoc.email} • {selectedTutorForDoc.phone} • {selectedTutorForDoc.university} ({selectedTutorForDoc.department})
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTutorForDoc(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Document Display Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. NID Card Document */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">1. National ID (NID) Card</h4>
                    {selectedTutorForDoc.nidCard && (
                      <a
                        href={selectedTutorForDoc.nidCard}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Full Image
                      </a>
                    )}
                  </div>

                  <div className="border-2 border-slate-200 rounded-2xl p-2 bg-slate-50 min-h-[220px] flex items-center justify-center overflow-hidden">
                    {selectedTutorForDoc.nidCard ? (
                      <img
                        src={selectedTutorForDoc.nidCard}
                        alt="NID Card"
                        className="w-full h-auto max-h-[260px] object-contain rounded-xl shadow-xs"
                      />
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">NID Card not uploaded</p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    NID Number: <strong className="text-slate-800">{selectedTutorForDoc.nidNumber}</strong>
                  </p>
                </div>

                {/* 2. Student ID Card Document */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-ink uppercase tracking-wider">2. Student / Tutor ID Card</h4>
                    {selectedTutorForDoc.studentIdCard && (
                      <a
                        href={selectedTutorForDoc.studentIdCard}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> Full Image
                      </a>
                    )}
                  </div>

                  <div className="border-2 border-slate-200 rounded-2xl p-2 bg-slate-50 min-h-[220px] flex items-center justify-center overflow-hidden">
                    {selectedTutorForDoc.studentIdCard ? (
                      <img
                        src={selectedTutorForDoc.studentIdCard}
                        alt="Student ID Card"
                        className="w-full h-auto max-h-[260px] object-contain rounded-xl shadow-xs"
                      />
                    ) : (
                      <p className="text-xs text-slate-400 font-medium italic">Student ID Card not uploaded</p>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Institute: <strong className="text-slate-800">{selectedTutorForDoc.university}</strong>
                  </p>
                </div>

              </div>

              {/* Rejection Reason Form */}
              {showRejectInput && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-rose-900">
                    Rejection Feedback / Reason (টিউটর এই মন্তব্য দেখতে পাবেন)*
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. NID কার্ডের ছবি অস্পষ্ট। অনুগ্রহ করে পরিষ্কার ছবি আপলোড করুন।"
                    className="w-full bg-white border border-rose-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="pt-4 border-t border-ink/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTutorForDoc(null)}
                  className="px-5 py-3 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-3">
                  {!showRejectInput ? (
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(true)}
                      className="px-5 py-3 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle size={15} />
                      <span>Reject Application</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isApproving || !rejectionReason.trim()}
                      onClick={() => handleApprove(selectedTutorForDoc.id, false, rejectionReason)}
                      className="px-5 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      Confirm Rejection
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove(selectedTutorForDoc.id, true)}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    <span>{selectedTutorForDoc.isApproved ? 'Mark as Re-Verified' : 'Approve & Mark Verified'}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {tutorToDelete && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setTutorToDelete(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">Delete Tutor Account</h3>
                <p className="text-xs text-ink-muted mt-1">
                  Are you sure you want to permanently delete this tutor account? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTutorToDelete(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-600/20 cursor-pointer"
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

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, UserCheck, Ban, Trash2, ShieldCheck, Filter, 
  ChevronLeft, ChevronRight, Phone, MapPin, Mail,
  GraduationCap, BookOpen, AlertCircle, CheckCircle2, Check
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { 
  useGetAdminUsersQuery, 
  useUpdateUserStatusMutation, 
  useDeleteUserMutation,
  useApproveTutorMutation 
} from '@/src/services/adminApi';

const ITEMS_PER_PAGE = 5;

export default function AdminAllTutors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [tutorToDelete, setTutorToDelete] = useState<string | null>(null);

  const { data: usersData, isLoading } = useGetAdminUsersQuery({ role: 'tutor' });
  const [updateUserStatusMutation] = useUpdateUserStatusMutation();
  const [deleteUserMutation] = useDeleteUserMutation();
  const [approveTutorMutation] = useApproveTutorMutation();

  const tutors = useMemo(() => {
    const raw = (usersData as { data?: unknown[] } | undefined)?.data ?? [];
    return (raw as any[]).map((u) => ({
      id: u._id || u.id,
      name: u.name || 'Tutor',
      email: u.email || '',
      phone: u.phone || 'N/A',
      area: u.district || u.area || 'Dhaka',
      subject: u.isApproved ? 'APPROVED' : 'PENDING',
      status: u.status === 'blocked' ? 'banned' : 'active',
      isApproved: Boolean(u.isApproved),
    }));
  }, [usersData]);

  // Filtering Logic
  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor => {
      const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tutor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'All' || tutor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tutors, searchQuery, statusFilter]);

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
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const toggleApprove = async (tutorId: string, currentApproved: boolean) => {
    try {
      await approveTutorMutation({ id: tutorId, isApproved: !currentApproved }).unwrap();
    } catch (err) {
      console.error('Failed to approve tutor:', err);
    }
  };

  const confirmDelete = async () => {
    if (tutorToDelete) {
      try {
        await deleteUserMutation(tutorToDelete).unwrap();
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
            <h1 className="text-3xl font-display font-black text-ink">All Registered Tutors</h1>
            <p className="text-sm font-medium text-ink-muted">View, approve, ban, or delete tutor accounts across the platform.</p>
          </div>

          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl border border-white/40 shadow-sm">
            <button
              onClick={() => { setStatusFilter('All'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                statusFilter === 'All'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              All Tutors ({tutors.length})
            </button>
            <button
              onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                statusFilter === 'active'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => { setStatusFilter('banned'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                statusFilter === 'banned'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Banned
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted">
            <Search size={18} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search tutor by name, email, phone or ID..."
            className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl py-4 pl-14 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5 bg-ink/5">
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Tutor</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Phone</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Approval</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Status</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  <AnimatePresence mode="popLayout">
                    {paginatedTutors.map((tutor, index) => (
                      <motion.tr 
                        key={tutor.id || index}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                              {tutor.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-ink">{tutor.name}</p>
                              <p className="text-xs text-ink-muted">{tutor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-ink">{tutor.phone}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleApprove(tutor.id, tutor.isApproved)}
                            className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase cursor-pointer transition-all",
                              tutor.isApproved
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            )}
                          >
                            {tutor.isApproved ? '✓ Approved' : '⏳ Pending Approve'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                            tutor.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {tutor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {!tutor.isApproved && (
                              <button
                                onClick={() => toggleApprove(tutor.id, tutor.isApproved)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                                title="Approve Tutor Account"
                              >
                                <Check size={14} />
                                <span>Approve</span>
                              </button>
                            )}
                            <button
                              onClick={() => toggleBan(tutor.id)}
                              className={cn(
                                "p-2 rounded-xl text-white transition-all shadow-md active:scale-95 cursor-pointer",
                                tutor.status === 'active' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                              )}
                              title={tutor.status === 'active' ? "Ban Tutor" : "Unban Tutor"}
                            >
                              {tutor.status === 'active' ? <Ban size={16} /> : <ShieldCheck size={16} />}
                            </button>
                            <button
                              onClick={() => setTutorToDelete(tutor.id)}
                              className="p-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer"
                              title="Delete Tutor"
                            >
                              <Trash2 size={16} />
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
          <div className="flex items-center justify-center gap-2 py-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm text-sm font-bold text-ink-muted">
              Page <span className="text-primary">{currentPage}</span> of {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {filteredTutors.length === 0 && !isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-black text-ink">No tutors found</h3>
            <p className="text-sm font-medium text-ink-muted max-w-xs">
              No registered tutors matching your search criteria.
            </p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {tutorToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTutorToDelete(null)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-ink">Delete Tutor?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  Are you sure you want to delete this tutor account?
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setTutorToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

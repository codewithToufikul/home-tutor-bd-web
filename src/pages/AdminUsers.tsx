import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Ban, Trash2, ShieldCheck, UserCheck, Users, 
  Filter, ChevronLeft, ChevronRight, AlertCircle, Clock3, CheckCircle2, XCircle
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useGetAdminUsersQuery, useApproveTutorMutation, useUpdateUserStatusMutation, useDeleteUserMutation } from '@/src/services/adminApi';
import type { UserRecord, UserRole } from '@/src/repositories/userRepository.ts';

const ITEMS_PER_PAGE = 5;

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { data: usersData, isLoading: loading } = useGetAdminUsersQuery(undefined);
  const [approveTutorMutation] = useApproveTutorMutation();
  const [updateUserStatusMutation] = useUpdateUserStatusMutation();
  const [deleteUserMutation] = useDeleteUserMutation();

  const users: UserRecord[] = useMemo(() => {
    const raw = (usersData as { data?: unknown[] } | undefined)?.data ?? [];
    return (raw as any[]).map((u) => ({
      ...u,
      uid: u._id || u.id,
      isApproved: Boolean(u.isApproved),
    })) as UserRecord[];
  }, [usersData]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = String(user.name || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      const uid = String(user.uid || '').toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase()) || uid.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase() as UserRole;
      const approvalState = user.isApproved ? 'approved' : 'pending';
      const matchesStatus = statusFilter === 'All' || approvalState === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const approveUser = async (userId: string) => {
    try {
      await approveTutorMutation({ id: userId, isApproved: true }).unwrap();
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      await approveTutorMutation({ id: userId, isApproved: false }).unwrap();
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  };

  const toggleBan = async (userId: string) => {
    const target = users.find((user) => user.uid === userId);
    if (!target) return;
    const nextStatus = target.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateUserStatusMutation({ id: userId, status: nextStatus }).unwrap();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation(userToDelete).unwrap();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 relative pb-20">
        {/* Sticky Topbar Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-4 shrink-0">
              {/* Title */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm md:text-base font-display font-black text-ink leading-none">
                  User Information
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[90px]"
                >
                  <option value="All">All Roles</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Student">Student</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Coaching">Coaching</option>
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[80px]"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
            </div>

            {/* Total Users */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
              <Users size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredUsers.length}</span></span>
            </div>
          </div>
        </div>

        {/* Users Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Serial</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Name</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Email</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Role</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">User Id</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Banned</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedUsers.map((user, index) => (
                    <motion.tr 
                      key={user.uid || user._id || user.id || index}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-bold text-ink-muted">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-ink">{user.name || 'Unnamed User'}</span>
                          <span className="text-[10px] font-bold text-ink-muted/60 uppercase tracking-tight">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-ink-muted">{user.email}</td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                          user.role === 'tutor' ? "bg-blue-100 text-blue-600" : 
                          user.role === 'coaching' ? "bg-cyan-100 text-cyan-600" :
                          user.role === 'guardian' ? "bg-emerald-100 text-emerald-600" :
                          "bg-amber-100 text-amber-600"
                        )}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm font-mono font-bold text-primary">{user.uid}</td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase',
                            user.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          )}>
                            {user.isVerified ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase',
                            user.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          )}>
                            {user.isApproved ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                            {user.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {!user.isApproved ? (
                            <button 
                              onClick={() => approveUser(user.uid)}
                              className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-1"
                            >
                              <UserCheck size={12} />
                              Approve
                            </button>
                          ) : (
                            <button 
                              onClick={() => rejectUser(user.uid)}
                              className="px-3 py-2 rounded-xl text-[10px] font-black uppercase bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95 flex items-center gap-1"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          )}
                          <button 
                            onClick={() => setUserToDelete(user.uid)}
                            className="p-2 rounded-xl bg-[#991B1B] text-white shadow-lg shadow-rose-900/20 hover:bg-rose-900 transition-all active:scale-95 flex items-center justify-center"
                          >
                            <Trash2 size={14} />
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

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          <AnimatePresence mode="popLayout">
            {paginatedUsers.map((user, index) => (
              <motion.div
                key={user.uid || user._id || user.id || index}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1} • {user.uid}
                    </p>
                    <h3 className="text-lg font-black text-ink leading-tight">{user.name || 'Unnamed User'}</h3>
                    <p className="text-sm font-medium text-ink-muted">{user.email}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                    user.role === 'tutor' ? "bg-blue-100 text-blue-600" : 
                    user.role === 'coaching' ? "bg-cyan-100 text-cyan-600" :
                    user.role === 'guardian' ? "bg-emerald-100 text-emerald-600" :
                    "bg-amber-100 text-amber-600"
                  )}>
                    {user.role}
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                    <span className={cn('rounded-full px-2 py-1', user.isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600')}>
                      {user.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                    <span className={cn('rounded-full px-2 py-1', user.isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                      {user.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {!user.isApproved ? (
                      <button 
                        onClick={() => approveUser(user.uid)}
                        className="flex-grow py-3 rounded-2xl text-[10px] font-black uppercase bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                      >
                        <UserCheck size={14} />
                        Approve User
                      </button>
                    ) : (
                      <button 
                        onClick={() => rejectUser(user.uid)}
                        className="flex-grow py-3 rounded-2xl text-[10px] font-black uppercase bg-rose-500 text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} />
                        Reject User
                      </button>
                    )}
                    <button 
                      onClick={() => setUserToDelete(user.uid)}
                      className="w-12 h-12 rounded-2xl bg-[#991B1B] text-white shadow-lg shadow-rose-900/20 flex items-center justify-center active:scale-95 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm">
              <span className="text-sm font-bold text-ink-muted">
                Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <Search size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No users found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any users matching your current search or filter criteria.
              </p>
            </div>
            <button 
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('All');
                setStatusFilter('All');
              }}
              className="text-primary font-bold text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserToDelete(null)}
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
                <h3 className="text-2xl font-display font-black text-ink">Are you sure?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all"
                >
                  No, Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
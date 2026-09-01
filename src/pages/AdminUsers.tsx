import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Ban, Trash2, ShieldCheck, UserCheck, Users, 
  Filter, ChevronLeft, ChevronRight, AlertCircle, Clock3, 
  CheckCircle2, XCircle, Eye, Mail, Phone, Calendar, 
  MapPin, Sparkles, Building2, GraduationCap, Copy, Check,
  X, RefreshCw, AlertTriangle, Shield, User, Lock, Unlock
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { 
  useGetAdminUsersQuery, 
  useApproveTutorMutation, 
  useUpdateUserStatusMutation, 
  useDeleteUserMutation 
} from '@/src/services/adminApi';

const ITEMS_PER_PAGE = 8;

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'student' | 'tutor' | 'coaching' | 'guardian' | 'staff'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'blocked' | 'pending_coaching'>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToToggleBan, setUserToToggleBan] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: usersData, isLoading: loading, refetch, isFetching } = useGetAdminUsersQuery(undefined);
  const [approveTutorMutation, { isLoading: isApproving }] = useApproveTutorMutation();
  const [updateUserStatusMutation, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [deleteUserMutation, { isLoading: isDeleting }] = useDeleteUserMutation();

  // Normalize Users List
  const allUsers: any[] = useMemo(() => {
    const raw = (usersData as { data?: unknown[] } | undefined)?.data ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((u: any) => ({
      ...u,
      id: u._id || u.id,
      isApproved: Boolean(u.isApproved),
      isVerified: Boolean(u.isEmailVerified),
      role: u.role || 'student',
      status: u.status || 'active',
      phone: u.phone || 'N/A',
      createdAtFormatted: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
    }));
  }, [usersData]);

  // Role Counts for Quick KPIs
  const roleCounts = useMemo(() => {
    return {
      total: allUsers.length,
      student: allUsers.filter(u => u.role === 'student').length,
      tutor: allUsers.filter(u => u.role === 'tutor').length,
      coaching: allUsers.filter(u => u.role === 'coaching').length,
      guardian: allUsers.filter(u => u.role === 'guardian').length,
      staff: allUsers.filter(u => ['super_admin', 'admin', 'moderator'].includes(u.role)).length,
      pendingCoaching: allUsers.filter(u => u.role === 'coaching' && !u.isApproved).length,
    };
  }, [allUsers]);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q) ||
        user.id?.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q);

      const matchesRole = 
        roleFilter === 'All' ? true :
        roleFilter === 'staff' ? ['super_admin', 'admin', 'moderator'].includes(user.role) :
        user.role === roleFilter;

      const matchesStatus = 
        statusFilter === 'All' ? true :
        statusFilter === 'active' ? user.status === 'active' :
        statusFilter === 'blocked' ? user.status === 'blocked' :
        statusFilter === 'pending_coaching' ? (user.role === 'coaching' && !user.isApproved) :
        true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchQuery, roleFilter, statusFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApproveCoaching = async (userId: string, isApproved: boolean) => {
    try {
      await approveTutorMutation({ id: userId, isApproved }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to approve coaching center:', error);
    }
  };

  const handleToggleStatus = async () => {
    if (!userToToggleBan) return;
    const nextStatus = userToToggleBan.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateUserStatusMutation({ id: userToToggleBan.id, status: nextStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUserToToggleBan(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation(userToDelete.id).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-20 px-1 sm:px-0">
        
        {/* 🌟 1. Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
              <Users size={14} />
              User Directory Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-ink tracking-tight">
              User Accounts & Management
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-medium">
              Manage registered students, tutors, coaching centers, and guardians across the platform.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-ink rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-95"
            title="Refresh Users List"
          >
            <RefreshCw size={15} className={cn(isFetching && "animate-spin text-primary")} />
            <span>Sync Users</span>
          </button>
        </div>

        {/* 📊 2. KPI Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { label: 'All Accounts', count: roleCounts.total, role: 'All', icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-200/60' },
            { label: 'Students', count: roleCounts.student, role: 'student', icon: GraduationCap, color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' },
            { label: 'Tutors', count: roleCounts.tutor, role: 'tutor', icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60' },
            { label: 'Coaching Centers', count: roleCounts.coaching, role: 'coaching', icon: Building2, color: 'text-cyan-600 bg-cyan-50 border-cyan-200/60', badge: roleCounts.pendingCoaching > 0 ? `${roleCounts.pendingCoaching} Pending` : null },
            { label: 'Guardians', count: roleCounts.guardian, role: 'guardian', icon: Users, color: 'text-amber-600 bg-amber-50 border-amber-200/60' },
            { label: 'Staff Members', count: roleCounts.staff, role: 'staff', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 border-purple-200/60' },
          ].map((card) => {
            const isSelected = roleFilter === card.role;
            return (
              <motion.div
                key={card.label}
                whileHover={{ y: -3 }}
                onClick={() => {
                  setRoleFilter(card.role as any);
                  setCurrentPage(1);
                }}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden",
                  isSelected
                    ? "bg-white ring-2 ring-primary border-primary shadow-lg shadow-primary/10"
                    : "bg-white/80 hover:bg-white border-white/60 shadow-sm"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", card.color)}>
                    <card.icon size={16} />
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[9px] font-black animate-pulse">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider truncate">{card.label}</p>
                  <p className="text-xl font-display font-black text-ink tabular-nums">{card.count}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 🔍 3. Filter, Search & Status Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-[28px] border border-white/60 shadow-lg shadow-ink/5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, phone number or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-gray-50/80 focus:bg-white border border-ink/10 focus:border-primary/30 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-ink focus:outline-none transition-all placeholder:text-ink-muted/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-ink-muted hover:text-ink"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 bg-gray-50/80 border border-ink/10 rounded-2xl px-3 py-2 text-xs">
                <Filter size={14} className="text-ink-muted" />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer text-xs"
                >
                  <option value="All">All Roles</option>
                  <option value="student">Students</option>
                  <option value="tutor">Tutors</option>
                  <option value="coaching">Coaching Centers</option>
                  <option value="guardian">Guardians</option>
                  <option value="staff">Staff (Admins)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-50/80 border border-ink/10 rounded-2xl px-3 py-2 text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="blocked">Blocked Only</option>
                  <option value="pending_coaching">Pending Coaching Approval</option>
                </select>
              </div>

              <div className="px-3 py-2 bg-primary/10 text-primary font-black rounded-2xl text-xs shrink-0">
                {filteredUsers.length} Result{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>

          </div>
        </div>

        {/* 📋 4. Main Users Table (Desktop View) */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">User Profile</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Contact Info</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Account Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Approval State</th>
                  <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, index) => {
                      const isStaff = ['super_admin', 'admin', 'moderator'].includes(user.role);
                      const isCoaching = user.role === 'coaching';
                      const isBlocked = user.status === 'blocked';

                      return (
                        <motion.tr 
                          key={user.id || index}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group hover:bg-blue-50/30 transition-colors"
                        >
                          {/* Serial */}
                          <td className="px-6 py-4 text-xs font-bold text-ink-muted">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>

                          {/* Profile */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0">
                                <img
                                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email || 'user')}`}
                                  alt={user.name || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-ink truncate max-w-[180px]">{user.name || 'Unnamed User'}</span>
                                  {user.isVerified && (
                                    <span title="Email Verified" className="text-emerald-500">
                                      <CheckCircle2 size={13} />
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-ink-muted/80 block truncate">
                                  ID: {user.id?.slice(-8) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border",
                              user.role === 'super_admin' ? "bg-amber-100 text-amber-800 border-amber-200" :
                              user.role === 'admin' ? "bg-purple-100 text-purple-800 border-purple-200" :
                              user.role === 'moderator' ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
                              user.role === 'tutor' ? "bg-blue-100 text-blue-800 border-blue-200" : 
                              user.role === 'coaching' ? "bg-cyan-100 text-cyan-800 border-cyan-200" :
                              user.role === 'guardian' ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                              "bg-orange-100 text-orange-800 border-orange-200"
                            )}>
                              {user.role === 'super_admin' ? '👑 Super Admin' :
                               user.role === 'admin' ? '🛡️ Admin' :
                               user.role === 'moderator' ? '⚖️ Moderator' :
                               user.role === 'tutor' ? '👨‍🏫 Tutor' :
                               user.role === 'coaching' ? '🏢 Coaching' :
                               user.role === 'guardian' ? '👨‍👩‍👧 Guardian' : '🎓 Student'}
                            </span>
                          </td>

                          {/* Contact Info */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-ink truncate max-w-[200px]">
                                <Mail size={12} className="text-ink-muted shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              {user.phone && user.phone !== 'N/A' && (
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
                                  <Phone size={11} className="shrink-0" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Account Status (Active/Blocked) */}
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 border",
                              isBlocked 
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            )}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", isBlocked ? "bg-rose-500" : "bg-emerald-500 animate-pulse")} />
                              {isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>

                          {/* Approval State (ONLY for Coaching Center) */}
                          <td className="px-6 py-4">
                            {isCoaching ? (
                              user.isApproved ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 size={12} />
                                  Approved
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                    <Clock3 size={12} />
                                    Pending Approval
                                  </span>
                                  <button
                                    onClick={() => handleApproveCoaching(user.id, true)}
                                    disabled={isApproving}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-xs active:scale-95"
                                  >
                                    Approve
                                  </button>
                                </div>
                              )
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 bg-gray-100 text-gray-700 border border-gray-200/80">
                                <Check size={11} className="text-emerald-600" />
                                Auto-Active
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inspect Profile */}
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-primary/10 text-ink-muted hover:text-primary transition-all active:scale-95 cursor-pointer"
                                title="View Full Profile"
                              >
                                <Eye size={15} />
                              </button>

                              {/* Ban / Unban Toggle */}
                              {!isStaff && (
                                <button
                                  onClick={() => setUserToToggleBan(user)}
                                  className={cn(
                                    "p-2 rounded-xl transition-all active:scale-95 cursor-pointer",
                                    isBlocked
                                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                      : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                                  )}
                                  title={isBlocked ? 'Unblock User' : 'Block User'}
                                >
                                  {isBlocked ? <Unlock size={15} /> : <Ban size={15} />}
                                </button>
                              )}

                              {/* Delete User */}
                              {!isStaff && (
                                <button
                                  onClick={() => setUserToDelete(user)}
                                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all active:scale-95 cursor-pointer"
                                  title="Delete User"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-ink-muted font-bold">
                        No users found matching your search and filter criteria.
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
          {paginatedUsers.map((user, index) => {
            const isStaff = ['super_admin', 'admin', 'moderator'].includes(user.role);
            const isCoaching = user.role === 'coaching';
            const isBlocked = user.status === 'blocked';

            return (
              <div 
                key={user.id || index}
                className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email || 'user')}`}
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-ink leading-tight">{user.name || 'Unnamed User'}</h4>
                      <p className="text-xs text-ink-muted truncate">{user.email}</p>
                      <p className="text-[10px] text-ink-muted/70 font-mono">ID: {user.id?.slice(-8)}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shrink-0 border",
                    user.role === 'tutor' ? "bg-blue-100 text-blue-800 border-blue-200" :
                    user.role === 'coaching' ? "bg-cyan-100 text-cyan-800 border-cyan-200" :
                    "bg-emerald-100 text-emerald-800 border-emerald-200"
                  )}>
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-ink/5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                      isBlocked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {isBlocked ? 'Blocked' : 'Active'}
                    </span>

                    {isCoaching && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                        user.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1.5 bg-gray-100 text-ink rounded-xl text-xs font-bold"
                    >
                      Details
                    </button>
                    {isCoaching && !user.isApproved && (
                      <button
                        onClick={() => handleApproveCoaching(user.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🔢 6. Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm">
            <p className="text-xs font-bold text-ink-muted">
              Showing page <span className="text-ink font-black">{currentPage}</span> of <span className="text-ink font-black">{totalPages}</span> ({filteredUsers.length} total users)
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

        {/* 🔍 7. User Profile Details Slide-over / Modal */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[36px] shadow-2xl border border-white/40 max-w-lg w-full p-6 sm:p-8 z-10 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between border-b border-ink/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0 shadow-md">
                      <img
                        src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.name || 'user')}`}
                        alt={selectedUser.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-ink">{selectedUser.name || 'Unnamed User'}</h3>
                      <p className="text-xs text-primary font-bold">{selectedUser.email}</p>
                      <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 bg-gray-100 rounded-md text-ink-muted">
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-ink-muted"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Phone Number</p>
                      <p className="font-black text-ink">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Joined Date</p>
                      <p className="font-black text-ink">{selectedUser.createdAtFormatted}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Account Status</p>
                      <p className={cn("font-black capitalize", selectedUser.status === 'blocked' ? "text-rose-600" : "text-emerald-600")}>
                        {selectedUser.status}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Email Verified</p>
                      <p className="font-black text-emerald-600 flex items-center gap-1">
                        {selectedUser.isVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} className="text-rose-500" />}
                        {selectedUser.isVerified ? 'Verified' : 'Pending OTP'}
                      </p>
                    </div>
                  </div>

                  {selectedUser.role === 'coaching' && (
                    <div className="p-4 bg-cyan-50/60 border border-cyan-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-900">Coaching Center Approval</span>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase",
                          selectedUser.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        )}>
                          {selectedUser.isApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                      {!selectedUser.isApproved && (
                        <button
                          onClick={() => {
                            handleApproveCoaching(selectedUser.id, true);
                            setSelectedUser((prev: any) => ({ ...prev, isApproved: true }));
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                        >
                          Approve Coaching Center Access
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-ink-muted uppercase">Database User ID</p>
                    <div className="flex items-center justify-between">
                      <code className="text-[11px] font-mono text-ink select-all">{selectedUser.id}</code>
                      <button
                        onClick={() => copyToClipboard(selectedUser.id, 'modal_id')}
                        className="text-primary hover:underline text-[11px] font-bold flex items-center gap-1"
                      >
                        {copiedField === 'modal_id' ? <Check size={12} /> : <Copy size={12} />}
                        {copiedField === 'modal_id' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-ink/5">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ⚠️ 8. Ban/Block Confirmation Modal */}
        <AnimatePresence>
          {userToToggleBan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setUserToToggleBan(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl p-6 max-w-sm w-full z-10 space-y-4 shadow-2xl text-center"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl mx-auto flex items-center justify-center",
                  userToToggleBan.status === 'blocked' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                )}>
                  {userToToggleBan.status === 'blocked' ? <Unlock size={22} /> : <Ban size={22} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-ink">
                    {userToToggleBan.status === 'blocked' ? 'Unblock User Account?' : 'Block User Account?'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-1">
                    {userToToggleBan.status === 'blocked' 
                      ? `User "${userToToggleBan.name}" will regain full access to their dashboard.`
                      : `User "${userToToggleBan.name}" will be blocked from logging in until unblocked.`}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setUserToToggleBan(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-ink rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={isUpdatingStatus}
                    className={cn(
                      "flex-1 py-2.5 text-white rounded-xl text-xs font-black uppercase",
                      userToToggleBan.status === 'blocked' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                    )}
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 🗑️ 9. Delete Confirmation Modal */}
        <AnimatePresence>
          {userToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setUserToDelete(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl p-6 max-w-sm w-full z-10 space-y-4 shadow-2xl text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-black text-ink">Permanently Delete User?</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Are you sure you want to delete <span className="font-bold text-ink">"{userToDelete.name}"</span>? This action is permanent and cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="flex-1 py-2.5 bg-gray-100 text-ink rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase"
                  >
                    Delete
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
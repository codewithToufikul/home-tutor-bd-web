import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Ban, Trash2, ShieldCheck, UserCheck, Users, 
  Filter, ChevronLeft, ChevronRight, AlertCircle, Clock3, 
  CheckCircle2, XCircle, Eye, Mail, Phone, Calendar, 
  MapPin, Sparkles, Building2, GraduationCap, Copy, Check,
  X, RefreshCw, AlertTriangle, Shield, User, Lock, Unlock,
  ExternalLink, FileText, Star, Briefcase, Award, ArrowRight
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { 
  useGetAdminUsersQuery, 
  useApproveTutorMutation, 
  useUpdateUserStatusMutation, 
  useDeleteUserMutation 
} from '@/src/services/adminApi';
import { Link } from 'react-router-dom';

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
      lastLoginFormatted: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never logged in',
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
      if (selectedUser && selectedUser.id === userToToggleBan.id) {
        setSelectedUser((prev: any) => ({ ...prev, status: nextStatus }));
      }
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
      if (selectedUser && selectedUser.id === userToDelete.id) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setUserToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-3 sm:space-y-8 max-w-7xl mx-auto pb-28 px-0 sm:px-0">
        
        {/* 🌟 1. Top Header Banner */}
        <div className="flex items-center justify-between gap-3 bg-white/70 backdrop-blur-xl p-4 sm:p-8 rounded-2xl sm:rounded-[32px] border border-white/60 shadow-sm sm:shadow-xl shadow-ink/5">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Users size={12} />
              User Directory Hub
            </div>
            <h1 className="text-lg sm:text-3xl font-display font-black text-ink leading-tight">
              All Registered Users & Accounts
            </h1>
            <p className="text-[11px] sm:text-sm text-ink-muted line-clamp-2">
              প্ল্যাটফর্মের সকল টিউটর, শিক্ষার্থী, অভিভাবক ও কোচিং সেন্টারের তথ্য দেখুন এবং পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2.5 sm:p-3 bg-white hover:bg-gray-50 border border-ink/10 rounded-xl sm:rounded-2xl text-ink-muted hover:text-primary transition-all shadow-xs active:scale-95 cursor-pointer"
              title="Refresh Users List"
            >
              <RefreshCw size={16} className={cn(isFetching && "animate-spin text-primary")} />
            </button>
            <div className="bg-primary/10 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-primary/20 text-center">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-primary block">Total Users</span>
              <span className="text-sm sm:text-base font-black text-primary tabular-nums">{allUsers.length}</span>
            </div>
          </div>
        </div>

        {/* 📊 2. Quick KPI Statistics Cards */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {[
            { label: 'All Users', count: roleCounts.total, role: 'All', icon: Users, color: 'text-primary bg-primary/10' },
            { label: 'Tutors', count: roleCounts.tutor, role: 'tutor', icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
            { label: 'Students', count: roleCounts.student, role: 'student', icon: User, color: 'text-orange-600 bg-orange-50' },
            { label: 'Guardians', count: roleCounts.guardian, role: 'guardian', icon: UserCheck, color: 'text-emerald-600 bg-emerald-50' },
            { label: 'Coaching', count: roleCounts.coaching, role: 'coaching', icon: Building2, color: 'text-cyan-600 bg-cyan-50', badge: roleCounts.pendingCoaching ? `${roleCounts.pendingCoaching}` : null },
            { label: 'Staff', count: roleCounts.staff, role: 'staff', icon: Shield, color: 'text-purple-600 bg-purple-50' },
          ].map((card) => {
            const isSelected = roleFilter === card.role;
            const Icon = card.icon;

            return (
              <motion.div
                key={card.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setRoleFilter(card.role as any);
                  setCurrentPage(1);
                }}
                className={cn(
                  "p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 sm:gap-3 shadow-sm",
                  isSelected
                    ? "bg-white border-primary ring-2 ring-primary/20 shadow-md shadow-primary/5"
                    : "bg-white/60 hover:bg-white border-white/80 hover:border-ink/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center", card.color)}>
                    <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  {(card as any).badge && (
                    <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[8px] font-black animate-pulse">
                      {(card as any).badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-bold text-ink-muted uppercase tracking-wider truncate">{card.label}</p>
                  <p className="text-lg sm:text-xl font-display font-black text-ink tabular-nums">{card.count}</p>
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
                  className="absolute inset-y-0 right-3 flex items-center text-ink-muted hover:text-ink cursor-pointer"
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
                  <th className="px-4 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-center w-12">#</th>
                  <th className="px-5 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">User Profile</th>
                  <th className="px-4 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider">Contact Info</th>
                  <th className="px-4 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-center">Approval</th>
                  <th className="px-5 py-4 text-[10px] font-black text-ink-muted uppercase tracking-wider text-right">Actions</th>
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
                          className="group hover:bg-emerald-50/30 transition-colors"
                        >
                          {/* Serial */}
                          <td className="px-4 py-4 text-xs font-bold text-ink-muted text-center">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>

                          {/* Profile */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                onClick={() => setSelectedUser(user)}
                                className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
                              >
                                <img
                                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email || 'user')}`}
                                  alt={user.name || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="text-sm font-black text-ink hover:text-primary transition-colors truncate max-w-[160px] text-left cursor-pointer"
                                    title="Click to view details"
                                  >
                                    {user.name || 'Unnamed User'}
                                  </button>
                                  {user.isVerified && (
                                    <span title="Email Verified" className="text-emerald-500">
                                      <CheckCircle2 size={13} />
                                    </span>
                                  )}
                                  {/* Inline Quick Eye Icon Button */}
                                  <button
                                    onClick={() => setSelectedUser(user)}
                                    className="p-1 rounded-lg text-primary/80 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                                    title="View Full Profile Details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                </div>
                                <span className="text-[10px] font-mono text-ink-muted/80 block truncate">
                                  ID: {user.id?.slice(-8) || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-4 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 border whitespace-nowrap",
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
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-ink truncate max-w-[180px]">
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
                          <td className="px-4 py-4 text-center">
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

                          {/* Approval State */}
                          <td className="px-4 py-4 text-center">
                            {isCoaching ? (
                              user.isApproved ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 size={12} />
                                  Approved
                                </span>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                    Pending
                                  </span>
                                  <button
                                    onClick={() => handleApproveCoaching(user.id, true)}
                                    disabled={isApproving}
                                    className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer shadow-xs"
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

                          {/* Actions Column */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 👁️ Dedicated Eye Icon Button */}
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="px-2.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                                title="View Full User Details"
                              >
                                <Eye size={15} />
                                <span className="text-[11px] hidden xl:inline">Details</span>
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
        <div className="flex flex-col gap-2 md:hidden">
          {paginatedUsers.length === 0 && (
            <div className="py-12 text-center text-xs text-ink-muted font-bold bg-white/80 rounded-2xl border border-white/60">
              No users match your search/filter criteria.
            </div>
          )}
          {paginatedUsers.map((user, index) => {
            const isStaff = ['super_admin', 'admin', 'moderator'].includes(user.role);
            const isBlocked = user.status === 'blocked';
            const isCoaching = user.role === 'coaching';

            return (
              <div 
                key={user.id || index}
                className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/70 shadow-sm overflow-hidden"
              >
                {/* Card Top: Avatar + Name + Role + Status */}
                <div className="p-3.5 flex items-center gap-3">
                  <div 
                    onClick={() => setSelectedUser(user)}
                    className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-ink/10 shrink-0 cursor-pointer"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || user.email || 'user')}`}
                      alt={user.name || 'User'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 
                        onClick={() => setSelectedUser(user)}
                        className="text-sm font-black text-ink leading-tight cursor-pointer hover:text-primary transition-colors truncate"
                      >
                        {user.name || 'Unnamed User'}
                      </h4>
                      {user.isVerified && (
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border",
                        user.role === 'tutor' ? "bg-blue-100 text-blue-800 border-blue-200" :
                        user.role === 'coaching' ? "bg-cyan-100 text-cyan-800 border-cyan-200" :
                        user.role === 'guardian' ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        user.role === 'student' ? "bg-orange-100 text-orange-800 border-orange-200" :
                        "bg-purple-100 text-purple-800 border-purple-200"
                      )}>
                        {user.role === 'super_admin' ? '👑 SAdmin' :
                         user.role === 'admin' ? '🛡️ Admin' :
                         user.role === 'tutor' ? '👨‍🏫 Tutor' :
                         user.role === 'coaching' ? '🏢 Coaching' :
                         user.role === 'guardian' ? '👨‍👩‍👧 Guardian' : '🎓 Student'}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase flex items-center gap-0.5",
                        isBlocked ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", isBlocked ? "bg-rose-500" : "bg-emerald-500 animate-pulse")} />
                        {isBlocked ? 'Blocked' : 'Active'}
                      </span>
                      {isCoaching && !user.isApproved && (
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick View Button */}
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="p-2.5 rounded-xl bg-primary/10 text-primary transition-all cursor-pointer shrink-0 active:scale-90"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </div>

                {/* Card Bottom: Action Row */}
                <div className="flex items-center gap-0 border-t border-ink/5">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="flex-1 py-2.5 text-primary font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-primary/5 transition-colors"
                  >
                    <Eye size={13} />
                    <span>Full Details</span>
                  </button>

                  {!isStaff && (
                    <>
                      <div className="w-px h-8 bg-ink/5" />
                      <button
                        onClick={() => setUserToToggleBan(user)}
                        className={cn(
                          "flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-opacity-60 transition-colors",
                          isBlocked ? "text-emerald-600 hover:bg-emerald-50" : "text-amber-600 hover:bg-amber-50"
                        )}
                      >
                        {isBlocked ? <Unlock size={13} /> : <Ban size={13} />}
                        <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                      </button>
                      <div className="w-px h-8 bg-ink/5" />
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="flex-1 py-2.5 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 📑 6. Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/60 shadow-sm">
            <p className="text-[11px] sm:text-xs font-bold text-ink-muted">
              Page <span className="text-ink font-black">{currentPage}</span>/<span className="text-ink font-black">{totalPages}</span>
              <span className="hidden sm:inline"> · {filteredUsers.length} users</span>
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft size={15} />
              </button>
              <div className="text-xs font-black px-2 tabular-nums">{currentPage}</div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* 🔍 7. RICH USER PROFILE DETAILS MODAL */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedUser(null)}
                className="fixed inset-0 bg-ink/50 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white rounded-[32px] shadow-2xl border border-white/40 max-w-2xl w-full p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-ink/5 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border-2 border-primary/20 shrink-0 shadow-md">
                      <img
                        src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedUser.name || 'user')}`}
                        alt={selectedUser.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-black text-ink">{selectedUser.name || 'Unnamed User'}</h3>
                        {selectedUser.isVerified && (
                          <span className="text-emerald-500" title="Email Verified">
                            <CheckCircle2 size={16} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-primary font-bold">{selectedUser.email}</p>
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] uppercase tracking-wider font-black px-2.5 py-0.5 bg-primary/10 text-primary rounded-md border border-primary/20">
                          {selectedUser.role}
                        </span>
                        <span className={cn(
                          "text-[10px] uppercase font-black px-2.5 py-0.5 rounded-md border",
                          selectedUser.status === 'blocked'
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        )}>
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-ink-muted transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Basic Account Info Grid (3-column: Phone, Joined, Last Login) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-ink-muted uppercase flex items-center gap-1">
                      <Phone size={11} /> Phone Number
                    </p>
                    <p className="font-black text-ink truncate">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-ink-muted uppercase flex items-center gap-1">
                      <Calendar size={11} /> Joined Date
                    </p>
                    <p className="font-black text-ink">{selectedUser.createdAtFormatted}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                    <p className="text-[10px] font-bold text-ink-muted uppercase flex items-center gap-1">
                      <Clock3 size={11} /> Last Login
                    </p>
                    <p className="font-black text-ink truncate">{selectedUser.lastLoginFormatted}</p>
                  </div>
                </div>

                {/* 👨‍🏫 ROLE SPECIFIC: TUTOR DETAILS */}
                {selectedUser.role === 'tutor' && (
                  <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-blue-100/60 pb-3">
                      <div className="flex items-center gap-2 text-blue-900 font-black text-xs uppercase tracking-wider">
                        <GraduationCap size={16} className="text-blue-600" />
                        <span>Tutor Educational & Teaching Profile</span>
                      </div>
                      <Link
                        to={`/tutor/${selectedUser.id}`}
                        target="_blank"
                        className="text-xs font-bold text-blue-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Public Profile</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">University / Institute</span>
                        <span className="font-bold text-ink">{selectedUser.university || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Department / Major</span>
                        <span className="font-bold text-ink">{selectedUser.department || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Qualification / Degree</span>
                        <span className="font-bold text-ink">{selectedUser.qualification || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Experience</span>
                        <span className="font-bold text-ink">{selectedUser.experience || 'Fresher'}</span>
                      </div>
                    </div>

                    {/* Subjects */}
                    {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-blue-100/60">
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Preferred Subjects</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.subjects.map((sub: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-white text-blue-800 text-[11px] font-bold rounded-xl border border-blue-200">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mediums */}
                    {selectedUser.mediums && selectedUser.mediums.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Mediums</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedUser.mediums.map((med: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-white text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200">
                              {med}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 🏢 ROLE SPECIFIC: COACHING CENTER DETAILS */}
                {selectedUser.role === 'coaching' && (
                  <div className="p-5 bg-cyan-50/50 border border-cyan-100 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-cyan-100/60 pb-3">
                      <div className="flex items-center gap-2 text-cyan-900 font-black text-xs uppercase tracking-wider">
                        <Building2 size={16} className="text-cyan-600" />
                        <span>Coaching Center Profile</span>
                      </div>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border",
                        selectedUser.isApproved ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                      )}>
                        {selectedUser.isApproved ? 'Approved & Active' : 'Pending Approval'}
                      </span>
                    </div>

                    {/* 📄 Trade License / Registration Number */}
                    <div className="p-4 bg-white rounded-2xl border border-cyan-200/80 shadow-xs space-y-1">
                      <span className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={13} className="text-cyan-600" />
                        Trade License / Registration Number
                      </span>
                      <p className="text-sm font-black text-ink font-mono select-all">
                        {selectedUser.tradeLicense || selectedUser.coachingProfile?.tradeLicense || 'Not provided'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-white/70 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Institute Name</span>
                        <span className="font-bold text-ink">{selectedUser.instituteName || selectedUser.name || 'N/A'}</span>
                      </div>
                      <div className="p-3 bg-white/70 rounded-2xl space-y-0.5">
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">District / Location</span>
                        <span className="font-bold text-ink">{selectedUser.district || selectedUser.location || 'Dhaka'}</span>
                      </div>
                    </div>

                    {!selectedUser.isApproved && (
                      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-amber-900">অ্যাকাউন্ট ব্যবহারের জন্য অনুমোদন দিন:</span>
                        <button
                          onClick={() => {
                            handleApproveCoaching(selectedUser.id, true);
                            setSelectedUser((prev: any) => ({ ...prev, isApproved: true }));
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase cursor-pointer shadow-xs"
                        >
                          Approve Now
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 🎓 ROLE SPECIFIC: STUDENT / GUARDIAN */}
                {(selectedUser.role === 'student' || selectedUser.role === 'guardian') && (
                  <div className="p-5 bg-orange-50/40 border border-orange-100 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-orange-900 font-black text-xs uppercase tracking-wider border-b border-orange-100/60 pb-2">
                      <User size={16} className="text-orange-600" />
                      <span>{selectedUser.role === 'guardian' ? 'Guardian Information' : 'Student Academic Information'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Class / Grade</span>
                        <span className="font-bold text-ink">{selectedUser.studentClass || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Medium</span>
                        <span className="font-bold text-ink">{selectedUser.medium || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Institution</span>
                        <span className="font-bold text-ink">{selectedUser.institution || 'Not specified'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink-muted uppercase block">Emergency Phone</span>
                        <span className="font-bold text-ink">{selectedUser.emergencyContact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Controls Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink/5">
                  <div className="flex items-center gap-2">
                    {!['super_admin', 'admin', 'moderator'].includes(selectedUser.role) && (
                      <button
                        onClick={() => {
                          setUserToToggleBan(selectedUser);
                        }}
                        className={cn(
                          "px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer",
                          selectedUser.status === 'blocked'
                            ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-700"
                        )}
                      >
                        {selectedUser.status === 'blocked' ? <Unlock size={14} /> : <Ban size={14} />}
                        <span>{selectedUser.status === 'blocked' ? 'Unblock User' : 'Block User'}</span>
                      </button>
                    )}

                    {!['super_admin', 'admin', 'moderator'].includes(selectedUser.role) && (
                      <button
                        onClick={() => {
                          setUserToDelete(selectedUser);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Delete User</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedUser(null)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleStatus}
                    disabled={isUpdatingStatus}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer",
                      userToToggleBan.status === 'blocked' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                    )}
                  >
                    {isUpdatingStatus ? 'Updating...' : (userToToggleBan.status === 'blocked' ? 'Confirm Unblock' : 'Confirm Block')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 🚨 9. Delete Confirmation Modal */}
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
                <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center bg-rose-100 text-rose-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-base font-black text-ink">Delete User Account?</h3>
                  <p className="text-xs text-ink-muted mt-1">
                    Are you sure you want to delete <strong className="text-ink">{userToDelete.name}</strong>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setUserToDelete(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
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
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, UserPlus, Search, Trash2, Ban, CheckCircle2, 
  XCircle, Copy, Check, Eye, EyeOff, Key, Shield, User, 
  Phone, Mail, Calendar, Sparkles, Filter, AlertTriangle, 
  Loader2, RefreshCw, Lock, Unlock
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { 
  useGetStaffQuery, 
  useCreateStaffMutation, 
  useUpdateStaffStatusMutation, 
  useUpdateStaffPermissionsMutation, 
  useDeleteStaffMutation 
} from '@/src/services/adminApi.ts';

const PERMISSION_OPTIONS = [
  { id: 'manage_jobs', label: 'টিউশন জব পরিচালনা (Jobs)', desc: 'জব দেখা, এডিট ও ওপেন/ক্লোজ করা' },
  { id: 'manage_tutors', label: 'টিউটর ভেরিফিকেশন (Tutors)', desc: 'টিউটর প্রোফাইল ও ডকুমেন্টস রিভিউ' },
  { id: 'manage_blogs', label: 'ব্লগ ও নোটিশ (Blogs & Notices)', desc: 'নতুন ব্লগ বা জরুরি নোটিশ পোস্ট করা' },
  { id: 'support_inbox', label: 'ইনবক্স সাপোর্ট (Inbox Support)', desc: 'ব্যবহারকারীদের মেসেজ ও ইনকোয়ারি উত্তর' },
  { id: 'view_payments', label: 'পেমেন্ট নজরদারি (Payments View)', desc: 'প্ল্যাটফর্ম পেমেন্ট তালিকা দেখা' },
];

export default function AdminStaffManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator' | 'super_admin'>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any | null>(null);
  const [staffToEditPermissions, setStaffToEditPermissions] = useState<any | null>(null);
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string;
    username: string;
    email: string;
    password: string;
    role: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form State for Add Staff
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<'admin' | 'moderator'>('admin');
  const [formPermissions, setFormPermissions] = useState<string[]>(['manage_jobs', 'manage_tutors']);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // RTK Query Hooks
  const { data: staffData, isLoading, refetch } = useGetStaffQuery(undefined);
  const [createStaffMutation, { isLoading: isCreating }] = useCreateStaffMutation();
  const [updateStaffStatusMutation, { isLoading: isUpdatingStatus }] = useUpdateStaffStatusMutation();
  const [updateStaffPermissionsMutation, { isLoading: isUpdatingPermissions }] = useUpdateStaffPermissionsMutation();
  const [deleteStaffMutation, { isLoading: isDeleting }] = useDeleteStaffMutation();

  // Normalize staff list
  const staffList: any[] = useMemo(() => {
    const raw = (staffData as any)?.data ?? staffData ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((s: any) => ({
      ...s,
      id: s._id || s.id,
      username: s.username || `${s.role === 'admin' ? 'adm' : (s.role === 'moderator' ? 'mod' : 'super')}_${(s.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${String(s._id || '').slice(-4)}`,
      avatar: s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name || s.email)}`,
      createdAtFormatted: s.createdAt ? new Date(s.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }) : 'সম্প্রতি',
      status: s.status || 'active',
      permissions: Array.isArray(s.permissions) ? s.permissions : [],
    }));
  }, [staffData]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: staffList.length,
      superAdmins: staffList.filter(s => s.role === 'super_admin').length,
      admins: staffList.filter(s => s.role === 'admin').length,
      moderators: staffList.filter(s => s.role === 'moderator').length,
      banned: staffList.filter(s => s.status === 'blocked').length,
    };
  }, [staffList]);

  // Live Auto Username Preview
  const previewUsername = useMemo(() => {
    const prefix = formRole === 'admin' ? 'adm' : 'mod';
    const clean = formName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'user';
    return `${prefix}_${clean}_xxxx`;
  }, [formName, formRole]);

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        staff.name.toLowerCase().includes(q) ||
        staff.username.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        (staff.phone || '').toLowerCase().includes(q);

      const matchesRole = roleFilter === 'all' || staff.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [staffList, searchQuery, roleFilter]);

  // Generate Random Password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pwd);
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Handle Create Staff Submit
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim()) {
      setFormError('কর্মীর পূর্ণ নাম প্রদান করুন।');
      return;
    }
    if (!formEmail.trim() || !formEmail.includes('@')) {
      setFormError('সঠিক ইমেইল এড্রেস প্রদান করুন।');
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      setFormError('কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    try {
      const res: any = await createStaffMutation({
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        role: formRole,
        password: formPassword,
        permissions: formRole === 'admin' ? ['all'] : formPermissions,
      }).unwrap();

      const created = res?.data || res;
      setCreatedCredentials({
        name: formName,
        username: created.username || previewUsername,
        email: formEmail,
        password: formPassword,
        role: formRole === 'admin' ? 'Admin (এডমিন)' : 'Moderator (মডারেটর)',
      });

      // Reset form
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormPassword('');
      setIsAddModalOpen(false);
      refetch();
    } catch (err: any) {
      setFormError(err?.data?.message || 'কর্মী যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  // Toggle Ban / Unban
  const handleToggleBan = async (staff: any) => {
    if (staff.role === 'super_admin') return;
    const nextStatus = staff.status === 'blocked' ? 'active' : 'blocked';
    try {
      await updateStaffStatusMutation({ id: staff.id, status: nextStatus }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    try {
      await deleteStaffMutation(staffToDelete.id).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to delete staff:', err);
    } finally {
      setStaffToDelete(null);
    }
  };

  // Save Updated Permissions
  const handleSavePermissions = async () => {
    if (!staffToEditPermissions) return;
    try {
      await updateStaffPermissionsMutation({
        id: staffToEditPermissions.id,
        permissions: staffToEditPermissions.permissions,
      }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to save permissions:', err);
    } finally {
      setStaffToEditPermissions(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-24">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/5">
                <ShieldCheck size={26} />
              </div>
              Super Admin: Staff & Role Management
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              প্ল্যাটফর্মের জন্য নতুন Admin এবং Moderator যুক্ত করুন, তাদের স্বয়ংক্রিয় ইউনিক ইউজারনেম তৈরি করুন ও পারমিশন পরিচালনা করুন।
            </p>
          </div>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              handleGeneratePassword();
            }}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <UserPlus size={16} />
            Add Admin / Moderator
          </button>
        </div>

        {/* 📊 Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Staff */}
          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4">
            <div className="w-13 h-13 bg-indigo-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-500/20">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">সর্বমোট কর্মী</p>
              <p className="text-2xl font-black text-ink">{stats.total} জন</p>
            </div>
          </div>

          {/* Admins */}
          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4">
            <div className="w-13 h-13 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-500/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">এডমিন (Admins)</p>
              <p className="text-2xl font-black text-blue-600">{stats.admins} জন</p>
            </div>
          </div>

          {/* Moderators */}
          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4">
            <div className="w-13 h-13 bg-purple-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-purple-500/20">
              <User size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">মডারেটর (Moderators)</p>
              <p className="text-2xl font-black text-purple-600">{stats.moderators} জন</p>
            </div>
          </div>

          {/* Banned Staff */}
          <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-4">
            <div className="w-13 h-13 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-rose-500/20">
              <Ban size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-ink-muted uppercase">স্থগিত/ব্লকড কর্মী</p>
              <p className="text-2xl font-black text-rose-600">{stats.banned} জন</p>
            </div>
          </div>
        </div>

        {/* 🎛️ Search & Filter Bar */}
        <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide">
            {[
              { label: 'সব স্টাফ (All)', value: 'all', count: stats.total },
              { label: '👑 Super Admin', value: 'super_admin', count: stats.superAdmins },
              { label: '🛡️ Admin', value: 'admin', count: stats.admins },
              { label: '⚖️ Moderator', value: 'moderator', count: stats.moderators },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setRoleFilter(tab.value as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
                  roleFilter === tab.value
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px]",
                  roleFilter === tab.value ? "bg-amber-100 text-amber-800 font-black" : "bg-ink/5 text-ink-muted"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
            <input
              type="text"
              placeholder="Search by Name, Username, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-2xl border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-amber-400 outline-none transition-all shadow-xs"
            />
          </div>
        </div>

        {/* 📋 Staff Table */}
        {isLoading ? (
          <div className="py-24 text-center space-y-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[32px]">
            <Loader2 className="animate-spin text-amber-500 mx-auto" size={36} />
            <p className="text-xs font-bold text-ink-muted">স্টাফ তালিকা লোড হচ্ছে...</p>
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5 bg-gray-50/50 text-[11px] font-black uppercase text-ink-muted tracking-wider">
                    <th className="py-4 px-6">স্টাফ প্রোফাইল ও নাম</th>
                    <th className="py-4 px-6">ইউনিক ইউজারনেম (Username)</th>
                    <th className="py-4 px-6">রোল (Role)</th>
                    <th className="py-4 px-6">যোগাযোগ (Email & Phone)</th>
                    <th className="py-4 px-6">স্ট্যাটাস</th>
                    <th className="py-4 px-6 text-right">অ্যাকশন (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 text-xs">
                  {filteredStaff.map((staff) => {
                    const isSuper = staff.role === 'super_admin';
                    const isBanned = staff.status === 'blocked';

                    return (
                      <tr key={staff.id} className="hover:bg-amber-50/20 transition-all">
                        {/* 1. Profile & Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={staff.avatar}
                              alt={staff.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-ink/10 shadow-xs"
                            />
                            <div>
                              <p className="font-black text-ink text-sm flex items-center gap-1.5">
                                {staff.name}
                                {isSuper && <span title="Platform Owner">👑</span>}
                              </p>
                              <span className="text-[10px] text-ink-muted flex items-center gap-1">
                                <Calendar size={11} /> {staff.createdAtFormatted}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Unique Username Badge with Copy */}
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100/90 rounded-xl border border-ink/5">
                            <span className="font-mono font-bold text-ink text-xs">@{staff.username}</span>
                            <button
                              onClick={() => copyToClipboard(staff.username, `uname-${staff.id}`)}
                              className="text-ink-muted hover:text-amber-600 transition-all cursor-pointer"
                              title="Copy Username"
                            >
                              {copiedField === `uname-${staff.id}` ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 3. Role Badge */}
                        <td className="py-4 px-6">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                            isSuper
                              ? "bg-amber-100 text-amber-900 border-amber-300"
                              : staff.role === 'admin'
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-purple-100 text-purple-800 border-purple-200"
                          )}>
                            {isSuper ? '👑 Super Admin' : staff.role === 'admin' ? '🛡️ Admin' : '⚖️ Moderator'}
                          </span>
                        </td>

                        {/* 4. Contact Details */}
                        <td className="py-4 px-6 space-y-0.5">
                          <div className="flex items-center gap-1.5 text-ink font-medium">
                            <Mail size={12} className="text-blue-600 shrink-0" />
                            <span className="truncate max-w-[180px]">{staff.email}</span>
                          </div>
                          {staff.phone && (
                            <div className="flex items-center gap-1.5 text-ink-muted">
                              <Phone size={12} className="text-emerald-600 shrink-0" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                        </td>

                        {/* 5. Status Badge */}
                        <td className="py-4 px-6">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            isBanned
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-800"
                          )}>
                            {isBanned ? '● Banned' : '● Active'}
                          </span>
                        </td>

                        {/* 6. Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          {isSuper ? (
                            <span className="text-[11px] font-bold text-ink-muted italic">Protected (Owner)</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Permissions for Moderator */}
                              {staff.role === 'moderator' && (
                                <button
                                  onClick={() => setStaffToEditPermissions(staff)}
                                  className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all cursor-pointer"
                                  title="Edit Moderator Permissions"
                                >
                                  <Key size={14} />
                                </button>
                              )}

                              {/* Ban / Unban Toggle */}
                              <button
                                onClick={() => handleToggleBan(staff)}
                                className={cn(
                                  "p-2 rounded-xl border transition-all cursor-pointer",
                                  isBanned
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                )}
                                title={isBanned ? 'Unban Staff Account' : 'Ban / Suspend Staff'}
                              >
                                {isBanned ? <Unlock size={14} /> : <Ban size={14} />}
                              </button>

                              {/* Delete Staff */}
                              <button
                                onClick={() => setStaffToDelete(staff)}
                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
                                title="Delete Staff Account"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-16 bg-white/60 backdrop-blur-xl rounded-[36px] border border-white/40 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-display font-black text-ink">কোনো স্টাফ পাওয়া যায়নি</h3>
              <p className="text-xs font-medium text-ink-muted">
                আপনার দেওয়া সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো কর্মী নেই।
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ➕ Modal: Add New Staff Member (Admin / Moderator) */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[36px] shadow-2xl max-w-lg w-full p-7 space-y-5 my-8"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-ink flex items-center gap-2">
                    <UserPlus size={20} className="text-amber-600" />
                    নতুন কর্মী যুক্ত করুন (Add Staff)
                  </h3>
                  <p className="text-xs font-medium text-ink-muted">
                    সিস্টেম স্বয়ংক্রিয়ভাবে একটি ইউনিক ইউজারনেম তৈরি করে দেবে।
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-ink transition-all cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-bold flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateStaff} className="space-y-4">
                {/* 1. Role Selector Tabs */}
                <div>
                  <label className="text-[11px] font-black text-ink-muted uppercase block mb-1.5">কর্মীর পদবী (Role)</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFormRole('admin')}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2",
                        formRole === 'admin'
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <ShieldCheck size={16} /> 🛡️ Admin (এডমিন)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormRole('moderator')}
                      className={cn(
                        "py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2",
                        formRole === 'moderator'
                          ? "bg-white text-purple-700 shadow-sm"
                          : "text-ink-muted hover:text-ink"
                      )}
                    >
                      <User size={16} /> ⚖️ Moderator (মডারেটর)
                    </button>
                  </div>
                </div>

                {/* 2. Full Name */}
                <div>
                  <label className="text-[11px] font-black text-ink-muted uppercase block mb-1">পূর্ণ নাম (Full Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Tanvir Ahmed"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-ink/10 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* 3. Live Auto-Generated Unique Username Preview */}
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
                      <Sparkles size={12} /> Auto Unique Username Preview:
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-md">
                      সিস্টেম জেনারেটেড
                    </span>
                  </div>
                  <p className="font-mono font-black text-amber-900 text-sm">
                    @{previewUsername}
                  </p>
                  <p className="text-[10px] text-amber-800/80">
                    * ডাটাবেজে সাবমিট হলে র্যান্ডম ডিজিট দিয়ে শতভাগ ইউনিক নিশ্চিত করা হবে।
                  </p>
                </div>

                {/* 4. Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-black text-ink-muted uppercase block mb-1">ইমেইল এড্রেস</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@hometutor.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-ink/10 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-ink-muted uppercase block mb-1">মোবাইল নম্বর (ঐচ্ছিক)</label>
                    <input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-ink/10 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* 5. Password with Quick Generator */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-ink-muted uppercase">লগইন পাসওয়ার্ড</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-black text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw size={11} /> স্ট্রং পাসওয়ার্ড তৈরি করুন
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="পাসওয়ার্ড লিখুন"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 bg-gray-50 rounded-xl border border-ink/10 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 6. Moderator Permissions (if role === 'moderator') */}
                {formRole === 'moderator' && (
                  <div className="space-y-2 pt-2 border-t border-ink/5">
                    <label className="text-[11px] font-black text-ink-muted uppercase block">মডারেটর পারমিশনসমূহ (Permissions)</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {PERMISSION_OPTIONS.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-start gap-2.5 p-2 bg-gray-50 rounded-xl border border-ink/5 cursor-pointer hover:bg-gray-100 transition-all text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={formPermissions.includes(perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormPermissions([...formPermissions, perm.id]);
                              } else {
                                setFormPermissions(formPermissions.filter(p => p !== perm.id));
                              }
                            }}
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-400"
                          />
                          <div>
                            <p className="font-bold text-ink">{perm.label}</p>
                            <p className="text-[10px] text-ink-muted">{perm.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs uppercase shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isCreating ? <Loader2 size={16} className="animate-spin" /> : 'অ্যাকাউন্ট তৈরি করুন'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔑 Success Credentials Modal (Copy to Clipboard) */}
      <AnimatePresence>
        {createdCredentials && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[36px] shadow-2xl max-w-md w-full p-7 space-y-5 text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink">নতুন কর্মী অ্যাকাউন্ট তৈরি সম্পন্ন!</h3>
                <p className="text-xs text-ink-muted">
                  লগইন তথ্য সংরক্ষণ করুন বা কর্মীকে পাঠিয়ে দিন।
                </p>
              </div>

              {/* Credentials Box */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-ink/10 text-left space-y-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block font-sans font-bold">নাম ও পদবী:</span>
                  <p className="font-bold text-ink">{createdCredentials.name} ({createdCredentials.role})</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block font-sans font-bold">ইউনিক ইউজারনেম (Username):</span>
                  <p className="font-bold text-amber-600 text-sm">@{createdCredentials.username}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block font-sans font-bold">ইমেইল:</span>
                  <p className="font-bold text-ink">{createdCredentials.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-ink-muted uppercase block font-sans font-bold">পাসওয়ার্ড:</span>
                  <p className="font-bold text-emerald-700">{createdCredentials.password}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const text = `🎉 Home Tutor BD Staff Account\nName: ${createdCredentials.name}\nRole: ${createdCredentials.role}\nUsername: ${createdCredentials.username}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.password}\nLogin at: /admin/login`;
                    copyToClipboard(text, 'all-creds');
                  }}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {copiedField === 'all-creds' ? (
                    <>
                      <Check size={16} /> কপি সম্পন্ন!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> সকল তথ্য কপি করুন
                    </>
                  )}
                </button>
                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="px-5 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✏️ Modal: Edit Moderator Permissions */}
      <AnimatePresence>
        {staffToEditPermissions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[36px] shadow-2xl max-w-md w-full p-7 space-y-5"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink flex items-center gap-2">
                  <Key size={20} className="text-purple-600" />
                  মডারেটর পারমিশন পরিবর্তন
                </h3>
                <p className="text-xs text-ink-muted">
                  {staffToEditPermissions.name} (@{staffToEditPermissions.username}) এর পারমিশন নিয়ন্ত্রণ করুন।
                </p>
              </div>

              <div className="space-y-2.5">
                {PERMISSION_OPTIONS.map((perm) => {
                  const hasPerm = staffToEditPermissions.permissions.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-ink/5 cursor-pointer hover:bg-gray-100 transition-all text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={hasPerm}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...staffToEditPermissions.permissions, perm.id]
                            : staffToEditPermissions.permissions.filter((p: string) => p !== perm.id);
                          setStaffToEditPermissions({
                            ...staffToEditPermissions,
                            permissions: updated,
                          });
                        }}
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-400"
                      />
                      <div>
                        <p className="font-black text-ink">{perm.label}</p>
                        <p className="text-[11px] text-ink-muted font-medium">{perm.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStaffToEditPermissions(null)}
                  className="flex-1 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isUpdatingPermissions}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  {isUpdatingPermissions ? 'সেভ হচ্ছে...' : 'পারমিশন সেভ করুন'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🗑️ Modal: Delete Confirmation */}
      <AnimatePresence>
        {staffToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-7 space-y-5 text-center"
            >
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-ink">স্টাফ অ্যাকাউন্ট মুছে ফেলতে চান?</h3>
                <p className="text-xs text-ink-muted font-medium">
                  {staffToDelete.name} (@{staffToDelete.username}) এর অ্যাকাউন্ট ডাটাবেজ থেকে মুছে ফেলা হবে।
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStaffToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  {isDeleting ? 'মুছছি...' : 'মুছে ফেলুন'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Bell,
  Sliders,
  Shield,
  Smartphone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Download,
  PauseCircle,
  Trash2,
  Check,
  Loader2,
  ShieldCheck,
  Laptop,
  Globe,
  DollarSign,
  Radio,
  BookOpen,
  Info,
  Lock,
  UserCheck
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useUpdateProfileMutation, useGetMeQuery } from '@/src/services/authApi.ts';
import { useGetMyTutorProfileQuery, useUpdateTutorProfileMutation } from '@/src/services/tutorApi.ts';
import { useSearchParams, Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

type SettingsTab = 'security' | 'tuition' | 'notifications' | 'privacy' | 'account';

export default function TutorSecurity() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as SettingsTab;

  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || 'security');

  // Sync tab with URL
  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    if (tabParam && ['security', 'tuition', 'notifications', 'privacy', 'account'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // RTK Queries & Mutations
  const { data: userData, refetch: refetchUser } = useGetMeQuery(undefined);
  const { data: tutorDataResponse, refetch: refetchTutor } = useGetMyTutorProfileQuery(undefined);
  const [updateUserAuth, { isLoading: isUpdatingAuth }] = useUpdateProfileMutation();
  const [updateTutorProfile, { isLoading: isUpdatingTutor }] = useUpdateTutorProfileMutation();

  const tutorProfile = (tutorDataResponse as any)?.data || tutorDataResponse || {};

  // Global Alert State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // -------------------------------------------------------------
  // 1. Password Form State
  // -------------------------------------------------------------
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = getPasswordStrength(passwords.newPassword);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      showNotification('error', 'দয়া করে বর্তমান পাসওয়ার্ডটি দিন।');
      return;
    }
    if (passwords.newPassword.length < 6) {
      showNotification('error', 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification('error', 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    try {
      await updateUserAuth({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }).unwrap();

      showNotification('success', 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      showNotification('error', err?.data?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে! সঠিক তথ্য দিন।');
    }
  };

  // -------------------------------------------------------------
  // 2. Tuition Preferences State
  // -------------------------------------------------------------
  const [isAvailable, setIsAvailable] = useState<boolean>(
    tutorProfile.isAvailableForTuition !== false
  );
  const [selectedMediums, setSelectedMediums] = useState<string[]>(
    tutorProfile.mediums || ['Bangla Medium']
  );
  const [selectedModes, setSelectedModes] = useState<string[]>(
    tutorProfile.preferredTuitionModes || ['Home Tutoring (বাসায় গিয়ে)', 'Online Tutoring (অনলাইন)']
  );
  const [daysPerWeek, setDaysPerWeek] = useState<string>(
    tutorProfile.daysPerWeek || '3 Days/Week'
  );
  const [preferredShift, setPreferredShift] = useState<string>(
    tutorProfile.timingShift || 'Evening (বিকাল/সন্ধ্যা)'
  );
  const [minSalary, setMinSalary] = useState<number | string>(
    tutorProfile.salary || 5000
  );

  useEffect(() => {
    if (tutorProfile) {
      if (tutorProfile.isAvailableForTuition !== undefined) {
        setIsAvailable(tutorProfile.isAvailableForTuition);
      }
      if (tutorProfile.mediums) {
        setSelectedMediums(tutorProfile.mediums);
      }
      if (tutorProfile.preferredTuitionModes) {
        setSelectedModes(tutorProfile.preferredTuitionModes);
      }
      if (tutorProfile.salary) {
        setMinSalary(tutorProfile.salary);
      }
    }
  }, [tutorProfile]);

  const toggleMedium = (medium: string) => {
    setSelectedMediums((prev) =>
      prev.includes(medium) ? prev.filter((m) => m !== medium) : [...prev, medium]
    );
  };

  const toggleMode = (mode: string) => {
    setSelectedModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const handleSaveTuitionPreferences = async () => {
    try {
      await updateTutorProfile({
        isAvailableForTuition: isAvailable,
        mediums: selectedMediums,
        preferredTuitionModes: selectedModes,
        salary: Number(minSalary) || 0,
        daysPerWeek,
        timingShift: preferredShift,
      }).unwrap();

      showNotification('success', 'টিউশন প্রেফারেন্স সফলভাবে সংরক্ষিত হয়েছে!');
      refetchTutor();
    } catch (err: any) {
      showNotification('error', err?.data?.message || 'প্রেফারেন্স সংরক্ষণ করা যায়নি!');
    }
  };

  // -------------------------------------------------------------
  // 3. Notification Settings State
  // -------------------------------------------------------------
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    chatMessages: true,
    smsAlerts: false,
    emailDigest: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = async () => {
    try {
      await updateTutorProfile({
        notificationSettings: notifications,
      }).unwrap();
      showNotification('success', 'নোটিফিকেশন প্রেফারেন্স আপডেট সম্পন্ন হয়েছে!');
    } catch (err: any) {
      showNotification('error', 'নোটিফিকেশন সেটিং সংরক্ষণ করা যায়নি।');
    }
  };

  // -------------------------------------------------------------
  // 4. Privacy Settings State
  // -------------------------------------------------------------
  const [privacy, setPrivacy] = useState({
    phoneVisibility: 'verified_only', // 'verified_only' | 'public' | 'hidden'
    publicProfile: true,
    showSalary: true,
  });

  const handleSavePrivacy = async () => {
    try {
      await updateTutorProfile({
        privacySettings: privacy,
      }).unwrap();
      showNotification('success', 'গোপনীয়তা ও প্রাইভেসি সেটিংস আপডেট হয়েছে!');
    } catch (err: any) {
      showNotification('error', 'প্রাইভেসি সেটিং আপডেট করা যায়নি।');
    }
  };

  // -------------------------------------------------------------
  // 5. Account / Danger Zone State
  // -------------------------------------------------------------
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <TutorLayout>
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6 pb-24 sm:pb-20 px-2 sm:px-4">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-[#006A4E] to-[#014D39] p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-[#006A4E]/10 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-[10.5px] sm:text-xs font-semibold">
              <Sliders size={12} /> Tutor Settings & Preferences
            </div>
            <h1 className="text-xl sm:text-2xl sm:text-3xl font-black tracking-tight">Account & Matching Settings</h1>
            <p className="text-[11px] sm:text-xs sm:text-sm text-emerald-100/80 max-w-xl line-clamp-2 sm:line-clamp-none">
              পাসওয়ার্ড পরিবর্তন, টিউশন ম্যাচিং অ্যালার্ট, প্রাপ্যতা (Availability) এবং প্রাইভেসি কন্ট্রোল সহজে পরিচালনা করুন।
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0">
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/20 flex sm:flex-col items-center justify-between gap-2 sm:gap-0.5 w-full sm:w-auto sm:min-w-[110px]">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-emerald-200">Status</span>
              <span className="text-[11px] sm:text-xs font-black inline-flex items-center gap-1.5 text-white">
                <span className={cn('w-2 h-2 rounded-full', isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400')} />
                {isAvailable ? 'Available' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Decorative subtle circles */}
          <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Global Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2.5 sm:gap-3 text-xs font-bold border shadow-xs',
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              )}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span className="text-[11px] sm:text-xs">{feedback.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs - Horizontal Swipe on Mobile */}
        <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-xl sm:rounded-2xl border border-ink/10 shadow-xs flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {[
            { id: 'security', label: 'নিরাপত্তা ও পাসওয়ার্ড', icon: Lock },
            { id: 'tuition', label: 'টিউশন ম্যাচিং ও প্রাপ্যতা', icon: Sparkles },
            { id: 'notifications', label: 'অ্যালার্ট ও নোটিফিকেশন', icon: Bell },
            { id: 'privacy', label: 'গোপনীয়তা ও যোগাযোগ', icon: ShieldCheck },
            { id: 'account', label: 'অ্যাকাউন্ট কন্ট্রোল', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as SettingsTab)}
                className={cn(
                  'snap-start flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 shrink-0',
                  isActive
                    ? 'bg-[#006A4E] text-white shadow-md shadow-[#006A4E]/20'
                    : 'text-ink-muted hover:text-[#001F3F] hover:bg-ink/5'
                )}
              >
                <Icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ACCOUNT SECURITY & PASSWORD */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left/Main Column: Password Change Form */}
            <div className="lg:col-span-2 bg-white/90 backdrop-blur-xl p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2.5 sm:gap-3 border-b border-ink/5 pb-3 sm:pb-4">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#006A4E]/10 text-[#006A4E] flex items-center justify-center shrink-0">
                  <KeyRound size={18} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#001F3F]">পাসওয়ার্ড পরিবর্তন (Change Password)</h3>
                  <p className="text-[11px] sm:text-xs text-ink-muted">আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-[#001F3F] uppercase tracking-wider mb-2">
                    বর্তমান পাসওয়ার্ড (Current Password)*
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-gray-50/70 border border-ink/10 rounded-2xl p-3.5 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#001F3F] uppercase tracking-wider mb-2">
                    নতুন পাসওয়ার্ড (New Password)*
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="কমপক্ষে ৬+ অক্ষর দিন"
                      className="w-full bg-gray-50/70 border border-ink/10 rounded-2xl p-3.5 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwords.newPassword && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-ink-muted">Password Strength:</span>
                        <span
                          className={cn(
                            passStrength <= 1 && 'text-rose-500',
                            passStrength === 2 && 'text-amber-500',
                            passStrength === 3 && 'text-blue-500',
                            passStrength >= 4 && 'text-emerald-600'
                          )}
                        >
                          {passStrength <= 1 && 'দুর্বল (Weak)'}
                          {passStrength === 2 && 'মোটামুটি (Fair)'}
                          {passStrength === 3 && 'ভালো (Strong)'}
                          {passStrength >= 4 && 'অত্যন্ত শক্তিশালী (Excellent)'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 1 ? 'bg-rose-500' : 'bg-transparent')} />
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 2 ? 'bg-amber-500' : 'bg-transparent')} />
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 3 ? 'bg-blue-500' : 'bg-transparent')} />
                        <div className={cn('h-full flex-1 rounded-full transition-all', passStrength >= 4 ? 'bg-emerald-500' : 'bg-transparent')} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#001F3F] uppercase tracking-wider mb-2">
                    কনফার্ম নতুন পাসওয়ার্ড (Confirm New Password)*
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="পাসওয়ার্ডটি পুনরায় লিখুন"
                      className="w-full bg-gray-50/70 border border-ink/10 rounded-2xl p-3.5 pr-12 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20 focus:border-[#006A4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                    <p className="text-[11px] text-rose-500 mt-1 font-semibold flex items-center gap-1">
                      <AlertCircle size={12} /> পাসওয়ার্ড মিলছে না!
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingAuth}
                  className="w-full py-4 rounded-2xl bg-[#006A4E] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#006A4E]/20 hover:bg-[#00523C] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingAuth ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} /> পাসওয়ার্ড আপডেট করুন
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Active Session & Security Checklist */}
            <div className="space-y-6">
              {/* Account Status Card */}
              <div className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#001F3F]">Security Status</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 size={12} /> Account Protected
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-ink/5 text-xs">
                  <div className="flex items-center justify-between text-ink-muted">
                    <span>Registered Phone:</span>
                    <span className="font-bold text-[#001F3F]">{user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-muted">
                    <span>Email Address:</span>
                    <span className="font-bold text-[#001F3F] truncate max-w-[150px]">{user?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink-muted">
                    <span>Role Verification:</span>
                    <span className="font-bold text-emerald-600">
                      {tutorProfile.isVerified ? '✓ Verified Tutor' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Session Info */}
              <div className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Laptop size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-[#001F3F]">বর্তমান সেশন (Active Device)</h4>
                    <p className="text-[11px] text-ink-muted">This Web Browser</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Status:</span>
                    <span className="font-bold text-emerald-600 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Now
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">Client:</span>
                    <span className="font-semibold text-ink">Web Dashboard</span>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/60 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <Info size={16} className="text-amber-600" />
                  <span>টিপস ও সতর্কতা</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  আপনার লগইন ওটিপি কিংবা পাসওয়ার্ড কাউকে শেয়ার করবেন না। কোনো সন্দেহজনক কার্যকলাপ চোখে পড়লে তাৎক্ষণিক অ্যাডমিনের সাথে যোগাযোগ করুন।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TUITION MATCHING & AVAILABILITY */}
        {/* ========================================================= */}
        {activeTab === 'tuition' && (
          <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-ink/5 pb-4 sm:pb-6">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#001F3F]">টিউশন প্রাপ্যতা ও প্রেফারেন্স (Matching Preferences)</h3>
                <p className="text-[11px] sm:text-xs text-ink-muted">আপনি কোন কোন মিডিয়াম, মোড ও পারিশ্রমিকে টিউশন করাতে চান তা নির্দিষ্ট করুন।</p>
              </div>
              <button
                onClick={handleSaveTuitionPreferences}
                disabled={isUpdatingTutor}
                className="w-full sm:w-auto justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#006A4E] text-white font-bold text-xs shadow-lg shadow-[#006A4E]/20 hover:bg-[#00523C] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
              >
                {isUpdatingTutor ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                প্রেফারেন্স সংরক্ষণ করুন
              </button>
            </div>

            {/* 1. Live Availability Switch */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50 border border-ink/5 flex items-center justify-between gap-3 sm:gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-[#001F3F] block">নতুন টিউশনের জন্য প্রস্তুত (Available for Tuitions)</span>
                <p className="text-[10.5px] sm:text-[11px] text-ink-muted">
                  এটি অন রাখলে অভিভাবক ও শিক্ষার্থীরা আপনার প্রোফাইল খুঁজে পাবে এবং নতুন টিউশন অফার পাঠাতে পারবে।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={cn(
                  'w-12 sm:w-14 h-7 sm:h-8 rounded-full p-1 transition-all cursor-pointer relative shrink-0',
                  isAvailable ? 'bg-[#006A4E]' : 'bg-gray-300'
                )}
              >
                <div
                  className={cn(
                    'w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white shadow-md transition-all',
                    isAvailable ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* 2. Tutoring Modes */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="block text-[11px] sm:text-xs font-black text-[#001F3F] uppercase tracking-wider">
                পছন্দের পাঠদান পদ্ধতি (Preferred Tutoring Modes)*
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'Home Tutoring (বাসায় গিয়ে)', label: 'Home Tutoring (বাসায় গিয়ে)', desc: 'শিক্ষার্থীর বাসায় গিয়ে পড়ানো' },
                  { id: 'Online Tutoring (অনলাইন)', label: 'Online Tutoring (অনলাইন)', desc: 'Zoom / Google Meet এর মাধ্যমে' },
                  { id: 'Group / Batch (ব্যাচ কোচিং)', label: 'Group / Batch (গ্রুপ কোচিং)', desc: 'একাধিক শিক্ষার্থী একসাথে পড়ানো' },
                ].map((mode) => {
                  const isChecked = selectedModes.includes(mode.id);
                  return (
                    <div
                      key={mode.id}
                      onClick={() => toggleMode(mode.id)}
                      className={cn(
                        'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-1.5 sm:gap-2 active:scale-95',
                        isChecked
                          ? 'border-[#006A4E] bg-[#006A4E]/5 text-[#006A4E]'
                          : 'border-ink/10 bg-white hover:border-ink/20 text-ink'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{mode.label}</span>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-lg flex items-center justify-center border',
                            isChecked ? 'bg-[#006A4E] text-white border-[#006A4E]' : 'border-ink/20'
                          )}
                        >
                          {isChecked && <Check size={12} />}
                        </div>
                      </div>
                      <p className="text-[10.5px] sm:text-[11px] text-ink-muted">{mode.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Mediums / Curricula */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="block text-[11px] sm:text-xs font-black text-[#001F3F] uppercase tracking-wider">
                পছন্দের কারিকুলাম ও মিডিয়াম (Mediums)*
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                {[
                  'Bangla Medium',
                  'English Medium (Edexcel/Cambridge)',
                  'English Version (NCTB)',
                  'Madrasah / Religious',
                ].map((medium) => {
                  const isChecked = selectedMediums.includes(medium);
                  return (
                    <button
                      key={medium}
                      type="button"
                      onClick={() => toggleMedium(medium)}
                      className={cn(
                        'p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer active:scale-95',
                        isChecked
                          ? 'border-[#006A4E] bg-[#006A4E]/5 text-[#006A4E]'
                          : 'border-ink/10 bg-white text-ink-muted hover:border-ink/20'
                      )}
                    >
                      <span className="truncate pr-1">{medium}</span>
                      {isChecked && <CheckCircle2 size={16} className="text-[#006A4E] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Schedule & Expected Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6 pt-4 border-t border-ink/5">
              {/* Days Per Week */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#001F3F] uppercase tracking-wider mb-1.5 sm:mb-2">
                  সপ্তাহে দিন (Days / Week)
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(e.target.value)}
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20"
                >
                  <option value="1 Day/Week">১ দিন / সপ্তাহ</option>
                  <option value="2 Days/Week">২ দিন / সপ্তাহ</option>
                  <option value="3 Days/Week">৩ দিন / সপ্তাহ</option>
                  <option value="4 Days/Week">৪ দিন / সপ্তাহ</option>
                  <option value="5 Days/Week">৫ দিন / সপ্তাহ</option>
                  <option value="6 Days/Week">৬ দিন / সপ্তাহ</option>
                </select>
              </div>

              {/* Preferred Shift */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#001F3F] uppercase tracking-wider mb-1.5 sm:mb-2">
                  পছন্দের সময় (Preferred Shift)
                </label>
                <select
                  value={preferredShift}
                  onChange={(e) => setPreferredShift(e.target.value)}
                  className="w-full bg-gray-50 border border-ink/10 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20"
                >
                  <option value="Morning (সকাল)">Morning (সকাল ৮টা - ১২টা)</option>
                  <option value="Afternoon (দুপুর)">Afternoon (দুপুর ১২টা - ৪টা)</option>
                  <option value="Evening (বিকাল/সন্ধ্যা)">Evening (বিকাল ৪টা - রাত ৮টা)</option>
                  <option value="Night (রাত)">Night (রাত ৮টা - ১০টা)</option>
                  <option value="Any Time (যেকোনো সময়)">Any Time (যেকোনো সুবিধাজনক সময়)</option>
                </select>
              </div>

              {/* Minimum Expected Salary */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-[#001F3F] uppercase tracking-wider mb-1.5 sm:mb-2">
                  ন্যূনতম পারিশ্রমিক (Min Salary - ৳/মাস)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-ink-muted text-xs">৳</span>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-gray-50 border border-ink/10 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 pl-8 text-xs font-bold text-[#001F3F] focus:outline-none focus:ring-2 focus:ring-[#006A4E]/20"
                  />
                </div>
              </div>
            </div>

            {/* Quick Salary Chips */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-ink-muted">Quick Set:</span>
              {[3000, 5000, 6000, 8000, 10000, 12000, 15000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMinSalary(amt)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg sm:rounded-xl text-[10.5px] sm:text-[11px] font-bold border transition-all cursor-pointer active:scale-95',
                    Number(minSalary) === amt
                      ? 'bg-[#006A4E] text-white border-[#006A4E]'
                      : 'bg-white text-ink hover:border-ink/20 border-ink/10'
                  )}
                >
                  ৳{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SMART NOTIFICATIONS & JOB ALERTS */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-ink/5 pb-4 sm:pb-6">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#001F3F]">স্মার্ট নোটিফিকেশন ও জব অ্যালার্ট</h3>
                <p className="text-[11px] sm:text-xs text-ink-muted">কোন কোন আপডেট আপনি তাৎক্ষণিক পেতে চান তা পছন্দমতো সাজিয়ে নিন।</p>
              </div>
              <button
                onClick={handleSaveNotifications}
                disabled={isUpdatingTutor}
                className="w-full sm:w-auto justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#006A4E] text-white font-bold text-xs shadow-lg shadow-[#006A4E]/20 hover:bg-[#00523C] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
              >
                {isUpdatingTutor ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                নোটিফিকেশন সেভ করুন
              </button>
            </div>

            <div className="space-y-2.5 sm:space-y-4">
              {[
                {
                  key: 'jobAlerts',
                  title: 'তাৎক্ষণিক টিউশন ম্যাচ অ্যালার্ট (Instant Job Match)',
                  desc: 'আপনার পছন্দের এরিয়া ও বিষয়ে নতুন টিউশন পোস্ট হওয়া মাত্র নোটিফিকেশন পাঠানো হবে।',
                  icon: Sparkles,
                },
                {
                  key: 'applicationUpdates',
                  title: 'আবেদন স্ট্যাটাস আপডেট (Application Status Alerts)',
                  desc: 'যখন আপনার আবেদন অভিভাবক গ্রহণ, শর্টলিস্ট বা নির্বাচন করবেন তখন নোটিফিকেশন পাবেন।',
                  icon: CheckCircle2,
                },
                {
                  key: 'chatMessages',
                  title: 'মেসেজ ও লাইভ চ্যাট অ্যালার্ট (Chat & Messages)',
                  desc: 'অভিভাবক বা প্ল্যাটফর্ম সাপোর্ট থেকে মেসেজ আসলে রিয়েল-টাইম সাউন্ড ও পপআপ পাবেন।',
                  icon: Bell,
                },
                {
                  key: 'smsAlerts',
                  title: 'জরুরি এসএমএস নোটিফিকেশন (SMS Alerts for High Priority)',
                  desc: 'আপনার এরিয়ার প্রিমিয়াম ও জরুরি টিউশন অফারের জন্য এসএমএস অ্যালার্ট পাঠানো হবে।',
                  icon: Smartphone,
                },
                {
                  key: 'emailDigest',
                  title: 'সাপ্তাহিক টিউশন সামারি ও ট্রেন্ডস (Weekly Tuition Digest)',
                  desc: 'সপ্তাহের সেরা টিউশন অফার ও গড় পারিশ্রমিকের বিশ্লেষণ ইমেইলে পাঠানো হবে।',
                  icon: Mail,
                },
              ].map((item) => {
                const isChecked = notifications[item.key as keyof typeof notifications];
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                    className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gray-50/70 border border-ink/5 hover:border-ink/15 transition-all flex items-center justify-between gap-3 sm:gap-4 cursor-pointer active:scale-98"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#006A4E]/10 text-[#006A4E] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={17} className="sm:w-[20px] sm:h-[20px]" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-black text-[#001F3F]">{item.title}</h4>
                        <p className="text-[10.5px] sm:text-[11px] text-ink-muted leading-relaxed max-w-xl">{item.desc}</p>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'w-11 sm:w-12 h-6 sm:h-7 rounded-full p-1 transition-all relative shrink-0',
                        isChecked ? 'bg-[#006A4E]' : 'bg-gray-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white shadow-md transition-all',
                          isChecked ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: PRIVACY & CONTACT VISIBILITY */}
        {/* ========================================================= */}
        {activeTab === 'privacy' && (
          <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-ink/5 pb-4 sm:pb-6">
              <div>
                <h3 className="text-sm sm:text-base font-black text-[#001F3F]">গোপনীয়তা ও যোগাযোগ সেটিংস (Privacy & Visibility)</h3>
                <p className="text-[11px] sm:text-xs text-ink-muted">আপনার ফোন নম্বর ও প্রোফাইলের তথ্য কীভাবে প্রদর্শিত হবে তা নির্ধারণ করুন।</p>
              </div>
              <button
                onClick={handleSavePrivacy}
                disabled={isUpdatingTutor}
                className="w-full sm:w-auto justify-center px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#006A4E] text-white font-bold text-xs shadow-lg shadow-[#006A4E]/20 hover:bg-[#00523C] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 active:scale-95"
              >
                {isUpdatingTutor ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                প্রাইভেসি সেভ করুন
              </button>
            </div>

            {/* Phone Visibility Radio Options */}
            <div className="space-y-2.5 sm:space-y-3">
              <label className="block text-[11px] sm:text-xs font-black text-[#001F3F] uppercase tracking-wider">
                মোবাইল নম্বর দৃশ্যমানতা (Phone Number Visibility)
              </label>
              <div className="space-y-2 sm:space-y-2.5">
                {[
                  {
                    value: 'verified_only',
                    title: 'শুধুমাত্র ভেরিফাইড অভিভাবক (Verified Guardians Only - Recommended)',
                    desc: 'আবেদন ম্যাচ বা শর্টলিস্ট হওয়ার পর ভেরিফাইড অভিভাবক নম্বর দেখতে পাবেন।',
                  },
                  {
                    value: 'public',
                    title: 'সকল নিবন্ধিত ব্যবহারকারী (All Registered Users)',
                    desc: 'লগইন করা যেকোনো অভিভাবক সরাসরি কল করতে পারবেন।',
                  },
                  {
                    value: 'hidden',
                    title: 'সম্পূর্ণ গোপন রাখুন (Keep Private - Chat Only)',
                    desc: 'নম্বর পুরোপুরি গোপন থাকবে, শুধুমাত্র ইন-অ্যাপ চ্যাটের মাধ্যমে কথা হবে।',
                  },
                ].map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => setPrivacy({ ...privacy, phoneVisibility: opt.value })}
                    className={cn(
                      'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 sm:gap-4 active:scale-98',
                      privacy.phoneVisibility === opt.value
                        ? 'border-[#006A4E] bg-[#006A4E]/5'
                        : 'border-ink/10 bg-white hover:border-ink/20'
                    )}
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#001F3F] block">{opt.title}</span>
                      <span className="text-[10.5px] sm:text-[11px] text-ink-muted">{opt.desc}</span>
                    </div>
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                        privacy.phoneVisibility === opt.value ? 'border-[#006A4E]' : 'border-gray-300'
                      )}
                    >
                      {privacy.phoneVisibility === opt.value && <div className="w-2 h-2 rounded-full bg-[#006A4E]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Public Profile Directory Toggle */}
            <div className="pt-4 border-t border-ink/5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#001F3F] block">পাবলিক সার্চে প্রোফাইল প্রদর্শন</span>
                  <span className="text-[10.5px] sm:text-[11px] text-ink-muted">
                    ওয়েবসাইটের টিউটর সার্চ পেজে আপনার প্রোফাইল কার্ড দৃশ্যমান থাকবে।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacy({ ...privacy, publicProfile: !privacy.publicProfile })}
                  className={cn(
                    'w-11 sm:w-12 h-6 sm:h-7 rounded-full p-1 transition-all relative shrink-0 cursor-pointer',
                    privacy.publicProfile ? 'bg-[#006A4E]' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white shadow-md transition-all',
                      privacy.publicProfile ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Show Expected Salary Toggle */}
              <div className="flex items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#001F3F] block">প্রত্যাশিত পারিশ্রমিক প্রদর্শন</span>
                  <span className="text-[10.5px] sm:text-[11px] text-ink-muted">
                    আপনার পাবলিক প্রোফাইলে ন্যূনতম প্রত্যাশিত পারিশ্রমিক দেখাবে।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPrivacy({ ...privacy, showSalary: !privacy.showSalary })}
                  className={cn(
                    'w-11 sm:w-12 h-6 sm:h-7 rounded-full p-1 transition-all relative shrink-0 cursor-pointer',
                    privacy.showSalary ? 'bg-[#006A4E]' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white shadow-md transition-all',
                      privacy.showSalary ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACCOUNT CONTROL & DANGER ZONE */}
        {/* ========================================================= */}
        {activeTab === 'account' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Export Tutor Data Card */}
            <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Download size={20} className="sm:w-[24px] sm:h-[24px]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#001F3F]">আমার টিউটর ডাটা ও সিভি ডাউনলোড</h3>
                  <p className="text-[10.5px] sm:text-xs text-ink-muted">
                    আপনার শিক্ষাগত যোগ্যতা, অভিজ্ঞতা ও টিউশন হিস্টোরির সম্পূর্ণ পিডিএফ কপি ডাউনলোড করুন।
                  </p>
                </div>
              </div>
              <Link
                to="/tutor/downloads"
                className="w-full sm:w-auto justify-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-all flex items-center gap-2 shrink-0 active:scale-95"
              >
                <Download size={14} /> PDF Zone এ যান
              </Link>
            </div>

            {/* Vacation / Pause Profile Mode */}
            <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-ink/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <PauseCircle size={20} className="sm:w-[24px] sm:h-[24px]" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#001F3F]">সাময়িক বিরতি (Vacation / Exam Mode)</h3>
                  <p className="text-[10.5px] sm:text-xs text-ink-muted">
                    পরীক্ষা বা ছুটির কারণে সাময়িক সময়ের জন্য টিউশন আবেদন ও কল বন্ধ রাখতে প্রোফাইল পজ করুন।
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  try {
                    await updateTutorProfile({ isAvailableForTuition: !isAvailable }).unwrap();
                    setIsAvailable(!isAvailable);
                    showNotification('success', !isAvailable ? 'প্রোফাইল পুনরায় সক্রিয় করা হয়েছে!' : 'প্রোফাইল সাময়িকভাবে পজ করা হয়েছে।');
                  } catch (e) {
                    showNotification('error', 'স্ট্যাটাস পরিবর্তন করা যায়নি!');
                  }
                }}
                className={cn(
                  'w-full sm:w-auto justify-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95',
                  isAvailable ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                )}
              >
                <PauseCircle size={15} /> {isAvailable ? 'Pause Profile Now' : 'Resume Profile Now'}
              </button>
            </div>

            {/* Danger Zone: Account Deactivation */}
            <div className="bg-rose-50/50 p-4 sm:p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-rose-200/80 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2.5 sm:gap-3 text-rose-700">
                <Trash2 size={18} className="sm:w-[22px] sm:h-[22px]" />
                <h3 className="text-sm sm:text-base font-black text-rose-950">Danger Zone (অ্যাকাউন্ট নিষ্ক্রিয়করণ)</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-rose-800 leading-relaxed max-w-2xl">
                আপনি যদি আপনার অ্যাকাউন্ট আর ব্যবহার করতে না চান, তবে সাপোর্ট টিমের কাছে অ্যাকাউন্ট নিষ্ক্রিয় বা মুছে ফেলার অনুরোধ পাঠাতে পারেন।
              </p>
              <div className="pt-1">
                <Link
                  to="/tutor/messages"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 active:scale-95"
                >
                  <Trash2 size={14} /> সাপোর্ট টিমকে ডিলিট রিকোয়েস্ট পাঠান
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </TutorLayout>
  );
}
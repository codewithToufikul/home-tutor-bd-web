import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Phone, MapPin, GraduationCap, Building2,
  BookOpen, ShieldCheck, Lock, Bell, CheckCircle2,
  Camera, Loader2, Sparkles, AlertCircle, Save,
  Home, Users, HeartHandshake, Eye, EyeOff, Check,
  Navigation, Globe
} from 'lucide-react';
import { getDivisions, getDistricts, getUpazilas } from '@olism/bd-geo';
import { getDhakaZones, getDhakaSubLocations } from '@/src/data/dhakaLocations';
import StudentLayout from '@/src/components/StudentLayout';
import { useAuth } from '@/src/context/AuthContext';
import { useGetMeQuery, useUpdateProfileMutation } from '@/src/services/authApi';
import { uploadFileWithProgress } from '@/src/repositories/storageRepository';
import { cn } from '@/src/lib/utils';

const CLASSES = [
  'Play - KG',
  'Class 1 - 5 (Primary)',
  'Class 6 - 8 (Junior)',
  'Class 9 - 10 (SSC / O-Level)',
  'Class 11 - 12 (HSC / A-Level)',
  'University / College Level',
  'Admission Test Preparation',
  'Spoken English / Language',
  'Coding & IT Skills',
  'Quran & Religious Studies'
];

const MEDIUMS = [
  'Bangla Medium',
  'English Version',
  'English Medium (Edexcel)',
  'English Medium (Cambridge)',
  'Madrasah Medium',
  'Technical / Vocational',
  'Other'
];

const RELATIONS = [
  'Father',
  'Mother',
  'Elder Brother',
  'Elder Sister',
  'Uncle / Aunt',
  'Local Guardian',
  'Self (Student)'
];

type TabType = 'personal' | 'location' | 'guardian' | 'security';

export default function StudentSettings() {
  const { user } = useAuth();
  const { data: meData, refetch } = useGetMeQuery(undefined);
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Avatar upload state
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Bangladesh Geo Data from @olism/bd-geo
  const allDivisions = useMemo(() => getDivisions(), []);
  const allDistricts = useMemo(() => getDistricts(), []);
  const allUpazilas = useMemo(() => getUpazilas(), []);

  // Form State
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [studentClass, setStudentClass] = useState('');
  const [medium, setMedium] = useState('');
  const [institution, setInstitution] = useState('');
  const [bio, setBio] = useState('');

  // Location State with @olism/bd-geo & dhakaLocations
  const [division, setDivision] = useState('Dhaka');
  const [divisionId, setDivisionId] = useState<number | ''>(3);
  const [district, setDistrict] = useState('Dhaka');
  const [districtId, setDistrictId] = useState<number | ''>(1);
  const [upazila, setUpazila] = useState('');
  const [upazilaId, setUpazilaId] = useState<number | string | ''>('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [preferredTuitionMode, setPreferredTuitionMode] = useState<'Home Tutoring' | 'Online Tutoring' | 'Both' | ''>('Both');

  // Guardian State
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // Security & Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  // Notification Preferences
  const [notifyChat, setNotifyChat] = useState(true);
  const [notifyTuition, setNotifyTuition] = useState(true);
  const [notifyTutorMatch, setNotifyTutorMatch] = useState(true);

  const isDhaka = useMemo(() => {
    return district.toLowerCase().includes('dhaka') || Number(districtId) === 1;
  }, [district, districtId]);

  // Cascaded geo options
  const availableDistricts = useMemo(() => {
    if (!divisionId) return allDistricts;
    return allDistricts.filter((d) => d.divisionId === Number(divisionId));
  }, [allDistricts, divisionId]);

  const availableUpazilas = useMemo(() => {
    if (!districtId) return [];
    if (isDhaka) {
      const zones = getDhakaZones();
      return zones.map((zone) => ({
        id: zone,
        name: zone,
        nameBn: '',
      }));
    }
    return allUpazilas.filter((u) => u.districtId === Number(districtId));
  }, [allUpazilas, districtId, isDhaka]);

  const availableAreas = useMemo(() => {
    if (isDhaka) {
      return getDhakaSubLocations(upazila);
    }
    return [];
  }, [upazila, isDhaka]);

  // Load User Data
  useEffect(() => {
    const u = (meData?.data as any)?.user || meData?.data || user;
    if (u) {
      setName(u.name || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
      setAvatar(u.avatar || '');
      setAddress(u.address || '');

      const userDistName = (u as any).district || 'Dhaka';
      const userDivName = (u as any).division || '';
      const userUpazilaName = (u as any).upazila || '';

      // Match district from bd-geo
      const matchedDist = allDistricts.find(
        (d) => d.name.toLowerCase() === userDistName.toLowerCase()
      );
      if (matchedDist) {
        setDistrict(matchedDist.name);
        setDistrictId(matchedDist.id);
        setDivisionId(matchedDist.divisionId);
        const matchedDiv = allDivisions.find((div) => div.id === matchedDist.divisionId);
        if (matchedDiv) setDivision(matchedDiv.name);
      } else {
        setDistrict(userDistName);
      }

      if (userDivName) {
        const matchedDiv = allDivisions.find(
          (d) => d.name.toLowerCase() === userDivName.toLowerCase()
        );
        if (matchedDiv) {
          setDivision(matchedDiv.name);
          setDivisionId(matchedDiv.id);
        }
      }

      if (userUpazilaName) {
        setUpazila(userUpazilaName);
        const matchedUp = allUpazilas.find(
          (up) => up.name.toLowerCase() === userUpazilaName.toLowerCase()
        );
        if (matchedUp) setUpazilaId(matchedUp.id);
        else setUpazilaId(userUpazilaName);
      }

      setArea((u as any).area || (u.location || ''));
      setGender((u as any).gender || '');
      setStudentClass((u as any).studentClass || '');
      setMedium((u as any).medium || '');
      setInstitution((u as any).institution || '');
      setEmergencyContact((u as any).emergencyContact || '');
      setGuardianName((u as any).guardianName || '');
      setGuardianRelation((u as any).guardianRelation || '');
      setGuardianPhone((u as any).guardianPhone || '');
      setBio((u as any).bio || '');
      setPreferredTuitionMode((u as any).preferredTuitionMode || 'Both');
      if ((u as any).notificationPreferences) {
        setNotifyChat((u as any).notificationPreferences.chat !== false);
        setNotifyTuition((u as any).notificationPreferences.tuition !== false);
        setNotifyTutorMatch((u as any).notificationPreferences.tutorMatch !== false);
      }
    }
  }, [meData, user, allDivisions, allDistricts, allUpazilas]);

  // Cascaded change handlers
  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divId = Number(e.target.value);
    const div = allDivisions.find((d) => d.id === divId);
    setDivision(div ? div.name : '');
    setDivisionId(divId || '');
    setDistrict('');
    setDistrictId('');
    setUpazila('');
    setUpazilaId('');
    setArea('');
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = Number(e.target.value);
    const dist = allDistricts.find((d) => d.id === distId);
    setDistrict(dist ? dist.name : '');
    setDistrictId(distId || '');
    setUpazila('');
    setUpazilaId('');
    setArea('');
  };

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (isDhaka) {
      setUpazila(val);
      setUpazilaId(val);
      if (!area) setArea(val);
    } else {
      const upId = Number(val);
      const up = availableUpazilas.find((u) => u.id === upId);
      setUpazila(up ? up.name : '');
      setUpazilaId(upId || '');
      if (!area) setArea(up ? up.name : '');
    }
  };

  // Profile Completeness Calculation
  const completionPercentage = useMemo(() => {
    const fields = [
      name, phone, address, district, area,
      gender, studentClass, medium, institution, guardianPhone
    ];
    const filled = fields.filter((f) => Boolean(String(f).trim())).length;
    return Math.round((filled / fields.length) * 100);
  }, [name, phone, address, district, area, gender, studentClass, medium, institution, guardianPhone]);

  // Avatar Upload Handler
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    setAvatarUploading(true);
    setAvatarProgress(10);
    try {
      const uploadedUrl = await uploadFileWithProgress(
        file,
        'home-tutor-bd/avatars',
        (percent) => setAvatarProgress(percent)
      );
      setAvatar(uploadedUrl);
      await updateProfile({ avatar: uploadedUrl }).unwrap();
      refetch();
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
      setAvatarProgress(0);
    }
  };

  // Main Save Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Password validation if changing
    if (newPassword || currentPassword) {
      if (!currentPassword) {
        setErrorMessage('Please provide your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New password and confirm password do not match.');
        return;
      }
    }

    try {
      const locationLabel = area && upazila
        ? `${area}, ${upazila}, ${district}`
        : area
        ? `${area}, ${district}`
        : upazila
        ? `${upazila}, ${district}`
        : district;

      const payload: Record<string, any> = {
        name,
        phone,
        avatar,
        address,
        location: locationLabel,
        division,
        divisionId: divisionId || undefined,
        district,
        districtId: districtId || undefined,
        upazila,
        upazilaId: upazilaId || undefined,
        area,
        gender,
        studentClass,
        medium,
        institution,
        emergencyContact,
        guardianName,
        guardianRelation,
        guardianPhone,
        bio,
        preferredTuitionMode,
        notificationPreferences: {
          chat: notifyChat,
          tuition: notifyTuition,
          tutorMatch: notifyTutorMatch,
        },
      };

      if (newPassword && currentPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      await updateProfile(payload).unwrap();
      await refetch();

      if (newPassword) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPassSuccess(true);
        setTimeout(() => setPassSuccess(false), 4000);
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } catch (err: any) {
      setErrorMessage(err?.data?.message || err?.message || 'Failed to update profile settings.');
    }
  };

  const currentAvatar =
    avatar ||
    `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
      name || 'student'
    )}&backgroundColor=b6e3f4`;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28 sm:pb-16 px-3.5 sm:px-0">
        {/* ══ Header Banner ════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#001F3F] via-[#0F3460] to-[#00A884] rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar with Upload trigger */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-3 sm:border-4 border-white/20 bg-white/10 shadow-xl backdrop-blur-md">
                <img src={currentAvatar} alt={name} className="w-full h-full object-cover" />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-transform active:scale-90 cursor-pointer"
                title="Change Avatar"
              >
                {avatarUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </button>
            </div>

            {/* User Details & Completeness */}
            <div className="flex-1 text-center sm:text-left space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight">{name || 'Student / Guardian'}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] sm:text-[11px] font-bold">
                  Verified Student
                </span>
              </div>

              <p className="text-[11px] sm:text-xs text-slate-300 font-medium flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-emerald-300" />
                  <span className="truncate max-w-[180px] sm:max-w-none">{email || 'No email set'}</span>
                </span>
                {phone && (
                  <>
                    <span className="text-white/40">•</span>
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-emerald-300" />
                      <span>{phone}</span>
                    </span>
                  </>
                )}
              </p>

              {/* Completeness Bar */}
              <div className="pt-1.5 max-w-sm mx-auto sm:mx-0">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold mb-1">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-300" /> Profile Completeness
                  </span>
                  <span className="text-emerald-300 font-extrabold">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ Navigation Tabs ══════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          {[
            { id: 'personal', label: 'Personal & Academic', icon: User },
            { id: 'location', label: 'Location & Address', icon: MapPin },
            { id: 'guardian', label: 'Guardian Information', icon: Users },
            { id: 'security', label: 'Security & Preferences', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "py-2.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center",
                  isActive
                    ? "bg-white text-[#001F3F] shadow-xs border border-slate-200/80 font-black"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                )}
              >
                <Icon size={14} className={isActive ? "text-primary shrink-0" : "text-slate-400 shrink-0"} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ══ Form Card ════════════════════════════════════════════════ */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs sm:shadow-sm p-4 sm:p-8 space-y-5 sm:space-y-6">
          {/* Success Banner */}
          <AnimatePresence>
            {isSaved && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs"
              >
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Your profile settings have been successfully updated!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Banner */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs"
              >
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tab 1: Personal & Academic */}
          {activeTab === 'personal' && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
              <div className="border-b border-slate-100 pb-2.5 sm:pb-3">
                <h3 className="text-sm sm:text-base font-black text-[#001F3F]">Personal & Academic Details</h3>
                <p className="text-xs text-slate-400 font-medium">Keep your academic background and basic contact info updated.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" /> Student / Guardian Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Toufikul Islam"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" /> Email Address (Account Identifier)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>

                {/* Primary Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> Emergency / Alternate Contact
                  </label>
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="e.g. 018XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male (পুরুষ)</option>
                    <option value="Female">Female (নারী)</option>
                    <option value="Other">Other (অন্যান্য)</option>
                  </select>
                </div>

                {/* Class / Grade Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap size={13} className="text-slate-400" /> Current Class / Grade Level
                  </label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Class / Level</option>
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Medium / Curriculum */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-slate-400" /> Medium / Curriculum
                  </label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Curriculum Medium</option>
                    {MEDIUMS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Institution / School */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-400" /> School / College / University Name
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Notre Dame College / Dhaka City College"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Bio / Learning Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Learning Goals / Notes for Tutors
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mention your preferred subjects, target exam goals, or special requirements..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {/* Tab 2: Location & Address (Integrated with @olism/bd-geo) */}
          {activeTab === 'location' && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
              <div className="border-b border-slate-100 pb-2.5 sm:pb-3">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary" />
                  <h3 className="text-sm sm:text-base font-black text-[#001F3F]">Location & Address Information</h3>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Powered by Bangladesh Geo database for accurate tutor proximity matching.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Division Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Globe size={13} className="text-slate-400" /> Division (বিভাগ) *
                  </label>
                  <select
                    value={divisionId}
                    onChange={handleDivisionChange}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Division</option>
                    {allDivisions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.nameBn ? `(${d.nameBn})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> District (জেলা) *
                  </label>
                  <select
                    value={districtId}
                    onChange={handleDistrictChange}
                    required
                    disabled={!divisionId}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.nameBn ? `(${d.nameBn})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Upazila / Thana Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Navigation size={13} className="text-slate-400" /> Thana / Upazila (থানা/উপজেলা) *
                  </label>
                  <select
                    value={upazilaId}
                    onChange={handleUpazilaChange}
                    disabled={!districtId}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select Thana / Upazila</option>
                    {availableUpazilas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.nameBn ? `(${u.nameBn})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Area / Sub-area / Landmark */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Home size={13} className="text-slate-400" /> Specific Area / Neighborhood / Landmark (এলাকা/মহল্লা)
                  </label>
                  <input
                    type="text"
                    list="student-area-suggestions"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Dhanmondi 27, Mirpur-10, Sector-4, Zindabazar, Agrabad"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  {availableAreas.length > 0 && (
                    <datalist id="student-area-suggestions">
                      {availableAreas.map((loc, idx) => (
                        <option key={idx} value={loc} />
                      ))}
                    </datalist>
                  )}
                </div>

                {/* Preferred Tuition Mode */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Tuition Delivery Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { id: 'Home Tutoring', label: 'Home Tutoring (বাসায় এসে)' },
                      { id: 'Online Tutoring', label: 'Online Tutoring (অনলাইন)' },
                      { id: 'Both', label: 'Both (উভয় মাধ্যম)' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setPreferredTuitionMode(mode.id as any)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer active:scale-98",
                          preferredTuitionMode === mode.id
                            ? "bg-emerald-50 border-emerald-400 text-emerald-800 shadow-2xs font-extrabold"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Street Address */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> Detailed Street Address / House & Road No. *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="e.g. House #12, Road #5, Block #A, Dhanmondi, Dhaka"
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 3: Guardian Details */}
          {activeTab === 'guardian' && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
              <div className="border-b border-slate-100 pb-2.5 sm:pb-3">
                <h3 className="text-sm sm:text-base font-black text-[#001F3F]">Guardian Contact & Relationship</h3>
                <p className="text-xs text-slate-400 font-medium">Guardian information ensures safety, verification, and payment coordination.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Guardian Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Users size={13} className="text-slate-400" /> Guardian Full Name
                  </label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Md. Rafiqul Islam"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Relationship */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <HeartHandshake size={13} className="text-slate-400" /> Relationship to Student
                  </label>
                  <select
                    value={guardianRelation}
                    onChange={(e) => setGuardianRelation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">Select Relationship</option>
                    {RELATIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Guardian Phone */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> Guardian Contact Number (WhatsApp / Calling)
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 4: Security & Preferences */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="space-y-5 sm:space-y-6">
              <div className="border-b border-slate-100 pb-2.5 sm:pb-3">
                <h3 className="text-sm sm:text-base font-black text-[#001F3F]">Security & Notification Settings</h3>
                <p className="text-xs text-slate-400 font-medium">Manage your password and choose how you receive real-time notifications.</p>
              </div>

              {/* Password Change Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 sm:space-y-4">
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-primary" />
                  <h4 className="text-xs sm:text-sm font-black text-[#001F3F]">Change Password</h4>
                </div>

                <AnimatePresence>
                  {passSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2"
                    >
                      <Check size={16} /> Password updated successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Password</label>
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">New Password</label>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-primary" />
                  <h4 className="text-xs sm:text-sm font-black text-[#001F3F]">Notification Preferences</h4>
                </div>

                <div className="space-y-2 pt-1">
                  {[
                    {
                      label: 'Real-time Chat & Message Notifications',
                      desc: 'Get instant push alerts when a tutor or admin sends you a message.',
                      checked: notifyChat,
                      toggle: () => setNotifyChat(!notifyChat),
                    },
                    {
                      label: 'Tuition Job Application Alerts',
                      desc: 'Receive updates when qualified tutors apply for your tuition post.',
                      checked: notifyTuition,
                      toggle: () => setNotifyTuition(!notifyTuition),
                    },
                    {
                      label: 'Verified Tutor Matching Recommendations',
                      desc: 'Get recommendations of top-rated tutors matching your area and subjects.',
                      checked: notifyTutorMatch,
                      toggle: () => setNotifyTutorMatch(!notifyTutorMatch),
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={item.toggle}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="pr-3">
                        <p className="text-xs font-bold text-slate-800">{item.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                      </div>
                      <div className={cn(
                        "w-11 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0",
                        item.checked ? "bg-emerald-500" : "bg-slate-300"
                      )}>
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out shadow-xs",
                          item.checked ? "translate-x-5" : "translate-x-0"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ Submit Action Bar ═════════════════════════════════════ */}
          <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : isSaved ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Changes Saved</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
}
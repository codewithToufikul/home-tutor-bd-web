import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  BookOpen,
  User,
  FileText,
  ChevronRight,
  MapPin,
  Plus,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Camera,
  Sparkles,
  AlertCircle,
  Clock,
  XCircle,
  Upload,
  Eye,
  ExternalLink,
  Check,
  X,
  Info,
  Building2,
  CreditCard,
  Briefcase
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import { useGetMyTutorProfileQuery, useSubmitTutorVerificationMutation, useUpdateTutorProfileMutation } from '@/src/services/tutorApi.ts';
import { uploadFile } from '@/src/repositories/storageRepository.ts';
import { calculateTutorProfileCompletion } from '@/src/lib/profileCompletion.ts';
import { SUBJECTS } from '@/src/constants.tsx';
import { useSearchParams, Link } from 'react-router-dom';

type TabType = 'educational' | 'tuition' | 'personal' | 'documents' | 'verification';

export default function TutorProfileDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType;

  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'educational');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // RTK Query Hooks for Tutor Profile & Verification
  const { data: apiProfileResponse, isLoading: isFetchingProfile, refetch } = useGetMyTutorProfileQuery(undefined);
  const [submitVerification, { isLoading: isSubmittingVerification }] = useSubmitTutorVerificationMutation();
  const [updateProfileMutation] = useUpdateTutorProfileMutation();

  const tutorApiData = (apiProfileResponse as any)?.data || apiProfileResponse || {};

  // Form State Data
  const [profileData, setProfileData] = useState<any>({
    photoUrl: '',
    // Educational - Secondary
    sscInstitute: '', sscCurriculum: 'Select One', sscGroup: 'Select One', sscYear: '2026', sscResult: '',
    // Educational - Higher Secondary
    hscInstitute: '', hscCurriculum: 'Select One', hscGroup: 'Select One', hscYear: '2026', hscResult: '',
    // Educational - Graduation
    gradInstituteType: 'Select One',
    gradInstitute: '',
    gradStudyType: 'Select One',
    gradDept: '',
    gradCurriculum: 'Select One',
    gradYear: 'First Year',
    gradCgpa: '',

    // Tuition
    tuitionDistrict: 'Dhaka', preferredArea: '', preferredMedium: 'Select...', preferredClasses: [] as string[],
    preferredSubjects: [] as string[], preferredSubject: '', daysPerWeek: '1 Day', timingShift: 'Morning', expectedSalary: 'Select One',
    tutoringStyle: 'Private Tutoring', experienceYears: '0 year(s)',

    // Personal
    fullName: user?.name || '', phone: user?.phone || '', altPhone: '', gender: 'Male',
    currentCity: '', currentArea: '', permanentAddress: '',
    fatherName: '', fatherPhone: '', motherName: '', motherPhone: '',
    emergencyPhone: '', guardianRelation: '', bio: '',

    // Documents
    nid: '',
    nidCard: '',
    studentIdCard: '',
    sscCertificate: '',
    hscCertificate: '',
  });

  // Individual Uploading States
  const [uploadingDocs, setUploadingDocs] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (tabParam && ['educational', 'tuition', 'personal', 'documents', 'verification'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync data from API/Firestore
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const ex = tutorApiData;
        if (ex && Object.keys(ex).length > 0) {
          setProfileData((prev: any) => ({
            ...prev,
            ...ex,
            fullName: ex.name || ex.userId?.name || user?.name || prev.fullName,
            phone: ex.phone || ex.userId?.phone || user?.phone || prev.phone,
            photoUrl: ex.photoUrl || ex.avatar || ex.userId?.avatar || prev.photoUrl || '',
            gradInstitute: ex.university || ex.gradInstitute || prev.gradInstitute || '',
            gradDept: ex.department || ex.gradDept || prev.gradDept || '',
            expectedSalary: ex.salary ? String(ex.salary) : prev.expectedSalary,
            preferredSubjects: ex.subjects || prev.preferredSubjects || [],
            gender: ex.gender || prev.gender || 'Male',
            nid: ex.nid || prev.nid || '',
            nidCard: ex.nidCard || prev.nidCard || '',
            studentIdCard: ex.studentIdCard || prev.studentIdCard || '',
            sscCertificate: ex.certificates?.[0] || prev.sscCertificate || '',
            hscCertificate: ex.certificates?.[1] || prev.hscCertificate || '',
          }));
        }
      } catch (err) {
        console.warn('Error fetching tutor data:', err);
      }
    };
    fetchTutorData();
  }, [tutorApiData, user]);

  const handleChange = (field: string, value: any) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleDocumentUpload = async (docType: 'nidCard' | 'studentIdCard' | 'sscCertificate' | 'hscCertificate', file: File) => {
    setUploadingDocs(prev => ({ ...prev, [docType]: true }));
    setSuccessMsg(null);
    try {
      const url = await uploadFile(file, 'home-tutor-bd/documents');
      setProfileData((prev: any) => ({ ...prev, [docType]: url }));
      
      // Auto-save document url to backend profile
      await updateProfileMutation({ [docType]: url }).unwrap();
      refetch();
      setSuccessMsg('ডকুমেন্ট সফলভাবে আপলোড ও সংরক্ষণ হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'ডকুমেন্ট আপলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docType]: false }));
    }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const url = await uploadFile(file, 'home-tutor-bd/profile-images');
      setProfileData((prev: any) => ({ ...prev, photoUrl: url }));
      await updateProfileMutation({ photoUrl: url, avatar: url }).unwrap();
      refetch();
      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveAndNext = async () => {
    setSaving(true);
    setSuccessMsg(null);
    try {
      // Save profile payload
      const salaryNum = parseInt(profileData.expectedSalary.replace(/[^0-9]/g, ''), 10) || 0;
      await updateProfileMutation({
        ...profileData,
        name: profileData.fullName,
        university: profileData.gradInstitute,
        department: profileData.gradDept,
        salary: salaryNum,
        subjects: profileData.preferredSubjects,
      }).unwrap();

      refetch();
      setSuccessMsg('Saved Successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);

      // Move to next tab
      const tabOrder: TabType[] = ['educational', 'tuition', 'personal', 'documents', 'verification'];
      const nextIndex = tabOrder.indexOf(activeTab) + 1;
      if (nextIndex < tabOrder.length) {
        handleTabChange(tabOrder[nextIndex]);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalVerificationSubmit = async () => {
    if (!profileData.nidCard || !profileData.studentIdCard) {
      alert('অনুগ্রহ করে Documents ট্যাবে NID কার্ড এবং স্টুডেন্ট/টিউটর আইডি কার্ড উভয় ডকুমেন্ট আপলোড করুন।');
      handleTabChange('documents');
      return;
    }

    try {
      await submitVerification({
        nidCard: profileData.nidCard,
        studentIdCard: profileData.studentIdCard,
        nid: profileData.nid?.trim(),
      }).unwrap();

      refetch();
      setSuccessMsg('আপনার ভেরিফিকেশন আবেদনটি অ্যাডমিন ও মডারেটরদের কাছে পর্যালোচনার জন্য সফলভাবে জমা হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.data?.message || err.message || 'ভেরিফিকেশন সাবমিট করতে সমস্যা হয়েছে।');
    }
  };

  const isVerified = Boolean(tutorApiData?.isVerified || user?.isApproved);
  const verificationStatus = tutorApiData?.verificationStatus || (isVerified ? 'Approved' : (profileData.nidCard && profileData.studentIdCard ? 'Pending' : 'Unsubmitted'));
  const rejectionReason = tutorApiData?.rejectionReason;

  const completion = useMemo(() => {
    return calculateTutorProfileCompletion({
      ...profileData,
      avatar: profileData.photoUrl,
    });
  }, [profileData]);

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'educational', label: 'EDUCATIONAL-INFO', icon: GraduationCap },
    { id: 'tuition', label: 'TUITION-INFO', icon: BookOpen },
    { id: 'personal', label: 'PERSONAL-INFO', icon: User },
    { id: 'documents', label: 'DOCUMENTS-INFO', icon: FileText },
    { id: 'verification', label: 'VERIFICATION-INFO', icon: ShieldCheck },
  ];

  return (
    <TutorLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        
        {/* Profile Completion Header Card */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
          {/* Avatar with Camera Upload */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-primary p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={profileData.photoUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.name || 'tutor')}&backgroundColor=b6e3f4`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-primary-dark transition-colors">
              <Camera size={14} />
              <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} className="hidden" />
            </label>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="animate-spin text-white" size={20} />
              </div>
            )}
          </div>

          {/* Progress Bar & Missing Fields */}
          <div className="flex-grow space-y-3 w-full text-center md:text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" />
                <h3 className="font-bold text-ink text-sm">প্রোফাইল সম্পূর্ণ করুন</h3>
                <span className="text-xs text-ink-muted hidden sm:inline">— সম্পূর্ণ করলে ৩ গুণ বেশি টিউশন অফার পাবেন।</span>
              </div>
              <span className="px-3 py-1 bg-rose-50 text-rose-600 font-black text-xs rounded-full border border-rose-100">
                {completion.percentage}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-primary transition-all duration-500"
                style={{ width: `${completion.percentage}%` }}
              />
            </div>

            {completion?.missingItems && completion.missingItems.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {completion.missingItems.slice(0, 4).map((f, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-rose-600 bg-rose-50/80 px-2.5 py-1 rounded-md border border-rose-100">
                    ✨ {f.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-white p-2 rounded-2xl border border-ink/10 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                )}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Section */}
        <div className="space-y-6">
          
          {/* 1. EDUCATIONAL INFO TAB */}
          {activeTab === 'educational' && (
            <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              {/* Secondary (SSC) */}
              <div className="space-y-4">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider flex items-center gap-2 border-b border-ink/5 pb-2">
                  <GraduationCap className="text-primary" size={18} /> Secondary (SSC / O-Level)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormGroup label="Institute Name" placeholder="ex: Govt Laboratory High School" value={profileData.sscInstitute} onChange={(v) => handleChange('sscInstitute', v)} />
                  <FormGroup label="Curriculum" type="select" options={['Bangla Medium', 'English Version', 'English Medium', 'Madrasah']} value={profileData.sscCurriculum} onChange={(v) => handleChange('sscCurriculum', v)} />
                  <FormGroup label="Group" type="select" options={['Science', 'Commerce', 'Humanities']} value={profileData.sscGroup} onChange={(v) => handleChange('sscGroup', v)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Passing Year" type="select" options={['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']} value={profileData.sscYear} onChange={(v) => handleChange('sscYear', v)} />
                  <FormGroup label="GPA / Result" placeholder="ex: 5.00" value={profileData.sscResult} onChange={(v) => handleChange('sscResult', v)} />
                </div>
              </div>

              {/* Higher Secondary (HSC) */}
              <div className="space-y-4 pt-6 border-t border-ink/5">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider flex items-center gap-2 border-b border-ink/5 pb-2">
                  <GraduationCap className="text-primary" size={18} /> Higher Secondary (HSC / A-Level)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormGroup label="Institute Name" placeholder="ex: Dhaka College" value={profileData.hscInstitute} onChange={(v) => handleChange('hscInstitute', v)} />
                  <FormGroup label="Curriculum" type="select" options={['Bangla Medium', 'English Version', 'English Medium', 'Madrasah']} value={profileData.hscCurriculum} onChange={(v) => handleChange('hscCurriculum', v)} />
                  <FormGroup label="Group" type="select" options={['Science', 'Commerce', 'Humanities']} value={profileData.hscGroup} onChange={(v) => handleChange('hscGroup', v)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Passing Year" type="select" options={['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']} value={profileData.hscYear} onChange={(v) => handleChange('hscYear', v)} />
                  <FormGroup label="GPA / Result" placeholder="ex: 5.00" value={profileData.hscResult} onChange={(v) => handleChange('hscResult', v)} />
                </div>
              </div>

              {/* Graduation / University */}
              <div className="space-y-4 pt-6 border-t border-ink/5">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider flex items-center gap-2 border-b border-ink/5 pb-2">
                  <Building2 className="text-primary" size={18} /> Graduation / Current University Study
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormGroup label="Institute Type" type="select" options={['Public University', 'Private University', 'National University', 'Medical College', 'Engineering / BUET', 'Other']} value={profileData.gradInstituteType} onChange={(v) => handleChange('gradInstituteType', v)} />
                  <FormGroup label="University Name" placeholder="ex: University of Dhaka" value={profileData.gradInstitute} onChange={(v) => handleChange('gradInstitute', v)} required />
                  <FormGroup label="Department / Major" placeholder="ex: Computer Science & Engineering" value={profileData.gradDept} onChange={(v) => handleChange('gradDept', v)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Current Year / Status" type="select" options={['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Graduated / Completed', 'Masters / Post-Grad']} value={profileData.gradYear} onChange={(v) => handleChange('gradYear', v)} />
                  <FormGroup label="CGPA (Optional)" placeholder="ex: 3.85" value={profileData.gradCgpa} onChange={(v) => handleChange('gradCgpa', v)} />
                </div>
              </div>
            </div>
          )}

          {/* 2. TUITION INFO TAB */}
          {activeTab === 'tuition' && (
            <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="Tuition District" type="select" options={['Dhaka', 'Chittagong', 'Rajshahi', 'Sylhet', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh']} value={profileData.tuitionDistrict} onChange={(v) => handleChange('tuitionDistrict', v)} required />
                <FormGroup label="Preferred Tuition Areas" placeholder="ex: Mirpur, Dhanmondi, Uttara" value={profileData.preferredArea} onChange={(v) => handleChange('preferredArea', v)} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormGroup label="Preferred Medium" type="select" options={['Bangla Medium', 'English Version', 'English Medium', 'Madrasah', 'All Mediums']} value={profileData.preferredMedium} onChange={(v) => handleChange('preferredMedium', v)} required />
                <FormGroup label="Days Per Week" type="select" options={['2 Days/Week', '3 Days/Week', '4 Days/Week', '5 Days/Week', '6 Days/Week']} value={profileData.daysPerWeek} onChange={(v) => handleChange('daysPerWeek', v)} />
                <FormGroup label="Expected Monthly Salary (BDT)" placeholder="ex: 6000" value={profileData.expectedSalary} onChange={(v) => handleChange('expectedSalary', v)} required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#001F3F] block">Select Preferred Subjects to Teach</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUBJECTS.slice(0, 16).map((sub) => {
                    const isSelected = profileData.preferredSubjects?.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => {
                          const current = profileData.preferredSubjects || [];
                          const next = isSelected ? current.filter((s: string) => s !== sub) : [...current, sub];
                          handleChange('preferredSubjects', next);
                        }}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                          isSelected
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {isSelected ? '✓ ' : '+ '}{sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-ink/5">
                <FormGroup label="Tutoring Style" type="select" options={['Private Tutoring (One to One)', 'Online Tutoring', 'Group Tutoring', 'All Types']} value={profileData.tutoringStyle} onChange={(v) => handleChange('tutoringStyle', v)} />
                <FormGroup label="Total Teaching Experience" type="select" options={['0 year(s)', '1 year(s)', '2 year(s)', '3 year(s)', '4 year(s)', '5+ year(s)']} value={profileData.experienceYears} onChange={(v) => handleChange('experienceYears', v)} />
              </div>
            </div>
          )}

          {/* 3. PERSONAL INFO TAB */}
          {activeTab === 'personal' && (
            <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormGroup label="E-Mail" value={user?.email || ''} required disabled />
                <FormGroup label="Phone Number" value={profileData.phone} onChange={(v) => handleChange('phone', v)} required disabled />
                <FormGroup label="Additional Phone Number" placeholder="ex: 017..." value={profileData.altPhone} onChange={(v) => handleChange('altPhone', v)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FormGroup label="Full Name" value={profileData.fullName} onChange={(v) => handleChange('fullName', v)} required />
                </div>
                <FormGroup label="Gender" type="select" options={['Male', 'Female']} value={profileData.gender} onChange={(v) => handleChange('gender', v)} required />
              </div>

              <div className="space-y-4 pt-6 border-t border-ink/5">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Present & Permanent Address
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Current City" type="select" options={['Dhaka', 'Chittagong', 'Rajshahi', 'Sylhet', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh']} value={profileData.currentCity} onChange={(v) => handleChange('currentCity', v)} />
                  <FormGroup label="Current Area" placeholder="ex: Mirpur-1, Dhaka" value={profileData.currentArea} onChange={(v) => handleChange('currentArea', v)} />
                </div>
                <FormGroup label="Permanent Address" type="textarea" placeholder="Village/Road, Thana, District" value={profileData.permanentAddress} onChange={(v) => handleChange('permanentAddress', v)} />
              </div>

              <div className="space-y-4 pt-6 border-t border-ink/5">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider">About Yourself (Bio)</h2>
                <FormGroup label="Bio / Teaching Philosophy" type="textarea" placeholder="Write a short summary about your teaching methodology, strengths, and background..." value={profileData.bio} onChange={(v) => handleChange('bio', v)} />
              </div>
            </div>
          )}

          {/* 4. DOCUMENTS INFO TAB (Cloudinary Direct Upload) */}
          {activeTab === 'documents' && (
            <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
              <div>
                <h2 className="text-lg font-black text-ink">Upload Verification & Educational Documents</h2>
                <p className="text-xs text-ink-muted mt-1">
                  Upload your National ID card and Student ID card to get verified. Documents are securely encrypted via Cloudinary.
                </p>
              </div>

              {/* NID Number Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                  National ID (NID) Number / Smart Card No
                </label>
                <input
                  type="text"
                  value={profileData.nid || ''}
                  onChange={(e) => handleChange('nid', e.target.value)}
                  placeholder="e.g. 1998261234567890"
                  className="w-full bg-slate-50 border border-ink/10 rounded-2xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                />
              </div>

              {/* Document Upload Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                
                {/* 1. NID Card Box */}
                <DocumentUploadCard
                  title="1. National ID (NID) Card"
                  required
                  docUrl={profileData.nidCard}
                  isUploading={uploadingDocs.nidCard}
                  onUpload={(file) => handleDocumentUpload('nidCard', file)}
                  onPreview={() => setPreviewImage(profileData.nidCard)}
                />

                {/* 2. Student ID Card Box */}
                <DocumentUploadCard
                  title="2. Student ID / University ID"
                  required
                  docUrl={profileData.studentIdCard}
                  isUploading={uploadingDocs.studentIdCard}
                  onUpload={(file) => handleDocumentUpload('studentIdCard', file)}
                  onPreview={() => setPreviewImage(profileData.studentIdCard)}
                />

                {/* 3. SSC Certificate */}
                <DocumentUploadCard
                  title="3. SSC / O-Level Certificate"
                  docUrl={profileData.sscCertificate}
                  isUploading={uploadingDocs.sscCertificate}
                  onUpload={(file) => handleDocumentUpload('sscCertificate', file)}
                  onPreview={() => setPreviewImage(profileData.sscCertificate)}
                />

                {/* 4. HSC Certificate */}
                <DocumentUploadCard
                  title="4. HSC / A-Level Certificate"
                  docUrl={profileData.hscCertificate}
                  isUploading={uploadingDocs.hscCertificate}
                  onUpload={(file) => handleDocumentUpload('hscCertificate', file)}
                  onPreview={() => setPreviewImage(profileData.hscCertificate)}
                />

              </div>

              {/* Next Step Callout */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary shrink-0" size={24} />
                  <div>
                    <h4 className="text-xs font-bold text-ink">ডকুমেন্ট আপলোড শেষ হয়েছে?</h4>
                    <p className="text-[11px] text-ink-muted">পরবর্তী ধাপে Verification ট্যাবে গিয়ে তথ্য রিভিয়ু করে অ্যাডমিনের কাছে সাবমিট করুন।</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('verification')}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shrink-0 cursor-pointer"
                >
                  Go to Verification Tab →
                </button>
              </div>
            </div>
          )}

          {/* 5. VERIFICATION INFO TAB (Full Review & Submit for Approval) */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              
              {/* Live Verification Status Card */}
              {isVerified || verificationStatus === 'Approved' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ★ শতভাগ অনুমোদিত ও ভেরিফাইড প্রোফাইল
                    </span>
                    <h3 className="text-xl font-display font-black text-emerald-950 pt-1">অভিনন্দন! আপনার প্রোফাইল ভেরিফাইড 🎉</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
                      অ্যাডমিন আপনার NID ও স্টুডেন্ট আইডি কার্ড যাচাই করে অনুমোদন করেছেন। আপনার প্রোফাইল এখন পাবলিক টিউটর তালিকায় দৃশ্যমান এবং আপনি প্ল্যাটফর্মের যেকোনো টিউশন জবে সরাসরি আবেদন করতে পারবেন।
                    </p>
                    <div className="pt-3">
                      <Link to="/jobs" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm">
                        <span>Browse Available Tuition Jobs</span>
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              ) : verificationStatus === 'Pending' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                    <Clock size={32} />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                      ⏳ পর্যালোচনায় রয়েছে (Under Review)
                    </span>
                    <h3 className="text-xl font-display font-black text-amber-950 pt-1">ভেরিফিকেশন আবেদন জমা হয়েছে</h3>
                    <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                      আপনার আপলোডকৃত NID ও স্টুডেন্ট আইডি কার্ড অ্যাডমিন ও মডারেটরদের কাছে পর্যালোচনার জন্য জমা রয়েছে। খুব দ্রুত যাচাই শেষে অনুমোদন দেওয়া হবে এবং আপনার ড্যাশবোর্ডে নোটিফিকেশন পাঠানো হবে।
                    </p>
                  </div>
                </div>
              ) : verificationStatus === 'Rejected' ? (
                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-rose-500/20">
                    <XCircle size={32} />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300">
                      ❌ ভেরিফিকেশন আবেদন প্রত্যাখ্যাত
                    </span>
                    <h3 className="text-xl font-display font-black text-rose-950 pt-1">ডকুমেন্টে সমস্যা পাওয়া গেছে</h3>
                    <p className="text-xs text-rose-800 leading-relaxed max-w-2xl">
                      {rejectionReason ? (
                        <><strong>অ্যাডমিন মন্তব্য:</strong> {rejectionReason}</>
                      ) : (
                        'আপনার আপলোডকৃত ডকুমেন্টের ছবি অস্পষ্ট বা অসম্পূর্ণ হওয়ায় তা সাময়িকভাবে প্রত্যাখ্যাত হয়েছে। অনুগ্রহ করে ডকুমেন্টস ট্যাবে গিয়ে সঠিক ছবি পুনরায় আপলোড করুন।'
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50/80 border border-blue-200 rounded-3xl p-6 sm:p-8 flex items-start gap-4 shadow-sm">
                  <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                    <Info size={32} />
                  </div>
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-primary border border-blue-300">
                      ⚠️ ভেরিফিকেশন প্রয়োজন
                    </span>
                    <h3 className="text-xl font-display font-black text-slate-900 pt-1">প্রোফাইল ভেরিফিকেশন সাবমিট করুন</h3>
                    <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                      টিউশন জবে আবেদন করতে এবং পাবলিক টিউটর তালিকায় নাম দেখাতে আপনার প্রোফাইল ভেরিফাই করা বাধ্যতামূলক। নিচের আপলোডকৃত ডকুমেন্টস যাচাই করে সাবমিট করুন।
                    </p>
                  </div>
                </div>
              )}

              {/* Uploaded Documents Review Grid */}
              <div className="bg-white border border-ink/10 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                <h3 className="text-sm font-black text-ink uppercase tracking-wider border-b border-ink/5 pb-3">
                  📄 আপলোডকৃত ডকুমেন্ট ও প্রোফাইল সারাংশ
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* NID Card Summary */}
                  <div className="border border-ink/10 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">1. National ID (NID) Card</span>
                      {profileData.nidCard && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(profileData.nidCard)}
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} /> View Full
                        </button>
                      )}
                    </div>

                    {profileData.nidCard ? (
                      <div className="h-32 rounded-xl overflow-hidden border border-ink/10 bg-white relative group">
                        <img src={profileData.nidCard} alt="NID Card" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={11} /> Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs font-bold text-rose-600">NID Card Not Uploaded</p>
                        <button
                          type="button"
                          onClick={() => handleTabChange('documents')}
                          className="text-[10px] font-bold text-primary hover:underline mt-1 cursor-pointer"
                        >
                          Upload Now →
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">NID No: <strong>{profileData.nid || 'Not Provided'}</strong></p>
                  </div>

                  {/* Student ID Card Summary */}
                  <div className="border border-ink/10 rounded-2xl p-4 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">2. Student ID / University ID</span>
                      {profileData.studentIdCard && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(profileData.studentIdCard)}
                          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} /> View Full
                        </button>
                      )}
                    </div>

                    {profileData.studentIdCard ? (
                      <div className="h-32 rounded-xl overflow-hidden border border-ink/10 bg-white relative group">
                        <img src={profileData.studentIdCard} alt="Student ID" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check size={11} /> Uploaded
                        </span>
                      </div>
                    ) : (
                      <div className="h-32 rounded-xl border border-dashed border-rose-300 bg-rose-50/50 flex flex-col items-center justify-center p-4 text-center">
                        <p className="text-xs font-bold text-rose-600">Student ID Not Uploaded</p>
                        <button
                          type="button"
                          onClick={() => handleTabChange('documents')}
                          className="text-[10px] font-bold text-primary hover:underline mt-1 cursor-pointer"
                        >
                          Upload Now →
                        </button>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-500">University: <strong>{profileData.gradInstitute || 'Not Provided'}</strong></p>
                  </div>
                </div>

                {/* Final Submit Button */}
                <div className="pt-4 border-t border-ink/10 space-y-2">
                  <button
                    type="button"
                    onClick={handleFinalVerificationSubmit}
                    disabled={isSubmittingVerification || !profileData.nidCard || !profileData.studentIdCard}
                    className="w-full py-4 px-6 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmittingVerification ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Submitting for Admin Review...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        <span>{isVerified ? 'Update & Re-Submit for Verification' : 'Submit for Admin Verification Review'}</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    📢 সাবমিট করার সাথে সাথে Super Admin, Admin ও Moderator ড্যাশবোর্ডে রিয়েল-টাইম নোটিফিকেশন পৌঁছে যাবে।
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* Next Button for Forms */}
          {activeTab !== 'verification' && (
            <div className="flex flex-col items-center gap-2 pt-4">
              {successMsg && (
                <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 size={16} /> {successMsg}
                </p>
              )}
              <button
                onClick={handleSaveAndNext}
                disabled={saving}
                className="bg-primary text-white px-12 py-3.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Save & Next
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Full-Screen Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-3xl max-h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Document Preview"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
              <div className="p-3 flex items-center justify-between">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={14} /> Open in New Tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </TutorLayout>
  );
}

// ─── Document Upload Card Component ───────────────────────────────────────────
function DocumentUploadCard({
  title,
  required = false,
  docUrl,
  isUploading = false,
  onUpload,
  onPreview
}: {
  title: string;
  required?: boolean;
  docUrl?: string;
  isUploading?: boolean;
  onUpload: (file: File) => void;
  onPreview?: () => void;
}) {
  return (
    <div className="border-2 border-dashed border-ink/15 rounded-3xl p-6 text-center hover:border-primary/40 transition-all bg-slate-50/60 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
      {isUploading ? (
        <div className="space-y-3 py-6 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs font-bold text-primary">Uploading to Cloudinary...</p>
        </div>
      ) : docUrl ? (
        <div className="space-y-3 w-full flex flex-col items-center">
          <div className="relative w-full max-w-[240px] h-32 rounded-2xl overflow-hidden border border-ink/10 shadow-sm group">
            <img src={docUrl} alt={title} className="w-full h-full object-cover" />
            {onPreview && (
              <button
                type="button"
                onClick={onPreview}
                className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Eye size={16} /> View Full
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
              <Check size={12} /> Uploaded
            </span>
            <label className="text-[11px] font-bold text-primary hover:underline cursor-pointer">
              <span>Change</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer space-y-3 py-4 w-full flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
            <Upload size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-ink block">
              {title} {required && <span className="text-rose-500">*</span>}
            </span>
            <span className="text-[10px] text-ink-muted mt-0.5 block">JPG, PNG, WebP or PDF (Max 5MB)</span>
          </div>
          <span className="inline-block text-xs font-bold text-primary bg-white border border-primary/20 px-3.5 py-1.5 rounded-xl shadow-xs">
            Choose File
          </span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

// ─── Reusable Form Group Input ────────────────────────────────────────────────
function FormGroup({
  label,
  value = '',
  onChange,
  placeholder,
  type = 'input',
  options = [],
  required = false,
  disabled = false
}: {
  label: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  type?: 'input' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-[#001F3F] flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {type === 'input' ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full border border-ink/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink/20",
            disabled ? "bg-[#EBEDF0] text-ink cursor-not-allowed border-transparent" : "bg-white"
          )}
        />
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-ink/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink/20 min-h-[80px] mt-1"
        />
      ) : (
        <select
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          disabled={disabled}
          className="w-full border border-ink/10 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}
    </div>
  );
}
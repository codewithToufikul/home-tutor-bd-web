import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  Camera
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';

type TabType = 'educational' | 'tuition' | 'personal' | 'documents' | 'verification';

export default function TutorProfileDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('educational');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

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
    tuitionDistrict: 'Dhaka', preferredArea: '', preferredMedium: 'Select...', preferredClass: 'Select...',
    preferredSubject: 'Select...', daysPerWeek: '1 Day', timingShift: 'Morning', expectedSalary: 'Select One',
    tutoringStyle: 'Private Tutoring', experienceYears: '0 year(s)',
    
    // Personal
    fullName: user?.displayName || 'Md Shakil Hosen', phone: '01722773191', altPhone: '01722773191', gender: 'Male',
    currentCity: 'Dhaka', currentArea: 'Mirpur -1', permanentAddress: '',
    fatherName: '', fatherPhone: '', motherName: '', motherPhone: '',
    emergencyPhone: '', guardianRelation: '', bio: ''
  });

  // Firestore থেকে সেভ হওয়া ডাটা লোড করা
  useEffect(() => {
    const fetchTutorData = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const existing = await TutorProfileService.getByUid(user.uid);
        if (existing) {
          setProfileData((prev: any) => ({ ...prev, ...existing }));
        }
      } catch (err) {
        console.error("Error fetching tutor profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [user]);

  const handleChange = (key: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [key]: value }));
  };

  // Profile photo preview and persistence through the service layer
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    const decision = can({
      user,
      permission: PERMISSIONS.EDIT_PROFILE,
      allowedRoles: ['tutor'],
      ownerId: user.uid,
      resourceOwnerId: user.uid,
    });

    if (!decision.ok) {
      alert(decision.message);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size is too large! Please upload an image under 5MB.');
      return;
    }

    setUploadingPhoto(true);
    try {
      const photoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      setProfileData((prev: any) => ({ ...prev, photoUrl }));

      const existing = await TutorProfileService.getByUid(user.uid);
      if (existing?.id) {
        await TutorProfileService.update(existing.id, { photoUrl });
      } else {
        await TutorProfileService.create({ uid: user.uid, photoUrl });
      }

      alert('Profile photo uploaded successfully!');
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ডাটা সেভ এবং Next ট্যাবে নেভিগেট করার ফাংশন
  const handleSaveAndNext = async () => {
    const decision = can({
      user,
      permission: PERMISSIONS.EDIT_PROFILE,
      allowedRoles: ['tutor'],
      ownerId: user?.uid,
      resourceOwnerId: user?.uid,
    });

    if (!decision.ok) {
      alert(decision.message);
      return;
    }

    setSaving(true);

    try {
      const existing = await TutorProfileService.getByUid(user.uid);
      if (existing?.id) {
        await TutorProfileService.update(existing.id, {
          ...profileData,
          email: user?.email || '',
          updatedAt: new Date().toISOString(),
        });
      } else {
        await TutorProfileService.create({
          uid: user.uid,
          ...profileData,
          email: user?.email || '',
          updatedAt: new Date().toISOString(),
        });
      }

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2000);

      const tabOrder: TabType[] = ['educational', 'tuition', 'personal', 'documents', 'verification'];
      const currentIndex = tabOrder.indexOf(activeTab);
      if (currentIndex < tabOrder.length - 1) {
        setActiveTab(tabOrder[currentIndex + 1]);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'educational', label: 'Educational-info', icon: GraduationCap },
    { id: 'tuition', label: 'Tuition-info', icon: BookOpen },
    { id: 'personal', label: 'Personal-info', icon: User },
    { id: 'documents', label: 'Documents-info', icon: FileText },
    { id: 'verification', label: 'Verification-info', icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <TutorLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Profile Photo Upload Banner Section */}
        <div className="bg-white border border-ink/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/20 bg-gray-100 flex items-center justify-center shadow-md relative">
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              )}

              {profileData.photoUrl ? (
                <img src={profileData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-ink-muted" />
              )}
            </div>
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer z-20">
              <Camera size={20} />
              <span className="text-[10px] font-bold mt-1">Change</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-lg font-black text-[#001F3F]">Upload Profile Photo</h2>
            <p className="text-xs text-ink-muted">Upload a clear professional photo of yourself. (JPG, PNG, Max 5MB)</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0 border border-ink/10 rounded-xl overflow-hidden bg-white shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex flex-col items-center justify-center py-6 px-4 transition-all border-r border-ink/5 last:border-r-0",
                activeTab === tab.id 
                  ? "bg-white border-b-4 border-primary" 
                  : "bg-gray-50/50 text-ink-muted hover:bg-white"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform",
                activeTab === tab.id ? "text-primary scale-110" : "text-ink-muted"
              )}>
                <tab.icon size={32} strokeWidth={1.5} />
              </div>
              <span className={cn(
                "text-xs font-bold uppercase tracking-tight",
                activeTab === tab.id ? "text-primary" : "text-ink-muted"
              )}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-display font-black text-[#001F3F] border-b-4 border-primary w-fit pb-1">
              {tabs.find(t => t.id === activeTab)?.label.split('-')[0]} Info
            </h1>
            <p className="text-sm text-ink-muted font-medium">Update your profile</p>
          </div>

          {activeTab === 'educational' && (
            <div className="space-y-6">
              {/* Secondary Section */}
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-ink/5 text-center">
                  <h2 className="text-sm font-black text-[#001F3F] uppercase tracking-wide">Secondary / SSC / O-level / Dakhil</h2>
                </div>
                <div className="p-8 space-y-4">
                  <FormRow label="Institute" value={profileData.sscInstitute} onChange={(v) => handleChange('sscInstitute', v)} placeholder="ex: Saint Joseph Higher Secondary School" />
                  <FormRow label="Curriculum" type="select" value={profileData.sscCurriculum} onChange={(v) => handleChange('sscCurriculum', v)} options={['Select One', 'Bangla Medium', 'English Medium', 'English Version']} />
                  <FormRow label="Group" type="select" value={profileData.sscGroup} onChange={(v) => handleChange('sscGroup', v)} options={['Select One', 'Science', 'Commerce', 'Arts']} />
                  <FormRow label="Passing Year" type="select" value={profileData.sscYear} onChange={(v) => handleChange('sscYear', v)} options={['2026', '2025', '2024', '2023']} />
                  <FormRow label="Result" value={profileData.sscResult} onChange={(v) => handleChange('sscResult', v)} placeholder="ex: 5.00" />
                </div>
              </div>

              {/* Higher Secondary Section */}
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-ink/5 text-center">
                  <h2 className="text-sm font-black text-[#001F3F] uppercase tracking-wide">Higher Secondary / HSC / A level / Alim</h2>
                </div>
                <div className="p-8 space-y-4">
                  <FormRow label="Institute" value={profileData.hscInstitute} onChange={(v) => handleChange('hscInstitute', v)} placeholder="ex: Notre Dame College, Dhaka" />
                  <FormRow label="Curriculum" type="select" value={profileData.hscCurriculum} onChange={(v) => handleChange('hscCurriculum', v)} options={['Select One', 'Bangla Medium', 'English Medium', 'English Version']} />
                  <FormRow label="Group" type="select" value={profileData.hscGroup} onChange={(v) => handleChange('hscGroup', v)} options={['Select One', 'Science', 'Commerce', 'Arts']} />
                  <FormRow label="Passing Year" type="select" value={profileData.hscYear} onChange={(v) => handleChange('hscYear', v)} options={['2026', '2025', '2024', '2023']} />
                  <FormRow label="Result" value={profileData.hscResult} onChange={(v) => handleChange('hscResult', v)} placeholder="ex: 5.00" />
                </div>
              </div>

              {/* Graduation Section */}
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-ink/5 text-center">
                  <h2 className="text-sm font-black text-[#001F3F] uppercase tracking-wide">Graduation / Bachelor / Diploma</h2>
                </div>
                <div className="p-8 space-y-4">
                  <FormRow label="Institute Type" type="select" value={profileData.gradInstituteType} onChange={(v) => handleChange('gradInstituteType', v)} options={['Select One', 'Public', 'Private', 'National', 'International', 'Polytechnic']} />
                  <FormRow label="Institute" type="input" value={profileData.gradInstitute} onChange={(v) => handleChange('gradInstitute', v)} placeholder="ex: University of Dhaka" />
                  <FormRow label="Study Type" type="select" value={profileData.gradStudyType} onChange={(v) => handleChange('gradStudyType', v)} options={['Select One', 'Regular', 'Professional']} />
                  <FormRow label="Departments" type="input" value={profileData.gradDept} onChange={(v) => handleChange('gradDept', v)} placeholder="ex: Computer Science & Engineering" />
                  <FormRow label="Curriculum" type="select" value={profileData.gradCurriculum} onChange={(v) => handleChange('gradCurriculum', v)} options={['Select One', 'Bangla Medium', 'English Medium', 'English Version']} />
                  <FormRow label="Passing Year/ Semester/ Year* (If has)" type="select" value={profileData.gradYear} onChange={(v) => handleChange('gradYear', v)} options={['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Passed']} />
                  <FormRow label="CGPA / Current CGPA" value={profileData.gradCgpa} onChange={(v) => handleChange('gradCgpa', v)} placeholder="ex: 3.75" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tuition' && (
            <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
              <div className="p-8 space-y-4">
                <FormRow 
                  label="Select provide tuition districts: *" 
                  type="select" 
                  value={profileData.tuitionDistrict}
                  onChange={(v) => handleChange('tuitionDistrict', v)}
                  options={['Dhaka', 'Chittagong', 'Rajshahi', 'Sylhet', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh']} 
                />
                <FormRow 
                  label="Preferred Area for tuition:" 
                  value={profileData.preferredArea}
                  onChange={(v) => handleChange('preferredArea', v)}
                  placeholder="Select Area..."
                />
                <FormRow 
                  label="Preferred Medium:" 
                  type="select" 
                  value={profileData.preferredMedium}
                  onChange={(v) => handleChange('preferredMedium', v)}
                  options={['Select...', 'Bangla Medium', 'English Medium', 'English Version', 'Madrasa Medium']} 
                />
                <FormRow 
                  label="Preferred Classes:" 
                  type="select" 
                  value={profileData.preferredClass}
                  onChange={(v) => handleChange('preferredClass', v)}
                  options={['Select...', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year']} 
                />
                <FormRow 
                  label="Preferred Subjects (1st one will be Major Sub):" 
                  type="select" 
                  value={profileData.preferredSubject}
                  onChange={(v) => handleChange('preferredSubject', v)}
                  options={['Select...', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'ICT', 'Accounting', 'Finance']} 
                />
                <FormRow 
                  label="Days Per Week:" 
                  type="select" 
                  value={profileData.daysPerWeek}
                  onChange={(v) => handleChange('daysPerWeek', v)}
                  options={['1 Day', '2 Days', '3 Days', '4 Days', '5 Days', '6 Days', '7 Days']} 
                />
                <FormRow 
                  label="Timing Shift:" 
                  type="select" 
                  value={profileData.timingShift}
                  onChange={(v) => handleChange('timingShift', v)}
                  options={['Morning', 'Afternoon', 'Evening', 'Night']} 
                />
                <FormRow 
                  label="Expected Salary:" 
                  type="select" 
                  value={profileData.expectedSalary}
                  onChange={(v) => handleChange('expectedSalary', v)}
                  options={['Select One', '3000-5000', '5000-8000', '8000-10000', '10000-15000', '15000+']} 
                />
                <FormRow 
                  label="Preffered Tutoring Style: *" 
                  type="select" 
                  value={profileData.tutoringStyle}
                  onChange={(v) => handleChange('tutoringStyle', v)}
                  options={['Private Tutoring', 'Group Tutoring', 'Online Tutoring']} 
                />
                <FormRow 
                  label="Tuition experience (In Year): *" 
                  type="select" 
                  value={profileData.experienceYears}
                  onChange={(v) => handleChange('experienceYears', v)}
                  options={['0 year(s)', '1 year(s)', '2 year(s)', '3 year(s)', '4 year(s)', '5+ year(s)']} 
                />
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden p-8 space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormGroup label="E-Mail" value={user?.email || 'shakil.infox@gmail.com'} required disabled />
                <FormGroup label="Phone Number" value={profileData.phone} onChange={(v) => handleChange('phone', v)} required disabled />
                <FormGroup label="Additional Phone Number" value={profileData.altPhone} onChange={(v) => handleChange('altPhone', v)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <FormGroup label="Full Name" value={profileData.fullName} onChange={(v) => handleChange('fullName', v)} />
                </div>
                <FormGroup label="Gender" type="select" options={['Male', 'Female', 'Other']} value={profileData.gender} onChange={(v) => handleChange('gender', v)} />
              </div>

              {/* Current Location */}
              <div className="space-y-4 pt-6 border-t border-ink/5">
                <div className="flex items-center gap-2 text-[#001F3F] font-black">
                  <MapPin size={18} className="text-primary" />
                  <span className="text-sm">Your Current Location</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Current City" type="select" options={['Dhaka', 'Chittagong', 'Rajshahi']} value={profileData.currentCity} onChange={(v) => handleChange('currentCity', v)} />
                  <FormGroup label="Current Area" type="select" options={['Mirpur -1', 'Uttara', 'Dhanmondi']} value={profileData.currentArea} onChange={(v) => handleChange('currentArea', v)} />
                </div>
              </div>

              {/* Permanent Location */}
              <div className="space-y-4 pt-6 border-t border-ink/5">
                <div className="flex items-center gap-2 text-[#001F3F] font-black">
                  <MapPin size={18} className="text-primary" />
                  <span className="text-sm">Your Permanent Location</span>
                </div>
                <FormGroup label="Permanent Location" type="textarea" value={profileData.permanentAddress} onChange={(v) => handleChange('permanentAddress', v)} />
              </div>

              {/* Parental Info */}
              <div className="space-y-4 pt-6 border-t border-ink/5">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider">Parental Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Father's Name" placeholder="ex: Kamal Hossain" value={profileData.fatherName} onChange={(v) => handleChange('fatherName', v)} />
                  <FormGroup label="Father's Phone Number" placeholder="ex: 01........." value={profileData.fatherPhone} onChange={(v) => handleChange('fatherPhone', v)} />
                  <FormGroup label="Mother's Name" placeholder="ex: Jahanara Kamal" value={profileData.motherName} onChange={(v) => handleChange('motherName', v)} />
                  <FormGroup label="Mother's Phone Number" placeholder="ex: 01........." value={profileData.motherPhone} onChange={(v) => handleChange('motherPhone', v)} />
                </div>
              </div>

              {/* Extra Info */}
              <div className="space-y-4 pt-6 border-t border-ink/5">
                <h2 className="text-[#001F3F] font-black text-sm uppercase tracking-wider">Extra Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormGroup label="Local Guardian Number (On Emergency)" placeholder="ex: 01........." value={profileData.emergencyPhone} onChange={(v) => handleChange('emergencyPhone', v)} />
                  <FormGroup label="Guardian Relationship" placeholder="ex: Uncle" value={profileData.guardianRelation} onChange={(v) => handleChange('guardianRelation', v)} />
                </div>
                <FormGroup label="About Yourself" type="textarea" value={profileData.bio} onChange={(v) => handleChange('bio', v)} />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DocumentCard title="NID/ Passport/ Birth Certificate" />
                <DocumentCard title="University ID/ Certificate" />
                <DocumentCard title="SSC/ O Level Marksheets/ Certificate" />
                <DocumentCard title="HSC/ A Level Marksheets/ Certificate" />
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Premium Registration Card */}
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-[#40E0D0]" />
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#00E5FF] uppercase tracking-tight">Request for Premium Registration</h2>
                    <p className="text-sm font-medium text-ink-muted">
                      You need to pay a one-time charge for the <span className="font-black text-ink">PREMIUM MEMBERSHIP</span> process.
                    </p>
                  </div>
                  <button className="bg-[#007BFF] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0056b3] transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                    Submit Request
                  </button>
                </div>
              </div>

              {/* Profile Verification Card */}
              <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden relative group hover:shadow-md transition-all">
                <div className="absolute inset-y-0 left-0 w-1.5 bg-[#40E0D0]" />
                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#00E5FF] uppercase tracking-tight">Request for Profile Verification</h2>
                    <p className="text-sm font-medium text-ink-muted leading-relaxed">
                      If you want to make a Tutor profile verification Request, you have to confirm at least One Job.
                    </p>
                  </div>
                  <button className="bg-[#007BFF] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0056b3] transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap">
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex flex-col items-center gap-2 pt-4">
            {successMsg && (
              <p className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 size={16} /> Saved Successfully!
              </p>
            )}
            <button 
              onClick={handleSaveAndNext}
              disabled={saving}
              className="bg-[#6B21A8] text-white px-12 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#581C87] transition-all shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Next
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}

function DocumentCard({ title }: { title: string }) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 hover:shadow-md transition-all cursor-pointer group border-dashed">
      <div className="relative">
        <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <FileText size={40} strokeWidth={1} />
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Plus size={16} strokeWidth={3} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-[10px] font-black text-[#001F3F] leading-tight uppercase tracking-wider">{title}</h3>
        <p className="text-[9px] font-bold text-primary flex items-center justify-center gap-1">
          <Plus size={10} strokeWidth={3} /> Add New
        </p>
      </div>
    </div>
  );
}

function FormGroup({ label, value = '', onChange, placeholder, type = 'input', options = [], required = false, disabled = false }: { 
  label: string, 
  value?: string,
  onChange?: (val: string) => void,
  placeholder?: string, 
  type?: 'input' | 'select' | 'textarea', 
  options?: string[],
  required?: boolean,
  disabled?: boolean
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
            "w-full border border-ink/10 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-ink/20",
            disabled ? "bg-[#EBEDF0] text-ink cursor-not-allowed border-transparent" : "bg-white"
          )}
        />
      ) : type === 'textarea' ? (
        <textarea 
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-ink/10 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-ink/20 min-h-[80px] mt-1"
        />
      ) : (
        <select 
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          className="w-full border border-ink/10 rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-white appearance-none cursor-pointer"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a1a1aa\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}
    </div>
  );
}

function FormRow({ label, value = '', onChange, placeholder, type = 'input', options = [] }: { label: string, value?: string, onChange?: (val: string) => void, placeholder?: string, type?: 'input' | 'select', options?: string[] }) {
  const isRequired = label.includes('*');
  const cleanLabel = label.replace('*', '').trim();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      <label className="text-sm font-black text-[#001F3F] md:text-right pr-4">
        {cleanLabel}
        {isRequired && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <div className="md:col-span-2">
        {type === 'input' ? (
          <input 
            type="text" 
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-ink/10 rounded-md px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-ink/20"
          />
        ) : (
          <select 
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="w-full border border-ink/10 rounded-md px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white cursor-pointer"
          >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
      </div>
    </div>
  );
}
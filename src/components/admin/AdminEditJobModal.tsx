import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Save, Loader2, MapPin, BookOpen, GraduationCap,
  Calendar, Clock, DollarSign, Users, Sparkles, Check,
  AlertCircle, Briefcase, Plus, Trash2
} from 'lucide-react';
import { getDivisions, getDistricts, getUpazilas, getAreas } from '@olism/bd-geo';
import { SUBJECTS } from '@/src/constants';
import { useUpdateTuitionJobMutation } from '@/src/services/adminApi';
import { cn } from '@/src/lib/utils';

interface AdminEditJobModalProps {
  job: any;
  onClose: () => void;
  onSuccess?: (updatedJob: any) => void;
}

const CUSTOM_CLASSES = [
  'Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC', 'O-Level',
  'A-Level', 'Public University Admission Test',
  'Medical College Admission Test', 'Engineering University Admission Test',
  'Medical Admission', 'Cadet Admission', 'College Admission', 'Admission Candidate',
  'BA', 'BBA', 'BSC', 'Degree', 'Diploma Engineering', 'Engineering',
  'Medical - MBBS', 'Medical - BDS', 'Law', 'Honours', 'University', 'Undergraduate',
  'BCS', 'Bank', 'IELTS', 'Islamic Studies', 'Drawing & Painting', 'Handwriting'
];

const CUSTOM_MEDIUMS = [
  'Bangla Medium', 'English Medium', 'English Version', 'Madrasah Medium',
  'Admission Candidate', 'Admission Help', 'International Exam Preparation',
  'Religious and Moral Studies', 'Language', 'Arts and Crafts',
  'Special Skills Mastery', 'Skills Development', 'Job Preparation'
];

const DAYS_OPTIONS = [
  '2 Days/Week', '3 Days/Week', '4 Days/Week', '5 Days/Week', '6 Days/Week', 'Negotiable'
];

const TIME_SLOT_OPTIONS = [
  'Flexible', 'Morning (8:00 AM - 12:00 PM)', 'Afternoon (12:00 PM - 4:00 PM)',
  'Evening (4:00 PM - 8:00 PM)', 'Night (8:00 PM - 10:00 PM)'
];

const POPULAR_UNIVERSITIES = [
  'Any University', 'BUET', 'DU (Dhaka University)', 'DMC (Medical)',
  'NSU', 'BRACU', 'JU (Jahangirnagar)', 'RUET', 'CUET', 'SUST', 'IUT', 'BUP'
];

export default function AdminEditJobModal({
  job,
  onClose,
  onSuccess,
}: AdminEditJobModalProps) {
  const [updateTuitionJob, { isLoading: isSaving }] = useUpdateTuitionJobMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [studentClass, setStudentClass] = useState('');
  const [medium, setMedium] = useState('Bangla Medium');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubjectInput, setNewSubjectInput] = useState('');
  
  const [salary, setSalary] = useState<string>('');
  const [tutoringDays, setTutoringDays] = useState('3 Days/Week');
  const [timeSlot, setTimeSlot] = useState('Flexible');
  
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [area, setArea] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');

  const [genderPreference, setGenderPreference] = useState<'Male' | 'Female' | 'Any'>('Any');
  const [universityPreference, setUniversityPreference] = useState('Any University');
  const [status, setStatus] = useState<string>('Open');
  const [extraNotes, setExtraNotes] = useState('');

  // Bangladesh Geo Data
  const allDivisions = useMemo(() => getDivisions(), []);
  const allDistricts = useMemo(() => getDistricts(), []);
  const allUpazilas = useMemo(() => getUpazilas(), []);

  // Initialize form with job data
  useEffect(() => {
    if (!job) return;

    setStudentClass(job.studentClass || job.category || 'Class 9');
    setMedium(job.medium || 'Bangla Medium');

    // Subjects
    if (Array.isArray(job.subjects)) {
      setSubjects(job.subjects);
    } else if (typeof job.subjects === 'string' && job.subjects.trim()) {
      setSubjects(job.subjects.split(',').map((s: string) => s.trim()).filter(Boolean));
    } else if (job.subject) {
      setSubjects([job.subject]);
    } else {
      setSubjects(['General']);
    }

    setSalary(job.salary ? String(job.salary) : '');
    setTutoringDays(
      Array.isArray(job.tutoringDays) ? job.tutoringDays.join(', ') : (job.tutoringDays || '3 Days/Week')
    );
    setTimeSlot(job.timeSlot || 'Flexible');

    // Location
    const locObj = typeof job.location === 'object' ? job.location : {};
    const div = locObj.division || job.division || 'Dhaka';
    const dist = locObj.district || job.district || 'Dhaka';
    const ar = locObj.area || locObj.upazila || job.area || '';
    const addr = locObj.address || job.address || job.detailedAddress || (typeof job.location === 'string' ? job.location : '');

    setDivision(div);
    setDistrict(dist);
    setArea(ar);
    setDetailedAddress(addr);

    setGenderPreference(job.genderPreference || 'Any');
    setUniversityPreference(
      Array.isArray(job.universityPreference) ? (job.universityPreference[0] || 'Any University') : (job.universityPreference || 'Any University')
    );
    setStatus(job.status || 'Open');

    const rawNotes = job.extraNotes || (Array.isArray(job.requirements) ? job.requirements.join(', ') : job.requirements) || job.details || job.description || '';
    setExtraNotes(typeof rawNotes === 'string' ? rawNotes : '');
  }, [job]);

  // Cascaded geo lists
  const currentDivObj = allDivisions.find(d => d.name === division || d.id === (division as any));
  const availableDistricts = useMemo(() => {
    if (!currentDivObj) return allDistricts;
    return allDistricts.filter(d => d.divisionId === currentDivObj.id);
  }, [allDistricts, currentDivObj]);

  const currentDistObj = allDistricts.find(d => d.name === district || d.id === (district as any));
  const availableUpazilas = useMemo(() => {
    if (!currentDistObj) return allUpazilas;
    return allUpazilas.filter(u => u.districtId === currentDistObj.id);
  }, [allUpazilas, currentDistObj]);

  // Subject helpers
  const handleAddSubject = (sub: string) => {
    const trimmed = sub.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    setSubjects([...subjects, trimmed]);
    setNewSubjectInput('');
  };

  const handleRemoveSubject = (subToRemove: string) => {
    setSubjects(subjects.filter(s => s !== subToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const jobId = String(job.id || job._id || '');
    if (!jobId) {
      setErrorMsg('Invalid job ID');
      return;
    }

    try {
      const notesStr = typeof extraNotes === 'string' ? extraNotes.trim() : '';

      const payload: Record<string, any> = {
        studentClass: String(studentClass || 'Class 9').trim(),
        medium: String(medium || 'Bangla Medium').trim(),
        subjects: Array.isArray(subjects) && subjects.length > 0
          ? subjects.map(s => String(s).trim()).filter(Boolean)
          : ['General'],
        salary: salary ? Number(salary) : 0,
        tutoringDays: [String(tutoringDays || '3 Days/Week').trim()],
        timeSlot: String(timeSlot || 'Flexible').trim(),
        location: {
          division: String(division || '').trim(),
          district: String(district || 'Dhaka').trim(),
          area: String(area || district || 'Dhaka').trim(),
          detailedAddress: String(detailedAddress || '').trim(),
        },
        genderPreference: genderPreference || 'Any',
        universityPreference: String(universityPreference || 'Any University').trim(),
        status: status || 'Open',
        description: notesStr,
        requirements: notesStr ? [notesStr] : [],
      };

      const result = await updateTuitionJob({
        id: jobId,
        ...payload,
      }).unwrap();

      if (onSuccess) {
        onSuccess(result?.data || payload);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to update tuition job:', err);
      setErrorMsg(err?.data?.message || err?.message || 'জব আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  const jobCode = job?.jobCode || job?.customId || `JOB-${String(job?.id || job?._id || '').slice(-6).toUpperCase()}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink/50 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-[32px] shadow-2xl border border-ink/10 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto"
        >
          {/* 🏷️ Header */}
          <div className="px-6 py-5 border-b border-ink/5 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/40 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                  {jobCode}
                </span>
                <h3 className="text-lg font-black text-ink">টিউশন পোস্ট এডিট করুন (Edit Job)</h3>
              </div>
              <p className="text-xs text-ink-muted font-medium">
                অ্যাডমিন / মডারেটর হিসেবে টিউশন জবের সকল তথ্য পরিবর্তন ও আপডেট করতে পারবেন।
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSaving}
              className="w-9 h-9 rounded-2xl bg-white text-ink-muted hover:text-ink hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer shadow-xs border border-ink/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* 📝 Form Body (Scrollable) */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: 📚 Class & Medium */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-ink/5 space-y-4">
              <h4 className="text-xs font-black text-ink uppercase flex items-center gap-2">
                <BookOpen size={14} className="text-primary" />
                ১. শ্রেণি ও মাধ্যম (Class & Medium)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Class */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">শ্রেণি / কোর্স (Class / Level) *</label>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    {CUSTOM_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                {/* Medium */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">কারিকুলাম / মাধ্যম (Medium) *</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    {CUSTOM_MEDIUMS.map(med => (
                      <option key={med} value={med}>{med}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: ✍️ Subjects */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-ink/5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-ink uppercase flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  ২. পড়ানোর বিষয়সমূহ (Subjects) *
                </h4>
                <span className="text-[10px] text-ink-muted font-bold">নির্বাচিত বিষয়: {subjects.length} টি</span>
              </div>

              {/* Selected Subjects Tags */}
              <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-white rounded-xl border border-ink/10">
                {subjects.length > 0 ? (
                  subjects.map(sub => (
                    <span
                      key={sub}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-black flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub)}
                        className="hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-muted font-medium italic p-1">কোনো বিষয় যোগ করা হয়নি</span>
                )}
              </div>

              {/* Add Custom Subject Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectInput}
                  onChange={(e) => setNewSubjectInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject(newSubjectInput);
                    }
                  }}
                  placeholder="অন্য বিষয় লিখুন এবং এন্টার চাপুন..."
                  className="flex-1 px-3.5 py-2 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleAddSubject(newSubjectInput)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> যোগ করুন
                </button>
              </div>

              {/* Quick Preset Subject Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-ink-muted uppercase">জনপ্রিয় বিষয়সমূহ:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUBJECTS.slice(0, 10).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleAddSubject(s)}
                      disabled={subjects.includes(s)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] font-bold border transition-all cursor-pointer",
                        subjects.includes(s)
                          ? "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-white text-ink-muted hover:text-primary hover:border-primary border-ink/10"
                      )}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: 💰 Salary, Days & Time Slot */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-ink/5 space-y-4">
              <h4 className="text-xs font-black text-ink uppercase flex items-center gap-2">
                <DollarSign size={14} className="text-emerald-600" />
                ৩. বেতন ও সময়সূচি (Salary, Days & Shift)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Salary */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">মাসিক বেতন (৳ Salary / Month)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-ink-muted text-xs">৳</span>
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full pl-7 pr-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-black text-ink focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Days Per Week */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">সপ্তাহে দিন (Days / Week)</label>
                  <select
                    value={tutoringDays}
                    onChange={(e) => setTutoringDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    {DAYS_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Time Slot */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">পড়ানোর সময় (Time Slot)</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    {TIME_SLOT_OPTIONS.map(ts => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: 📍 Location & Address */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-ink/5 space-y-4">
              <h4 className="text-xs font-black text-ink uppercase flex items-center gap-2">
                <MapPin size={14} className="text-rose-500" />
                ৪. লোকেশন ও ঠিকানা (Location & Address)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Division */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">বিভাগ (Division)</label>
                  <select
                    value={division}
                    onChange={(e) => {
                      setDivision(e.target.value);
                      setDistrict('');
                      setArea('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="">Select Division</option>
                    {allDivisions.map((div: any) => (
                      <option key={div.id || div.name} value={div.name}>{div.name} ({div.nameBn || ''})</option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">জেলা (District)</label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setArea('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="">Select District</option>
                    {availableDistricts.map((d: any) => (
                      <option key={d.id || d.name} value={d.name}>{d.name} ({d.nameBn || ''})</option>
                    ))}
                  </select>
                </div>

                {/* Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">এলাকা / থানা (Area / Upazila)</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="">Select Area / Thana</option>
                    {availableUpazilas.map((u: any) => (
                      <option key={u.id || u.name} value={u.name}>{u.name} ({u.nameBn || ''})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Road Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">বিস্তারিত ঠিকানা ও ল্যান্ডমার্ক (Road / Address)</label>
                <input
                  type="text"
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  placeholder="e.g. House #12, Road #4, Block-A, Near City Hospital"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-medium text-ink focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Section 5: 🎓 Preferences & Status */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-ink/5 space-y-4">
              <h4 className="text-xs font-black text-ink uppercase flex items-center gap-2">
                <GraduationCap size={14} className="text-violet-600" />
                ৫. টিউটর পছন্দ ও জবের স্ট্যাটাস (Preferences & Status)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tutor Gender Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">টিউটর জেন্ডার পছন্দ (Tutor Gender)</label>
                  <select
                    value={genderPreference}
                    onChange={(e) => setGenderPreference(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="Any">Any (যে কোনো)</option>
                    <option value="Male">Male (পুরুষ টিউটর)</option>
                    <option value="Female">Female (মহিলা টিউটর)</option>
                  </select>
                </div>

                {/* University Preference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">পছন্দের বিশ্ববিদ্যালয় (University)</label>
                  <select
                    value={universityPreference}
                    onChange={(e) => setUniversityPreference(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    {POPULAR_UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                {/* Job Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">জব স্ট্যাটাস (Job Status) *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-black text-ink focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="Open">🔵 Open (আবেদন চলছে)</option>
                    <option value="Active">🟢 Active (চলতি/কনফার্মড)</option>
                    <option value="Closed">⚫ Closed (বন্ধ/স্থগিত)</option>
                    <option value="Pending">🟡 Pending (অপেক্ষমাণ)</option>
                  </select>
                </div>
              </div>

              {/* Extra Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink">বিশেষ রিকোয়ারমেন্ট ও নোট (Extra Requirements)</label>
                <textarea
                  value={extraNotes}
                  onChange={(e) => setExtraNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. সপ্তাহে ১ দিন বিশেষ পরীক্ষা নিতে হবে, গণিতে যত্নশীল হতে হবে..."
                  className="w-full p-3.5 bg-white rounded-xl border border-ink/10 text-xs font-medium text-ink focus:outline-none focus:border-primary transition-all resize-none"
                />
              </div>
            </div>
          </form>

          {/* 🔘 Footer Action Buttons */}
          <div className="px-6 py-4 border-t border-ink/5 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-ink/10 text-ink-muted hover:text-ink font-bold text-xs hover:bg-white transition-all cursor-pointer"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>পরিবর্তন সংরক্ষণ করুন (Save Changes)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

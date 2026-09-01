import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlusCircle, MapPin, BookOpen, GraduationCap,
  Users, Clock, Phone, MessageSquare,
  School, CheckCircle2, X, AlertCircle,
  Loader2, ChevronRight, ShieldCheck, Star,
  Calendar, Target, Briefcase, ArrowLeft,
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS, CLASSES, MEDIUMS, DISTRICTS, DISTRICT_WISE_AREAS } from '@/src/constants';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useCreateTuitionJobMutation } from '@/src/services/adminApi.ts';

const TUTOR_GENDERS = ['Male', 'Female', 'Any'];
const STUDENT_GENDERS = ['Male', 'Female'];
const DAYS_OPTIONS = ['2 Days/Week', '3 Days/Week', '4 Days/Week', '5 Days/Week', '6 Days/Week', '7 Days/Week'];
const DURATION_OPTIONS = ['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'];
const TIME_OPTIONS = ['Morning (6am-10am)', 'Afternoon (12pm-4pm)', 'Evening (4pm-8pm)', 'Flexible'];
const JOB_CATEGORIES = ['Home Tuition', 'Online Tuition', 'Coaching Center', 'Group Tuition'];

type Step = 'location' | 'subjects' | 'details' | 'contact' | 'review';

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  { key: 'location', label: 'Location', icon: <MapPin size={16} /> },
  { key: 'subjects', label: 'Subjects', icon: <BookOpen size={16} /> },
  { key: 'details', label: 'Details', icon: <GraduationCap size={16} /> },
  { key: 'contact', label: 'Contact', icon: <Phone size={16} /> },
  { key: 'review', label: 'Review', icon: <Star size={16} /> },
];

export default function AdminCreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createTuitionJob, { isLoading: isSubmitting }] = useCreateTuitionJobMutation();
  const [currentStep, setCurrentStep] = useState<Step>('location');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    district: '',
    area: '',
    studentClass: '',
    medium: '',
    subjects: [] as string[],
    customSubject: '',
    tuitionType: '',
    salary: '',
    genderPreference: '',
    tutoringDays: '',
    duration: '',
    startTime: '',
    studentGender: '',
    numStudents: '1',
    schoolName: '',
    phone: (user as any)?.phone || '',
    whatsapp: '',
    comment: '',
  });

  const set = (key: keyof typeof form, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const toggleSubject = (sub: string) => {
    const up = sub.toUpperCase();
    setForm(prev => ({
      ...prev,
      subjects: prev.subjects.includes(up)
        ? prev.subjects.filter(s => s !== up)
        : [...prev.subjects, up],
    }));
  };

  const addCustomSubject = () => {
    if (form.customSubject.trim()) {
      const formatted = form.customSubject.trim().toUpperCase();
      if (!form.subjects.includes(formatted)) {
        setForm(prev => ({ ...prev, subjects: [...prev.subjects, formatted], customSubject: '' }));
      } else {
        setForm(prev => ({ ...prev, customSubject: '' }));
      }
    }
  };

  const currentDistrictAreas = form.district && DISTRICT_WISE_AREAS[form.district]
    ? DISTRICT_WISE_AREAS[form.district]
    : [];

  const stepIndex = STEPS.findIndex(s => s.key === currentStep);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'location': return Boolean(form.district && form.area);
      case 'subjects': return Boolean(form.studentClass && form.medium && form.subjects.length > 0);
      case 'details': return Boolean(form.tuitionType && form.salary && form.genderPreference && form.tutoringDays && form.duration && form.startTime && form.studentGender);
      case 'contact': return Boolean(form.phone);
      case 'review': return true;
    }
  };

  const goNext = () => {
    if (!canProceed()) return;
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) setCurrentStep(STEPS[nextIdx].key);
  };

  const goBack = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) setCurrentStep(STEPS[prevIdx].key);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    const payload = {
      studentClass: form.studentClass,
      subjects: form.subjects,
      location: { district: form.district, area: form.area },
      salary: parseInt(form.salary) || 0,
      medium: form.medium,
      genderPreference: form.genderPreference || 'Any',
      tutoringDays: [form.tutoringDays],
      duration: form.duration,
      startTime: form.startTime,
      studentGender: form.studentGender,
      numStudents: parseInt(form.numStudents) || 1,
      schoolName: form.schoolName,
      description: form.comment || '',
      tuitionType: form.tuitionType,
      approvalStatus: 'Approved',
      status: 'Open',
    };

    try {
      await createTuitionJob(payload).unwrap();
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/manage-jobs'), 2000);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to create job. Please try again.';
      setErrorMsg(msg);
    }
  };

  const inputCls = "w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-400/30 focus:bg-white focus:border-violet-300 transition-all shadow-sm placeholder:text-ink-muted/40";
  const labelCls = "block text-[11px] font-black text-ink-muted uppercase mb-1.5 tracking-wider";

  if (isSuccess) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={44} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-ink">Job Created Successfully!</h2>
            <p className="text-sm text-ink-muted">Redirecting to Manage Jobs...</p>
            <Loader2 className="animate-spin text-primary mx-auto" size={20} />
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto pb-24 space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/manage-jobs')} className="p-2 hover:bg-ink/5 rounded-xl transition-all cursor-pointer">
              <ArrowLeft size={18} className="text-ink-muted" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2.5 py-1 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-black flex items-center gap-1 uppercase">
                  <ShieldCheck size={10} /> Admin Post
                </div>
                <div className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">
                  Auto Approved
                </div>
              </div>
              <h1 className="text-2xl font-display font-black text-ink">Post a Tuition Job</h1>
              <p className="text-sm text-ink-muted">Posted by: <span className="font-bold text-violet-700">{(user as any)?.name}</span> ({(user as any)?.role})</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[28px] p-4 shadow-lg">
          <div className="flex items-center gap-1">
            {STEPS.map((step, idx) => (
              <div key={step.key} className="flex-1 flex items-center gap-1">
                <button
                  onClick={() => idx < stepIndex && setCurrentStep(step.key)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-black transition-all",
                    currentStep === step.key
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                      : idx < stepIndex
                        ? "bg-violet-100 text-violet-700 cursor-pointer hover:bg-violet-200"
                        : "bg-ink/5 text-ink-muted cursor-not-allowed"
                  )}
                >
                  {idx < stepIndex ? <CheckCircle2 size={13} /> : step.icon}
                  <span className="hidden sm:block">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight size={14} className={cn("shrink-0", idx < stepIndex ? "text-violet-400" : "text-ink/20")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-xl space-y-6"
          >

            {/* ── STEP 1: Location ── */}
            {currentStep === 'location' && (
              <>
                <StepHeader icon={<MapPin />} title="Location Details" subtitle="Where is the student located?" color="violet" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>District *</label>
                    <select value={form.district} onChange={e => { set('district', e.target.value); set('area', ''); }} className={inputCls}>
                      <option value="">Select District</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Area / Thana *</label>
                    <select value={form.area} onChange={e => set('area', e.target.value)} disabled={!form.district} className={cn(inputCls, "disabled:opacity-40")}>
                      <option value="">{form.district ? 'Select Area' : 'First Select District'}</option>
                      {currentDistrictAreas.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
                {form.district && form.area && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-sm text-emerald-700 font-bold">
                    <MapPin size={16} /> {form.area}, {form.district}
                  </motion.div>
                )}
              </>
            )}

            {/* ── STEP 2: Subjects ── */}
            {currentStep === 'subjects' && (
              <>
                <StepHeader icon={<BookOpen />} title="Subjects & Class" subtitle="What does the student need to study?" color="blue" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Class *</label>
                    <select value={form.studentClass} onChange={e => set('studentClass', e.target.value)} className={inputCls}>
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Medium *</label>
                    <select value={form.medium} onChange={e => set('medium', e.target.value)} className={inputCls}>
                      <option value="">Select Medium</option>
                      {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Subjects * ({form.subjects.length} selected)</label>
                  {form.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-violet-50 border border-violet-100 rounded-2xl mb-3">
                      {form.subjects.map(sub => (
                        <span key={sub} className="inline-flex items-center gap-1.5 bg-violet-600 text-white px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                          {sub}
                          <button type="button" onClick={() => toggleSubject(sub)} className="hover:bg-white/20 rounded-full p-0.5 cursor-pointer"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Type custom subject and press Add..."
                      value={form.customSubject}
                      onChange={e => set('customSubject', e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                      className={inputCls}
                    />
                    <button type="button" onClick={addCustomSubject} className="bg-violet-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase hover:bg-violet-700 transition-all cursor-pointer shrink-0">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                    {SUBJECTS.map(sub => {
                      const isSelected = form.subjects.includes(sub.toUpperCase());
                      return (
                        <button key={sub} type="button" onClick={() => toggleSubject(sub)} className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border", isSelected ? "bg-violet-600 text-white border-violet-600 shadow-sm" : "bg-white/60 text-ink border-ink/10 hover:border-violet-300 hover:text-violet-700")}>
                          {sub} {isSelected && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 3: Job Details ── */}
            {currentStep === 'details' && (
              <>
                <StepHeader icon={<Briefcase />} title="Job Details" subtitle="Tuition requirements and schedule" color="emerald" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Tuition Type *</label>
                    <select value={form.tuitionType} onChange={e => set('tuitionType', e.target.value)} className={inputCls}>
                      <option value="">Select Type</option>
                      {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Monthly Salary (BDT) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-black text-sm">৳</span>
                      <input type="number" min="500" placeholder="e.g. 5000" value={form.salary} onChange={e => set('salary', e.target.value)} className={cn(inputCls, "pl-10")} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Preferred Tutor Gender *</label>
                    <div className="flex gap-2">
                      {TUTOR_GENDERS.map(g => (
                        <button key={g} type="button" onClick={() => set('genderPreference', g)} className={cn("flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer", form.genderPreference === g ? "bg-violet-600 text-white border-violet-600" : "bg-white/60 border-ink/10 hover:border-violet-300")}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Student Gender *</label>
                    <div className="flex gap-2">
                      {STUDENT_GENDERS.map(g => (
                        <button key={g} type="button" onClick={() => set('studentGender', g)} className={cn("flex-1 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer", form.studentGender === g ? "bg-sky-600 text-white border-sky-600" : "bg-white/60 border-ink/10 hover:border-sky-300")}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Days Per Week *</label>
                    <select value={form.tutoringDays} onChange={e => set('tutoringDays', e.target.value)} className={inputCls}>
                      <option value="">Select Days</option>
                      {DAYS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Class Duration *</label>
                    <select value={form.duration} onChange={e => set('duration', e.target.value)} className={inputCls}>
                      <option value="">Select Duration</option>
                      {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Preferred Time *</label>
                    <select value={form.startTime} onChange={e => set('startTime', e.target.value)} className={inputCls}>
                      <option value="">Select Time Slot</option>
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Number of Students</label>
                    <select value={form.numStudents} onChange={e => set('numStudents', e.target.value)} className={inputCls}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={String(n)}>{n} Student{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 4: Contact ── */}
            {currentStep === 'contact' && (
              <>
                <StepHeader icon={<Phone />} title="Contact & School Info" subtitle="How tutors can reach the student" color="sky" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Contact Number *</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01XXXXXXXXX" className={cn(inputCls, "pl-11")} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>WhatsApp Number</label>
                    <div className="relative">
                      <MessageSquare size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="01XXXXXXXXX (optional)" className={cn(inputCls, "pl-11")} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Student School / College Name</label>
                    <div className="relative">
                      <School size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
                      <input type="text" value={form.schoolName} onChange={e => set('schoolName', e.target.value)} placeholder="Enter School/College Name" className={cn(inputCls, "pl-11")} />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Special Requirements / Notes</label>
                    <textarea value={form.comment} onChange={e => set('comment', e.target.value)} placeholder="Any special requirements, preferred tutor background, etc." rows={4} className={cn(inputCls, "resize-none")} />
                  </div>
                </div>
              </>
            )}

            {/* ── STEP 5: Review ── */}
            {currentStep === 'review' && (
              <>
                <StepHeader icon={<Target />} title="Review & Submit" subtitle="Double check everything before posting" color="emerald" />

                <div className="space-y-4">
                  {/* Admin Badge */}
                  <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-2xl">
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-violet-800">Posted by Admin — Auto Approved</p>
                      <p className="text-xs text-violet-600">{(user as any)?.name} • {(user as any)?.email}</p>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ReviewItem label="Location" value={`${form.area}, ${form.district}`} icon={<MapPin size={14} />} />
                    <ReviewItem label="Class & Medium" value={`${form.studentClass} • ${form.medium}`} icon={<GraduationCap size={14} />} />
                    <ReviewItem label="Subjects" value={form.subjects.join(', ') || '—'} icon={<BookOpen size={14} />} />
                    <ReviewItem label="Monthly Salary" value={`৳${parseInt(form.salary || '0').toLocaleString()}`} icon={<Star size={14} />} />
                    <ReviewItem label="Tuition Type" value={form.tuitionType} icon={<Briefcase size={14} />} />
                    <ReviewItem label="Schedule" value={`${form.tutoringDays} • ${form.duration}`} icon={<Clock size={14} />} />
                    <ReviewItem label="Time Slot" value={form.startTime} icon={<Calendar size={14} />} />
                    <ReviewItem label="Tutor Gender" value={form.genderPreference} icon={<Users size={14} />} />
                    <ReviewItem label="Contact" value={form.phone} icon={<Phone size={14} />} />
                    {form.schoolName && <ReviewItem label="School" value={form.schoolName} icon={<School size={14} />} />}
                  </div>
                </div>

                {errorMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}
              </>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer",
              stepIndex === 0 ? "invisible" : "bg-white/70 border border-white/50 text-ink hover:bg-white shadow-md"
            )}
          >
            <ArrowLeft size={16} /> Back
          </button>

          {currentStep !== 'review' ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className={cn(
                "flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm transition-all cursor-pointer",
                canProceed()
                  ? "bg-violet-600 text-white shadow-xl shadow-violet-600/25 hover:bg-violet-700"
                  : "bg-ink/10 text-ink-muted cursor-not-allowed"
              )}
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Posting...</>
              ) : (
                <><PlusCircle size={16} /> Post Job Now</>
              )}
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

// ── Sub-components ──

function StepHeader({ icon, title, subtitle, color }: { icon: React.ReactNode; title: string; subtitle: string; color: string }) {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-100 text-violet-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    sky: 'bg-sky-100 text-sky-700',
  };
  return (
    <div className="flex items-center gap-4 pb-2">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", colorMap[color] || colorMap.violet)}>
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-ink">{title}</h3>
        <p className="text-xs text-ink-muted font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

function ReviewItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white/70 rounded-xl border border-ink/5">
      <div className="w-7 h-7 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-ink-muted uppercase">{label}</p>
        <p className="text-sm font-bold text-ink truncate">{value || '—'}</p>
      </div>
    </div>
  );
}
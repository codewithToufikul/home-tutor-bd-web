import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, MapPin, BookOpen, GraduationCap, 
  Phone, User, CheckCircle2, School, Calendar, 
  Globe, Layout, Sparkles, ShieldCheck, Star, MessageSquare, ArrowRight, X 
} from 'lucide-react';
import { SUBJECTS, CLASSES, MEDIUMS, DISTRICTS, DISTRICT_WISE_AREAS } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionJob } from '@/src/types';

function TakaIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <div 
      style={{ width: size, height: size, fontSize: size * 0.9 }} 
      className={cn("flex items-center justify-center font-black leading-none", className)}
    >
      ৳
    </div>
  );
}

export default function RequestTutor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [matchedTutors, setMatchedTutors] = useState<any[]>([]);
  const [customSubInput, setCustomSubInput] = useState('');
  const [customAreaInput, setCustomAreaInput] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    schoolName: '',
    medium: '',
    studentClass: '',
    subjects: [] as string[],
    tuitionType: '',
    preferredTutor: '',
    district: '',
    areas: [] as string[],
    salaryOffer: '',
    daysPerWeek: '',
    universityTeacher: '',
    additional: '',
    agreedToTerms: false
  });

  const toSentenceCase = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const totalSteps = 4;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const toggleSubject = (sub: string) => {
    const formatted = sub.toUpperCase();
    if (formData.subjects.includes(formatted)) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(s => s !== formatted)
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, formatted]
      });
    }
  };

  const addCustomSubject = () => {
    if (customSubInput.trim()) {
      const formatted = customSubInput.trim().toUpperCase();
      if (!formData.subjects.includes(formatted)) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, formatted]
        });
      }
      setCustomSubInput('');
    }
  };

  const toggleArea = (area: string) => {
    const formatted = area.toUpperCase();
    if (formData.areas.includes(formatted)) {
      setFormData({
        ...formData,
        areas: formData.areas.filter(a => a !== formatted)
      });
    } else {
      setFormData({
        ...formData,
        areas: [...formData.areas, formatted]
      });
    }
  };

  const addCustomArea = () => {
    if (customAreaInput.trim()) {
      const formatted = customAreaInput.trim().toUpperCase();
      if (!formData.areas.includes(formatted)) {
        setFormData({
          ...formData,
          areas: [...formData.areas, formatted]
        });
      }
      setCustomAreaInput('');
    }
  };

  const handleSubmit = async () => {
    // Validate required fields before sending
    if (!formData.district) {
      alert('দয়া করে জেলা নির্বাচন করুন!');
      return;
    }
    if (!formData.studentClass) {
      alert('দয়া করে ক্লাস নির্বাচন করুন!');
      return;
    }
    if (!formData.medium) {
      alert('দয়া করে মাধ্যম নির্বাচন করুন!');
      return;
    }
    if (!formData.salaryOffer || parseInt(formData.salaryOffer) <= 0) {
      alert('দয়া করে বেতন উল্লেখ করুন!');
      return;
    }

    // Build payload that matches backend schema exactly
    const payload = {
      studentClass: formData.studentClass,
      subjects: formData.subjects.length > 0 ? formData.subjects : ['General Subjects'],
      location: {
        district: formData.district,
        area: formData.areas.length > 0 ? formData.areas.join(', ') : formData.district,
      },
      salary: parseInt(formData.salaryOffer) || 0,
      medium: formData.medium,
      genderPreference: formData.preferredTutor || 'Any',
      tutoringDays: formData.daysPerWeek || [],
      tuitionType: formData.tuitionType || 'Home Tuition',
      phone: formData.phone,
      name: formData.studentName,
      description: `Tutor requested for: ${formData.studentClass}. Medium: ${formData.medium}. Subjects: ${formData.subjects.join(', ')}. Location: ${formData.areas.join(', ')}, ${formData.district}. Phone: ${formData.phone}`,
      status: 'Open',
      approvalStatus: 'Approved',
    };

    try {
      await TuitionService.create(payload);
      setMatchedTutors([]);
      setIsSubmitted(true);
    } catch (err: any) {
      alert('টিউশন পোস্ট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      console.error('Failed to create tuition job:', err);
    }
  };

  // ডিস্ট্রিক্ট অনুযায়ী শুধু নির্দিষ্ট এরিয়াগুলো ফিল্টার করবে (অন্য জেলারগুলো দেখাবে না)
  const currentDistrictAreas = formData.district && DISTRICT_WISE_AREAS[formData.district] 
    ? DISTRICT_WISE_AREAS[formData.district] 
    : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 lg:py-20">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display font-bold text-ink">Request a Tutor</h1>
          <p className="text-ink-muted">Fill out the form below and we'll match you with the best tutors.</p>
          
          {!isSubmitted && (
            <div className="flex items-center justify-center gap-4 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                    step === i ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : 
                    step > i ? "bg-secondary text-white" : "bg-ink/5 text-ink-muted"
                  )}>
                    {step > i ? <CheckCircle2 size={20} /> : i}
                  </div>
                  {i < 4 && (
                    <div className={cn(
                      "w-8 h-1 mx-2 rounded-full",
                      step > i ? "bg-secondary" : "bg-ink/5"
                    )} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-surface p-8 lg:p-12 rounded-[2.5rem] border border-ink/5 shadow-2xl shadow-primary/5 min-h-[500px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* Step 1 */}
            {!isSubmitted && step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-grow"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Student Name <span className="text-primary">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
                      <input
                        type="text"
                        placeholder="Enter Student Name"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: toSentenceCase(e.target.value) })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Active Mobile Number <span className="text-primary">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
                      <input
                        type="tel"
                        placeholder="Enter Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Your School Name <span className="text-primary">*</span></label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
                      <input
                        type="text"
                        placeholder="Enter School/College Name"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: toSentenceCase(e.target.value) })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {!isSubmitted && step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-grow"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Select Medium <span className="text-primary">*</span></label>
                    <select
                      value={formData.medium}
                      onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Medium</option>
                      {MEDIUMS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Select Class <span className="text-primary">*</span></label>
                    <select
                      value={formData.studentClass}
                      onChange={(e) => setFormData({ ...formData, studentClass: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Multiple Subjects Selection Area */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Select Subjects (Multiple Choice) <span className="text-primary">*</span></label>
                    
                    {formData.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/15">
                        {formData.subjects.map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                            {sub}
                            <button 
                              type="button" 
                              onClick={() => toggleSubject(sub)}
                              className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Type other subject & click add..."
                        value={customSubInput}
                        onChange={(e) => setCustomSubInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); } }}
                        className="w-full px-4 py-3 rounded-2xl border border-ink/5 bg-background text-ink text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={addCustomSubject}
                        className="bg-primary text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-primary-dark transition-all cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2 max-h-40 overflow-y-auto p-2 bg-background rounded-2xl border border-ink/5">
                      {SUBJECTS.map((s) => {
                        const isSelected = formData.subjects.includes(s.toUpperCase());
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSubject(s)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                              isSelected 
                                ? "bg-primary text-white border-primary shadow-sm" 
                                : "bg-white text-ink-muted border-ink/10 hover:border-primary/40 hover:text-ink"
                            )}
                          >
                            {s} {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Tuition Type <span className="text-primary">*</span></label>
                    <select
                      value={formData.tuitionType}
                      onChange={(e) => setFormData({ ...formData, tuitionType: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Tuition Type</option>
                      <option value="Home Tuition">Home Tuition</option>
                      <option value="Online Tuition">Online Tuition</option>
                      <option value="Coaching Center">Coaching Center</option>
                      <option value="Group Tuition">Group Tuition</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Preferred Tutor <span className="text-primary">*</span></label>
                    <select
                      value={formData.preferredTutor}
                      onChange={(e) => setFormData({ ...formData, preferredTutor: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Preferred Tutor</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Any">Any</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {!isSubmitted && step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-grow"
              >
                <div className="space-y-6">
                  {/* District Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Select District <span className="text-primary">*</span></label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value, areas: [] })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select District</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* 🌟 District-Wise Suggested Areas */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">
                      Select Areas {formData.district ? `(${formData.district})` : ''} <span className="text-primary">*</span>
                    </label>

                    {!formData.district ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold text-center">
                        ⚠️ প্রথমে ওপরের ড্রপডাউন থেকে একটি জেলা (District) সিলেক্ট করুন, তবেই ওই জেলার নির্দিষ্ট এরিয়াগুলো সাজেশপ্রদর্শনে আসবে।
                      </div>
                    ) : (
                      <>
                        {formData.areas.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-2xl border border-primary/15">
                            {formData.areas.map((ar) => (
                              <span key={ar} className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-1 rounded-xl text-xs font-bold shadow-sm">
                                {ar}
                                <button 
                                  type="button" 
                                  onClick={() => toggleArea(ar)}
                                  className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Type custom area & click add..."
                            value={customAreaInput}
                            onChange={(e) => setCustomAreaInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomArea(); } }}
                            className="w-full px-4 py-3 rounded-2xl border border-ink/5 bg-background text-ink text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                          <button 
                            type="button"
                            onClick={addCustomArea}
                            className="bg-primary text-white px-5 py-3 rounded-2xl font-bold text-xs uppercase hover:bg-primary-dark transition-all cursor-pointer shrink-0"
                          >
                            Add
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-2 max-h-40 overflow-y-auto p-2 bg-background rounded-2xl border border-ink/5">
                          {currentDistrictAreas.length > 0 ? (
                            currentDistrictAreas.map((a) => {
                              const isSelected = formData.areas.includes(a.toUpperCase());
                              return (
                                <button
                                  key={a}
                                  type="button"
                                  onClick={() => toggleArea(a)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                                    isSelected 
                                      ? "bg-primary text-white border-primary shadow-sm" 
                                      : "bg-white text-ink-muted border-ink/10 hover:border-primary/40 hover:text-ink"
                                  )}
                                >
                                  {a} {isSelected && '✓'}
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-xs text-ink-muted p-2">এই জেলার জন্য কোনো নির্দিষ্ট এরিয়ার তালিকা নেই। আপনি চাইলে ওপরে কাস্টম এরিয়া টাইপ করে যোগ করতে পারেন।</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Salary Do You Offer <span className="text-primary">*</span></label>
                    <div className="relative">
                      <TakaIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
                      <input
                        type="text"
                        placeholder="e.g. 5000"
                        value={formData.salaryOffer}
                        onChange={(e) => setFormData({ ...formData, salaryOffer: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Days Per Week <span className="text-primary">*</span></label>
                    <select
                      value={formData.daysPerWeek}
                      onChange={(e) => setFormData({ ...formData, daysPerWeek: e.target.value })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      <option value="">Select Days</option>
                      {[1, 2, 3, 4, 5, 6, 7].map(d => (
                        <option key={d} value={`${d} Day${d > 1 ? 's' : ''}/Week`}>{d} Day{d > 1 ? 's' : ''}/Week</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4 */}
            {!isSubmitted && step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 flex-grow"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Which university Teacher you want?</label>
                    <input
                      type="text"
                      placeholder="e.g. DU, BUET, NSU"
                      value={formData.universityTeacher}
                      onChange={(e) => setFormData({ ...formData, universityTeacher: toSentenceCase(e.target.value) })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-ink uppercase">Additional Information</label>
                    <textarea
                      placeholder="Any specific requirements or notes..."
                      value={formData.additional}
                      onChange={(e) => setFormData({ ...formData, additional: toSentenceCase(e.target.value) })}
                      className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none min-h-[120px] resize-none"
                    />
                  </div>

                  <button 
                    onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                    className="flex items-start gap-3 text-left group cursor-pointer"
                  >
                    <div className={cn(
                      "mt-1 w-5 h-5 rounded border flex items-center justify-center transition-all",
                      formData.agreedToTerms ? "bg-primary border-primary text-white" : "border-ink/20 group-hover:border-primary"
                    )}>
                      {formData.agreedToTerms && <CheckCircle2 size={14} />}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      By clicking submit tuition button, you agree our <span className="text-primary font-bold">terms and policy</span>.
                    </p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success & Auto-Match Screen */}
            {isSubmitted && (
              <motion.div
                key="submittedScreen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 py-4"
              >
                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-900">Tuition Posted Successfully!</h2>
                  <p className="text-emerald-700 text-sm max-w-lg mx-auto">
                    Thank you, <span className="font-bold">{formData.studentName}</span>! Your tuition job is now live and public. Interested tutors can apply directly.
                  </p>
                  <div className="pt-2 flex justify-center gap-4">
                    <a
                      href="https://wa.me/8801928325460"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition-all"
                    >
                      <MessageSquare size={16} /> Direct WhatsApp Us
                    </a>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-amber-500" size={24} />
                      <h3 className="text-xl font-bold text-ink">Auto-Matched Tutors Near You</h3>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {matchedTutors.length} Matches Found
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {matchedTutors.map((tutor) => (
                      <div
                        key={tutor.id}
                        className="bg-background rounded-2xl border border-ink/10 p-5 space-y-4 shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={tutor.photo}
                            alt={tutor.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                          />
                          <div>
                            <h4 className="font-bold text-ink text-sm flex items-center gap-1">
                              {tutor.name}
                              <ShieldCheck size={16} className="text-primary fill-primary/10" />
                            </h4>
                            <p className="text-xs text-ink-muted">{tutor.university}</p>
                            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                              <Star size={12} fill="currentColor" /> {tutor.rating}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-ink-muted border-t border-ink/5 pt-3">
                          <p className="flex items-center gap-1">
                            <MapPin size={12} className="text-primary" /> {tutor.areas.join(', ')}
                          </p>
                          <p className="font-medium text-ink">
                            Subjects: {tutor.subjects.join(', ')}
                          </p>
                        </div>

                        <Link
                          to={`/tutor/${tutor.id}`}
                          className="block text-center w-full py-2.5 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all"
                        >
                          View Profile & Contact
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 cursor-pointer"
                  >
                    View All Tuition Jobs <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {!isSubmitted && (
            <div className="flex gap-4 mt-12">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 px-8 py-4 rounded-2xl font-bold text-ink-muted hover:bg-ink/5 transition-all cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                onClick={step === 4 ? handleSubmit : nextStep}
                disabled={step === 4 && !formData.agreedToTerms}
                className={cn(
                  "flex-[2] py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer",
                  step === 4 && !formData.agreedToTerms 
                    ? "bg-ink/10 text-ink-muted cursor-not-allowed shadow-none" 
                    : "bg-primary text-white shadow-primary/20 hover:bg-primary-dark"
                )}
              >
                {step === 4 ? 'Submit Tuition' : 'Continue'}
                <ChevronRight size={20} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
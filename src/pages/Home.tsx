import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, BookOpen, Phone, ChevronRight, Star, Users, ShieldCheck, Award, GraduationCap, Clock, Target, UserPlus, FileText, ClipboardList, CheckCircle, ArrowRight, UserCheck, Briefcase, PlayCircle, ChevronLeft, X, Home as HomeIcon, Video, Youtube
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { SUBJECTS, DISTRICTS, DISTRICT_WISE_AREAS, CATEGORIES_DATA } from '@/src/constants';
import TutorCard from '@/src/components/TutorCard.tsx';
import { TutorProfile, TuitionJob } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import { NotificationService } from '@/src/services/notificationService.ts';
import ITServicesSection from '@/src/components/home/ITServicesSection.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';

const CUSTOM_CLASSES = [
  'Play / Nursery',
  'KG',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'SSC / O-Level',
  'HSC / A-Level (AS & A2)',
  'University / Undergrad',
  'Admission Candidate'
];

const CUSTOM_MEDIUMS = [
  'Bangla Medium',
  'English Version',
  'English Medium (Cambridge)',
  'English Medium (Edexcel)',
  'Madrasah',
  'Admission Candidate'
];

// ======================== SLIDER SECTION (আপডেটেড) ========================

function SliderSection({ title, subtitle, items, renderItem, viewAllLink, itemWidth = 'w-[280px]' }: any) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-display font-bold text-[#001F3F]">{title}</h3>
          <p className="text-sm text-ink-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={scrollPrev} className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm cursor-pointer">
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollNext} className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center text-ink hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm cursor-pointer">
            <ChevronRight size={20} />
          </button>
          <Link to={viewAllLink} className="text-sm font-bold text-primary hover:underline ml-2">
            View All
          </Link>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4"> {/* gap কমালাম gap-6 -> gap-4 */}
          {items.map((item: any, index: number) => (
            <div key={index} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0">
              <div className={itemWidth}>
                {renderItem(item)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ======================== VIDEO CARD ========================

function VideoCard({ title, description, thumbnail, link }: any) {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-ink/5">
        <div className="relative aspect-video bg-black">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <PlayCircle size={24} className="text-white fill-white" />
            </div>
          </div>
        </div>
        <div className="p-3">
          <h4 className="text-sm font-bold text-ink group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-xs text-ink-muted mt-1">{description}</p>
        </div>
      </div>
    </a>
  );
}

// ======================== MAIN COMPONENT ========================

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [popularTutors, setPopularTutors] = useState<TutorProfile[]>([]);

  useEffect(() => {
    let active = true;

    const fetchTutors = async () => {
      try {
        const tutors = await TutorProfileService.getAll();
        if (active) {
          setPopularTutors((tutors || []).slice(0, 8) as unknown as TutorProfile[]);
        }
      } catch (error) {
        console.error('Failed to load tutors for homepage:', error);
        if (active) {
          setPopularTutors([]);
        }
      }
    };

    fetchTutors();
    return () => {
      active = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    classes: [] as string[],
    district: 'Dhaka',
    area: '',
    detailedAddress: '',
    medium: 'Bangla Medium',
    tuitionType: 'Home Tuition',
    subjects: [] as string[],
    customSubject: '',
    genderPreference: 'Any',
    tutoringDays: '3 Days/Week',
    salary: '5000',
    phone: '',
    name: '',
  });
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const toggleClass = (c: string) => {
    if (formData.classes.includes(c)) {
      setFormData({
        ...formData,
        classes: formData.classes.filter(item => item !== c)
      });
    } else {
      setFormData({
        ...formData,
        classes: [...formData.classes, c]
      });
    }
  };

  const toggleSubject = (sub: string) => {
    const upperSub = sub.toUpperCase();
    if (formData.subjects.includes(upperSub)) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(s => s !== upperSub)
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, upperSub]
      });
    }
  };

  const addCustomSubject = () => {
    if (formData.customSubject.trim()) {
      const upper = formData.customSubject.trim().toUpperCase();
      if (!formData.subjects.includes(upper)) {
        setFormData({
          ...formData,
          subjects: [...formData.subjects, upper],
          customSubject: '',
        });
      } else {
        setFormData({ ...formData, customSubject: '' });
      }
    }
  };

  const currentDistrictAreas = formData.district && DISTRICT_WISE_AREAS[formData.district] 
    ? DISTRICT_WISE_AREAS[formData.district] 
    : [];

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone.trim()) {
      setErrorMessage('Please provide your active phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const classesStr = formData.classes.length > 0 ? formData.classes.join(', ') : 'Class 10';
      const subjectsList = formData.subjects.length > 0 ? formData.subjects : ['All General Subjects'];
      const subjectsStr = subjectsList.join(', ');
      const salaryNum = parseInt(formData.salary, 10) || 5000;

      const payload = {
        studentClass: classesStr,
        subjects: subjectsList,
        location: {
          district: formData.district || 'Dhaka',
          area: formData.area || 'All Areas',
        },
        salary: salaryNum,
        medium: formData.medium || 'Bangla Medium',
        genderPreference: formData.genderPreference || 'Any',
        tutoringDays: [formData.tutoringDays || '3 Days/Week'],
        tuitionType: formData.tuitionType || 'Home Tuition',
        studentGender: 'Any',
        duration: '1.5 Hours',
        startTime: 'Evening',
        phone: formData.phone.trim(),
        name: formData.name.trim() || user?.name || '',
        description: `Tutor requested for: ${classesStr}. Medium: ${formData.medium}. Subjects: ${subjectsStr}. Location: ${formData.area || 'All Areas'}, ${formData.district || 'Dhaka'}${formData.detailedAddress ? ` (${formData.detailedAddress})` : ''}. Tuition Type: ${formData.tuitionType}. Schedule: ${formData.tutoringDays}. Expected Salary: ৳${salaryNum.toLocaleString()}. Contact: ${formData.phone}`,
        status: 'Open',
        approvalStatus: 'Approved',
      };

      await TuitionService.create(payload);

      setSubmittedData({
        ...payload,
        classesStr,
        subjectsStr,
      });
      setIsSuccess(true);
    } catch (error: any) {
      console.error('Failed to submit tutor request:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to submit request. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      classes: [],
      district: 'Dhaka',
      area: '',
      detailedAddress: '',
      medium: 'Bangla Medium',
      tuitionType: 'Home Tuition',
      subjects: [],
      customSubject: '',
      genderPreference: 'Any',
      tutoringDays: '3 Days/Week',
      salary: '5000',
      phone: '',
      name: '',
    });
    setSubmittedData(null);
    setIsSuccess(false);
    setStep(1);
    setErrorMessage('');
  };

  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const typingSubjects = ['Mathematics', 'Physics', 'English', 'Chemistry', 'Biology'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSubjectIndex((prev) => (prev + 1) % typingSubjects.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-16 lg:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                  <Award size={14} />
                  #1 Tutor Platform in Bangladesh
                </div>
                <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-ink leading-[1.1]">
                  Find the Best <br />
                  <span className="text-primary relative inline-block">
                    {typingSubjects[currentSubjectIndex]}
                    <motion.span
                      key={currentSubjectIndex}
                      initial={{ width: '100%' }}
                      animate={{ width: '0%' }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                      className="absolute inset-y-0 right-0 bg-background z-10"
                    />
                  </span>
                  <br />Tutor for You.
                </h1>
                <p className="text-lg text-ink-muted max-w-lg leading-relaxed">
                  Connect with verified home tutors from top universities. Personalized learning for every student, right at your doorstep.
                </p>
              </div>

              <div className="space-y-4 pt-4 w-full max-w-lg overflow-hidden">
                <p className="text-[10px] font-bold text-ink-muted uppercase">Divisional Tutors:</p>
                <div className="relative">
                  <motion.div 
                    animate={{ x: [0, -1200] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="flex gap-3 whitespace-nowrap"
                  >
                    {[
                      { name: 'Dhaka', count: 86450 },
                      { name: 'Chattogram', count: 15220 },
                      { name: 'Rajshahi', count: 12666 },
                      { name: 'Khulna', count: 10550 },
                      { name: 'Barishal', count: 8440 },
                      { name: 'Sylhet', count: 9220 },
                      { name: 'Rangpur', count: 1220 },
                      { name: 'Mymensingh', count: 1266 },
                    ].map((div, i) => (
                      <div key={i} className="px-5 py-2 bg-white border border-ink/5 rounded-full shadow-sm text-[11px] font-bold text-[#7C3AED] flex items-center gap-1.5">
                        {div.name}: <span className="text-ink">{div.count}</span>
                      </div>
                    ))}
                  </motion.div>
                  <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                  <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-10 h-10 rounded-full border-2 border-surface shadow-sm" alt="" referrerPolicy="no-referrer" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-bold text-ink">10k+ Students</p>
                  <p className="text-ink-muted">already found their perfect tutor</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mt-4 lg:mt-0"
            >
              <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-3xl pointer-events-none" />
              <div className="relative bg-surface p-7 sm:p-9 lg:p-10 rounded-[2rem] border border-ink/5 shadow-2xl shadow-primary/10">
                <div className="mb-6 pt-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black text-ink">Request a Tutor</h2>
                    <span className="text-xs font-black uppercase px-3 py-1 bg-primary/10 text-primary rounded-full tracking-wider">
                      {isSuccess ? 'Matched' : `Step ${step} of 5`}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 font-medium">Get matched with top verified tutors in minutes.</p>
                  
                  {!isSuccess && (
                    <div className="flex gap-1.5 mt-5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-500", 
                            step >= i ? "bg-primary shadow-xs shadow-primary/30" : "bg-ink/5"
                          )} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="min-h-[300px]">
                  {isSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      className="py-4 text-center space-y-5"
                    >
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle size={36} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-ink">Request Submitted Successfully!</h3>
                        <p className="text-xs text-slate-500 font-medium">
                          Our automated system has received your request. Matching verified tutors will be notified immediately.
                        </p>
                      </div>

                      {submittedData && (
                        <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100 text-xs font-medium text-slate-700">
                          <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                            <span className="text-slate-400 font-bold">Class(es):</span>
                            <span className="font-bold text-ink truncate max-w-[180px]">{submittedData.studentClass}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                            <span className="text-slate-400 font-bold">Location:</span>
                            <span className="font-bold text-ink">{submittedData.location.area}, {submittedData.location.district}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                            <span className="text-slate-400 font-bold">Medium & Mode:</span>
                            <span className="font-bold text-ink">{submittedData.medium} • {submittedData.tuitionType}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                            <span className="text-slate-400 font-bold">Subjects:</span>
                            <span className="font-bold text-ink truncate max-w-[180px]">{submittedData.subjects.join(', ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">Contact Phone:</span>
                            <span className="font-black text-primary">{submittedData.phone}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Request Another
                        </button>
                        <Link
                          to="/tutors"
                          className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 transition-all text-center"
                        >
                          Browse Tutors
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {/* Step 1: Classes */}
                      {step === 1 && (
                        <motion.div 
                          key="step1" 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: -20 }} 
                          className="space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-ink uppercase">1. Select Class(es) (Multiple Choice)</label>
                            {formData.classes.length > 0 && (
                              <button 
                                type="button" 
                                onClick={() => setStep(2)} 
                                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                Next Step →
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 p-2 bg-background rounded-xl border border-ink/10 min-h-[40px] items-center">
                            {formData.classes.length > 0 ? (
                              formData.classes.map((c) => (
                                <span key={c} className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-sm">
                                  {c}
                                  <button type="button" onClick={() => toggleClass(c)} className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer">
                                    <X size={10} />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-ink-muted/50 font-medium">Click one or more classes below...</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                            {CUSTOM_CLASSES.map((c) => {
                              const isSelected = formData.classes.includes(c);
                              return (
                                <button 
                                  key={c} 
                                  type="button" 
                                  onClick={() => toggleClass(c)} 
                                  className={cn(
                                    "px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer flex items-center justify-between", 
                                    isSelected 
                                      ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" 
                                      : "border-ink/5 hover:border-primary/30 bg-white"
                                  )}
                                >
                                  <span className="truncate">{c}</span>
                                  {isSelected && <span className="text-primary font-bold">✓</span>}
                                </button>
                              );
                            })}
                          </div>

                          <button 
                            type="button" 
                            disabled={formData.classes.length === 0}
                            onClick={() => setStep(2)} 
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-primary-dark transition-all cursor-pointer mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Continue to Location →
                          </button>
                        </motion.div>
                      )}

                      {/* Step 2: Location */}
                      {step === 2 && (
                        <motion.div 
                          key="step2" 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: -20 }} 
                          className="space-y-3"
                        >
                          <label className="block text-xs font-bold text-ink uppercase">2. Address & Location</label>
                          <div className="space-y-2.5">
                            <select 
                              value={formData.district} 
                              onChange={(e) => setFormData({ ...formData, district: e.target.value, area: '' })} 
                              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                            >
                              <option value="">Select District</option>
                              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>

                            <select 
                              value={formData.area} 
                              onChange={(e) => setFormData({ ...formData, area: e.target.value })} 
                              disabled={!formData.district} 
                              className="w-full px-4 py-3 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer disabled:opacity-50"
                            >
                              <option value="">{formData.district ? 'Select Area / Thana' : 'First Select District'}</option>
                              {currentDistrictAreas.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>

                            <div className="relative">
                              <HomeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
                              <input 
                                type="text" 
                                placeholder="House No, Road No, Sector / Details..." 
                                value={formData.detailedAddress} 
                                onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })} 
                                className="w-full pl-10 pr-3 py-3 rounded-xl border border-ink/10 bg-background text-xs font-medium text-ink focus:ring-2 focus:ring-primary/20 outline-none" 
                              />
                            </div>
                          </div>

                          <button 
                            type="button" 
                            disabled={!formData.district || !formData.area} 
                            onClick={() => setStep(3)} 
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-40 mt-1"
                          >
                            Continue to Medium & Mode →
                          </button>
                        </motion.div>
                      )}

                      {/* Step 3: Medium & Tuition Type */}
                      {step === 3 && (
                        <motion.div 
                          key="step3" 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: -20 }} 
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-ink uppercase">3. Medium / Curriculum</label>
                            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                              {CUSTOM_MEDIUMS.map((m) => (
                                <button 
                                  key={m} 
                                  type="button" 
                                  onClick={() => setFormData({ ...formData, medium: m })} 
                                  className={cn(
                                    "px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer flex items-center justify-between", 
                                    formData.medium === m 
                                      ? "border-primary bg-primary/10 text-primary shadow-sm" 
                                      : "border-ink/5 hover:border-primary/30 bg-white"
                                  )}
                                >
                                  <span className="truncate">{m}</span>
                                  {formData.medium === m && <span>✓</span>}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <label className="block text-xs font-bold text-ink uppercase">Tuition Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'Home Tuition', label: '🏠 Home' },
                                { id: 'Online Tuition', label: '💻 Online' },
                                { id: 'Both / Flexible', label: '🔄 Flexible' },
                              ].map((mode) => (
                                <button
                                  key={mode.id}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, tuitionType: mode.id })}
                                  className={cn(
                                    "py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                    formData.tuitionType === mode.id
                                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/30"
                                  )}
                                >
                                  {mode.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <button 
                            type="button" 
                            onClick={() => setStep(4)} 
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-primary-dark transition-all cursor-pointer mt-1"
                          >
                            Continue to Subjects →
                          </button>
                        </motion.div>
                      )}

                      {/* Step 4: Subjects */}
                      {step === 4 && (
                        <motion.div 
                          key="step4" 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: -20 }} 
                          className="space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-ink uppercase">4. Select Subjects (Multiple)</label>
                            {formData.subjects.length > 0 && (
                              <button 
                                type="button" 
                                onClick={() => setStep(5)} 
                                className="text-xs font-bold text-primary hover:underline cursor-pointer"
                              >
                                Next Step →
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5 p-2 bg-background rounded-xl border border-ink/10 min-h-[40px] items-center">
                            {formData.subjects.length > 0 ? (
                              formData.subjects.map((sub) => (
                                <span key={sub} className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-sm">
                                  {sub}
                                  <button type="button" onClick={() => toggleSubject(sub)} className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer">
                                    <X size={10} />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-ink-muted/50 font-medium">Click subjects below to select...</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                            {SUBJECTS.map((s) => {
                              const upper = s.toUpperCase();
                              const isSelected = formData.subjects.includes(upper);
                              return (
                                <button 
                                  key={s} 
                                  type="button" 
                                  onClick={() => toggleSubject(s)} 
                                  className={cn(
                                    "px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all text-left cursor-pointer flex items-center justify-between", 
                                    isSelected 
                                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs" 
                                      : "border-ink/5 hover:border-primary/30 bg-white"
                                  )}
                                >
                                  <span className="truncate">{s}</span>
                                  {isSelected && <span className="text-primary text-[10px]">✓</span>}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Subject Input */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Other subject..."
                              value={formData.customSubject}
                              onChange={(e) => setFormData({ ...formData, customSubject: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomSubject();
                                }
                              }}
                              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={addCustomSubject}
                              className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-900"
                            >
                              + Add
                            </button>
                          </div>

                          <button 
                            type="button" 
                            disabled={formData.subjects.length === 0}
                            onClick={() => setStep(5)} 
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-primary-dark transition-all cursor-pointer mt-1 disabled:opacity-40"
                          >
                            Proceed to Preferences & Contact →
                          </button>
                        </motion.div>
                      )}

                      {/* Step 5: Preferences & Phone */}
                      {step === 5 && (
                        <motion.form 
                          key="step5" 
                          onSubmit={handleRequestSubmit} 
                          initial={{ opacity: 0, x: 20 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: -20 }} 
                          className="space-y-4"
                        >
                          {/* Tutor Gender & Days */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-ink uppercase">Tutor Gender</label>
                              <select
                                value={formData.genderPreference}
                                onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink outline-none cursor-pointer"
                              >
                                <option value="Any">Any Gender</option>
                                <option value="Male">Male Tutor</option>
                                <option value="Female">Female Tutor</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[11px] font-bold text-ink uppercase">Days/Week</label>
                              <select
                                value={formData.tutoringDays}
                                onChange={(e) => setFormData({ ...formData, tutoringDays: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink outline-none cursor-pointer"
                              >
                                <option value="2 Days/Week">2 Days/Week</option>
                                <option value="3 Days/Week">3 Days/Week</option>
                                <option value="4 Days/Week">4 Days/Week</option>
                                <option value="5 Days/Week">5 Days/Week</option>
                                <option value="6 Days/Week">6 Days/Week</option>
                              </select>
                            </div>
                          </div>

                          {/* Budget / Salary */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="block text-[11px] font-bold text-ink uppercase">Expected Salary / Budget</label>
                              <span className="text-xs font-black text-primary">৳{parseInt(formData.salary || '0', 10).toLocaleString()} /mo</span>
                            </div>
                            <div className="flex gap-1.5 overflow-x-auto pb-1">
                              {['3000', '5000', '8000', '10000', '15000'].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, salary: amt })}
                                  className={cn(
                                    "px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer",
                                    formData.salary === amt
                                      ? "bg-primary text-white shadow-xs"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  )}
                                >
                                  ৳{parseInt(amt).toLocaleString()}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Name & Phone */}
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Your Name (Optional)"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-medium text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                            />

                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
                              <input 
                                type="tel" 
                                placeholder="Phone Number (01XXXXXXXXX) *" 
                                required 
                                value={formData.phone} 
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-ink/10 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold" 
                              />
                            </div>
                          </div>

                          {errorMessage && (
                            <p className="text-xs font-bold text-rose-500 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                              ⚠️ {errorMessage}
                            </p>
                          )}

                          <button 
                            type="submit" 
                            disabled={isSubmitting || !formData.phone.trim()} 
                            className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
                          >
                            {isSubmitting ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Submit Tutor Request</span>
                                <ChevronRight size={18} />
                              </>
                            )}
                          </button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  )}
                </div>

                {step > 1 && !isSuccess && (
                  <button 
                    type="button" 
                    onClick={() => setStep(step - 1)} 
                    className="mt-5 text-xs font-bold text-ink-muted hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                  >
                    ← Back to Step {step - 1}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-surface p-8 rounded-[3rem] border border-ink/5 shadow-sm">
          {[
            { label: 'Verified Tutors', value: '5,000+', icon: ShieldCheck },
            { label: 'Happy Students', value: '12,000+', icon: Users },
            { label: 'Average Rating', value: '4.9/5', icon: Star },
            { label: 'Subjects Covered', value: '50+', icon: BookOpen },
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
                <stat.icon size={24} />
              </div>
              <h3 className="text-3xl font-display font-extrabold text-ink">{stat.value}</h3>
              <p className="text-sm text-ink-muted font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tuition Types Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-2 mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#001F3F]">Tuition Types</h2>
          <p className="text-lg text-ink-muted">Find the best tuition type that fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Home Tutoring", desc: "Personalized one-to-one learning in the comfort of your home.", icon: MapPin, color: "text-blue-600", bgColor: "bg-blue-50" },
            { title: "Online Tutoring", desc: "Connect with top tutors anywhere via interactive digital tools.", icon: GraduationCap, color: "text-purple-600", bgColor: "bg-purple-50" },
            { title: "Group Tutoring", desc: "Collaborative learning with peers at an affordable rate.", icon: Users, color: "text-emerald-600", bgColor: "bg-emerald-50" }
          ].map((type, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="bg-surface p-8 rounded-3xl border border-ink/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col items-center text-center">
              <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500", type.bgColor, type.color)}>
                <type.icon size={36} />
              </div>
              <div className="space-y-3 flex-grow">
                <h3 className="text-2xl font-display font-bold text-[#001F3F]">{type.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed max-w-[240px] mx-auto">{type.desc}</p>
              </div>
              <Link to="/tutors" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                Find Tutors <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== 1. TUTORS ===== */}
      <SliderSection
        title="Our Popular Tutors"
        subtitle="Here are few of the Verified Teachers"
        items={popularTutors}
        viewAllLink="/tutors"
        itemWidth="w-[230px] sm:w-[300px] lg:w-[280px]"
        renderItem={(tutor: TutorProfile) => <TutorCard tutor={tutor} className="h-full" />}
      />

      {/* ===== YOUTUBE VIDEOS SECTION ===== */}
      <section className="max-w-8x3 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold text-[#001F3F]">
              <Video className="inline mr-2 text-primary" size={28} />
              All Tutoring Videos
            </h2>
            <p className="text-sm text-ink-muted">Watch tutorials and learn from expert tutors</p>
          </div>
          <Link to="/videos" className="text-sm font-bold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-ink/5">
            <div className="relative aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/zbOVbWhmuSU?autoplay=1&mute=1&loop=1&playlist=zbOVbWhmuSU"
                title="Tutor Registration"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-ink">Tutor Registration</h4>
              <p className="text-xs text-ink-muted mt-1">Complete guide to register as a tutor</p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-ink/5">
            <div className="relative aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/zbOVbWhmuSU?autoplay=1&mute=1&loop=1&playlist=zbOVbWhmuSU"
                title="How to Find Tutor"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-ink">How to Find Tutor</h4>
              <p className="text-xs text-ink-muted mt-1">Step by step guide for parents</p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-ink/5">
            <div className="relative aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/zbOVbWhmuSU?autoplay=1&mute=1&loop=1&playlist=zbOVbWhmuSU"
                title="Demo Class Tips"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-ink">Demo Class Tips</h4>
              <p className="text-xs text-ink-muted mt-1">Tips for a successful demo class</p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-ink/5">
            <div className="relative aspect-video bg-black">
              <iframe
                src="https://www.youtube.com/embed/zbOVbWhmuSU?autoplay=1&mute=1&loop=1&playlist=zbOVbWhmuSU"
                title="Parent's Guide"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-ink">Parent's Guide</h4>
              <p className="text-xs text-ink-muted mt-1">Everything parents need to know</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="bg-ink/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink">Explore <span className="text-primary">Categories</span></h2>
              <p className="text-ink-muted max-w-xl">Find the perfect tutor across a wide range of subjects and skills tailored to your needs.</p>
            </div>
            <Link to="/categories" className="group flex items-center gap-2 text-primary font-bold hover:text-ink transition-colors">
              View All Categories <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CATEGORIES_DATA.slice(0, 8).map((category, i) => (
              <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -5 }}>
                <Link to={`/jobs?category=${encodeURIComponent(category.title)}`} className="relative h-48 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group block">
                  <img src={category.image} alt={category.title} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="space-y-2">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white mb-2", category.color)}>
                        <category.icon size={20} />
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight group-hover:text-primary transition-colors">{category.title}</h3>
                      <p className="text-white/60 text-xs font-medium">{category.items.length} Subjects</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 IT & Software Services Section */}
      <ITServicesSection />

      {/* Tutor Connection Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#001F3F]">The ways Tutors can connect with us</h2>
          <p className="text-lg text-ink-muted">Join our elite community of educators and start your professional journey today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Create Profile", desc: "Create your profile in minutes with sign up information.", icon: UserPlus, accent: "text-primary" },
            { title: "Complete your profile", desc: "Make your profile at least 80% to get fast responses.", icon: UserCheck, accent: "text-primary" },
            { title: "Apply for Tuition Job", desc: "Visit “Job Board” daily & apply for desired tuition jobs.", icon: Briefcase, accent: "text-primary" },
            { title: "Start tutoring", desc: "Be confident in the first meet & start tutoring.", icon: PlayCircle, accent: "text-primary" }
          ].map((step, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="bg-surface border border-ink/5 p-8 rounded-3xl space-y-6 group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 text-center flex flex-col items-center">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/5 transition-transform group-hover:scale-110", step.accent)}>
                <step.icon size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-display font-bold text-[#001F3F]">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{step.desc}</p>
              </div>
              <div className="pt-4 w-full flex items-center gap-2 text-[10px] font-bold uppercase text-ink/20">
                <div className="h-px flex-grow bg-ink/5" /> Step {i + 1} <div className="h-px flex-grow bg-ink/5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Register Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-20">
        <div className="bg-surface border border-ink/5 rounded-3xl p-6 md:p-8 shadow-lg shadow-ink/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-ink-muted uppercase">Want to become</p>
              <h2 className="text-3xl lg:text-4xl font-display font-black text-ink leading-none">TUTOR</h2>
            </div>
            <div className="h-12 w-px bg-ink/10 hidden md:block" />
            <p className="text-lg lg:text-xl text-ink-muted font-medium leading-tight">Let's <span className="text-ink font-bold">Work</span> Together & Explore <span className="opacity-60">Opportunities</span></p>
          </div>
          <Link to="/register" className="bg-ink text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-xl shadow-ink/10 hover:bg-ink/90 transition-all active:scale-95 shrink-0">
            Register Now
          </Link>
        </div>
      </section>

      {/* Why Choose Us? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#001F3F]">Why Choose Us?</h2>
          <p className="text-lg text-ink-muted">We ensure quality through our rigorous 4-step tutor selection process</p>
        </div>

        <div className="relative">
          <svg className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 hidden lg:block pointer-events-none" viewBox="0 0 1200 100" fill="none">
            <path d="M0 50 C 150 50, 150 10, 300 10 C 450 10, 450 90, 600 90 C 750 90, 750 10, 900 10 C 1050 10, 1050 50, 1200 50" stroke="url(#gradient-path)" strokeWidth="2" strokeDasharray="8 8" />
            <defs>
              <linearGradient id="gradient-path" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0D9488" stopOpacity="0" />
                <stop offset="0.2" stopColor="#0D9488" />
                <stop offset="0.8" stopColor="#0D9488" />
                <stop offset="1" stopColor="#0D9488" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {[
              { title: "Strict Application", desc: "Tutors from top-tier universities apply with detailed academic records.", icon: UserPlus, color: "bg-[#E8F0FE] text-[#4285F4]", label: "Step 1" },
              { title: "Document Verification", desc: "We manually verify certificates, NID, and university credentials.", icon: ShieldCheck, color: "bg-[#FCE8E6] text-[#EA4335]", label: "Step 2" },
              { title: "Skill Assessment", desc: "Tutors undergo interviews to test communication and teaching depth.", icon: Award, color: "bg-[#E6F4EA] text-[#34A853]", label: "Step 3" },
              { title: "Quality Onboarding", desc: "Only the top 5% of applicants make it to our platform.", icon: CheckCircle, color: "bg-[#FEF7E0] text-[#FBBC04]", label: "Step 4" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center space-y-6 group">
                <div className="relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white border border-ink/10 rounded-full text-[10px] font-bold text-ink-muted uppercase shadow-sm z-20">{item.label}</div>
                  <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-ink/5 to-transparent group-hover:via-primary/20 transition-all duration-500">
                    <div className={cn("w-28 h-28 rounded-[2.2rem] flex items-center justify-center transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 shadow-sm bg-white", item.color.split(' ')[1])}>
                      <div className={cn("w-20 h-20 rounded-[1.8rem] flex items-center justify-center", item.color.split(' ')[0])}>
                        <item.icon size={36} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-bold text-[#001F3F] group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed max-w-[220px] mx-auto">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 overflow-hidden">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-display font-bold text-ink">What People Say</h2>
          <p className="text-ink-muted max-w-lg mx-auto">Hear from the parents and students who have transformed their learning journey with us.</p>
        </div>
        <TestimonialsCarousel />
      </section>

      {/* How to Connect Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#001F3F]">How to Connect?</h2>
          <p className="text-lg text-ink-muted">Follow these 4 simple steps to find your perfect tutor</p>
        </div>

        <div className="relative bg-primary/5 rounded-[4rem] p-12 lg:p-20">
          <div className="absolute top-1/2 left-20 right-20 h-0.5 bg-primary/20 -translate-y-1/2 hidden lg:block border-t-2 border-dashed border-primary/30" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
            {[
              { title: "Create Profile", desc: "Sign up as a student or parent to unlock all features.", icon: UserPlus, color: "bg-blue-500" },
              { title: "Submit Requirements", desc: "Tell us your subject, class, and preferred budget.", icon: FileText, color: "bg-purple-500" },
              { title: "Get Tutors' CV", desc: "Receive top-rated tutor profiles within 24 hours.", icon: ClipboardList, color: "bg-emerald-500" },
              { title: "Select your Tutor", desc: "Have a trial class and start your regular sessions.", icon: UserCheck, color: "bg-orange-500" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center space-y-6 group">
                <div className="relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white text-primary font-black text-sm flex items-center justify-center shadow-md z-20 border-2 border-primary/10">{i + 1}</div>
                  <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", item.color)}>
                    <item.icon size={32} />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-bold text-[#001F3F] group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed max-w-[180px] mx-auto">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-display font-bold text-ink">Frequently Asked Questions</h2>
          <p className="text-ink-muted">Everything you need to know about our tutoring platform and how it works.</p>
        </div>

        <div className="space-y-4">
          {[
            { q: "How do I request a tutor?", a: "You can request a tutor by filling out our simple 5-step form on the homepage. Once submitted, our team will review your requirements and match you with the best available tutors within minutes." },
            { q: "Is there any registration fee for parents?", a: "No, there is absolutely no registration fee for parents or students. Our matching service is completely free for you. You only pay the tutor their agreed-upon monthly salary." },
            { q: "How do you verify the tutors?", a: "We have a rigorous verification process. Every tutor must provide their NID/Passport, university ID card, and academic certificates. We also conduct background checks and interviews for top-rated tutors." },
            { q: "What happens if I'm not satisfied with the tutor?", a: "We offer a 2-day trial period. If you're not satisfied with the tutor after the trial, you can request a replacement at no extra cost. We ensure you find the perfect match for your learning needs." },
            { q: "How is the tutor's salary determined?", a: "The salary depends on several factors: the student's class, number of subjects, days per week, and the tutor's experience/university. You can specify your budget in the request form." }
          ].map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ======================== FAQ ITEM ========================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-ink/5 rounded-2xl overflow-hidden bg-surface transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer">
        <span className="font-display font-bold text-ink">{question}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0 text-primary">
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="px-6 pb-6 text-sm text-ink-muted leading-relaxed border-t border-ink/5 pt-4">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronDown({ size, className }: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

// ======================== TESTIMONIALS ========================

const TESTIMONIALS = [
  { id: 1, name: "Rahat Ahmed", role: "Parent of Class 9 Student", content: "Finding a reliable tutor in Dhaka was always a challenge until we found Home Tutor Provider BD. The matching process was seamless, and the tutor is exceptional.", rating: 5, image: "https://i.pravatar.cc/150?u=rahat" },
  { id: 2, name: "Sumiya Akter", role: "HSC Student", content: "The physics tutor I found here helped me clear all my basics. I went from struggling with equations to loving the subject. Highly recommended!", rating: 5, image: "https://i.pravatar.cc/150?u=sumiya" },
  { id: 3, name: "Kamrul Hassan", role: "Parent of O-Level Student", content: "Excellent platform. The verification process gives us peace of mind. Our English tutor is from a top university and is very professional.", rating: 4, image: "https://i.pravatar.cc/150?u=kamrul" },
  { id: 4, name: "Nabila Islam", role: "Class 8 Student", content: "I love my new math teacher! She makes everything so easy to understand with real-life examples. My grades have improved significantly.", rating: 5, image: "https://i.pravatar.cc/150?u=nabila" }
];

function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5, ease: "easeInOut" }} className="bg-surface p-8 md:p-12 rounded-[3rem] border border-ink/5 shadow-xl shadow-primary/5 flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="relative shrink-0">
              <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl" />
              <img src={TESTIMONIALS[currentIndex].image} alt={TESTIMONIALS[currentIndex].name} className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg">
                <Star size={16} fill="currentColor" />
              </div>
            </div>

            <div className="flex-grow space-y-6 text-center md:text-left">
              <div className="space-y-2">
                <div className="flex justify-center md:justify-start gap-1">
                  {[...Array(TESTIMONIALS[currentIndex].rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-primary" fill="currentColor" />
                  ))}
                </div>
                <p className="text-xl md:text-2xl font-display font-medium text-ink leading-relaxed italic">"{TESTIMONIALS[currentIndex].content}"</p>
              </div>
              <div>
                <h4 className="text-lg font-display font-bold text-ink">{TESTIMONIALS[currentIndex].name}</h4>
                <p className="text-sm text-ink-muted font-medium">{TESTIMONIALS[currentIndex].role}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-3 mt-8">
        {TESTIMONIALS.map((_, i) => (
          <button key={i} onClick={() => setCurrentIndex(i)} className={cn("h-2 rounded-full transition-all duration-300", currentIndex === i ? "w-8 bg-primary" : "w-2 bg-ink/10 hover:bg-ink/20")} />
        ))}
      </div>
    </div>
  );
}
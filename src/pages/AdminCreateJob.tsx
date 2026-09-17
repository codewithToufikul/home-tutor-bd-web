import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight, ChevronLeft, ChevronDown, MapPin, BookOpen, GraduationCap,
  Phone, User, School, Calendar, ShieldCheck, Star,
  MessageSquare, X, Check, AlertCircle, Send,
  Search, Target, Briefcase, Palette, Cpu, Stethoscope, Landmark,
  Building2, Sprout, Sparkles, Layers, PlusCircle, Loader2, ArrowLeft,
  Clock, DollarSign, CheckCircle2
} from 'lucide-react';
import { getDivisions, getDistricts, getUpazilas, getAreas } from '@olism/bd-geo';
import { getDhakaZones, getDhakaSubLocations } from '@/src/data/dhakaLocations';
import { SUBJECTS } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useCreateTuitionJobMutation } from '@/src/services/tuitionApi.ts';
import AdminLayout from '@/src/components/AdminLayout.tsx';

// ── Constants ───────────────────────────────────────────────────────────────

const COURSE_CATEGORIES = [
  { id: 'all', name: 'All Classes', bangla: 'সকল শ্রেণি ও কোর্স', icon: Sparkles },
  {
    id: 'school_college', name: 'School & College', bangla: 'স্কুল ও কলেজ', icon: School,
    items: ['Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'SSC', 'HSC', 'O-Level', 'A-Level']
  },
  {
    id: 'admission', name: 'Admission Test', bangla: 'ভর্তি পরীক্ষা', icon: Target,
    items: ['Public University Admission Test', 'Private University Admission Test', 'Medical College Admission Test', 'Engineering University Admission Test', 'Medical Admission', 'Cadet Admission', 'College Admission', 'School Admission Test', 'Admission', 'Admission Candidate']
  },
  {
    id: 'university_degree', name: 'University & Degree', bangla: 'বিশ্ববিদ্যালয় ও ডিগ্রি', icon: GraduationCap,
    items: ['BA', 'BBA', 'BSC', 'Degree', 'Diploma Engineering', 'Engineering', 'Medical - MBBS', 'Medical - BDS', 'Law', 'Honours', 'University', 'Undergraduate']
  },
  {
    id: 'job_prep', name: 'Job Preparation', bangla: 'চাকরি প্রস্তুতি', icon: Briefcase,
    items: ['BCS', 'Bank', 'Primary Teacher', 'Sub: Inspector', 'NTRCA']
  },
  {
    id: 'skills_courses', name: 'Skills & Courses', bangla: 'দক্ষতা ও স্পেশাল কোর্স', icon: Palette,
    items: ['IELTS', 'Islamic Studies', 'Drawing & Painting', 'Handwriting', 'Computer Programming', 'Basic Computer Operating']
  }
];

const CUSTOM_CLASSES = [
  'Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'SSC', 'HSC', 'O-Level', 'A-Level', 'Public University Admission Test', 'Private University Admission Test',
  'Medical College Admission Test', 'Engineering University Admission Test', 'Medical Admission', 'Cadet Admission',
  'College Admission', 'School Admission Test', 'Admission', 'Admission Candidate', 'BA', 'BBA', 'BSC', 'Degree',
  'Diploma Engineering', 'Engineering', 'Medical - MBBS', 'Medical - BDS', 'Law', 'Honours', 'University', 'Undergraduate',
  'BCS', 'Bank', 'Primary Teacher', 'Sub: Inspector', 'NTRCA', 'IELTS', 'Islamic Studies', 'Drawing & Painting',
  'Handwriting', 'Computer Programming', 'Basic Computer Operating',
];

const ADMISSION_CATEGORIES = [
  {
    id: 'du', name: 'Dhaka University (DU)', banglaName: 'ঢাকা বিশ্ববিদ্যালয় (ঢাবি)', icon: Landmark, badge: 'শীর্ষ পছন্দ',
    units: ["DU 'A' Unit (Science / বিজ্ঞান অনুষদ)", "DU 'B' Unit (Arts, Law & Social Science / মানবিক ও সামাজিক বিজ্ঞান)", "DU 'C' Unit (Business Studies / ব্যবসায় শিক্ষা)", "DU IBA (Institute of Business Administration)", "DU Fine Arts (চারুকলা অনুষদ)"]
  },
  {
    id: 'engineering', name: 'Engineering Admission', banglaName: 'ইঞ্জিনিয়ারিং এডমিশন', icon: Cpu, badge: 'বুয়েট ও ইঞ্জি.',
    units: ["BUET Engineering (বুয়েট)", "CKET Combined (RUET, KUET, CUET)", "BUTEX (বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয়)", "MIST Admission (মিলিটারি ইনস্টিটিউট)", "Engineering Math & Physics Special"]
  },
  {
    id: 'medical', name: 'Medical & Dental', banglaName: 'মেডিকেল ও ডেন্টাল এডমিশন', icon: Stethoscope, badge: 'MBBS / BDS',
    units: ["Medical Admission (MBBS সরকারি ও বেসরকারি)", "Dental Admission (BDS)", "Armed Forces Medical College (AFMC/AMC)", "Medical Biology & Chemistry Special"]
  },
  {
    id: 'iba_bup', name: 'IBA, BUP & Business', banglaName: 'IBA, BUP ও বিজনেস এডমিশন', icon: Building2, badge: 'IBA / BUP',
    units: ["DU IBA & JU IBA Admission", "BUP Admission (FASS, FST, FBS)", "Private University Admission (NSU, BRAC, IUB, EWU, AIUB)"]
  },
  {
    id: 'gst_public', name: 'GST & Public Universities', banglaName: 'গুচ্ছ ও পাবলিক বিশ্ববিদ্যালয়', icon: Sprout, badge: '২৪+ পাবলিক বিশ্ববিদ্যালয়',
    units: ["GST Gucche 'A' Unit (Science / বিজ্ঞান)", "GST Gucche 'B' Unit (Humanities / মানবিক)", "GST Gucche 'C' Unit (Commerce / বাণিজ্য)", "Jahangirnagar University (JU - সব ইউনিট)", "Rajshahi University (RU)", "Chittagong University (CU)", "Agricultural University Cluster (কৃষি গুচ্ছ)"]
  }
];

const CUSTOM_MEDIUMS = [
  'Bangla Medium', 'English Medium', 'English Version', 'Madrasah Medium', 'Admission Candidate', 'Admission Help',
  'International Exam Preparation', 'Religious and Moral Studies', 'Language', 'Arts and Crafts',
  'Special Skills Mastery', 'Skills Development', 'Graduate Program', 'Job Preparation', 'Medical Admission'
];

const POPULAR_UNIVERSITIES = [
  'Any University', 'BUET', 'DU (Dhaka University)', 'DMC (Medical)', 'NSU', 'BRACU', 'JU (Jahangirnagar)',
  'RUET', 'CUET', 'SUST', 'IUT', 'BUP', 'EWU', 'AIUB', 'AUST'
];

const SALARY_PRESETS = ['3000', '4000', '5000', '6000', '7000', '8000', '10000', '12000', '15000'];

const TUTOR_QUALIFICATIONS = [
  'Any Qualification', 'Public University Student', 'BUET / Engineering Student', 'Medical (MBBS) Student',
  'Top Private University (NSU/BRAC)', 'Experienced School/College Teacher', 'Post Graduate / Masters Passed'
];

const POPULAR_REQUIREMENTS = [
  'Punctual and regular', 'Special care for weak student', 'Strong in Math and Science',
  'Fluent in English communication', 'Interactive teaching method', 'Weekly test and progress report'
];

// ── Component ───────────────────────────────────────────────────────────────

export default function AdminCreateJob() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createTuitionJob, { isLoading: isSubmitting }] = useCreateTuitionJobMutation();

  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Class filtering & search
  const [classCategoryFilter, setClassCategoryFilter] = useState<string>('all');
  const [classSearchQuery, setClassSearchQuery] = useState<string>('');
  const [selectedAdmissionTab, setSelectedAdmissionTab] = useState<string>('du');
  const [showAdmissionPanel, setShowAdmissionPanel] = useState<boolean>(false);

  // Custom inputs
  const [customSubInput, setCustomSubInput] = useState('');
  const [customClassInput, setCustomClassInput] = useState('');
  const [customMediumInput, setCustomMediumInput] = useState('');

  // Bangladesh Geo Data
  const allDivisions = useMemo(() => getDivisions(), []);
  const allDistricts = useMemo(() => getDistricts(), []);
  const allUpazilas = useMemo(() => getUpazilas(), []);
  const allAreas = useMemo(() => getAreas(), []);

  const [formData, setFormData] = useState({
    studentName: '',
    studentGender: 'Any',
    numStudents: 1,
    schoolName: '',
    classes: [] as string[],
    mediums: ['Bangla Medium'] as string[],
    subjects: [] as string[],

    // Location
    division: 'Dhaka',
    divisionId: 3 as number | '',
    district: 'Dhaka',
    districtId: 1 as number | '',
    upazila: '',
    upazilaId: '' as number | string | '',
    union: '',
    unionId: '' as number | string | '',
    ward: '',
    wardId: '' as number | string | '',
    area: '',
    detailedAddress: '',

    // Tutor Preference
    genderPreference: 'Any',
    tuitionType: 'Home Tuition',
    tutorQualification: 'Any Qualification',
    universityPreference: 'Any University',
    requirements: [] as string[],

    // Schedule & Budget
    tutoringDays: '3 Days/Week',
    duration: '1.5 Hours',
    startTime: 'Evening (4:00 PM - 8:00 PM)',
    salaryOffer: '5000',

    // Contact
    contactName: '',
    phone: '',
    whatsappNumber: '',
    sameAsPhone: true,
    additional: '',
  });

  // Prefill from admin user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || (user as any).name || '',
        phone: prev.phone || (user as any).phone || '',
        whatsappNumber: prev.whatsappNumber || (user as any).phone || '',
      }));
    }
  }, [user]);

  const isDhaka = useMemo(() => {
    return formData.district.toLowerCase() === 'dhaka' || Number(formData.districtId) === 1;
  }, [formData.district, formData.districtId]);

  // Cascaded geo options
  const availableDistricts = useMemo(() => {
    if (!formData.divisionId) return [];
    return allDistricts.filter(d => d.divisionId === Number(formData.divisionId));
  }, [allDistricts, formData.divisionId]);

  const availableUpazilas = useMemo(() => {
    if (!formData.districtId) return [];
    if (isDhaka) {
      const zones = getDhakaZones();
      return zones.map((zone) => ({
        id: zone,
        name: zone,
        nameBn: '',
        type: 'zone',
      }));
    }
    return allUpazilas.filter(u => u.districtId === Number(formData.districtId));
  }, [allUpazilas, formData.districtId, isDhaka]);

  const availableUnions = useMemo(() => {
    if (isDhaka) return [];
    if (!formData.upazilaId) return [];
    return allAreas.filter(a => a.upazilaId === Number(formData.upazilaId) && a.type === 'union');
  }, [allAreas, formData.upazilaId, isDhaka]);

  const availableWards = useMemo(() => {
    if (isDhaka) {
      const list = getDhakaSubLocations(formData.upazila);
      return list.map((item, idx) => ({
        id: `dhaka-${idx + 1}`,
        name: item,
        nameBn: '',
        type: 'ward',
      }));
    }
    if (!formData.upazilaId) return [];
    return allAreas.filter(a => a.upazilaId === Number(formData.upazilaId) && a.type === 'ward');
  }, [allAreas, formData.upazilaId, formData.upazila, isDhaka]);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divId = Number(e.target.value);
    const div = allDivisions.find(d => d.id === divId);
    setFormData(prev => ({ ...prev, division: div ? div.name : '', divisionId: divId || '', district: '', districtId: '', upazila: '', upazilaId: '', union: '', unionId: '', ward: '', wardId: '', area: '' }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = Number(e.target.value);
    const dist = allDistricts.find(d => d.id === distId);
    setFormData(prev => ({ ...prev, district: dist ? dist.name : '', districtId: distId || '', upazila: '', upazilaId: '', union: '', unionId: '', ward: '', wardId: '', area: '' }));
  };

  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (isDhaka) {
      setFormData(prev => ({
        ...prev,
        upazila: val,
        upazilaId: val,
        union: '',
        unionId: '',
        ward: '',
        wardId: '',
        area: val,
      }));
    } else {
      const upId = Number(val);
      const up = allUpazilas.find(u => u.id === upId);
      setFormData(prev => ({ ...prev, upazila: up ? up.name : '', upazilaId: upId || '', union: '', unionId: '', ward: '', wardId: '', area: up ? up.name : '' }));
    }
  };

  const handleWardTextChange = (text: string) => {
    const matchedWd = availableWards.find(
      (w) => w.name.toLowerCase() === text.trim().toLowerCase() || (w.nameBn && w.nameBn === text.trim())
    );
    setFormData((prev) => ({
      ...prev,
      ward: text,
      wardId: matchedWd ? matchedWd.id : '',
    }));
  };

  const handleSelectWard = (wd: { id: number | string; name: string; nameBn?: string }) => {
    setFormData((prev) => ({
      ...prev,
      ward: wd.name,
      wardId: wd.id,
    }));
    setIsWardDropdownOpen(false);
  };

  const handleUnionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unId = Number(e.target.value);
    const un = availableUnions.find(u => u.id === unId);
    setFormData(prev => ({ ...prev, union: un ? un.name : '', unionId: unId || '' }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wdId = Number(e.target.value);
    const wd = availableWards.find(w => w.id === wdId);
    setFormData(prev => ({ ...prev, ward: wd ? wd.name : '', wardId: wdId || '' }));
  };

  const toSentenceCase = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
  const totalSteps = 4;

  const visibleClasses = useMemo(() => {
    let list = CUSTOM_CLASSES;
    if (classCategoryFilter !== 'all') {
      const cat = COURSE_CATEGORIES.find(c => c.id === classCategoryFilter);
      if (cat && (cat as any).items) list = (cat as any).items;
    }
    if (classSearchQuery.trim()) {
      const q = classSearchQuery.toLowerCase().trim();
      list = list.filter(item => item.toLowerCase().includes(q));
    }
    return list;
  }, [classCategoryFilter, classSearchQuery]);

  const toggleClass = (cls: string) => {
    const isAdmission = cls.toLowerCase().includes('admission') || ADMISSION_CATEGORIES.some(cat => cat.units.includes(cls));
    if (isAdmission) setShowAdmissionPanel(true);
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(cls) ? prev.classes.filter(c => c !== cls) : [...prev.classes, cls]
    }));
  };

  const toggleMedium = (med: string) => {
    setFormData(prev => ({
      ...prev,
      mediums: prev.mediums.includes(med)
        ? (prev.mediums.length === 1 ? prev.mediums : prev.mediums.filter(m => m !== med))
        : [...prev.mediums, med]
    }));
  };

  const toggleAdmissionUnit = (unit: string) => {
    if (formData.classes.includes(unit)) {
      setFormData(prev => ({ ...prev, classes: prev.classes.filter(item => item !== unit) }));
    } else {
      const newClasses = formData.classes.includes('Admission Candidate')
        ? [...formData.classes, unit]
        : [...formData.classes, 'Admission Candidate', unit];
      setFormData(prev => ({
        ...prev,
        classes: newClasses,
        mediums: prev.mediums.includes('Admission Candidate')
          ? prev.mediums
          : [...prev.mediums.filter(m => m !== 'Bangla Medium'), 'Admission Candidate']
      }));
      setShowAdmissionPanel(true);
    }
  };

  const toggleSubject = (sub: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(sub) ? prev.subjects.filter(s => s !== sub) : [...prev.subjects, sub]
    }));
  };

  const addCustomSubject = () => {
    if (customSubInput.trim()) {
      const formatted = toSentenceCase(customSubInput.trim());
      if (!formData.subjects.includes(formatted)) {
        setFormData(prev => ({ ...prev, subjects: [...prev.subjects, formatted] }));
      }
      setCustomSubInput('');
    }
  };

  const addCustomClass = () => {
    const val = customClassInput.trim();
    if (!val) return;
    const formatted = toSentenceCase(val);
    if (!formData.classes.includes(formatted)) {
      setFormData(prev => ({ ...prev, classes: [...prev.classes, formatted] }));
    }
    setCustomClassInput('');
  };

  const addCustomMedium = () => {
    const val = customMediumInput.trim();
    if (!val) return;
    const formatted = toSentenceCase(val);
    if (!formData.mediums.includes(formatted)) {
      setFormData(prev => ({ ...prev, mediums: [...prev.mediums, formatted] }));
    }
    setCustomMediumInput('');
  };

  const toggleRequirement = (req: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.includes(req) ? prev.requirements.filter(r => r !== req) : [...prev.requirements, req]
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setValidationError('');
    if (currentStep === 1) {
      if (!formData.studentName.trim()) { setValidationError('Please enter the student full name.'); return false; }
      if (formData.classes.length === 0) { setValidationError('Please select at least one class or course.'); return false; }
      if (formData.mediums.length === 0) { setValidationError('Please select at least one curriculum / medium.'); return false; }
      if (formData.subjects.length === 0) { setValidationError('Please select at least one subject.'); return false; }
    } else if (currentStep === 2) {
      if (!formData.divisionId) { setValidationError('Please select a division.'); return false; }
      if (!formData.districtId) { setValidationError('Please select a district.'); return false; }
      if (!formData.upazilaId) { setValidationError('Please select an upazila / thana.'); return false; }
    } else if (currentStep === 4) {
      if (!formData.salaryOffer || parseInt(formData.salaryOffer, 10) <= 0) { setValidationError('Please enter an expected salary amount.'); return false; }
      if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) { setValidationError('Please provide a valid active phone number.'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setValidationError('');
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    const classesStr = formData.classes.length > 0 ? formData.classes.join(', ') : 'Class 10';
    const mediumsStr = formData.mediums.length > 0 ? formData.mediums.join(', ') : 'Bangla Medium';
    const locationArea = [formData.ward, formData.union, formData.upazila].filter(Boolean).join(', ') || formData.upazila || formData.area || 'All Areas';
    const locationParts = [formData.ward ? `Ward: ${formData.ward}` : '', formData.union ? `Union: ${formData.union}` : '', formData.upazila, formData.district, formData.division].filter(Boolean);
    const fullLocationDescription = locationParts.join(', ') + (formData.detailedAddress ? ` (Details: ${formData.detailedAddress})` : '');
    const whatsapp = formData.sameAsPhone ? formData.phone.trim() : (formData.whatsappNumber.trim() || formData.phone.trim());

    const payload = {
      studentClass: classesStr,
      subjects: formData.subjects.length > 0 ? formData.subjects : ['General Subjects'],
      location: {
        division: formData.division || '',
        district: formData.district || 'Dhaka',
        upazila: formData.upazila || '',
        union: formData.union || '',
        ward: formData.ward || '',
        area: locationArea,
        detailedAddress: formData.detailedAddress.trim()
      },
      salary: parseInt(formData.salaryOffer, 10) || 5000,
      medium: mediumsStr,
      genderPreference: formData.genderPreference,
      tutoringDays: [formData.tutoringDays],
      tuitionType: formData.tuitionType,
      studentGender: formData.studentGender,
      numStudents: formData.numStudents,
      duration: formData.duration,
      startTime: formData.startTime,
      phone: formData.phone.trim(),
      whatsappNumber: whatsapp,
      name: formData.studentName.trim(),
      contactName: formData.contactName.trim() || formData.studentName.trim(),
      schoolName: formData.schoolName.trim(),
      universityPreference: formData.universityPreference,
      tutorQualification: formData.tutorQualification,
      requirements: formData.requirements,
      preferredTime: [formData.startTime],
      description: `Tutor requested for: ${classesStr} (${mediumsStr}). Subjects: ${formData.subjects.join(', ')}. Location: ${fullLocationDescription}. Tutor Preference: ${formData.genderPreference} Tutor from ${formData.universityPreference}. Schedule: ${formData.tutoringDays} (${formData.duration}). Expected Salary: ৳${parseInt(formData.salaryOffer, 10).toLocaleString()}/month.${formData.additional?.trim() ? ` Notes: ${formData.additional.trim()}` : ''}`,
      status: 'Open',
      approvalStatus: 'Approved',
    };

    try {
      await createTuitionJob(payload).unwrap();
      setIsSuccess(true);
      setTimeout(() => navigate('/admin/manage-jobs'), 2500);
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || 'Failed to create job. Please try again.';
      setValidationError(msg);
    }
  };

  const isAdmissionMode = showAdmissionPanel || formData.classes.some(c => c.toLowerCase().includes('admission') || ADMISSION_CATEGORIES.some(cat => cat.units.includes(c))) || classCategoryFilter === 'admission';

  const steps = [
    { num: 1, title: 'Class & Medium', desc: 'Academics', icon: BookOpen },
    { num: 2, title: 'Location Details', desc: 'Area Info', icon: MapPin },
    { num: 3, title: 'Tutor Preference', desc: 'Requirements', icon: GraduationCap },
    { num: 4, title: 'Schedule & Contact', desc: 'Finalize', icon: Calendar },
  ];

  const inputCls = "w-full px-3.5 py-3 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition text-xs sm:text-sm font-medium";
  const labelCls = "text-xs font-bold text-slate-700 block";

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4 max-w-sm bg-white p-8 rounded-3xl border border-slate-100 shadow-xl"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check size={38} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Job Posted Successfully!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">Auto-approved and now live on the platform. Redirecting to Manage Jobs...</p>
            <Loader2 className="animate-spin text-violet-600 mx-auto" size={20} />
          </motion.div>
        </div>
      </AdminLayout>
    );
  }

  // ── Main Form ───────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto px-2.5 sm:px-0 pb-28 sm:pb-24 space-y-4 sm:space-y-6 font-sans">

        {/* 🌟 1. Header Banner */}
        <div className="bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-[22px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/admin/manage-jobs')}
              className="p-2 sm:p-2.5 bg-slate-100 active:bg-slate-200 hover:bg-slate-200 rounded-xl sm:rounded-2xl transition-all cursor-pointer shrink-0 mt-0.5"
              title="Back to Jobs"
            >
              <ArrowLeft size={18} className="text-slate-700" />
            </button>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="px-2.5 py-0.5 bg-violet-100 text-violet-700 rounded-md text-[9px] sm:text-[10px] font-black flex items-center gap-1 uppercase">
                  <ShieldCheck size={11} /> Admin Post
                </div>
                <div className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[9px] sm:text-[10px] font-black uppercase">
                  Auto Approved
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight leading-tight">
                Post a Tuition Job
              </h1>
              <p className="text-xs text-slate-500 truncate">
                Posted by: <span className="font-bold text-violet-700">{(user as any)?.name || 'Admin'}</span> <span className="text-[11px] text-slate-400">({(user as any)?.role || 'super_admin'})</span>
              </p>
            </div>
          </div>
        </div>

        {/* 🚀 2. Stepper — Responsive Pill on Mobile, Full Multi-col on Desktop */}
        <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/60 shadow-md space-y-2.5">
          {/* Mobile Current Step Header Pill */}
          <div className="sm:hidden flex items-center justify-between pb-1 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {step}
              </span>
              <div className="leading-tight">
                <p className="text-xs font-black text-slate-900">{steps[step - 1].title}</p>
                <p className="text-[10px] text-slate-400">{steps[step - 1].desc}</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-lg">
              Step {step} of {totalSteps}
            </span>
          </div>

          {/* Desktop 4-Col Grid */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-2">
            {steps.map(st => {
              const isActive = step === st.num;
              const isCompleted = step > st.num;
              const StepIcon = st.icon;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => { if (st.num < step) setStep(st.num); }}
                  className={cn(
                    "text-left p-3 rounded-2xl border transition-all text-xs flex items-center gap-2.5 relative overflow-hidden",
                    isActive
                      ? "bg-violet-50/70 border-violet-300 ring-2 ring-violet-500/20 shadow-xs"
                      : isCompleted
                        ? "bg-slate-50 border-slate-200 text-slate-700 cursor-pointer hover:bg-slate-100"
                        : "bg-transparent border-transparent text-slate-400 cursor-not-allowed opacity-60"
                  )}
                >
                  <span className={cn(
                    "w-6 h-6 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0",
                    isActive ? "bg-violet-600 text-white shadow-xs"
                      : isCompleted ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-500"
                  )}>
                    {isCompleted ? <Check size={12} strokeWidth={3} /> : st.num}
                  </span>
                  <div className="min-w-0">
                    <p className={cn("font-bold truncate text-[11px]", isActive ? "text-violet-900 font-black" : "text-slate-800")}>
                      {st.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{st.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* ⚠️ 3. Validation Error */}
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-2 shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span className="truncate">{validationError}</span>
            </div>
            <button onClick={() => setValidationError('')} className="p-1 hover:bg-rose-100 rounded-lg text-rose-700">
              <X size={14} />
            </button>
          </motion.div>
        )}

        {/* 📋 4. Main Form Card */}
        <div className="bg-white/90 backdrop-blur-xl p-4 sm:p-8 rounded-[24px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 min-h-[420px] flex flex-col justify-between">
          <AnimatePresence mode="wait">

            {/* ══ STEP 1: Class, Medium & Subjects ══════════════════════════════ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4 sm:space-y-6 flex-grow">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Student, Class and Curriculum Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select class, curriculum medium, and subjects.</p>
                </div>

                <div className="space-y-4">
                  {/* Student Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className={labelCls}>Student Full Name <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Tanvir Rahman"
                        value={formData.studentName}
                        onChange={e => setFormData({ ...formData, studentName: toSentenceCase(e.target.value) })}
                        className={inputCls}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>Student Gender</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {['Male', 'Female', 'Any'].map(g => (
                          <button
                            key={g} type="button"
                            onClick={() => setFormData({ ...formData, studentGender: g })}
                            className={cn("py-2.5 px-1 rounded-xl border text-xs font-bold transition cursor-pointer text-center active:scale-95",
                              formData.studentGender === g ? "bg-slate-900 text-white border-slate-900 shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
                          >{g}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>School / College Name</label>
                      <input
                        type="text" placeholder="e.g. Notre Dame College"
                        value={formData.schoolName}
                        onChange={e => setFormData({ ...formData, schoolName: toSentenceCase(e.target.value) })}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Select Class */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className={labelCls}>Select Class or Course (Multiple) <span className="text-rose-500">*</span></label>
                      <span className="text-[11px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-lg">{formData.classes.length} selected</span>
                    </div>

                    {/* Selected chips */}
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 min-h-[42px] items-center">
                      {formData.classes.length > 0 ? formData.classes.map(c => (
                        <span key={c} className="inline-flex items-center gap-1 bg-violet-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs">
                          {c}
                          <button type="button" onClick={() => toggleClass(c)} className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5"><X size={12} /></button>
                        </span>
                      )) : <span className="text-xs text-slate-400">Click one or more classes or courses below...</span>}
                    </div>

                    {/* Category Filter Tabs with Smooth Touch Scrolling */}
                    <div className="flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1 pt-1 pb-1">
                      {COURSE_CATEGORIES.map(cat => {
                        const IconComponent = cat.icon;
                        const isActive = classCategoryFilter === cat.id;
                        return (
                          <button key={cat.id} type="button" onClick={() => setClassCategoryFilter(cat.id)}
                            className={cn("snap-start px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border active:scale-95",
                              isActive ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50")}
                          >
                            <IconComponent size={13} className={isActive ? "text-white" : "text-slate-500"} />
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text" value={classSearchQuery}
                        onChange={e => setClassSearchQuery(e.target.value)}
                        placeholder="Search class, admission, degree or course..."
                        className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition"
                      />
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      {classSearchQuery && (
                        <button type="button" onClick={() => setClassSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"><X size={13} /></button>
                      )}
                    </div>

                    {/* Class Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                      {visibleClasses.length > 0 ? visibleClasses.map(c => {
                        const isSelected = formData.classes.includes(c);
                        return (
                          <button key={c} type="button" onClick={() => toggleClass(c)}
                            className={cn("px-3 py-2.5 rounded-xl border text-xs font-medium transition text-left cursor-pointer flex items-center justify-between gap-1.5 active:scale-98",
                              isSelected ? "border-violet-500 bg-violet-50 text-violet-800 font-bold shadow-xs" : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
                          >
                            <span className="truncate">{c}</span>
                            {isSelected && <Check size={13} strokeWidth={3} className="text-violet-600 shrink-0" />}
                          </button>
                        );
                      }) : (
                        <div className="col-span-full py-4 text-center text-xs text-slate-400">No classes matching "{classSearchQuery}"</div>
                      )}
                    </div>

                    {/* Custom Class Type Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type custom class or course and press Add..."
                        value={customClassInput}
                        onChange={e => setCustomClassInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomClass())}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={addCustomClass}
                        className="bg-violet-600 active:bg-violet-700 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-violet-700 transition cursor-pointer shrink-0 active:scale-95"
                      >
                        Add
                      </button>
                    </div>

                    {/* Admission Panel */}
                    {isAdmissionMode && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="p-3.5 sm:p-4 bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-2xl border border-amber-200/80 space-y-3 mt-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Target size={15} className="text-amber-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 truncate">এডমিশন ইউনিট ও স্পেশাল ট্র্যাক</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">নির্দিষ্ট ইউনিট</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1 pb-1">
                          {ADMISSION_CATEGORIES.map(cat => {
                            const CatIcon = cat.icon;
                            const isTabActive = selectedAdmissionTab === cat.id;
                            const selectedCount = cat.units.filter(u => formData.classes.includes(u)).length;
                            return (
                              <button key={cat.id} type="button" onClick={() => setSelectedAdmissionTab(cat.id)}
                                className={cn("snap-start px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border active:scale-95",
                                  isTabActive ? "bg-violet-600 text-white border-violet-600 shadow-xs" : "bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50")}
                              >
                                <CatIcon size={13} className={isTabActive ? "text-white" : "text-slate-500"} />
                                <span>{cat.name}</span>
                                {selectedCount > 0 && (
                                  <span className={cn("w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center",
                                    isTabActive ? "bg-white text-violet-600" : "bg-violet-600 text-white")}>{selectedCount}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                        {(() => {
                          const currentCat = ADMISSION_CATEGORIES.find(c => c.id === selectedAdmissionTab) || ADMISSION_CATEGORIES[0];
                          const CurrentIcon = currentCat.icon;
                          return (
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                  <CurrentIcon size={14} className="text-violet-600" />
                                  <span>{currentCat.banglaName}</span>
                                </div>
                                <span className="text-[10px] text-violet-600 font-bold bg-violet-50 px-2 py-0.5 rounded-md">{currentCat.badge}</span>
                              </div>
                              <div className="grid grid-cols-1 gap-1.5">
                                {currentCat.units.map(unit => {
                                  const isSelected = formData.classes.includes(unit);
                                  return (
                                    <button key={unit} type="button" onClick={() => toggleAdmissionUnit(unit)}
                                      className={cn("px-3 py-2.5 rounded-xl border text-xs font-medium transition text-left cursor-pointer flex items-center justify-between gap-2 active:scale-98",
                                        isSelected ? "border-violet-500 bg-violet-50 text-violet-800 font-bold" : "border-slate-200 hover:border-violet-300 bg-white text-slate-700 hover:bg-slate-50")}
                                    >
                                      <span className="leading-snug">{unit}</span>
                                      {isSelected && <Check size={13} strokeWidth={3} className="text-violet-600 shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>

                  {/* Curriculum/Medium */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className={labelCls}>Curriculum / Medium <span className="text-rose-500">*</span></label>
                      <span className="text-[11px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-lg">{formData.mediums.length} selected</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CUSTOM_MEDIUMS.map(med => {
                        const isSel = formData.mediums.includes(med);
                        return (
                          <button key={med} type="button" onClick={() => toggleMedium(med)}
                            className={cn("px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95",
                              isSel ? "bg-violet-600 text-white border-violet-600 shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300")}
                          >
                            {isSel && <Check size={11} strokeWidth={3} className="inline mr-1" />}{med}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Medium Type Input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type custom medium and press Add..."
                        value={customMediumInput}
                        onChange={e => setCustomMediumInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomMedium())}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={addCustomMedium}
                        className="bg-violet-600 active:bg-violet-700 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-violet-700 transition cursor-pointer shrink-0 active:scale-95"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className={labelCls}>Subjects <span className="text-rose-500">*</span></label>
                      <span className="text-[11px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-lg">{formData.subjects.length} selected</span>
                    </div>
                    {formData.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2.5 bg-violet-50 rounded-2xl border border-violet-100">
                        {formData.subjects.map(sub => (
                          <span key={sub} className="inline-flex items-center gap-1 bg-violet-600 text-white px-2.5 py-1 rounded-xl text-xs font-bold shadow-xs">
                            {sub}
                            <button type="button" onClick={() => toggleSubject(sub)} className="hover:opacity-75 cursor-pointer p-0.5"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text" placeholder="Type custom subject and press Add..."
                        value={customSubInput}
                        onChange={e => setCustomSubInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomSubject())}
                        className={inputCls}
                      />
                      <button type="button" onClick={addCustomSubject} className="bg-violet-600 active:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-violet-700 transition cursor-pointer shrink-0 active:scale-95">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {SUBJECTS.map(sub => {
                        const isSel = formData.subjects.includes(sub);
                        return (
                          <button key={sub} type="button" onClick={() => toggleSubject(sub)}
                            className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border active:scale-95",
                              isSel ? "bg-violet-600 text-white border-violet-600 font-bold shadow-xs" : "bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:text-violet-700")}
                          >
                            {sub} {isSel && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 2: Location ══════════════════════════════════════════════ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4 sm:space-y-5 flex-grow">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Location Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Where is the student located?</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {/* Division */}
                  <div className="space-y-1">
                    <label className={labelCls}>Division <span className="text-rose-500">*</span></label>
                    <select value={formData.divisionId} onChange={handleDivisionChange} className={inputCls}>
                      <option value="">Select Division</option>
                      {allDivisions.map(d => <option key={d.id} value={d.id}>{d.name} ({d.nameBn})</option>)}
                    </select>
                  </div>

                  {/* District */}
                  <div className="space-y-1">
                    <label className={labelCls}>District <span className="text-rose-500">*</span></label>
                    <select value={formData.districtId} onChange={handleDistrictChange} disabled={!formData.divisionId} className={cn(inputCls, "disabled:opacity-40")}>
                      <option value="">{formData.divisionId ? 'Select District' : 'First select division'}</option>
                      {availableDistricts.map(d => <option key={d.id} value={d.id}>{d.name} ({d.nameBn})</option>)}
                    </select>
                  </div>

                  {/* Upazila Select */}
                  <div className="space-y-1">
                    <label className={labelCls}>Upazila / Thana <span className="text-rose-500">*</span></label>
                    <select value={formData.upazilaId} onChange={handleUpazilaChange} disabled={!formData.districtId} className={cn(inputCls, "disabled:opacity-40")}>
                      <option value="">{formData.districtId ? 'Select Upazila / Thana' : 'First select district'}</option>
                      {availableUpazilas.map(u => <option key={u.id} value={u.id}>{u.name} ({u.nameBn})</option>)}
                    </select>
                  </div>

                  {/* Union (optional) */}
                  {availableUnions.length > 0 && (
                    <div className="space-y-1">
                      <label className={labelCls}>Union <span className="text-slate-400 font-normal">(optional)</span></label>
                      <select value={formData.unionId} onChange={handleUnionChange} className={inputCls}>
                        <option value="">Select Union</option>
                        {availableUnions.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Ward (Select + Type Field) */}
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <label className={labelCls}>Ward / Area <span className="text-slate-400 font-normal">(optional)</span></label>
                      <span className="text-[10px] font-medium text-primary">(select or type)</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        list="admin-ward-suggestions"
                        value={formData.ward}
                        onChange={(e) => {
                          handleWardTextChange(e.target.value);
                          setIsWardDropdownOpen(true);
                        }}
                        onFocus={() => {
                          if (availableWards.length > 0) setIsWardDropdownOpen(true);
                        }}
                        placeholder={availableWards.length > 0 ? "Type or select Ward..." : "e.g. Ward 4, Sector 3, Block B..."}
                        className={cn(inputCls, "pr-8")}
                      />
                      {availableWards.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsWardDropdownOpen((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                        >
                          <ChevronDown size={14} className={cn("transition-transform duration-200", isWardDropdownOpen && "rotate-180")} />
                        </button>
                      )}
                    </div>

                    <datalist id="admin-ward-suggestions">
                      {availableWards.map((w) => (
                        <option key={w.id} value={w.name}>
                          {w.nameBn || ''}
                        </option>
                      ))}
                    </datalist>

                    {/* Custom Dropdown Suggestion List for Wards */}
                    {isWardDropdownOpen && availableWards.length > 0 && (
                      <>
                        <div 
                          className="fixed inset-0 z-20" 
                          onClick={() => setIsWardDropdownOpen(false)} 
                        />
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-30 divide-y divide-slate-100 scrollbar-thin">
                          {availableWards
                            .filter((w) => 
                              !formData.ward ||
                              w.name.toLowerCase().includes(formData.ward.toLowerCase()) ||
                              (w.nameBn && w.nameBn.includes(formData.ward))
                            )
                            .map((w) => {
                              const isSelected = formData.wardId === w.id || formData.ward.toLowerCase() === w.name.toLowerCase();
                              return (
                                <button
                                  key={w.id}
                                  type="button"
                                  onClick={() => handleSelectWard(w)}
                                  className={cn(
                                    "w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer",
                                    isSelected ? "bg-primary/10 font-bold text-primary" : "text-slate-800"
                                  )}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-semibold">{w.name}</span>
                                    {w.nameBn && <span className="text-slate-400 text-[11px]">({w.nameBn})</span>}
                                  </div>
                                  {isSelected && <span className="text-primary font-bold text-xs">✓</span>}
                                </button>
                              );
                            })}
                          {availableWards.filter((w) => 
                            !formData.ward ||
                            w.name.toLowerCase().includes(formData.ward.toLowerCase()) ||
                            (w.nameBn && w.nameBn.includes(formData.ward))
                          ).length === 0 && (
                            <div className="px-3 py-2 text-xs text-slate-500">
                              Custom: <span className="font-bold text-slate-900">{formData.ward}</span>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Detailed Address */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className={labelCls}>Detailed Address <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      type="text" placeholder="e.g. House #12, Road 5, Dhanmondi"
                      value={formData.detailedAddress}
                      onChange={e => setFormData({ ...formData, detailedAddress: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Location Preview */}
                {formData.divisionId && formData.districtId && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-800 font-bold">
                    <MapPin size={16} className="text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {[formData.ward, formData.union, formData.upazila, formData.district, formData.division].filter(Boolean).join(', ')}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ══ STEP 3: Tutor Preference ══════════════════════════════════════ */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4 sm:space-y-5 flex-grow">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Tutor Preference & Requirements</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Specify what kind of tutor you're looking for.</p>
                </div>

                <div className="space-y-4">
                  {/* Preferred Tutor Gender */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Preferred Tutor Gender</label>
                    <div className="flex gap-2">
                      {['Male', 'Female', 'Any'].map(g => (
                        <button key={g} type="button" onClick={() => setFormData({ ...formData, genderPreference: g })}
                          className={cn("flex-1 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95",
                            formData.genderPreference === g ? "bg-violet-600 text-white border-violet-600 shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:border-violet-300")}
                        >{g}</button>
                      ))}
                    </div>
                  </div>

                  {/* Tuition Type */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Tuition Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Home Tuition', 'Online Tuition', 'Coaching Center', 'Group Tuition'].map(t => (
                        <button key={t} type="button" onClick={() => setFormData({ ...formData, tuitionType: t })}
                          className={cn("py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-left flex items-center gap-2 active:scale-98",
                            formData.tuitionType === t ? "bg-violet-600 text-white border-violet-600 shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:border-violet-300")}
                        >
                          {formData.tuitionType === t && <Check size={13} strokeWidth={3} className="shrink-0" />}
                          <span className="truncate">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tutor Qualification */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Preferred Tutor Qualification</label>
                    <select value={formData.tutorQualification} onChange={e => setFormData({ ...formData, tutorQualification: e.target.value })} className={inputCls}>
                      {TUTOR_QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>

                  {/* University Preference */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>University Preference</label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_UNIVERSITIES.map(uni => (
                        <button key={uni} type="button" onClick={() => setFormData({ ...formData, universityPreference: uni })}
                          className={cn("px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer active:scale-95",
                            formData.universityPreference === uni ? "bg-violet-600 text-white border-violet-600 font-bold shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
                        >{uni}</button>
                      ))}
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-1.5">
                    <label className={labelCls}>Special Requirements <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {POPULAR_REQUIREMENTS.map(req => {
                        const isSel = formData.requirements.includes(req);
                        return (
                          <button key={req} type="button" onClick={() => toggleRequirement(req)}
                            className={cn("px-3 py-2 rounded-xl border text-xs font-medium transition cursor-pointer active:scale-95",
                              isSel ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
                          >{isSel && <Check size={12} strokeWidth={3} className="inline mr-1" />}{req}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 4: Schedule, Budget & Contact ══════════════════════════ */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="space-y-4 sm:space-y-5 flex-grow">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Schedule, Budget & Contact</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Set the schedule and contact details for this post.</p>
                </div>

                <div className="space-y-4">
                  {/* Schedule */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className={labelCls}>Days / Week</label>
                      <select value={formData.tutoringDays} onChange={e => setFormData({ ...formData, tutoringDays: e.target.value })} className={inputCls}>
                        {['2 Days/Week', '3 Days/Week', '4 Days/Week', '5 Days/Week', '6 Days/Week', '7 Days/Week'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>Duration</label>
                      <select value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} className={inputCls}>
                        {['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>Preferred Time</label>
                      <select value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className={inputCls}>
                        {['Morning (6:00 AM - 10:00 AM)', 'Afternoon (12:00 PM - 4:00 PM)', 'Evening (4:00 PM - 8:00 PM)', 'Night (8:00 PM - 11:00 PM)', 'Flexible'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="space-y-2">
                    <label className={labelCls}>Monthly Salary (BDT) <span className="text-rose-500">*</span></label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {SALARY_PRESETS.map(p => (
                        <button key={p} type="button" onClick={() => setFormData({ ...formData, salaryOffer: p })}
                          className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer active:scale-95",
                            formData.salaryOffer === p ? "bg-violet-600 text-white border-violet-600 shadow-xs" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50")}
                        >৳{parseInt(p).toLocaleString()}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">৳</span>
                      <input
                        type="number" min="500" placeholder="e.g. 5000"
                        value={formData.salaryOffer}
                        onChange={e => setFormData({ ...formData, salaryOffer: e.target.value })}
                        className={cn(inputCls, "pl-9 font-bold text-base text-emerald-700")}
                      />
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <label className={labelCls}>Contact Details <span className="text-rose-500">*</span></label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Contact Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="text" value={formData.contactName} onChange={e => setFormData({ ...formData, contactName: e.target.value })} placeholder="Guardian / Contact name" className={cn(inputCls, "pl-9")} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600">Phone Number *</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="01XXXXXXXXX" className={cn(inputCls, "pl-9 font-mono font-bold")} />
                        </div>
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-bold text-slate-600">WhatsApp Number</label>
                          <button type="button" onClick={() => setFormData({ ...formData, sameAsPhone: !formData.sameAsPhone })}
                            className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer active:scale-95",
                              formData.sameAsPhone ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}
                          >
                            {formData.sameAsPhone ? '✓ Same as phone' : 'Different number'}
                          </button>
                        </div>
                        {!formData.sameAsPhone && (
                          <div className="relative">
                            <MessageSquare size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="tel" value={formData.whatsappNumber} onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })} placeholder="01XXXXXXXXX" className={cn(inputCls, "pl-9 font-mono font-bold")} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-1">
                    <label className={labelCls}>Additional Notes <span className="text-slate-400 font-normal">(optional)</span></label>
                    <textarea
                      value={formData.additional}
                      onChange={e => setFormData({ ...formData, additional: e.target.value })}
                      placeholder="Any extra details for the tutor..."
                      rows={2}
                      className={cn(inputCls, "resize-none")}
                    />
                  </div>

                  {/* Admin Review Card */}
                  <div className="p-3.5 sm:p-4 bg-violet-50 border border-violet-200 rounded-2xl flex items-start gap-3">
                    <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-black text-violet-900">Admin Post — Auto Approved & Live</p>
                      <p className="text-[11px] text-violet-700 mt-0.5 truncate">{(user as any)?.name} • {(user as any)?.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* 🔘 5. Navigation Buttons (App-style Touch Layout) */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={cn(
              "flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer active:scale-95",
              step === 1 ? "invisible pointer-events-none" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
            )}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-violet-600 text-white shadow-xl shadow-violet-600/25 active:bg-violet-700 hover:bg-violet-700 transition-all cursor-pointer active:scale-95"
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 sm:px-10 py-3.5 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-60 active:scale-95"
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
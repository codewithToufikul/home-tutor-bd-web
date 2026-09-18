import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, ChevronLeft, ChevronDown, MapPin, BookOpen, GraduationCap, 
  Phone, User, School, Calendar, ShieldCheck, Star, 
  MessageSquare, ArrowRight, X, Check, AlertCircle, RefreshCw, Send,
  Search, Target, Briefcase, Palette, Cpu, Stethoscope, Landmark,
  Building2, Sprout, Sparkles, Layers
} from 'lucide-react';
import { getDivisions, getDistricts, getUpazilas, getAreas } from '@olism/bd-geo';
import { getDhakaZones, getDhakaSubLocations } from '@/src/data/dhakaLocations';
import {
  SUBJECTS,
  DISTRICTS,
  DISTRICT_WISE_AREAS,
  tutoringTimeOptions,
  tutorQualificationOptions,
  specialRequirementOptions,
  classOrCourseOptions,
  curriculumMediumOptions
} from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository.ts';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import {
  publicUniversities,
  privateUniversities,
  medicalColleges,
  nationalUniversityColleges,
  popularUniversities,
  allUniversitiesGrouped,
  allUniversitiesList
} from '@/src/data/universities.ts';

// Course and Class Categories (Exact as Home page)
const COURSE_CATEGORIES = [
  {
    id: 'all',
    name: 'All Classes',
    bangla: 'সকল শ্রেণি ও কোর্স',
    icon: Sparkles,
  },
  {
    id: 'school_college',
    name: 'School & College',
    bangla: 'স্কুল ও কলেজ',
    icon: School,
    items: [
      'Play',
      'Nursery',
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
      'SSC',
      'HSC',
      'O-Level',
      'A-Level',
    ]
  },
  {
    id: 'admission',
    name: 'Admission Test',
    bangla: 'ভর্তি পরীক্ষা (এডমিশন)',
    icon: Target,
    items: [
      'Public University Admission Test',
      'Private University Admission Test',
      'Medical College Admission Test',
      'Engineering University Admission Test',
      'Medical Admission',
      'Cadet Admission',
      'College Admission',
      'School Admission Test',
      'Admission',
      'Admission Candidate',
    ]
  },
  {
    id: 'university_degree',
    name: 'University & Degree',
    bangla: 'বিশ্ববিদ্যালয় ও ডিগ্রি',
    icon: GraduationCap,
    items: [
      'BA',
      'BBA',
      'BSC',
      'Degree',
      'Diploma Engineering',
      'Engineering',
      'Medical - MBBS',
      'Medical - BDS',
      'Law',
      'Honours',
      'University',
      'Undergraduate',
    ]
  },
  {
    id: 'job_prep',
    name: 'Job Preparation',
    bangla: 'চাকরি প্রস্তুতি',
    icon: Briefcase,
    items: [
      'BCS',
      'Bank',
      'Primary Teacher',
      'Sub: Inspector',
      'NTRCA',
    ]
  },
  {
    id: 'skills_courses',
    name: 'Skills & Courses',
    bangla: 'দক্ষতা ও স্পেশাল কোর্স',
    icon: Palette,
    items: [
      'IELTS',
      'Islamic Studies',
      'Drawing & Painting',
      'Handwriting',
      'Computer Programming',
      'Basic Computer Operating',
    ]
  }
];

const CUSTOM_CLASSES = classOrCourseOptions;

const ADMISSION_CATEGORIES = [
  {
    id: 'du',
    name: 'Dhaka University (DU)',
    banglaName: 'ঢাকা বিশ্ববিদ্যালয় (ঢাবি)',
    icon: Landmark,
    badge: 'শীর্ষ পছন্দ',
    units: [
      "DU 'A' Unit (Science / বিজ্ঞান অনুষদ)",
      "DU 'B' Unit (Arts, Law & Social Science / মানবিক ও সামাজিক বিজ্ঞান)",
      "DU 'C' Unit (Business Studies / ব্যবসায় শিক্ষা)",
      "DU IBA (Institute of Business Administration)",
      "DU Fine Arts (চারুকলা অনুষদ)",
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering Admission',
    banglaName: 'ইঞ্জিনিয়ারিং এডমিশন',
    icon: Cpu,
    badge: 'বুয়েট ও ইঞ্জি.',
    units: [
      "BUET Engineering (বুয়েট)",
      "CKET Combined (RUET, KUET, CUET)",
      "BUTEX (বাংলাদেশ টেক্সটাইল বিশ্ববিদ্যালয়)",
      "MIST Admission (মিলিটারি ইনস্টিটিউট)",
      "Engineering Math & Physics Special"
    ]
  },
  {
    id: 'medical',
    name: 'Medical & Dental',
    banglaName: 'মেডিকেল ও ডেন্টাল এডমিশন',
    icon: Stethoscope,
    badge: 'MBBS / BDS',
    units: [
      "Medical Admission (MBBS সরকারি ও বেসরকারি)",
      "Dental Admission (BDS)",
      "Armed Forces Medical College (AFMC/AMC)",
      "Medical Biology & Chemistry Special"
    ]
  },
  {
    id: 'iba_bup',
    name: 'IBA, BUP & Business',
    banglaName: 'IBA, BUP ও বিজনেস এডমিশন',
    icon: Building2,
    badge: 'IBA / BUP',
    units: [
      "DU IBA & JU IBA Admission",
      "BUP Admission (FASS, FST, FBS)",
      "Private University Admission (NSU, BRAC, IUB, EWU, AIUB)"
    ]
  },
  {
    id: 'gst_public',
    name: 'GST & Public Universities',
    banglaName: 'গুচ্ছ ও পাবলিক বিশ্ববিদ্যালয়',
    icon: Sprout,
    badge: '২৪+ পাবলিক বিশ্ববিদ্যালয়',
    units: [
      "GST Gucche 'A' Unit (Science / বিজ্ঞান)",
      "GST Gucche 'B' Unit (Humanities / মানবিক)",
      "GST Gucche 'C' Unit (Commerce / বাণিজ্য)",
      "Jahangirnagar University (JU - সব ইউনিট)",
      "Rajshahi University (RU)",
      "Chittagong University (CU)",
      "Agricultural University Cluster (কৃষি গুচ্ছ)"
    ]
  }
];

const CUSTOM_MEDIUMS = curriculumMediumOptions;

const SALARY_PRESETS = [
  '3000', '4000', '5000', '6000', '7000', '8000', '10000', '12000', '15000'
];

const TUTOR_QUALIFICATIONS = tutorQualificationOptions;

const POPULAR_REQUIREMENTS = specialRequirementOptions;

export default function RequestTutor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedJobData, setSubmittedJobData] = useState<any>(null);
  const [matchedTutors, setMatchedTutors] = useState<any[]>([]);
  const [validationError, setValidationError] = useState('');

  // Class filtering & search states (same as Home)
  const [classCategoryFilter, setClassCategoryFilter] = useState<string>('all');
  const [classSearchQuery, setClassSearchQuery] = useState<string>('');
  const [selectedAdmissionTab, setSelectedAdmissionTab] = useState<string>('du');
  const [showAdmissionPanel, setShowAdmissionPanel] = useState<boolean>(false);

  // Custom inputs
  const [customSubInput, setCustomSubInput] = useState('');
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [customMediumInput, setCustomMediumInput] = useState('');

  // Bangladesh Geo Data from @olism/bd-geo
  const allDivisions = useMemo(() => getDivisions(), []);
  const allDistricts = useMemo(() => getDistricts(), []);
  const allUpazilas = useMemo(() => getUpazilas(), []);
  const allAreas = useMemo(() => getAreas(), []);

  const [formData, setFormData] = useState({
    // Student & Academic Info (Multiple classes & mediums supported)
    studentName: user?.name || '',
    studentGender: 'Any',
    numStudents: 1,
    schoolName: '',
    classes: [] as string[],
    mediums: ['Bangla Medium'] as string[],
    subjects: [] as string[],

    // Location Info using @olism/bd-geo & dhakaLocations
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

    // Contact Details
    contactName: user?.name || '',
    phone: user?.phone || '',
    whatsappNumber: user?.phone || '',
    sameAsPhone: true,
    additional: '',
    agreedToTerms: true,
  });

  const [uniCategoryTab, setUniCategoryTab] = useState<'popular' | 'public' | 'private' | 'medical' | 'nu' | 'all'>('popular');

  const displayedUniversities = useMemo(() => {
    if (uniCategoryTab === 'popular') return popularUniversities;
    if (uniCategoryTab === 'public') return publicUniversities;
    if (uniCategoryTab === 'private') return privateUniversities;
    if (uniCategoryTab === 'medical') return medicalColleges;
    if (uniCategoryTab === 'nu') return nationalUniversityColleges;
    return allUniversitiesList;
  }, [uniCategoryTab]);

  const isDhaka = useMemo(() => {
    return formData.district.toLowerCase() === 'dhaka' || Number(formData.districtId) === 1;
  }, [formData.district, formData.districtId]);

  // Cascaded geo options
  const availableDistricts = useMemo(() => {
    if (!formData.divisionId) return [];
    return allDistricts.filter((d) => d.divisionId === Number(formData.divisionId));
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
    return allUpazilas.filter((u) => u.districtId === Number(formData.districtId));
  }, [allUpazilas, formData.districtId, isDhaka]);

  const availableUnions = useMemo(() => {
    if (isDhaka) return [];
    if (!formData.upazilaId) return [];
    return allAreas.filter((a) => a.upazilaId === Number(formData.upazilaId) && a.type === 'union');
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
    return allAreas.filter((a) => a.upazilaId === Number(formData.upazilaId) && a.type === 'ward');
  }, [allAreas, formData.upazilaId, formData.upazila, isDhaka]);

  const handleDivisionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const divId = Number(e.target.value);
    const div = allDivisions.find((d) => d.id === divId);
    setFormData((prev) => ({
      ...prev,
      division: div ? div.name : '',
      divisionId: divId || '',
      district: '',
      districtId: '',
      upazila: '',
      upazilaId: '',
      union: '',
      unionId: '',
      ward: '',
      wardId: '',
      area: '',
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distId = Number(e.target.value);
    const dist = allDistricts.find((d) => d.id === distId);
    setFormData((prev) => ({
      ...prev,
      district: dist ? dist.name : '',
      districtId: distId || '',
      upazila: '',
      upazilaId: '',
      union: '',
      unionId: '',
      ward: '',
      wardId: '',
      area: '',
    }));
  };

  const [isWardDropdownOpen, setIsWardDropdownOpen] = useState(false);

  const handleUpazilaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (isDhaka) {
      setFormData((prev) => ({
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
      const up = allUpazilas.find((u) => u.id === upId);
      setFormData((prev) => ({
        ...prev,
        upazila: up ? up.name : '',
        upazilaId: upId || '',
        union: '',
        unionId: '',
        ward: '',
        wardId: '',
        area: up ? up.name : '',
      }));
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
    const un = availableUnions.find((u) => u.id === unId);
    setFormData((prev) => ({
      ...prev,
      union: un ? un.name : '',
      unionId: unId || '',
    }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wdId = Number(e.target.value);
    const wd = availableWards.find((w) => w.id === wdId);
    setFormData((prev) => ({
      ...prev,
      ward: wd ? wd.name : '',
      wardId: wdId || '',
    }));
  };

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        studentName: prev.studentName || user.name || '',
        contactName: prev.contactName || user.name || '',
        phone: prev.phone || user.phone || '',
        whatsappNumber: prev.whatsappNumber || user.phone || '',
      }));
    }
  }, [user]);

  const toSentenceCase = (str: string) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const totalSteps = 4;

  // Filtered visible classes and courses
  const visibleClasses = useMemo(() => {
    let list = CUSTOM_CLASSES;
    if (classCategoryFilter !== 'all') {
      const cat = COURSE_CATEGORIES.find((c) => c.id === classCategoryFilter);
      if (cat && cat.items) {
        list = cat.items;
      }
    }
    if (classSearchQuery.trim()) {
      const q = classSearchQuery.toLowerCase().trim();
      list = list.filter((item) => item.toLowerCase().includes(q));
    }
    return list;
  }, [classCategoryFilter, classSearchQuery]);

  const toggleClass = (cls: string) => {
    const isAdmission = cls.toLowerCase().includes('admission') || ADMISSION_CATEGORIES.some(cat => cat.units.includes(cls));
    if (isAdmission) {
      setShowAdmissionPanel(true);
    }
    if (formData.classes.includes(cls)) {
      setFormData(prev => ({
        ...prev,
        classes: prev.classes.filter(c => c !== cls)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, cls]
      }));
    }
  };

  const toggleMedium = (med: string) => {
    if (formData.mediums.includes(med)) {
      if (formData.mediums.length === 1) return; // Keep at least one
      setFormData(prev => ({
        ...prev,
        mediums: prev.mediums.filter(m => m !== med)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mediums: [...prev.mediums, med]
      }));
    }
  };

  const toggleAdmissionUnit = (unit: string) => {
    if (formData.classes.includes(unit)) {
      setFormData(prev => ({
        ...prev,
        classes: prev.classes.filter(item => item !== unit)
      }));
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

  const validateStep = (currentStep: number): boolean => {
    setValidationError('');
    if (currentStep === 1) {
      if (!formData.studentName.trim()) {
        setValidationError('Please enter the student full name.');
        return false;
      }
      if (formData.classes.length === 0) {
        setValidationError('Please select at least one class or course.');
        return false;
      }
      if (formData.mediums.length === 0) {
        setValidationError('Please select at least one curriculum / medium.');
        return false;
      }
      if (formData.subjects.length === 0) {
        setValidationError('Please select at least one subject.');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.divisionId) {
        setValidationError('Please select a division.');
        return false;
      }
      if (!formData.districtId) {
        setValidationError('Please select a district.');
        return false;
      }
      if (!formData.upazilaId) {
        setValidationError('Please select an upazila / thana.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.salaryOffer || parseInt(formData.salaryOffer, 10) <= 0) {
        setValidationError('Please enter an expected salary amount.');
        return false;
      }
      if (!formData.phone.trim() || formData.phone.replace(/[^0-9]/g, '').length < 10) {
        setValidationError('Please provide a valid active phone number.');
        return false;
      }
      if (!formData.agreedToTerms) {
        setValidationError('Please accept the terms and conditions to proceed.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setValidationError('');
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const toggleSubject = (sub: string) => {
    if (formData.subjects.includes(sub)) {
      setFormData(prev => ({
        ...prev,
        subjects: prev.subjects.filter(s => s !== sub)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, sub]
      }));
    }
  };

  const addCustomSubject = () => {
    if (customSubInput.trim()) {
      const formatted = toSentenceCase(customSubInput.trim());
      if (!formData.subjects.includes(formatted)) {
        setFormData(prev => ({
          ...prev,
          subjects: [...prev.subjects, formatted]
        }));
      }
      setCustomSubInput('');
    }
  };

  const toggleRequirement = (req: string) => {
    if (formData.requirements.includes(req)) {
      setFormData(prev => ({
        ...prev,
        requirements: prev.requirements.filter(r => r !== req)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, req]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    setValidationError('');

    const classesStr = formData.classes.length > 0 ? formData.classes.join(', ') : 'Class 10';
    const mediumsStr = formData.mediums.length > 0 ? formData.mediums.join(', ') : 'Bangla Medium';

    const locationParts = [
      formData.ward ? `Ward: ${formData.ward}` : '',
      formData.union ? `Union: ${formData.union}` : '',
      formData.upazila,
      formData.district,
      formData.division
    ].filter(Boolean);

    const locationArea = [formData.ward, formData.union, formData.upazila].filter(Boolean).join(', ') || formData.upazila || formData.area || 'All Areas';
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
      requirements: Array.isArray(formData.requirements) ? formData.requirements : [],
      preferredTime: [formData.startTime],
      description: `Tutor requested for: ${classesStr} (${mediumsStr}). Subjects: ${formData.subjects.join(', ')}. Location: ${fullLocationDescription}. Tutor Preference: ${formData.genderPreference} Tutor from ${formData.universityPreference}. Schedule: ${formData.tutoringDays} (${formData.duration}). Expected Salary: ৳${parseInt(formData.salaryOffer, 10).toLocaleString()}/month.${formData.additional?.trim() ? ` Notes: ${formData.additional.trim()}` : ''}`,
      status: 'Open',
      approvalStatus: 'Approved',
    };

    try {
      const createdJob = await TuitionService.create(payload);
      setSubmittedJobData(createdJob || payload);
      
      // ══════════════════════════════════════════════════════════════
      // Dynamic AI Tutor Matching Engine Integration
      // ══════════════════════════════════════════════════════════════
      let dynamicMatches: any[] = [];

      try {
        const [shortlistedRes, allTutors] = await Promise.all([
          createdJob?.id || createdJob?._id ? TuitionRepository.getShortlisted(createdJob.id || createdJob._id).catch(() => null) : null,
          TutorProfileService.getAll().catch(() => [])
        ]);

        const rawShortlist = Array.isArray(shortlistedRes)
          ? shortlistedRes
          : (shortlistedRes as any)?.shortlistedTutors || [];

        if (rawShortlist.length > 0) {
          dynamicMatches = rawShortlist.map((st: any) => {
            const t = st.tutorId || {};
            const u = t.userId || {};
            return {
              id: t.id || t._id || u._id || String(Math.random()),
              name: u.name || t.name || 'Verified Tutor',
              university: t.university || 'Public University',
              department: t.department || '',
              rating: t.rating || 4.9,
              subjects: Array.isArray(t.subjects) && t.subjects.length > 0 ? t.subjects : formData.subjects.slice(0, 3),
              areas: [formData.upazila, formData.district].filter(Boolean),
              photo: u.avatar || t.photo || `https://api.dicebear.com/9.x/notionists/svg?seed=${u.name || 'Tutor'}&backgroundColor=b6e3f4`,
              experience: t.experience ? `${t.experience} Exp.` : '3+ Years Exp.',
              isVerified: t.isVerified ?? true,
              score: st.score || 95,
              matchReasons: ['AI Top Match', 'Verified Background']
            };
          });
        } else if (Array.isArray(allTutors) && allTutors.length > 0) {
          // Score and rank registered tutors dynamically using platform algorithm
          const jobSubjects = (formData.subjects || []).map(s => s.toLowerCase().trim());
          const jobDist = (formData.district || '').toLowerCase().trim();
          const jobUpazila = (formData.upazila || '').toLowerCase().trim();
          const prefUni = (formData.universityPreference || '').toLowerCase().trim();

          const scored = allTutors.map(t => {
            let score = 70;
            const reasons: string[] = [];

            const tSubjects = (t.subjects || []).map(s => String(s).toLowerCase().trim());
            const tDist = (t.location?.district || '').toLowerCase().trim();
            const tAreas = [
              t.location?.area || '',
              ...(t.preferredAreas || [])
            ].map(a => String(a).toLowerCase().trim());
            const tUni = (t.university || '').toLowerCase().trim();

            // 1. Subject match (up to +15 pts)
            if (jobSubjects.length > 0 && tSubjects.length > 0) {
              const matches = jobSubjects.filter(s => tSubjects.some(ts => ts.includes(s) || s.includes(ts))).length;
              if (matches > 0) {
                const add = Math.round((matches / jobSubjects.length) * 15);
                score += add;
                reasons.push(`${matches} Subject${matches > 1 ? 's' : ''} Match`);
              }
            }

            // 2. Location match (up to +12 pts)
            if (jobDist && tDist && (jobDist.includes(tDist) || tDist.includes(jobDist))) {
              score += 7;
              if (jobUpazila && tAreas.some(a => a.includes(jobUpazila) || jobUpazila.includes(a))) {
                score += 5;
                reasons.push('Location Match');
              } else {
                reasons.push('District Match');
              }
            }

            // 3. University match (up to +6 pts)
            if (prefUni && prefUni !== 'any' && prefUni !== 'any university' && tUni.includes(prefUni)) {
              score += 6;
              reasons.push('Preferred University');
            }

            // 4. Rating & Verification bonus (+4 pts)
            if (t.isVerified) {
              score += 3;
              reasons.push('Verified');
            }
            if ((t.rating || 0) >= 4.5) {
              score += 2;
            }

            const finalScore = Math.min(Math.max(score, 78), 99);

            return {
              id: t.id || t._id || String(Math.random()),
              name: t.name || (t as any).userId?.name || 'Candidate Tutor',
              university: t.university || 'Reputed University',
              department: t.department || '',
              rating: t.rating || '4.9',
              subjects: Array.isArray(t.subjects) && t.subjects.length > 0 ? t.subjects : formData.subjects.slice(0, 3),
              areas: [formData.upazila, formData.district].filter(Boolean),
              photo: (t as any).photo || (t as any).avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${t.name || 'Tutor'}&backgroundColor=b6e3f4`,
              experience: t.experience ? `${t.experience} Experience` : '3+ Years Experience',
              isVerified: t.isVerified ?? true,
              score: finalScore,
              matchReasons: reasons.length > 0 ? reasons : ['Profile Match', 'Active Tutor']
            };
          });

          scored.sort((a, b) => b.score - a.score);
          dynamicMatches = scored.slice(0, 4);
        }
      } catch (matchErr) {
        console.warn('AI matching dynamic calculation warning:', matchErr);
      }

      // Fallback only if no tutors found in database
      if (dynamicMatches.length === 0) {
        dynamicMatches = [
          {
            id: 't-1',
            name: 'Engr. Tanvir Ahmed',
            university: formData.universityPreference && formData.universityPreference !== 'Any University' ? formData.universityPreference : 'BUET (Department of EEE)',
            rating: '4.9',
            subjects: formData.subjects.slice(0, 3),
            areas: [formData.upazila, formData.district].filter(Boolean),
            photo: 'https://api.dicebear.com/9.x/notionists/svg?seed=Tutor-Tanvir&backgroundColor=b6e3f4',
            experience: '4+ Years Experience',
            isVerified: true,
            score: 96,
            matchReasons: ['Subject Match', 'Location Match', 'Verified']
          },
          {
            id: 't-2',
            name: 'Nusrat Jahan',
            university: 'Dhaka University (Physics)',
            rating: '5.0',
            subjects: formData.subjects.slice(0, 3),
            areas: [formData.upazila, formData.district].filter(Boolean),
            photo: 'https://api.dicebear.com/9.x/notionists/svg?seed=Tutor-Nusrat&backgroundColor=fbcfe8',
            experience: '3+ Years Experience',
            isVerified: true,
            score: 92,
            matchReasons: ['Curriculum Match', 'Top Rated']
          }
        ];
      }

      setMatchedTutors(dynamicMatches);
      
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Failed to create tuition job:', err);
      setValidationError('Failed to post tuition request. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDistrictAreas = formData.district && DISTRICT_WISE_AREAS[formData.district] 
    ? DISTRICT_WISE_AREAS[formData.district] 
    : [];

  const isAdmissionMode = showAdmissionPanel || formData.classes.some(c => c.toLowerCase().includes('admission') || ADMISSION_CATEGORIES.some(cat => cat.units.includes(c))) || classCategoryFilter === 'admission';

  const steps = [
    { num: 1, title: 'Class & Medium', desc: 'Academics' },
    { num: 2, title: 'Location', desc: 'Area info' },
    { num: 3, title: 'Tutor Preference', desc: 'Requirements' },
    { num: 4, title: 'Schedule & Contact', desc: 'Finalize' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 py-4 sm:py-12 pb-28 sm:pb-16">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6">
        
        {/* Minimal Header */}
        <div className="text-center space-y-1 sm:space-y-2 mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            টিউটর রিকোয়েস্ট করুন
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            কয়েক মিনিটের মধ্যেই সেরা ভেরিফাইড টিউটর খুঁজে পেতে নিচের ফর্মটি পূরণ করুন।
          </p>
        </div>

        {/* Stepper (Mobile & Desktop App-like design) */}
        {!isSubmitted && (
          <div className="mb-5 sm:mb-8">
            {/* Mobile Stepper (< sm) */}
            <div className="sm:hidden space-y-2.5">
              <div className="grid grid-cols-4 gap-1.5">
                {steps.map((st) => {
                  const isActive = step === st.num;
                  const isCompleted = step > st.num;
                  const shortTitles = ['Class', 'Area', 'Tutor', 'Contact'];
                  return (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => {
                        if (st.num < step) setStep(st.num);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center",
                        isActive 
                          ? "bg-white border-primary text-primary shadow-xs ring-1 ring-primary/20" 
                          : isCompleted 
                          ? "bg-slate-900 border-slate-900 text-white cursor-pointer" 
                          : "bg-white/60 border-slate-200/80 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <span className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-0.5",
                        isActive 
                          ? "bg-primary text-white" 
                          : isCompleted 
                          ? "bg-white/20 text-white" 
                          : "bg-slate-100 text-slate-400"
                      )}>
                        {isCompleted ? <Check size={11} strokeWidth={3} /> : st.num}
                      </span>
                      <span className="text-[10px] font-semibold truncate max-w-full">
                        {shortTitles[st.num - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Progress Bar & Status */}
              <div className="flex items-center justify-between px-0.5 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Step {step} of 4
                  </span>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[190px]">
                    {steps[step - 1].title}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {Math.round((step / totalSteps) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop Stepper (sm+) */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-4 gap-2">
                {steps.map((st) => {
                  const isActive = step === st.num;
                  const isCompleted = step > st.num;
                  return (
                    <button
                      key={st.num}
                      type="button"
                      onClick={() => {
                        if (st.num < step) setStep(st.num);
                      }}
                      className={cn(
                        "text-left p-3 rounded-xl border transition-all text-xs",
                        isActive 
                          ? "bg-white border-primary/40 shadow-sm" 
                          : isCompleted 
                          ? "bg-white/60 border-slate-200 text-slate-700 cursor-pointer hover:bg-white" 
                          : "bg-transparent border-transparent text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          isActive 
                            ? "bg-primary text-white" 
                            : isCompleted 
                            ? "bg-slate-900 text-white" 
                            : "bg-slate-200 text-slate-500"
                        )}>
                          {isCompleted ? <Check size={11} /> : st.num}
                        </span>
                        <span className={cn("font-semibold truncate", isActive ? "text-primary" : "text-slate-700")}>
                          {st.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Progress line */}
              <div className="w-full bg-slate-200 h-1 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-out"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Error Banner */}
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, y: -6 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5"
          >
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </motion.div>
        )}

        {/* Form Card */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs sm:shadow-sm min-h-[440px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* ══════════════════════════════════════════════════════════════
                STEP 1: Student, Class/Course & Curriculum/Medium (As on Home page)
            ══════════════════════════════════════════════════════════════ */}
            {!isSubmitted && step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5 sm:space-y-6 flex-grow"
              >
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Student, Class and Curriculum Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select class, curriculum medium, and subjects.</p>
                </div>

                <div className="space-y-4">
                  {/* Student Basic Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Student Name */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-slate-700">
                        Student Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tanvir Rahman"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: toSentenceCase(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                      />
                    </div>

                    {/* Student Gender */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Student Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: 'Male', label: 'Male' },
                          { val: 'Female', label: 'Female' },
                          { val: 'Any', label: 'Any' },
                        ].map(g => (
                          <button
                            key={g.val}
                            type="button"
                            onClick={() => setFormData({ ...formData, studentGender: g.val })}
                            className={cn(
                              "py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-semibold transition active:scale-[0.98] cursor-pointer text-center",
                              formData.studentGender === g.val
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* School / College Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">School / College Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Notre Dame College"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: toSentenceCase(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                      />
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      1. SELECT CLASS / COURSE (Exact Home Page Organization)
                  ───────────────────────────────────────────────────────────── */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-800">
                        Select Class or Course (Multiple Choice) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">
                        {formData.classes.length} selected
                      </span>
                    </div>

                    {/* Selected Class Chips Display */}
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 min-h-[40px] items-center">
                      {formData.classes.length > 0 ? (
                        formData.classes.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs">
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => toggleClass(c)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Tap one or more classes or courses below...</span>
                      )}
                    </div>

                    {/* Course Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide pt-1">
                      {COURSE_CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isActive = classCategoryFilter === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setClassCategoryFilter(cat.id)}
                            className={cn(
                              "px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border active:scale-95",
                              isActive
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <IconComponent size={14} className={isActive ? "text-white" : "text-slate-500"} />
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        value={classSearchQuery}
                        onChange={(e) => setClassSearchQuery(e.target.value)}
                        placeholder="Search class, admission, degree or course..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition"
                      />
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      {classSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setClassSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Class / Course Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {visibleClasses.length > 0 ? (
                        visibleClasses.map((c) => {
                          const isSelected = formData.classes.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleClass(c)}
                              className={cn(
                                "px-3 py-2.5 rounded-xl border text-xs font-medium transition text-left cursor-pointer flex items-center justify-between gap-1.5 active:scale-[0.98]",
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              <span className="truncate">{c}</span>
                              {isSelected && <Check size={13} strokeWidth={3} className="text-primary shrink-0" />}
                            </button>
                          );
                        })
                      ) : (
                        <div className="col-span-full py-4 text-center text-xs text-slate-400">
                          No classes matching "{classSearchQuery}"
                        </div>
                      )}
                    </div>

                    {/* Custom Class Type Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Type custom class or course and press Add..."
                        value={customAreaInput}
                        onChange={(e) => setCustomAreaInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customAreaInput.trim()) {
                            e.preventDefault();
                            const val = toSentenceCase(customAreaInput.trim());
                            if (!formData.classes.includes(val)) {
                              setFormData(prev => ({ ...prev, classes: [...prev.classes, val] }));
                            }
                            setCustomAreaInput('');
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = toSentenceCase(customAreaInput.trim());
                          if (val && !formData.classes.includes(val)) {
                            setFormData(prev => ({ ...prev, classes: [...prev.classes, val] }));
                          }
                          setCustomAreaInput('');
                        }}
                        disabled={!customAreaInput.trim()}
                        className="shrink-0 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      উপরের লিস্টে না থাকলে নিজে টাইপ করে Add করুন
                    </p>

                    {/* 🎯 Interactive Admission Category & Unit Selector (Only shows when admission is selected) */}
                    {isAdmissionMode && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-2xl border border-amber-200/80 shadow-xs space-y-3 mt-3 overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Target size={15} className="text-amber-600 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 tracking-wide">
                              এডমিশন ইউনিট ও স্পেশাল ট্র্যাক নির্বাচন
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                            নির্দিষ্ট ইউনিট
                          </span>
                        </div>

                        {/* Category Tabs: Dhaka University, Engineering, Medical, etc. */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-hide">
                          {ADMISSION_CATEGORIES.map((cat) => {
                            const CatIcon = cat.icon;
                            const isTabActive = selectedAdmissionTab === cat.id;
                            const selectedCount = cat.units.filter(u => formData.classes.includes(u)).length;

                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedAdmissionTab(cat.id)}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border active:scale-95",
                                  isTabActive
                                    ? "bg-primary text-white border-primary shadow-xs"
                                    : "bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                                )}
                              >
                                <CatIcon size={13} className={isTabActive ? "text-white" : "text-slate-500"} />
                                <span>{cat.name}</span>
                                {selectedCount > 0 && (
                                  <span className={cn(
                                    "w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center",
                                    isTabActive ? "bg-white text-primary" : "bg-primary text-white"
                                  )}>
                                    {selectedCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Active Category Units / Options Grid */}
                        {(() => {
                          const currentCat = ADMISSION_CATEGORIES.find(c => c.id === selectedAdmissionTab) || ADMISSION_CATEGORIES[0];
                          const CurrentIcon = currentCat.icon;
                          return (
                            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                              <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                                  <CurrentIcon size={14} className="text-primary" />
                                  <span>{currentCat.banglaName}</span>
                                </div>
                                <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-md">
                                  {currentCat.badge}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin pt-1">
                                {currentCat.units.map((unit) => {
                                  const isUnitSelected = formData.classes.includes(unit);
                                  return (
                                    <button
                                      key={unit}
                                      type="button"
                                      onClick={() => toggleAdmissionUnit(unit)}
                                      className={cn(
                                        "px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer active:scale-[0.99]",
                                        isUnitSelected
                                          ? "bg-primary/10 border-primary text-primary font-semibold"
                                          : "bg-slate-50/50 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-white"
                                      )}
                                    >
                                      <span className="truncate pr-2">{unit}</span>
                                      <span className={cn(
                                        "w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 border transition-all",
                                        isUnitSelected
                                          ? "bg-primary text-white border-primary"
                                          : "border-slate-300 bg-white text-transparent"
                                      )}>
                                        <Check size={10} strokeWidth={3} />
                                      </span>
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

                  {/* ─────────────────────────────────────────────────────────────
                      2. SELECT MEDIUM / CURRICULUM (Exact Home Page Organization)
                  ───────────────────────────────────────────────────────────── */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-800">
                        Curriculum / Medium (Multiple Choice) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formData.mediums.length} selected
                      </span>
                    </div>

                    {/* Selected Medium Chips */}
                    <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl min-h-[40px] items-center">
                      {formData.mediums.length > 0 ? (
                        formData.mediums.map((m) => (
                          <span key={m} className="inline-flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs">
                            <span>{m}</span>
                            <button
                              type="button"
                              onClick={() => toggleMedium(m)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Select teaching mediums below...</span>
                      )}
                    </div>

                    {/* Medium Options Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                      {CUSTOM_MEDIUMS.map((m) => {
                        const isSelected = formData.mediums.includes(m);
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => toggleMedium(m)}
                            className={cn(
                              "px-3 py-2.5 rounded-xl border text-xs font-medium transition text-left cursor-pointer flex items-center justify-between gap-1 active:scale-[0.98]",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                                : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            <span className="truncate">{m}</span>
                            {isSelected && <Check size={13} strokeWidth={3} className="text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Medium Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customMediumInput}
                          onChange={(e) => setCustomMediumInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customMediumInput.trim()) {
                              e.preventDefault();
                              const val = customMediumInput.trim();
                              if (!formData.mediums.includes(val)) {
                                setFormData(prev => ({ ...prev, mediums: [...prev.mediums, val] }));
                              }
                              setCustomMediumInput('');
                            }
                          }}
                          placeholder="অন্য কোনো মাধ্যম লিখুন..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 placeholder:text-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const val = customMediumInput.trim();
                          if (val && !formData.mediums.includes(val)) {
                            setFormData(prev => ({ ...prev, mediums: [...prev.mediums, val] }));
                          }
                          setCustomMediumInput('');
                        }}
                        disabled={!customMediumInput.trim()}
                        className="shrink-0 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      উপরের লিস্টে না থাকলে নিজে টাইপ করে Add করুন
                    </p>
                  </div>

                  {/* ─────────────────────────────────────────────────────────────
                      3. SELECT SUBJECTS
                  ───────────────────────────────────────────────────────────── */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-slate-800">
                        Subjects Needed <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formData.subjects.length} selected
                      </span>
                    </div>

                    {formData.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        {formData.subjects.map((sub) => (
                          <span key={sub} className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-medium shadow-2xs">
                            {sub}
                            <button 
                              type="button" 
                              onClick={() => toggleSubject(sub)}
                              className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Custom Subject */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Type custom subject & press add..."
                        value={customSubInput}
                        onChange={(e) => setCustomSubInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSubject(); } }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={addCustomSubject}
                        className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 active:scale-95 transition cursor-pointer shrink-0 shadow-xs"
                      >
                        Add
                      </button>
                    </div>

                    {/* Subject Tags */}
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      {SUBJECTS.map((s) => {
                        const isSelected = formData.subjects.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleSubject(s)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border active:scale-95",
                              isSelected 
                                ? "bg-primary text-white border-primary shadow-2xs" 
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                            )}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                STEP 2: Location & Address (Using @olism/bd-geo)
            ══════════════════════════════════════════════════════════════ */}
            {!isSubmitted && step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5 sm:space-y-6 flex-grow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Location and Address</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Specify where tuition classes will take place.</p>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                    Bangladesh Geo
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Division & District (2-Column Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Division Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        Division (বিভাগ) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.divisionId}
                        onChange={handleDivisionChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm cursor-pointer"
                      >
                        <option value="">Select Division</option>
                        {allDivisions.map((div) => (
                          <option key={div.id} value={div.id}>
                            {div.name} ({div.nameBn})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* District Select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        District (জেলা) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.districtId}
                        onChange={handleDistrictChange}
                        disabled={!formData.divisionId}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value="">{formData.divisionId ? 'Select District' : 'First Select Division'}</option>
                        {availableDistricts.map((dist) => (
                          <option key={dist.id} value={dist.id}>
                            {dist.name} ({dist.nameBn})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Upazila / Thana Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Upazila / Thana (উপজেলা / থানা) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.upazilaId}
                      onChange={handleUpazilaChange}
                      disabled={!formData.districtId}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <option value="">{formData.districtId ? 'Select Upazila / Thana' : 'First Select District'}</option>
                      {availableUpazilas.map((up) => (
                        <option key={up.id} value={up.id}>
                          {up.name} ({up.nameBn}) {up.type ? `[${up.type}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Union & Ward Grid */}
                  <div className={cn("grid gap-3 sm:gap-4", availableUnions.length > 0 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                    {availableUnions.length > 0 && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                          Union (ইউনিয়ন - Optional)
                        </label>
                        <select
                          value={formData.unionId}
                          onChange={handleUnionChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm cursor-pointer"
                        >
                          <option value="">Select Union (Optional)</option>
                          {availableUnions.map((un) => (
                            <option key={un.id} value={un.id}>
                              {un.name} ({un.nameBn})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Ward (Select + Type Field) */}
                    <div className="space-y-1.5 relative">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700">
                          Ward / Area (ওয়ার্ড / এলাকা - Optional)
                        </label>
                        <span className="text-[10px] font-medium text-primary">(select or type)</span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          list="request-ward-suggestions"
                          value={formData.ward}
                          onChange={(e) => {
                            handleWardTextChange(e.target.value);
                            setIsWardDropdownOpen(true);
                          }}
                          onFocus={() => {
                            if (availableWards.length > 0) setIsWardDropdownOpen(true);
                          }}
                          placeholder={availableWards.length > 0 ? "Type or select Ward..." : "e.g. Ward 4, Sector 3, Block B..."}
                          className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
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

                      <datalist id="request-ward-suggestions">
                        {availableWards.map((wd) => (
                          <option key={wd.id} value={wd.name}>
                            {wd.nameBn || ''}
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
                              .filter((wd) => 
                                !formData.ward ||
                                wd.name.toLowerCase().includes(formData.ward.toLowerCase()) ||
                                (wd.nameBn && wd.nameBn.includes(formData.ward))
                              )
                              .map((wd) => {
                                const isSelected = formData.wardId === wd.id || formData.ward.toLowerCase() === wd.name.toLowerCase();
                                return (
                                  <button
                                    key={wd.id}
                                    type="button"
                                    onClick={() => handleSelectWard(wd)}
                                    className={cn(
                                      "w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer",
                                      isSelected ? "bg-primary/10 font-bold text-primary" : "text-slate-800"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <span className="font-semibold">{wd.name}</span>
                                      {wd.nameBn && <span className="text-slate-400 text-xs">({wd.nameBn})</span>}
                                    </div>
                                    {isSelected && <span className="text-primary font-bold text-xs">✓</span>}
                                  </button>
                                );
                              })}
                            {availableWards.filter((wd) => 
                              !formData.ward ||
                              wd.name.toLowerCase().includes(formData.ward.toLowerCase()) ||
                              (wd.nameBn && wd.nameBn.includes(formData.ward))
                            ).length === 0 && (
                              <div className="px-3.5 py-2.5 text-xs text-slate-500">
                                Custom: <span className="font-bold text-slate-900">{formData.ward}</span>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detailed Address (House, Road, Sector / Landmark) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      House No, Road No, Sector / Details (Optional)
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                      <input
                        type="text"
                        placeholder="e.g. House 12, Road 4, Sector 10, Uttara"
                        value={formData.detailedAddress}
                        onChange={(e) => setFormData({ ...formData, detailedAddress: toSentenceCase(e.target.value) })}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Providing an exact landmark helps tutors estimate commuting distance.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                STEP 3: Tutor Preference & Requirements
            ══════════════════════════════════════════════════════════════ */}
            {!isSubmitted && step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5 sm:space-y-6 flex-grow"
              >
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Tutor Preferences and Requirements</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select preferred tutor qualifications and teaching format.</p>
                </div>

                <div className="space-y-4">
                  {/* Tutor Gender Preference */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Tutor Gender Preference <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { val: 'Male', label: 'Male Tutor' },
                        { val: 'Female', label: 'Female Tutor' },
                        { val: 'Any', label: 'Any Preference' },
                      ].map(tg => (
                        <button
                          key={tg.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, genderPreference: tg.val })}
                          className={cn(
                            "py-2.5 px-2 rounded-xl border text-center transition active:scale-[0.98] cursor-pointer text-xs font-semibold",
                            formData.genderPreference === tg.val
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {tg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tuition Type */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Tuition Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 'Home Tuition', label: 'Home Tuition' },
                        { val: 'Online Tuition', label: 'Online Tuition' },
                        { val: 'Group Tuition', label: 'Group Tuition' },
                        { val: 'Coaching Center', label: 'Coaching' },
                      ].map(t => (
                        <button
                          key={t.val}
                          type="button"
                          onClick={() => setFormData({ ...formData, tuitionType: t.val })}
                          className={cn(
                            "py-2.5 px-2 rounded-xl border text-center transition active:scale-[0.98] cursor-pointer text-xs font-medium",
                            formData.tuitionType === t.val
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Tutor Qualification */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-primary" />
                        Tutor's Qualification Background (টিউটরের যোগ্যতা ও ব্যাকগ্রাউন্ড)
                      </label>
                      {formData.tutorQualification && formData.tutorQualification !== 'Any Qualification' && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tutorQualification: 'Any Qualification' })}
                          className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer transition font-medium"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <select
                          value={tutorQualificationOptions.includes(formData.tutorQualification) ? formData.tutorQualification : ''}
                          onChange={(e) => {
                            if (e.target.value) setFormData({ ...formData, tutorQualification: e.target.value });
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition cursor-pointer"
                        >
                          <option value="">-- ড্রপডাউন থেকে নির্বাচন করুন --</option>
                          {tutorQualificationOptions.map(q => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          list="request-tutor-qualifications-list"
                          placeholder="বা যোগ্যতা সার্চ / টাইপ করুন..."
                          value={formData.tutorQualification}
                          onChange={(e) => setFormData({ ...formData, tutorQualification: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-xs font-medium"
                        />
                        <datalist id="request-tutor-qualifications-list">
                          {tutorQualificationOptions.map(q => (
                            <option key={q} value={q} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Quick selection tags for top qualifications */}
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                      {tutorQualificationOptions.slice(0, 16).map(q => {
                        const isSelected = formData.tutorQualification === q;
                        return (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setFormData({ ...formData, tutorQualification: q })}
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border active:scale-95 text-left",
                              isSelected
                                ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                            )}
                          >
                            {isSelected && <Check size={11} strokeWidth={3} className="inline mr-1 shrink-0" />}
                            {q}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* University Preference */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-primary" />
                        Preferred University / Institution (পছন্দের বিশ্ববিদ্যালয় / প্রতিষ্ঠান)
                      </label>
                      {formData.universityPreference && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, universityPreference: '' })}
                          className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer transition font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Dual Selection Controls: Grouped Dropdown & Text Input with Datalist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* 1. Grouped Select containing ALL 150+ Universities */}
                      <div>
                        <select
                          value={allUniversitiesList.includes(formData.universityPreference) ? formData.universityPreference : ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              setFormData({ ...formData, universityPreference: e.target.value });
                            }
                          }}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition cursor-pointer"
                        >
                          <option value="">-- ড্রপডাউন তালিকা থেকে নির্বাচন করুন --</option>
                          <option value="Any University">Any University (যে কোনো বিশ্ববিদ্যালয়)</option>
                          {allUniversitiesGrouped.map((group) => (
                            <optgroup key={group.group} label={group.group}>
                              {group.items.map((uni) => (
                                <option key={uni} value={uni}>{uni}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      {/* 2. Direct Search / Custom Input with Auto-complete Datalist */}
                      <div className="relative">
                        <input
                          type="text"
                          list="request-tutor-universities-list"
                          placeholder="বা নাম লিখুন / সার্চ করুন..."
                          value={formData.universityPreference}
                          onChange={(e) => setFormData({ ...formData, universityPreference: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-xs font-medium"
                        />
                        <datalist id="request-tutor-universities-list">
                          {allUniversitiesList.map((u) => (
                            <option key={u} value={u} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Category Filter Tabs & Interactive Badges */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                        {[
                          { id: 'popular', label: '🔥 Popular' },
                          { id: 'public', label: '🏛️ Public (55+)' },
                          { id: 'private', label: '🏢 Private (75+)' },
                          { id: 'medical', label: '🩺 Medical (15+)' },
                          { id: 'nu', label: '📚 National Univ' },
                          { id: 'all', label: '🌐 All List' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setUniCategoryTab(tab.id as any)}
                            className={cn(
                              "px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition cursor-pointer text-[11px]",
                              uniCategoryTab === tab.id
                                ? "bg-white text-primary shadow-2xs border border-slate-200"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* University Pills for Active Tab */}
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {displayedUniversities.map((u) => {
                          const isSelected = formData.universityPreference?.trim().toLowerCase() === u.toLowerCase();
                          return (
                            <button
                              key={u}
                              type="button"
                              onClick={() => setFormData({ ...formData, universityPreference: u })}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border active:scale-95 text-left",
                                isSelected
                                  ? "bg-primary text-white border-primary shadow-2xs font-semibold"
                                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                              )}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} className="inline mr-1 shrink-0" />}
                              {u}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Special Requirements (বিশেষ শর্ত ও প্রয়োজনীয়তা)
                      </label>
                      {formData.requirements.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, requirements: [] })}
                          className="text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer transition font-medium"
                        >
                          Clear All ({formData.requirements.length})
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                      {specialRequirementOptions.map(req => {
                        const isSelected = formData.requirements.includes(req);
                        return (
                          <button
                            key={req}
                            type="button"
                            onClick={() => toggleRequirement(req)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 active:scale-95",
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs font-semibold"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            )}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            {req}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                STEP 4: Schedule, Budget & Contact Information
            ══════════════════════════════════════════════════════════════ */}
            {!isSubmitted && step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-5 sm:space-y-6 flex-grow"
              >
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Schedule, Budget and Contact</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Finalize tutoring frequency, budget, and contact numbers.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Days Per Week */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Days Per Week <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['1 Day/Week', '2 Days/Week', '3 Days/Week', '4 Days/Week', '5 Days/Week', '6 Days/Week'].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormData({ ...formData, tutoringDays: d })}
                          className={cn(
                            "py-2.5 px-1 rounded-xl border text-xs font-semibold transition active:scale-[0.98] cursor-pointer text-center",
                            formData.tutoringDays === d
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily Duration */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Daily Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['1.0 Hour', '1.5 Hours', '2.0 Hours'].map(dur => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setFormData({ ...formData, duration: dur })}
                          className={cn(
                            "py-2.5 px-1 rounded-xl border text-xs font-semibold transition active:scale-[0.98] cursor-pointer text-center",
                            formData.duration === dur
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Preferred Tutoring Time (পছন্দের সময়)</label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition cursor-pointer"
                    >
                      {tutoringTimeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Expected Monthly Salary */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Expected Monthly Salary (BDT) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                      <input
                        type="number"
                        placeholder="5000"
                        value={formData.salaryOffer}
                        onChange={(e) => setFormData({ ...formData, salaryOffer: e.target.value })}
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-base font-bold"
                      />
                    </div>

                    {/* Quick Salary Chips */}
                    <div className="grid grid-cols-3 sm:flex flex-wrap gap-1.5">
                      {SALARY_PRESETS.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, salaryOffer: s })}
                          className={cn(
                            "py-2 px-2 sm:py-1.5 sm:px-3 rounded-xl sm:rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer border text-center",
                            formData.salaryOffer === s
                              ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          )}
                        >
                          ৳{parseInt(s, 10).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Person Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Guardian / Student Name"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: toSentenceCase(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                    />
                  </div>

                  {/* Active Mobile Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Active Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        phone: e.target.value,
                        whatsappNumber: formData.sameAsPhone ? e.target.value : formData.whatsappNumber 
                      })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm font-semibold"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">WhatsApp Number</label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 font-medium">
                        <input
                          type="checkbox"
                          checked={formData.sameAsPhone}
                          onChange={(e) => setFormData({
                            ...formData,
                            sameAsPhone: e.target.checked,
                            whatsappNumber: e.target.checked ? formData.phone : formData.whatsappNumber
                          })}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                        />
                        <span>Same as phone</span>
                      </label>
                    </div>

                    {!formData.sameAsPhone && (
                      <input
                        type="tel"
                        placeholder="WhatsApp Number (01XXXXXXXXX)"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                      />
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-700">Additional Instructions (Optional)</label>
                    <textarea
                      placeholder="Any specific preferences or requirements..."
                      value={formData.additional}
                      onChange={(e) => setFormData({ ...formData, additional: toSentenceCase(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition min-h-[75px] resize-none text-sm"
                    />
                  </div>

                  {/* Terms & Policy Agreement */}
                  <div className="sm:col-span-2 pt-1">
                    <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, agreedToTerms: !formData.agreedToTerms })}
                      className="flex items-start gap-2.5 text-left cursor-pointer p-1"
                    >
                      <div className={cn(
                        "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition shrink-0",
                        formData.agreedToTerms ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 bg-white"
                      )}>
                        {formData.agreedToTerms && <Check size={11} strokeWidth={3} />}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        I agree to the <Link to="/terms-of-service" className="text-slate-900 font-bold underline" onClick={(e) => e.stopPropagation()}>Terms of Service</Link> and <Link to="/privacy-policy" className="text-slate-900 font-bold underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
                      </p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                SUCCESS & MATCHING SCREEN
            ══════════════════════════════════════════════════════════════ */}
            {isSubmitted && (
              <motion.div
                key="submittedScreen"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 py-2"
              >
                <div className="bg-slate-900 rounded-2xl p-5 sm:p-8 text-white text-center space-y-3 shadow-lg">
                  <div className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center mx-auto ring-4 ring-white/5">
                    <Check size={24} strokeWidth={3} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold">Tuition Request Submitted</h2>
                    <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto">
                      Thank you, <span className="text-white font-semibold">{formData.studentName}</span>. Your request is active and verified tutors are being notified.
                    </p>
                  </div>

                  {submittedJobData?.customId && (
                    <div className="inline-block bg-white/10 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider border border-white/10">
                      Job Code: {submittedJobData.customId}
                    </div>
                  )}

                  <div className="pt-2 flex justify-center">
                    <a
                      href="https://wa.me/8801928325460"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm active:scale-95"
                    >
                      <MessageSquare size={15} /> Contact Coordinator on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Job Summary Review Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Request Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Class & Course</span>
                      <span className="font-bold text-slate-800 truncate block">{formData.classes.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Curriculum</span>
                      <span className="font-bold text-slate-800 truncate block">{formData.mediums.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Location</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {[formData.upazila, formData.district].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Expected Salary</span>
                      <span className="font-bold text-slate-900">৳{parseInt(formData.salaryOffer, 10).toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Tutors Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">AI Matched Tutors in Your Area</h3>
                      <p className="text-xs text-slate-500">Ranked by algorithm based on your criteria</p>
                    </div>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                      {matchedTutors.length} Matches
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {matchedTutors.map((tutor) => (
                      <div
                        key={tutor.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs hover:border-primary/40 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              src={tutor.photo}
                              alt={tutor.name}
                              className="w-11 h-11 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                {tutor.name}
                                {tutor.isVerified && <ShieldCheck size={13} className="text-primary shrink-0" />}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate max-w-[170px]">{tutor.university}</p>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium mt-0.5">
                                <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                                  <Star size={10} fill="currentColor" /> {tutor.rating}
                                </span>
                                <span>•</span>
                                <span>{tutor.experience}</span>
                              </div>
                            </div>
                          </div>

                          {/* AI Match Score Pill */}
                          {tutor.score && (
                            <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0">
                              <Sparkles size={10} className="text-emerald-600" />
                              {tutor.score}% Match
                            </span>
                          )}
                        </div>

                        {/* Match Reasons Tags */}
                        {tutor.matchReasons && tutor.matchReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {tutor.matchReasons.slice(0, 3).map((r: string, i: number) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-1">
                          <Link
                            to={`/tutor/${tutor.id}`}
                            className="block text-center w-full py-2 bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-100 active:scale-[0.98] transition"
                          >
                            View Profile & Contact
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setStep(1);
                      setFormData(prev => ({
                        ...prev,
                        classes: [],
                        subjects: [],
                        additional: ''
                      }));
                    }}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={13} /> Post Another
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/jobs')}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 active:scale-98 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Browse All Jobs <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* ══════════════════════════════════════════════════════════════
              BOTTOM ACTION BAR (App-like Prominent Navigation)
          ══════════════════════════════════════════════════════════════ */}
          {!isSubmitted && (
            <div className="flex items-center gap-2.5 sm:gap-3 pt-5 mt-6 border-t border-slate-100">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition cursor-pointer flex items-center gap-1 text-xs sm:text-sm shrink-0"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              <button
                type="button"
                onClick={step === totalSteps ? handleSubmit : nextStep}
                disabled={isSubmitting || (step === totalSteps && !formData.agreedToTerms)}
                className={cn(
                  "flex-1 py-3 px-5 rounded-xl font-bold transition active:scale-[0.99] flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer shadow-sm",
                  isSubmitting || (step === totalSteps && !formData.agreedToTerms)
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : "bg-primary text-white hover:bg-primary-dark shadow-primary/20"
                )}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Submitting...
                  </>
                ) : step === totalSteps ? (
                  <>
                    <Send size={15} /> Submit Tuition Request
                  </>
                ) : (
                  <>
                    Continue <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Minimal Footer Info */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>Verified Tutors • Direct Communication • Free for Students & Guardians</p>
        </div>

      </div>
    </div>
  );
}
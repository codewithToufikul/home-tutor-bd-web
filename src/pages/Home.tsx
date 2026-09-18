import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, MapPin, BookOpen, Phone, ChevronRight, ChevronDown, Star, Users, ShieldCheck, Award, GraduationCap, Clock, Target, UserPlus, FileText, ClipboardList, CheckCircle, ArrowRight, UserCheck, Briefcase, PlayCircle, ChevronLeft, X, Home as HomeIcon, Video, Youtube, Navigation, MessageCircle, Check,
  Sparkles, School, Palette, Landmark, Cpu, Stethoscope, Building2, Sprout, Globe, Laptop, HelpCircle
} from 'lucide-react';
import { getDivisions, getDistricts, getUpazilas, getAreas } from '@olism/bd-geo';
import { getDhakaZones, getDhakaSubLocations } from '@/src/data/dhakaLocations';
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
import TutorRoadmapTimeline from '@/src/components/home/TutorRoadmapTimeline.tsx';
import WhyChooseUsSection from '@/src/components/home/WhyChooseUsSection.tsx';
import HomeBlogsSection from '@/src/components/home/HomeBlogsSection.tsx';
import TestimonialsSection from '@/src/components/home/TestimonialsSection.tsx';
import HowToConnectSection from '@/src/components/home/HowToConnectSection.tsx';
import HomeFAQSection from '@/src/components/home/HomeFAQSection.tsx';
import tutorialIllustration from '@/src/assets/tutorial_illustration.png';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';
import { PERMISSIONS } from '@/src/shared/constants/permissions.ts';
import {
  allUniversitiesGrouped,
  allUniversitiesList,
  popularUniversities
} from '@/src/data/universities.ts';

export const COURSE_CATEGORIES = [
  {
    id: 'all',
    name: 'All Options',
    bangla: 'সব ক্লাস ও কোর্স',
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

const CUSTOM_CLASSES = [
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
  'BCS',
  'Bank',
  'Primary Teacher',
  'Sub: Inspector',
  'NTRCA',
  'IELTS',
  'Islamic Studies',
  'Drawing & Painting',
  'Handwriting',
  'Computer Programming',
  'Basic Computer Operating',
];

export const ADMISSION_CATEGORIES = [
  {
    id: 'du',
    name: 'Dhaka University (DU)',
    banglaName: 'ঢাকা বিশ্ববিদ্যালয় (ঢাবি)',
    icon: Landmark,
    badge: 'শীর্ষ পছন্দ',
    color: 'from-blue-600 to-indigo-700',
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
    color: 'from-amber-600 to-orange-700',
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
    color: 'from-rose-600 to-red-700',
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
    color: 'from-purple-600 to-violet-700',
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
    color: 'from-emerald-600 to-teal-700',
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

const CUSTOM_MEDIUMS = [
  'Admission Candidate',
  'Bangla Medium',
  'English Version',
  'English Medium (Edexcel)',
  'English Medium (Cambridge)',
  'English Medium (A1)',
  'English Medium (A2)',
  'Madrasah Medium',
  'Admission Help',
  'International Exam Preparation',
  'Religious and Moral Studies',
  'Language',
  'Arts and Crafts',
  'Special Skills Mastery',
  'Skills Development',
  'Graduate Program',
  'Job Preparation',
  'Medical Admission'
];

// ======================== SLIDER SECTION (আপডেটেড) ========================

function SliderSection({ title, subtitle, items, renderItem, viewAllLink, itemWidth = 'w-full' }: any) {
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    if (items.length === 1) return [items[0], items[0], items[0], items[0], items[0], items[0]];
    if (items.length < 6) return [...items, ...items, ...items];
    return items;
  }, [items]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    containScroll: false,
    skipSnaps: false,
    dragFree: false
  }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-teal-500/15 via-emerald-500/10 to-transparent border-y border-ink/5">
      {/* Vibrant Ambient Glow Blobs */}
      <div className="absolute top-0 left-10 w-[26rem] h-[26rem] bg-primary/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-4 w-[28rem] h-[28rem] bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Delicate Dot Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0D9488 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── ANIMATED FLOATING TUITION & EDUCATION VECTORS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* 1. Floating Graduation Cap (Top Left) */}
        <motion.div
          animate={{
            y: [0, -16, 0],
            rotate: [0, 10, -8, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-8 left-[4%] text-primary/20 sm:text-primary/25"
        >
          <GraduationCap size={46} className="transform -rotate-12" />
        </motion.div>

        {/* 2. Floating Open Book (Top Right) */}
        <motion.div
          animate={{
            y: [0, 18, 0],
            rotate: [0, -8, 6, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute top-10 right-[6%] text-emerald-500/25 sm:text-emerald-500/30"
        >
          <BookOpen size={42} />
        </motion.div>

        {/* 3. Floating Science Atom / CPU (Bottom Left) */}
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          }}
          className="absolute bottom-8 left-[6%] text-teal-600/20 sm:text-teal-600/25"
        >
          <Cpu size={48} />
        </motion.div>

        {/* 4. Floating Sparkles / Star (Center Right) */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.5, 0.9, 0.5],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-[40%] right-[3%] text-amber-500/35"
        >
          <Sparkles size={36} />
        </motion.div>

        {/* 5. Floating Award / Medal (Bottom Right) */}
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotate: [0, 6, -6, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute bottom-10 right-[15%] text-purple-600/20 hidden md:block"
        >
          <Award size={40} />
        </motion.div>

        {/* 6. Floating Target / Goal (Center Left) */}
        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 6, 0],
          }}
          transition={{
            duration: 7.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-[52%] left-[2%] text-primary/20"
        >
          <Target size={36} />
        </motion.div>

        {/* 7. Floating Math Formula Watermarks */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-16 left-[38%] text-primary/20 font-mono text-2xl font-black tracking-widest hidden lg:block"
        >
          f(x) = ax + b
        </motion.div>

        <motion.div
          animate={{
            y: [0, 10, 0],
            opacity: [0.12, 0.3, 0.12],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-8 left-[45%] text-emerald-600/20 font-mono text-2xl font-black tracking-widest hidden lg:block"
        >
          sin²θ + cos²θ = 1
        </motion.div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Row with Tuition Types title style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="relative space-y-2">

            <h2 className="relative inline-block text-2xl md:text-3xl lg:text-[44px] font-display font-bold text-[#001F3F]">
              {title}
              <svg
                className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 text-primary/70"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 12 C 60 2, 120 18, 180 8 C 220 2, 260 14, 298 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </h2>

            <p className=" text-sm md:text-base sm:text-lg text-ink-muted pt-2 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Controls */}
          <div className="flex hidden sm:flex items-end gap-3 self-start sm:self-end">
            <button
              onClick={scrollPrev}
              aria-label="Previous Tutor"
              className="w-11 h-11 rounded-2xl bg-white border border-ink/10 flex items-center justify-center text-ink hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:shadow-md cursor-pointer group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next Tutor"
              className="w-11 h-11 rounded-2xl bg-white border border-ink/10 flex items-center justify-center text-ink hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm hover:shadow-md cursor-pointer group"
            >
              <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all hover:scale-[1.02] active:scale-95 ml-1 group"
            >
              <span>View All</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Carousel Slider */}
        <div className="overflow-hidden w-full py-4" ref={emblaRef}>
          <div className="flex -ml-3 sm:-ml-4">
            {displayItems.map((item: any, index: number) => (
              <div
                key={index}
                className="pl-3 sm:pl-4 flex-[0_0_75%] sm:flex-[0_0_46%] lg:flex-[0_0_24%] min-w-0"
              >
                <div className="h-full">
                  {renderItem(item)}
                </div>
              </div>
            ))}
          </div>
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

  // Bangladesh Geo Data from @olism/bd-geo
  const allDivisions = useMemo(() => getDivisions(), []);
  const allDistricts = useMemo(() => getDistricts(), []);
  const allUpazilas = useMemo(() => getUpazilas(), []);
  const allAreas = useMemo(() => getAreas(), []);

  const [formData, setFormData] = useState({
    classes: [] as string[],
    division: 'Dhaka',
    divisionId: 3 as number | '',
    district: 'Dhaka',
    districtId: 1 as number | '',
    upazila: '',
    upazilaId: '' as number | '',
    union: '',
    unionId: '' as number | '',
    ward: '',
    wardId: '' as number | '',
    area: '',
    detailedAddress: '',
    mediums: ['Bangla Medium'] as string[],
    tuitionType: 'Home Tuition',
    subjects: [] as string[],
    customSubject: '',
    genderPreference: 'Any',
    tutoringDays: '3 Days/Week',
    salary: '5000',
    universityPreference: '',
    phone: '',
    whatsappNumber: '',
    sameAsPhone: true,
    name: '',
  });
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAdmissionTab, setSelectedAdmissionTab] = useState<string>('du');
  const [showAdmissionPanel, setShowAdmissionPanel] = useState(false);
  const [classCategoryFilter, setClassCategoryFilter] = useState<string>('all');
  const [classSearchQuery, setClassSearchQuery] = useState<string>('');
  const [customMediumInput, setCustomMediumInput] = useState('');

  const stats = [
    {
      label: 'Verified Tutors',
      value: '15,000+',
      subtext: 'BUET, DU, Medical & Top Unis',
      badge: '100% Verified',
      icon: ShieldCheck,
      accent: '#10B981',
      gradient: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      borderColor: 'border-emerald-500/20',
      tint: '#ECFDF5',
      textColor: 'text-emerald-700',
    },
    {
      label: 'Happy Students',
      value: '25,000+',
      subtext: 'Personalized 1-to-1 Learning',
      badge: 'Across 64 Districts',
      icon: Users,
      accent: '#0D9488',
      gradient: 'from-teal-500/15 via-teal-500/5 to-transparent',
      borderColor: 'border-teal-500/20',
      tint: '#F0FDFA',
      textColor: 'text-teal-700',
    },
    {
      label: 'Guardian Rating',
      value: '4.9 / 5.0',
      subtext: 'From 3,500+ genuine reviews',
      badge: '★ Top Rated',
      icon: Star,
      accent: '#F59E0B',
      gradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/20',
      tint: '#FFFBEB',
      textColor: 'text-amber-700',
    },
    {
      label: 'Matching Success',
      value: '98.5%',
      subtext: 'Average match within 24 hours',
      badge: '⚡ Fast Response',
      icon: Award,
      accent: '#8B5CF6',
      gradient: 'from-purple-500/15 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/20',
      tint: '#F5F3FF',
      textColor: 'text-purple-700',
    },
  ];

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

  const toggleClass = (c: string) => {
    const isAdmissionRelated = c.toLowerCase().includes('admission') || c === 'Admission Candidate';

    if (isAdmissionRelated) {
      if (formData.classes.includes(c)) {
        setFormData((prev) => ({
          ...prev,
          classes: prev.classes.filter(item => item !== c)
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          classes: [...prev.classes, c],
          mediums: prev.mediums.includes('Admission Candidate')
            ? prev.mediums
            : [...prev.mediums.filter(m => m !== 'Bangla Medium'), 'Admission Candidate']
        }));
        setShowAdmissionPanel(true);
      }
      return;
    }

    if (formData.classes.includes(c)) {
      setFormData((prev) => ({
        ...prev,
        classes: prev.classes.filter(item => item !== c)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        classes: [...prev.classes, c]
      }));
    }
  };

  const toggleAdmissionUnit = (unit: string) => {
    if (formData.classes.includes(unit)) {
      setFormData((prev) => ({
        ...prev,
        classes: prev.classes.filter(item => item !== unit)
      }));
    } else {
      const newClasses = formData.classes.includes('Admission Candidate')
        ? [...formData.classes, unit]
        : [...formData.classes, 'Admission Candidate', unit];
      setFormData((prev) => ({
        ...prev,
        classes: newClasses,
        mediums: prev.mediums.includes('Admission Candidate')
          ? prev.mediums
          : [...prev.mediums.filter(m => m !== 'Bangla Medium'), 'Admission Candidate']
      }));
    }
  };

  const toggleMedium = (m: string) => {
    setFormData((prev) => {
      const exists = prev.mediums.includes(m);
      if (exists) {
        return {
          ...prev,
          mediums: prev.mediums.filter((item) => item !== m),
        };
      } else {
        return {
          ...prev,
          mediums: [...prev.mediums, m],
        };
      }
    });
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

      const locationParts = [
        formData.ward ? `Ward: ${formData.ward}` : '',
        formData.union ? `Union: ${formData.union}` : '',
        formData.upazila,
        formData.district,
        formData.division
      ].filter(Boolean);

      const locationArea = [formData.ward, formData.union, formData.upazila].filter(Boolean).join(', ') || formData.upazila || formData.area || 'All Areas';
      const fullLocationText = locationParts.join(', ');
      const whatsapp = formData.sameAsPhone ? formData.phone.trim() : (formData.whatsappNumber.trim() || formData.phone.trim());

      const mediumsStr = formData.mediums.length > 0 ? formData.mediums.join(', ') : 'Bangla Medium';

      const payload = {
        studentClass: classesStr,
        subjects: subjectsList,
        location: {
          division: formData.division || '',
          district: formData.district || 'Dhaka',
          upazila: formData.upazila || '',
          union: formData.union || '',
          ward: formData.ward || '',
          area: locationArea,
          detailedAddress: formData.detailedAddress || '',
        },
        salary: salaryNum,
        medium: mediumsStr,
        genderPreference: formData.genderPreference || 'Any',
        tutoringDays: [formData.tutoringDays || '3 Days/Week'],
        tuitionType: formData.tuitionType || 'Home Tuition',
        studentGender: 'Any',
        duration: '1.5 Hours',
        startTime: 'Evening',
        phone: formData.phone.trim(),
        name: formData.name.trim() || user?.name || '',
        contactName: formData.name.trim() || user?.name || '',
        whatsappNumber: whatsapp,
        universityPreference: formData.universityPreference || '',
        description: `Tutor requested for: ${classesStr}. Medium: ${mediumsStr}. Subjects: ${subjectsStr}. Location: ${fullLocationText}${formData.detailedAddress ? ` (Details: ${formData.detailedAddress})` : ''}. University Preference: ${formData.universityPreference || 'Any'}. Tuition Type: ${formData.tuitionType}. Schedule: ${formData.tutoringDays}. Expected Salary: ৳${salaryNum.toLocaleString()}. Contact Phone: ${formData.phone}${whatsapp ? `, WhatsApp: ${whatsapp}` : ''}`,
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
      division: 'Dhaka',
      divisionId: 3,
      district: 'Dhaka',
      districtId: 1,
      upazila: '',
      upazilaId: '',
      union: '',
      unionId: '',
      ward: '',
      wardId: '',
      area: '',
      detailedAddress: '',
      mediums: ['Bangla Medium'],
      tuitionType: 'Home Tuition',
      subjects: [],
      customSubject: '',
      genderPreference: 'Any',
      tutoringDays: '3 Days/Week',
      salary: '5000',
      universityPreference: '',
      phone: '',
      whatsappNumber: '',
      sameAsPhone: true,
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
    <div className=" pb-12">
      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-8 lg:pt-16 pb-12 lg:pb-16 overflow-hidden bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent border-b border-ink/5">
        {/* Subtle Ambient Glow Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Delicate Dot Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#0D9488 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* ── ANIMATED FLOATING TUITION & EDUCATION VECTORS ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          {/* 1. Floating Graduation Cap (Top Left) */}
          <motion.div
            animate={{
              y: [0, -18, 0],
              rotate: [0, 8, -6, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-10 left-[5%] text-primary/20 sm:text-primary/25 drop-shadow-sm"
          >
            <GraduationCap size={46} className="transform -rotate-12" />
          </motion.div>

          {/* 2. Floating Open Book (Top Right) */}
          <motion.div
            animate={{
              y: [0, 20, 0],
              rotate: [0, -10, 6, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            className="absolute top-14 right-[8%] text-emerald-500/20 sm:text-emerald-500/25"
          >
            <BookOpen size={42} />
          </motion.div>

          {/* 3. Floating Science / Molecule (Bottom Left) */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 360],
            }}
            transition={{
              y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            }}
            className="absolute bottom-12 left-[3%] text-teal-600/15 sm:text-teal-600/20"
          >
            <Cpu size={50} />
          </motion.div>

          {/* 4. Floating Sparkles / Idea (Center Right) */}
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.4, 0.9, 0.4],
              y: [0, -12, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute top-1/2 right-[3%] text-amber-500/25"
          >
            <Sparkles size={36} />
          </motion.div>

          {/* 5. Floating Target / Goal (Center Left) */}
          <motion.div
            animate={{
              y: [0, 14, 0],
              rotate: [0, -12, 8, 0],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.5,
            }}
            className="absolute top-[48%] left-[2%] text-primary/15"
          >
            <Target size={38} />
          </motion.div>

          {/* 6. Floating University Landmark (Bottom Center-Right) */}
          <motion.div
            animate={{
              y: [0, -16, 0],
              rotate: [0, 6, -4, 0],
            }}
            transition={{
              duration: 7.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            className="absolute bottom-6 right-[24%] text-emerald-600/15"
          >
            <Landmark size={44} />
          </motion.div>

          {/* 7. Floating Math Formulas Watermark */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute top-20 left-[42%] text-primary/20 font-mono text-2xl font-black tracking-widest hidden md:block"
          >
            E = mc²
          </motion.div>

          <motion.div
            animate={{
              y: [0, 12, 0],
              opacity: [0.12, 0.3, 0.12],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute bottom-16 left-[32%] text-emerald-600/20 font-mono text-3xl font-black tracking-widest hidden md:block"
          >
            π r²
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-16 items-center">
            {/* ===== HERO LEFT COLUMN ===== */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Award size={14} className="text-primary" />
                <span>#1 Verified Home & Online Tutor Network</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-ink leading-[1.05] tracking-tight">
                  Find Your
                  <span className="relative block w-fit">
                    <span className="text-primary italic">
                      Perfect Tutor
                    </span>
                    <svg
                      className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-3 sm:h-4"
                      viewBox="0 0 300 20"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <path
                        d="M2 12 C 60 2, 120 18, 180 8 C 220 2, 260 14, 298 6"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        className="text-primary/70"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-xs sm:text-base text-ink-muted max-w-xl leading-relaxed font-medium">
                  Connect with verified home tutors from BUET, DU, Medical & top universities.
                  Trusted by over 10,000+ parents across Bangladesh.
                </p>
              </div>

              {/* ── DUAL FUNCTIONAL ACTION HUB ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Tutor Card */}
                <Link
                  to="/jobs"
                  className="group relative p-4.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 shadow-md hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                        <GraduationCap size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        For Tutors
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-display font-black text-ink group-hover:text-emerald-700 transition-colors">
                        Join as a Tutor
                      </h3>
                      <p className="text-[11px] font-medium text-ink-muted mt-0.5 leading-snug">
                        Apply to 500+ active tuition jobs & earn ৳10k–৳50k/month
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                    <span>Find Tuition Jobs</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                {/* Guardian / Student Card */}
                <Link
                  to="/request-tutor"
                  className="group relative p-4.5 rounded-2xl bg-gradient-to-br from-primary/10 via-white to-primary/5 border border-primary/20 hover:border-primary/50 shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform">
                        <Users size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        For Parents
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-display font-black text-ink group-hover:text-primary transition-colors">
                        Need a Tutor?
                      </h3>
                      <p className="text-[11px] font-medium text-ink-muted mt-0.5 leading-snug">
                        Get matched with background-verified top tutors in 2 hours
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-primary/10 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>টিউটর রিকোয়েস্ট করুন</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>

              {/* ── GORGEOUS AVATARS & LIVE TRUST PROOF ── */}

            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mt-4 lg:mt-0"
            >
              <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-3xl pointer-events-none" />
              <div className="relative bg-surface p-7 sm:p-9 lg:p-5 rounded-[2rem] border border-ink/5 shadow-2xl shadow-primary/10">
                <div className="mb-6 pt-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-display font-black text-ink">টিউটর রিকোয়েস্ট করুন</h2>
                    <span className="text-xs font-black uppercase px-3 py-1 bg-primary/10 text-primary rounded-full tracking-wider">
                      {isSuccess ? 'Matched' : `Step ${step} of 5`}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1 font-medium">কয়েক মিনিটের মধ্যেই খুঁজে নিন সেরা ভেরিফাইড টিউটর</p>

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
                      {/* Step 1: Classes & Courses */}
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold text-ink uppercase tracking-wide">
                              1. Select Class or Course (Multiple Choice)
                            </label>
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

                          {/* Selected Tags Display */}
                          <div className="flex flex-wrap gap-1.5 p-2 bg-background rounded-xl border border-ink/10 min-h-[40px] items-center">
                            {formData.classes.length > 0 ? (
                              formData.classes.map((c) => (
                                <span key={c} className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-xs">
                                  <span>{c}</span>
                                  <button
                                    type="button"
                                    onClick={() => toggleClass(c)}
                                    className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                                  >
                                    <X size={10} />
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-ink-muted/60 font-medium">Click one or more classes or courses below...</span>
                            )}
                          </div>

                          {/* Course Category Filter Tabs */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide pt-0.5">
                            {COURSE_CATEGORIES.map((cat) => {
                              const IconComponent = cat.icon;
                              const isActive = classCategoryFilter === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setClassCategoryFilter(cat.id)}
                                  className={cn(
                                    "px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border",
                                    isActive
                                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                      : "bg-white text-slate-600 hover:text-slate-900 border-slate-200/80 hover:bg-slate-50"
                                  )}
                                >
                                  <IconComponent size={13} className={isActive ? "text-white" : "text-slate-500"} />
                                  <span>{cat.name}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Instant Search Bar */}
                          <div className="relative">
                            <input
                              type="text"
                              value={classSearchQuery}
                              onChange={(e) => setClassSearchQuery(e.target.value)}
                              placeholder="Search class, admission, degree or course..."
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-ink placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                            />
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            {classSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setClassSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Class / Course Grid */}
                          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                            {visibleClasses.length > 0 ? (
                              visibleClasses.map((c) => {
                                const isSelected = formData.classes.includes(c);
                                const isAdmission = c.toLowerCase().includes('admission');
                                const isDegree = ['BA', 'BBA', 'BSC', 'Degree', 'Diploma Engineering', 'Engineering', 'Medical - MBBS', 'Medical - BDS', 'Law', 'Honours', 'University / Undergrad'].includes(c);
                                const isJob = ['BCS', 'Bank', 'Primary Teacher', 'Sub: Inspector', 'NTRCA'].includes(c);
                                const isSkill = ['IELTS', 'Islamic Studies', 'Drawing & Painting', 'Handwriting', 'Computer Programming', 'Basic Computer Operating'].includes(c);

                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => toggleClass(c)}
                                    className={cn(
                                      "px-2.5 py-2 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer flex items-center justify-between gap-1.5",
                                      isSelected
                                        ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                                        : "border-slate-200/80 hover:border-primary/40 bg-white text-slate-700 hover:bg-slate-50/50"
                                    )}
                                  >
                                    <span className="truncate flex items-center gap-1.5">
                                      {isAdmission && <Target size={13} className="text-amber-600 shrink-0" />}
                                      {isDegree && <GraduationCap size={13} className="text-indigo-600 shrink-0" />}
                                      {isJob && <Briefcase size={13} className="text-emerald-600 shrink-0" />}
                                      {isSkill && <Palette size={13} className="text-purple-600 shrink-0" />}
                                      {!isAdmission && !isDegree && !isJob && !isSkill && <BookOpen size={13} className="text-slate-400 shrink-0" />}
                                      <span className="truncate">{c}</span>
                                    </span>
                                    {isSelected && <Check size={12} strokeWidth={3} className="text-primary shrink-0" />}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="col-span-2 py-4 text-center text-xs text-slate-400">
                                No classes or courses matching "{classSearchQuery}"
                              </div>
                            )}
                          </div>

                          {/* 🎯 Interactive Admission Category & Unit Selector (Dhaka University, Engineering, Medical, etc.) */}
                          {(showAdmissionPanel || formData.classes.some(c => c.toLowerCase().includes('admission') || ADMISSION_CATEGORIES.some(cat => cat.units.includes(c)))) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="p-3 bg-gradient-to-br from-slate-50 to-amber-50/40 rounded-2xl border border-amber-200/80 shadow-xs space-y-2.5 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Target size={14} className="text-amber-600" />
                                  <span className="text-[11px] font-black text-ink uppercase tracking-wider">
                                    এডমিশন ইউনিট ও স্পেশাল ট্র্যাক নির্বাচন
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                                  নির্দিষ্ট ইউনিট সিলেক্ট করুন
                                </span>
                              </div>

                              {/* Category Tabs: Dhaka University, Engineering, Medical, etc. */}
                              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
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
                                        "px-2.5 py-1.5 rounded-xl text-[11px] font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border",
                                        isTabActive
                                          ? "bg-primary text-white border-primary shadow-xs"
                                          : "bg-white text-ink-muted hover:text-ink border-slate-200/80 hover:bg-slate-50"
                                      )}
                                    >
                                      <CatIcon size={12} className={isTabActive ? "text-white" : "text-slate-500"} />
                                      <span>{cat.name}</span>
                                      {selectedCount > 0 && (
                                        <span className="w-4 h-4 bg-white text-primary rounded-full text-[9px] font-black flex items-center justify-center">
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
                                  <div className="space-y-1.5 bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border border-slate-200/80">
                                    <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                                      <div className="flex items-center gap-1.5 text-[11px] font-black text-ink">
                                        <CurrentIcon size={13} className="text-primary" />
                                        <span>{currentCat.banglaName}</span>
                                      </div>
                                      <span className="text-[10px] text-primary font-bold">
                                        {currentCat.badge}
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin pt-1">
                                      {currentCat.units.map((unit) => {
                                        const isUnitSelected = formData.classes.includes(unit);
                                        return (
                                          <button
                                            key={unit}
                                            type="button"
                                            onClick={() => toggleAdmissionUnit(unit)}
                                            className={cn(
                                              "px-2.5 py-1.5 rounded-lg border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
                                              isUnitSelected
                                                ? "bg-primary/10 border-primary text-primary shadow-2xs"
                                                : "bg-slate-50/60 border-slate-200 text-slate-700 hover:border-primary/40 hover:bg-white"
                                            )}
                                          >
                                            <span className="truncate pr-2">{unit}</span>
                                            <span className={cn(
                                              "w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 border",
                                              isUnitSelected
                                                ? "bg-primary text-white border-primary"
                                                : "bg-white border-slate-300 text-transparent"
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

                      {/* Step 2: Address & Location using @olism/bd-geo */}
                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-ink uppercase">2. Address & Location</label>
                            <span className="text-[10px] text-primary font-bold">Bangladesh Geo Data</span>
                          </div>

                          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                            {/* Division & District (2-Column Grid) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {/* Division Select */}
                              <div>
                                <label className="block text-[10px] font-bold text-ink-muted mb-1 uppercase tracking-wider">
                                  Division (বিভাগ) *
                                </label>
                                <select
                                  value={formData.divisionId}
                                  onChange={handleDivisionChange}
                                  className="w-full px-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
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
                              <div>
                                <label className="block text-[10px] font-bold text-ink-muted mb-1 uppercase tracking-wider">
                                  District (জেলা) *
                                </label>
                                <select
                                  value={formData.districtId}
                                  onChange={handleDistrictChange}
                                  disabled={!formData.divisionId}
                                  className="w-full px-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer disabled:opacity-40"
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
                            <div>
                              <label className="block text-[10px] font-bold text-ink-muted mb-1 uppercase tracking-wider">
                                Upazila / Thana (উপজেলা / থানা) *
                              </label>
                              <select
                                value={formData.upazilaId}
                                onChange={handleUpazilaChange}
                                disabled={!formData.districtId}
                                className="w-full px-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                            <div className={cn("grid gap-2", availableUnions.length > 0 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                              {availableUnions.length > 0 && (
                                <div>
                                  <label className="block text-[10px] font-bold text-ink-muted mb-1 uppercase tracking-wider">
                                    Union (ইউনিয়ন - Optional)
                                  </label>
                                  <select
                                    value={formData.unionId}
                                    onChange={handleUnionChange}
                                    className="w-full px-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
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
                              <div className="relative">
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                                    Ward / Area (ওয়ার্ড / এলাকা - Optional)
                                  </label>
                                  <span className="text-[9px] font-semibold text-primary lowercase">(select or type)</span>
                                </div>
                                <div className="relative">
                                  <input
                                    type="text"
                                    list="home-ward-suggestions"
                                    value={formData.ward}
                                    onChange={(e) => {
                                      handleWardTextChange(e.target.value);
                                      setIsWardDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                      if (availableWards.length > 0) setIsWardDropdownOpen(true);
                                    }}
                                    placeholder={availableWards.length > 0 ? "Type or select Ward..." : "e.g. Ward 4, Sector 3, Block B..."}
                                    className="w-full pl-3 pr-8 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                                  />
                                  {availableWards.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setIsWardDropdownOpen((prev) => !prev)}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 cursor-pointer"
                                    >
                                      <ChevronDown size={14} className={cn("transition-transform duration-200", isWardDropdownOpen && "rotate-180")} />
                                    </button>
                                  )}
                                </div>

                                <datalist id="home-ward-suggestions">
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
                                    <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-ink/10 rounded-xl shadow-xl max-h-44 overflow-y-auto z-30 divide-y divide-ink/5 scrollbar-thin">
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
                                                "w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-primary/5 transition-colors cursor-pointer",
                                                isSelected ? "bg-primary/10 font-bold text-primary" : "text-ink"
                                              )}
                                            >
                                              <div className="flex items-center gap-1.5 truncate">
                                                <span className="font-semibold">{wd.name}</span>
                                                {wd.nameBn && <span className="text-ink-muted text-[11px]">({wd.nameBn})</span>}
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
                                        <div className="px-3 py-2 text-xs text-ink-muted">
                                          Custom: <span className="font-bold text-ink">{formData.ward}</span>
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Detailed Address (House, Road, Sector) */}
                            <div>
                              <label className="block text-[10px] font-bold text-ink-muted mb-1 uppercase tracking-wider">
                                House No, Road No, Sector / Details (ঐচ্ছিক)
                              </label>
                              <div className="relative">
                                <HomeIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
                                <input
                                  type="text"
                                  placeholder="e.g. House 14, Road 5, Block C, Sector 10"
                                  value={formData.detailedAddress}
                                  onChange={(e) => setFormData({ ...formData, detailedAddress: e.target.value })}
                                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-ink/10 bg-background text-xs font-medium text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={!formData.divisionId || !formData.districtId || !formData.upazilaId}
                            onClick={() => setStep(3)}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-1"
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
                            <div className="flex justify-between items-center">
                              <label className="block text-xs font-bold text-ink uppercase">
                                3. Medium / Curriculum (Multiple Choice)
                              </label>
                              {formData.mediums.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setStep(4)}
                                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                >
                                  Next Step →
                                </button>
                              )}
                            </div>

                            {/* Selected Medium Chips */}
                            {formData.mediums.length > 0 && (
                              <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-200/80 rounded-xl min-h-[38px] items-center">
                                {formData.mediums.map((m) => (
                                  <span key={m} className="inline-flex items-center gap-1 bg-primary text-white px-2.5 py-0.5 rounded-lg text-[11px] font-bold shadow-xs">
                                    <span>{m}</span>
                                    <button
                                      type="button"
                                      onClick={() => toggleMedium(m)}
                                      className="hover:bg-black/20 rounded-full p-0.5 transition-colors cursor-pointer"
                                    >
                                      <X size={10} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                              {CUSTOM_MEDIUMS.map((m) => {
                                const isSelected = formData.mediums.includes(m);
                                return (
                                  <button
                                    key={m}
                                    type="button"
                                    onClick={() => toggleMedium(m)}
                                    className={cn(
                                      "px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer flex items-center justify-between gap-1.5",
                                      isSelected
                                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                                        : "border-slate-200/80 hover:border-primary/40 bg-white text-slate-700 hover:bg-slate-50/50"
                                    )}
                                  >
                                    <span className="truncate">{m}</span>
                                    {isSelected && <span className="text-primary font-bold">✓</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Custom Medium Input */}
                            <div className="flex items-center gap-2">
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

                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <label className="block text-xs font-bold text-ink uppercase">Tuition Mode</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'Home Tuition', label: 'Home', icon: HomeIcon },
                                { id: 'Online Tuition', label: 'Online', icon: Laptop },
                                { id: 'Both / Flexible', label: 'Flexible', icon: Navigation },
                              ].map((mode) => {
                                const ModeIcon = mode.icon;
                                const isModeSelected = formData.tuitionType === mode.id;
                                return (
                                  <button
                                    key={mode.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tuitionType: mode.id })}
                                    className={cn(
                                      "py-2.5 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                                      isModeSelected
                                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                                        : "border-slate-200 bg-white text-slate-600 hover:border-primary/30"
                                    )}
                                  >
                                    <ModeIcon size={14} className={isModeSelected ? "text-primary" : "text-slate-400"} />
                                    <span>{mode.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={formData.mediums.length === 0}
                            onClick={() => setStep(4)}
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-xs uppercase shadow-md hover:bg-primary-dark transition-all cursor-pointer mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
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

                      {/* Step 5: Preferences, University, Salary & Contact */}
                      {step === 5 && (
                        <motion.form
                          key="step5"
                          onSubmit={handleRequestSubmit}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin"
                        >
                          {/* Tutor Gender & Days */}
                          <div className="grid grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">Tutor Gender</label>
                              <select
                                value={formData.genderPreference}
                                onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink outline-none cursor-pointer"
                              >
                                <option value="Any">Any Gender</option>
                                <option value="Male">Male Tutor</option>
                                <option value="Female">Female Tutor</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">Days/Week</label>
                              <select
                                value={formData.tutoringDays}
                                onChange={(e) => setFormData({ ...formData, tutoringDays: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink outline-none cursor-pointer"
                              >
                                <option value="2 Days/Week">2 Days/Week</option>
                                <option value="3 Days/Week">3 Days/Week</option>
                                <option value="4 Days/Week">4 Days/Week</option>
                                <option value="5 Days/Week">5 Days/Week</option>
                                <option value="6 Days/Week">6 Days/Week</option>
                              </select>
                            </div>
                          </div>

                          {/* University Preference (পছন্দের বিশ্ববিদ্যালয়) */}
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                              Preferred University (পছন্দের বিশ্ববিদ্যালয়)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              <select
                                value={allUniversitiesList.includes(formData.universityPreference) ? formData.universityPreference : ''}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setFormData({ ...formData, universityPreference: e.target.value === 'Any University' ? '' : e.target.value });
                                  }
                                }}
                                className="w-full px-2.5 py-2 rounded-xl border border-ink/10 bg-background text-xs font-medium text-ink focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                              >
                                <option value="">-- ড্রপডাউন থেকে বাছুন --</option>
                                <option value="Any University">Any University (যে কোনো বিশ্ববিদ্যালয়)</option>
                                {allUniversitiesGrouped.map((group) => (
                                  <optgroup key={group.group} label={group.group}>
                                    {group.items.map((uni) => (
                                      <option key={uni} value={uni}>{uni}</option>
                                    ))}
                                  </optgroup>
                                ))}
                              </select>
                              <div className="relative">
                                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={14} />
                                <input
                                  type="text"
                                  list="home-modal-universities-list"
                                  placeholder="বা সার্চ / টাইপ করুন..."
                                  value={formData.universityPreference}
                                  onChange={(e) => setFormData({ ...formData, universityPreference: e.target.value })}
                                  className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-ink/10 bg-background text-xs font-medium text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <datalist id="home-modal-universities-list">
                                  {allUniversitiesList.map((u) => (
                                    <option key={u} value={u} />
                                  ))}
                                </datalist>
                              </div>
                            </div>
                            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
                              {popularUniversities.slice(0, 10).map((uni) => (
                                <button
                                  key={uni}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, universityPreference: uni === 'Any University' ? '' : uni })}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer border",
                                    formData.universityPreference === uni || (uni === 'Any University' && !formData.universityPreference)
                                      ? "bg-primary text-white border-primary shadow-2xs"
                                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                  )}
                                >
                                  {uni}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Budget / Salary Input & Suggestions */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-bold text-ink-muted uppercase tracking-wider">
                                Expected Salary / Budget (প্রত্যাশিত মাসিক বেতন) *
                              </label>
                              <span className="text-xs font-black text-primary">৳{parseInt(formData.salary || '0', 10).toLocaleString()} /mo</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink font-bold text-xs">৳</span>
                              <input
                                type="number"
                                placeholder="Enter salary amount (e.g. 5000)"
                                value={formData.salary}
                                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                className="w-full pl-8 pr-3 py-2 rounded-xl border border-ink/10 bg-background text-xs font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                            </div>
                            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
                              {['3000', '5000', '7000', '8000', '10000', '12000', '15000'].map((amt) => (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, salary: amt })}
                                  className={cn(
                                    "px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer border",
                                    formData.salary === amt
                                      ? "bg-primary text-white border-primary shadow-2xs"
                                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                  )}
                                >
                                  ৳{parseInt(amt).toLocaleString()}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Name, Phone & WhatsApp */}
                          <div className="space-y-2 pt-1 border-t border-slate-100">
                            <input
                              type="text"
                              placeholder="Your Name (ঐচ্ছিক)"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-ink/10 bg-background text-xs font-medium text-ink focus:ring-2 focus:ring-primary/20 outline-none"
                            />

                            {/* Phone Number */}
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
                              <input
                                type="tel"
                                placeholder="Phone Number (01XXXXXXXXX) *"
                                required
                                value={formData.phone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFormData((prev) => ({
                                    ...prev,
                                    phone: val,
                                    whatsappNumber: prev.sameAsPhone ? val : prev.whatsappNumber
                                  }));
                                }}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink/10 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none text-xs font-bold"
                              />
                            </div>

                            {/* WhatsApp Number Same/Custom Toggle */}
                            <div className="space-y-1.5">
                              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-semibold text-slate-700 select-none">
                                <input
                                  type="checkbox"
                                  checked={formData.sameAsPhone}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFormData((prev) => ({
                                      ...prev,
                                      sameAsPhone: checked,
                                      whatsappNumber: checked ? prev.phone : ''
                                    }));
                                  }}
                                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span>WhatsApp number is same as phone</span>
                              </label>

                              {!formData.sameAsPhone && (
                                <div className="relative">
                                  <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600" size={15} />
                                  <input
                                    type="tel"
                                    placeholder="WhatsApp Number (01XXXXXXXXX)"
                                    value={formData.whatsappNumber}
                                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 text-ink focus:ring-2 focus:ring-emerald-500/20 outline-none text-xs font-bold"
                                  />
                                </div>
                              )}
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
                            className="w-full bg-primary text-white py-3.5 rounded-xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs uppercase tracking-wider"
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

      {/* ===== STATS & TRUST METRICS SECTION ===== */}
      <section className="max-w-7xl mx-auto mt-16 mb-16 px-3 sm:px-6 lg:px-8 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className={cn(
                "group relative bg-white/90 backdrop-blur-xl p-3 sm:p-4 lg:p-6 rounded-3xl border shadow-lg shadow-ink/[0.03] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden",
                stat.borderColor
              )}
            >
              {/* Background gradient on hover */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                  stat.gradient
                )}
              />

              {/* Top Row: Icon & Badge */}
              <div className="flex items-center justify-between relative z-10">
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center font-bold shadow-inner group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: stat.tint, color: stat.accent }}
                >
                  <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <span
                  className={cn(
                    "lg:text-[10px] text-[8px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wide",
                    stat.textColor,
                    stat.borderColor
                  )}
                  style={{ backgroundColor: stat.tint }}
                >
                  {stat.badge}
                </span>
              </div>

              {/* Center: Number & Label */}
              <div className="mt-3 sm:mt-4 lg:mt-5 space-y-1 relative z-10">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-ink tracking-tight tabular-nums group-hover:text-primary transition-colors">
                  {stat.value}
                </h3>
                <p className="text-xs md:text-sm font-bold text-ink-muted">
                  {stat.label}
                </p>
                <p className="text-xs font-medium text-slate-400 pt-0.5">
                  {stat.subtext}
                </p>
              </div>

              {/* Bottom decorative bar */}
              <div className="mt-4 pt-3 border-t border-ink/5 flex items-center justify-between relative z-10">
                <span className="text-[11px] font-bold text-ink-muted flex items-center gap-1 group-hover:text-ink transition-colors">
                  Platform Verified
                </span>
                <div
                  className="w-2.5 h-2.5 rounded-full group-hover:scale-125 transition-transform shadow-xs"
                  style={{ backgroundColor: stat.accent }}
                />
              </div>
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

      {/* 🧭 How to Connect Section (Minimalist Clean Roadmap Timeline) */}
      <HowToConnectSection />

      {/* Tuition Types Section */}
      <section className="relative overflow-hidden py-14 sm:py-16">
        {/* section background — soft educational wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F4F9F7] via-[#FAFAF8] to-white" />
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/[0.05] blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-purple-500/[0.04] blur-3xl" />
        {/* faint dotted texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#001F3F 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative space-y-2 mb-10 text-center sm:text-left">
            <h2 className="relative inline-block text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#001F3F]">
              Tuition Types
              <svg
                className="absolute left-0 -bottom-2 w-full h-2.5 text-primary/70 pointer-events-none"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 12 C 60 2, 120 18, 180 8 C 220 2, 260 14, 298 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 font-medium pt-1">
              Find the best tuition format that fits your learning needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {[
              {
                title: "Home Tutoring",
                desc: "Personalized one-to-one learning in the comfort of your home.",
                icon: MapPin,
                color: "text-blue-600",
                bgColor: "bg-blue-50 border-blue-100",
                ring: "hover:border-blue-200",
              },
              {
                title: "Online Tutoring",
                desc: "Connect with top tutors anywhere via interactive digital live tools.",
                icon: GraduationCap,
                color: "text-purple-600",
                bgColor: "bg-purple-50 border-purple-100",
                ring: "hover:border-purple-200",
                featured: true,
              },
              {
                title: "Group Tutoring",
                desc: "Collaborative learning with peers at an affordable shared rate.",
                icon: Users,
                color: "text-emerald-600",
                bgColor: "bg-emerald-50 border-emerald-100",
                ring: "hover:border-emerald-200",
              },
            ].map((type, i) => (
              <div
                key={i}
                className={cn(
                  "group relative flex flex-col items-center text-center bg-white rounded-2xl border p-5 sm:p-6 transition-all duration-300 hover:shadow-md",
                  type.featured
                    ? "border-purple-200/80 shadow-xs ring-1 ring-purple-500/10"
                    : cn("border-slate-200/70 shadow-xs", type.ring)
                )}
              >
                {type.featured && (
                  <span className="absolute -top-2.5 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-bold tracking-wide shadow-xs">
                    Most Popular
                  </span>
                )}

                <div
                  className={cn(
                    "lg:w-12 lg:h-12 w-8 h-8 rounded-xl flex items-center justify-center mb-4 border transition-transform group-hover:scale-105 duration-300",
                    type.bgColor,
                    type.color
                  )}
                >
                  <type.icon size={36} />
                </div>

                <div className="space-y-3 flex-grow">
                  <h3 className="lg:text-2xl text-xl font-display font-bold text-[#001F3F]">
                    {type.title}
                  </h3>
                  <p className="text-ink-muted text-xs md:text-sm leading-relaxed max-w-[240px] mx-auto">
                    {type.desc}
                  </p>
                </div>

                <Link
                  to="/tutors"
                  className={cn(
                    "mt-8 inline-flex items-center gap-2 text-sm font-bold transition-colors",
                    type.color,
                    "hover:opacity-80"
                  )}
                >
                  Find Tutors
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== VIDEO TUTORIALS & GUIDELINES SECTION ===== */}
      <section className="relative overflow-hidden py-16 sm:py-20 border-b border-ink/5">
        {/* Section Background — soft educational wash with glowing ambient orbs */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F0FDF9]/80 via-[#F8FAFC] to-[#F1F5F9]/60" />
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[26rem] h-[26rem] rounded-full bg-amber-400/[0.08] blur-3xl pointer-events-none" />

        {/* Faint dot texture */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(13,148,136,0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header with curved underline */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="relative space-y-2">

              <h2 className="relative inline-block text-2xl md:text-3xl lg:text-[44px] font-display font-bold text-[#001F3F]">
                How Platform <span className='text-primary'>Works</span>
                <svg
                  className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 text-primary/70"
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 12 C 60 2, 120 18, 180 8 C 220 2, 260 14, 298 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </h2>

              <p className="text-base sm:text-lg text-ink-muted pt-2 font-medium">
                Watch our quick video guide to easily hire tutors or start tutoring
              </p>
            </div>

            <Link
              to="https://www.youtube.com/channel/UCl_xwK1dZoF2mR69K0H-lPw"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-ink/10 text-primary hover:bg-primary hover:text-white transition-all text-sm font-bold shadow-sm hover:shadow-md self-start sm:self-end group"
            >
              <Youtube size={17} className="text-red-600 group-hover:text-white transition-colors" />
              <span>All Tutorials</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 2-Column Grid: Left Video Card & Right Illustration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: 1 Featured Video Player (7 Cols) */}
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-[2rem] border border-ink/10 shadow-xl shadow-ink/[0.04] space-y-4"
              >
                {/* 16:9 Video Frame */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src="https://www.youtube.com/embed/zbOVbWhmuSU?autoplay=0&rel=0&modestbranding=1"
                    title="Platform Tutorial & Registration Guide"
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>

                {/* Video Info & Key Features */}
                <div className="px-2 pt-1 pb-2 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-ink">
                      Complete Guide: Tutor Registration & Parent Request
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                      Step-by-Step
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-medium">
                    Learn how to register as a verified tutor, apply for active tuitions, or post a tutor request as a parent in less than 2 minutes.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-ink/5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Easy 1-Min Signup</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>Fast Tutor Match</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>100% Free Support</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Illustration with Floating Badges (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Soft Ambient Backdrop */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/15 via-emerald-400/10 to-amber-300/15 rounded-full blur-3xl pointer-events-none -z-10" />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative w-full max-w-md mx-auto"
              >
                <motion.img
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  src={tutorialIllustration}
                  alt="Teacher Teaching Student"
                  className="w-full h-auto max-h-[380px] object-contain drop-shadow-md mx-auto"
                />

                {/* Floating Badge 1: Top Right */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-3 right-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-ink/5 flex items-center gap-2 text-xs font-bold text-ink"
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <GraduationCap size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] leading-tight text-ink font-bold">1-to-1 Care</p>
                    <p className="text-[9px] text-ink-muted">Personalized Teaching</p>
                  </div>
                </motion.div>

                {/* Floating Badge 2: Bottom Left */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-3 left-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-ink/5 flex items-center gap-2 text-xs font-bold text-ink"
                >
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] leading-tight text-ink font-bold">Concept Clear</p>
                    <p className="text-[9px] text-ink-muted">Step by step progress</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== EXPLORE CATEGORIES SECTION ===== */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent border-y border-ink/5">
        {/* Ambient Glow Blobs */}
        <div className="absolute top-0 left-1/3 w-[30rem] h-[30rem] bg-primary/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-10 w-[26rem] h-[26rem] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Delicate Dot Grid Texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="relative space-y-2">
              <h2 className="relative inline-block text-2xl md:text-3xl lg:text-[44px] font-display font-bold text-[#001F3F]">
                Explore <span className="text-primary">Categories</span>
                <svg
                  className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 text-primary/70"
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M2 12 C 60 2, 120 18, 180 8 C 220 2, 260 14, 298 6"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </h2>

              <p className="text-xs md:text-base sm:text-lg text-ink-muted pt-2 font-medium max-w-2xl">
                Find the perfect tutor across a wide range of subjects, classes, and special skills tailored to your needs.
              </p>
            </div>

            <Link
              to="/categories"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-ink/10 text-primary hover:bg-primary hover:text-white transition-all text-xs md:text-sm font-bold shadow-sm hover:shadow-md self-start sm:self-end group shrink-0"
            >
              <span>View All Categories</span>
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {CATEGORIES_DATA.slice(0, 8).map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -6 }}
              >
                <Link
                  to={`/jobs?category=${encodeURIComponent(category.title)}`}
                  className="relative h-56 rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group block border border-ink/10"
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    referrerPolicy="no-referrer"
                    onError={(e: any) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800';
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Multi-gradient backdrop for readability & style */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 group-hover:from-black/95 transition-colors" />

                  {/* Top Badge: Subjects Count */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-xs">
                      {category.items.length} Subjects
                    </span>
                  </div>

                  {/* Card Content Bottom */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end z-10">
                    <div className="space-y-2">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform", category.color)}>
                        <category.icon size={20} />
                      </div>
                      <h3 className="text-white font-bold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {category.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs font-semibold text-white/70 pt-1 border-t border-white/10 group-hover:text-white transition-colors">
                        <span>Browse Tuitions</span>
                        <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛣️ The Ways Tutors Can Connect With Us (Interactive Animated Roadmap Timeline) */}
      <TutorRoadmapTimeline />

      {/* 🚀 IT & Software Services Section */}
      <ITServicesSection />

      {/* 🏆 Why Choose Us? (Redesigned Section with Curved Underline & Animated Vectors) */}
      <WhyChooseUsSection />

      {/* 📚 Blogs & Education Insights Section */}
      <HomeBlogsSection />

      {/* 💬 What People Say (Redesigned Testimonials Showcase with Trust Metrics) */}
      <TestimonialsSection />


      {/* ❓ Frequently Asked Questions (2-Column Interactive FAQ with Illustration) */}
      <HomeFAQSection />
    </div>
  );
}

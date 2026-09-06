import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star, MapPin, GraduationCap, ChevronRight, ShieldCheck,
  BookOpen, Eye, Send, ArrowLeft, Heart,
  Calendar, Clock, CheckCircle2, User, Award, Check,
  Building2, Briefcase, Share2, AlertCircle, Phone, Lock,
  Sparkles, DollarSign, School
} from 'lucide-react';
import { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { TutorProfileService } from '@/src/services/tutorProfileService.ts';
import { HireService } from '@/src/services/hireService.ts';
import { RecommendationService } from '@/src/services/recommendationService.ts';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { SavedTutorsRepository } from '@/src/repositories/savedTutorsRepository.ts';

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [tutor, setTutor] = useState<any | null>(null);
  const [suggestedTutors, setSuggestedTutors] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'tuition' | 'education' | 'bio' | 'reviews'>('tuition');
  const [isLoading, setIsLoading] = useState(true);

  // Direct Hire / Contact Form State
  const [guardianName, setGuardianName] = useState(user?.name || '');
  const [guardianPhone, setGuardianPhone] = useState(user?.phone || '');
  const [studentClass, setStudentClass] = useState('');
  const [subjectsNeeded, setSubjectsNeeded] = useState('');
  const [salaryOffer, setSalaryOffer] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      setIsLoading(true);
      try {
        if (!id) {
          setTutor(null);
          setSuggestedTutors([]);
          return;
        }

        const profile = await TutorProfileService.getById(id);
        if (!profile) {
          setTutor(null);
          setSuggestedTutors([]);
          return;
        }

        setTutor(profile);

        const all = await TutorProfileService.getAll();
        const suggestions = RecommendationService.getSimilarTutors(profile as unknown as TutorProfile, (all || []) as unknown as TutorProfile[]);
        const suggested = suggestions.slice(0, 3).map((entry) => entry.item);

        setSuggestedTutors(suggested);
      } catch (error) {
        console.error('Failed to load tutor profile:', error);
        setTutor(null);
        setSuggestedTutors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutor();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    SavedTutorsRepository.list()
      .then((saved) => {
        setIsSaved(saved.some((s) => String(s.tutorId) === String(id)));
      })
      .catch(() => { });
  }, [id]);

  const handleToggleSave = async () => {
    if (!id) return;
    setSaveLoading(true);
    try {
      if (isSaved) {
        await SavedTutorsRepository.remove(id);
        setIsSaved(false);
      } else {
        await SavedTutorsRepository.save(id, user?.uid);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName.trim() || !guardianPhone.trim() || !tutor) return;

    setIsSubmitting(true);
    try {
      const tutorTargetUserId = String(tutor.userId?._id || tutor.userId || tutor._id || id);
      const tutorProfileLocDistrict = typeof tutor.location === 'object' ? tutor.location?.district : (tutor.tuitionDistrict || 'Dhaka');
      const tutorProfileLocArea = typeof tutor.location === 'object' ? tutor.location?.area : (tutor.preferredArea || '');

      await HireService.create({
        tutorId: tutorTargetUserId,
        tutorName: tutor.name || (tutor.userId?.name) || 'Tutor',
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        guardianEmail: user?.email || '',
        studentClass: studentClass.trim(),
        subjects: subjectsNeeded ? subjectsNeeded.split(',').map((s) => s.trim()).filter(Boolean) : [],
        salaryOffer: salaryOffer || 'Negotiable',
        requirements: requirements.trim() || 'Direct tutor request from profile.',
        location: {
          district: tutorProfileLocDistrict,
          area: tutorProfileLocArea,
        },
        status: 'Pending',
      });

      setSubmitSuccess(true);
      setRequirements('');
      setSubjectsNeeded('');
      setStudentClass('');
      setSalaryOffer('');
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (error) {
      console.error('Error submitting hire request:', error);
      alert('রিকোয়েস্ট সাবমিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // Skeleton Loader State
  // ───────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-4 sm:pt-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

          {/* Top Bar Skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-9 w-36 bg-slate-200 rounded-xl animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 bg-slate-200 rounded-xl animate-pulse" />
              <div className="h-9 w-24 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* Left Column Skeleton */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-6 shadow-sm">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-slate-200 animate-pulse" />
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-60 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-6 w-20 bg-slate-100 rounded-lg animate-pulse" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="h-3 w-14 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                </div>

                <div className="h-12 w-full bg-slate-200 rounded-2xl animate-pulse" />
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-2">
                <div className="h-4 w-44 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-full bg-slate-200/60 rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-slate-200/60 rounded animate-pulse" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tabs Bar Skeleton */}
              <div className="h-12 bg-white rounded-2xl border border-slate-200/80 p-1.5 flex gap-2">
                <div className="flex-1 bg-slate-200 rounded-xl animate-pulse" />
                <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
                <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
                <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
              </div>

              {/* Tab Content Box Skeleton */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <div className="h-5 w-56 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="h-3 w-72 bg-slate-100 rounded animate-pulse" />
                </div>

                <div className="space-y-3">
                  <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-8 w-32 bg-slate-100 rounded-xl animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-8 w-24 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-8 w-28 bg-slate-100 rounded-xl animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                  <div className="h-12 w-full bg-slate-50 rounded-2xl border border-slate-100 animate-pulse" />
                </div>
              </div>

              {/* Direct Hire Box Skeleton */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="h-6 w-52 bg-slate-200 rounded-lg animate-pulse" />
                <div className="h-3 w-80 bg-slate-100 rounded animate-pulse" />
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                  <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <User size={32} />
          </div>
          <h2 className="text-xl font-display font-black text-slate-900">টিউটর প্রোফাইল পাওয়া যায়নি</h2>
          <p className="text-xs text-slate-500 font-medium">অনুরোধকৃত প্রোফাইলটি বর্তমানে উপলব্ধ নেই অথবা সরানো হয়েছে।</p>
          <Link
            to="/tutors"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
          >
            <ArrowLeft size={14} /> সকল টিউটর তালিকা দেখুন
          </Link>
        </div>
      </div>
    );
  }

  const tutorUser = typeof tutor.userId === 'object' ? tutor.userId : {};
  const displayName = tutorUser?.name || tutor.name || tutor.fullName || 'Registered Tutor';
  const displayAvatar = tutorUser?.avatar || tutor.photoUrl || tutor.avatar;
  const rating = Number(tutor.rating || 5.0);
  const reviewCount = Number(tutor.reviewCount || 0);
  const totalCompleted = Number(tutor.totalTuitionsCompleted || 0);
  const isVerified = Boolean(tutor.isVerified !== false);
  const tutorTargetUserId = String(tutorUser?._id || tutor.userId || tutor._id || id);

  const locDistrict = typeof tutor.location === 'object' ? tutor.location?.district : (tutor.tuitionDistrict || 'Dhaka');
  const locArea = typeof tutor.location === 'object' ? tutor.location?.area : (tutor.preferredArea || 'All Areas');
  const fullLocStr = [locArea, locDistrict].filter(Boolean).join(', ') || 'ঢাকা, বাংলাদেশ';

  const expectedSalaryFormatted = tutor.salary
    ? `৳ ${Number(tutor.salary).toLocaleString()} / মাস`
    : (tutor.expectedSalary ? `৳ ${tutor.expectedSalary} / মাস` : 'আলোচনা সাপেক্ষে');

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-4 sm:pt-8 font-sans">

      {/* Toast Alert */}
      <AnimatePresence>
        {copiedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <Check size={14} className="text-emerald-400" />
            <span>প্রোফাইল লিংক কপি করা হয়েছে!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/tutors"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs transition-colors"
          >
            <ArrowLeft size={15} />
            <span>টিউটর তালিকায় ফিরুন</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProfile}
              title="Share Profile"
              className="p-2 bg-white text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200/80 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">শেয়ার</span>
            </button>

            {user && ['student', 'guardian'].includes(user.role || '') && (
              <button
                onClick={handleToggleSave}
                disabled={saveLoading}
                className={cn(
                  'px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs',
                  isSaved
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-rose-50 hover:text-rose-600'
                )}
              >
                <Heart size={14} className={isSaved ? 'fill-rose-500 text-rose-500' : ''} />
                <span>{isSaved ? 'সংরক্ষিত' : 'সেভ করুন'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ─────────────────────────────────────────────────────────── */}
          {/* Left Column: Tutor Profile Hero Card (lg:col-span-5) */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Main Tutor Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">

              {/* Photo & Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-slate-100 border-2 border-slate-200 shadow-sm overflow-hidden">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-full h-full object-cover rounded-2xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || 'tutor')}`;
                        }}
                      />
                    ) : (
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName || 'tutor')}`}
                        alt={displayName}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    )}
                  </div>
                  {isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-md border-2 border-white" title="Verified Tutor">
                      <ShieldCheck size={18} />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {displayName}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-primary mt-0.5">
                    {tutor.department || 'Academic Tutor'} {tutor.university ? `• ${tutor.university}` : ''}
                  </p>
                </div>

                {/* Badge Row */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-black rounded-lg border border-emerald-200">
                      <ShieldCheck size={13} className="text-emerald-700" /> ভেরিফাইড শিক্ষক
                    </span>
                  )}
                  {tutor.isPremium && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800 text-[11px] font-black rounded-lg border border-amber-200">
                      <Sparkles size={13} className="text-amber-600" /> প্রিমিয়াম টিউটর
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50/90 text-amber-900 text-[11px] font-black rounded-lg border border-amber-200">
                    <Star size={13} className="text-amber-500 fill-amber-400" />
                    <span>{rating.toFixed(1)}</span>
                    <span className="text-[10px] text-amber-700">({reviewCount} রিভিউ)</span>
                  </span>
                </div>
              </div>

              {/* Key Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-700">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">প্রত্যাশিত বেতন</span>
                  <span className="text-emerald-700 font-black text-sm">{expectedSalaryFormatted}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">মোট সফল টিউশন</span>
                  <span className="text-slate-900 font-black text-sm">{totalCompleted > 0 ? `${totalCompleted} টি সম্পন্ন` : 'নতুন ভেরিফাইড'}</span>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">পড়ানো এলাকা</span>
                  <span className="text-slate-800 line-clamp-1">{fullLocStr}</span>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">অভিজ্ঞতা</span>
                  <span className="text-slate-800">{tutor.experience || tutor.experienceYears || 'অভিজ্ঞ টিউটর'}</span>
                </div>
              </div>

              {/* Quick Specs List */}
              <div className="space-y-2.5 text-xs divide-y divide-slate-100 font-medium text-slate-600">
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 font-bold">জেন্ডার:</span>
                  <span className="font-bold text-slate-800">{tutor.gender || 'Male'}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 font-bold">টিউশন স্টাইল:</span>
                  <span className="font-bold text-slate-800">{tutor.tutoringStyle || 'হোম ও অনলাইন টিউশন'}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 font-bold">সপ্তাহে সময়:</span>
                  <span className="font-bold text-slate-800">{tutor.daysPerWeek || '৩-৪ দিন / সপ্তাহ'}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-400 font-bold">মিডিয়াম প্রেফারেন্স:</span>
                  <span className="font-bold text-slate-800">{Array.isArray(tutor.mediums) ? tutor.mediums.join(', ') : (tutor.preferredMedium || 'Bangla & English Medium')}</span>
                </div>
              </div>


            </div>

            {/* Privacy & Safety Guarantee Card */}
            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-3xl space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center gap-2 text-slate-900 font-black">
                <Lock size={15} className="text-amber-600" />
                <span>যোগাযোগের তথ্যের নিরাপত্তা নীতি</span>
              </div>
              <p className="text-[11px] text-slate-500">
                শিক্ষক ও অভিভাবক উভয়ের গোপনীয়তা ও সুরক্ষা নিশ্চিত করতে সরাসরি ফোন নম্বর ও ইমেইল পাবলিকলি গোপন রাখা হয়। টিউশন রিকোয়েস্ট সাবমিট বা কনফার্মেশন হওয়ার পর পূর্ণ যোগাযোগের নম্বর উন্মুক্ত হয়।
              </p>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* Right Column: Detailed Tabs & Direct Hire Box (lg:col-span-7) */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Tab Navigation Segmented Pills */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto">
              {[
                { id: 'tuition', label: 'টিউশন সংক্রান্ত তথ্য', icon: BookOpen },
                { id: 'education', label: 'শিক্ষাগত যোগ্যতা', icon: GraduationCap },
                { id: 'bio', label: 'শিক্ষকের পরিচিতি', icon: User },
                { id: 'reviews', label: `মতামত (${reviewCount})`, icon: Star },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap',
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    )}
                  >
                    <Icon size={14} className={isActive ? 'text-primary' : 'text-slate-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Tuition Info */}
            {activeTab === 'tuition' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                    <BookOpen size={18} className="text-primary" />
                    পড়ানোর বিষয় ও টিউশন প্রেফারেন্স
                  </h3>
                  <p className="text-xs text-slate-500">শিক্ষক যেসকল বিষয়, শ্রেণী ও এলাকায় পাঠদান করতে আগ্রহী</p>
                </div>

                {/* Preferred Subjects */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    পড়ানোর বিষয়সমূহ (Preferred Subjects):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(tutor.subjects) && tutor.subjects.length > 0 ? (
                      tutor.subjects.map((sub: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">সকল সাধারণ বিষয়সমূহ</span>
                    )}
                  </div>
                </div>

                {/* Preferred Classes */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    উপযুক্ত শ্রেণী ও লেভেল (Preferred Classes):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(tutor.preferredClasses) && tutor.preferredClasses.length > 0 ? (
                      tutor.preferredClasses.map((cls: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold border border-blue-200"
                        >
                          {cls}
                        </span>
                      ))
                    ) : (
                      <span className="px-3.5 py-1.5 bg-blue-50 text-blue-900 rounded-xl text-xs font-bold border border-blue-200">
                        {tutor.studentClass || 'Class 1 to 12 & Admission'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Covered Areas */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> যেসব এলাকায় গিয়ে পড়াতে পারবেন (Covered Areas):
                  </span>
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs font-bold text-slate-800">
                    {Array.isArray(tutor.preferredAreas) && tutor.preferredAreas.length > 0
                      ? tutor.preferredAreas.join(', ')
                      : (tutor.preferredArea || fullLocStr)}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Academic Qualifications */}
            {activeTab === 'education' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                    <GraduationCap size={18} className="text-primary" />
                    শিক্ষাগত পটভূমি ও সার্টিফিকেশন
                  </h3>
                  <p className="text-xs text-slate-500">টিউটরের প্রাতিষ্ঠানিক ডিগ্রি ও পরীক্ষার ফলাফল</p>
                </div>

                <div className="space-y-4">
                  {/* Graduation / Current Study */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Building2 size={18} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            {tutor.university || tutor.gradInstitute || 'বিশ্ববিদ্যালয় পর্যায়ে অধ্যয়নরত / স্নাতক'}
                          </h4>
                          <p className="text-xs font-bold text-slate-600">
                            {tutor.department || tutor.gradDept || 'বিভাগ সংক্রান্ত তথ্য সংরক্ষিত'}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                        {tutor.gradYear || 'Current Study'}
                      </span>
                    </div>
                    {tutor.qualification && (
                      <p className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                        ডিগ্রি / কোয়ালিফিকেশন: <strong>{tutor.qualification}</strong>
                      </p>
                    )}
                  </div>

                  {/* HSC Summary (if exists in doc) */}
                  {(tutor.hscInstitute || tutor.hscResult) && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <School size={16} className="text-primary" />
                          <h5 className="text-xs font-black text-slate-900">
                            HSC / A-Level: {tutor.hscInstitute || 'College'}
                          </h5>
                        </div>
                        {tutor.hscResult && (
                          <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            GPA: {tutor.hscResult}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Group: {tutor.hscGroup || 'Science'} • Year: {tutor.hscYear || 'N/A'} • {tutor.hscCurriculum || 'Bangla Medium'}
                      </p>
                    </div>
                  )}

                  {/* SSC Summary (if exists in doc) */}
                  {(tutor.sscInstitute || tutor.sscResult) && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <School size={16} className="text-primary" />
                          <h5 className="text-xs font-black text-slate-900">
                            SSC / O-Level: {tutor.sscInstitute || 'School'}
                          </h5>
                        </div>
                        {tutor.sscResult && (
                          <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            GPA: {tutor.sscResult}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Group: {tutor.sscGroup || 'Science'} • Year: {tutor.sscYear || 'N/A'} • {tutor.sscCurriculum || 'Bangla Medium'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Bio & Teaching Philosophy */}
            {activeTab === 'bio' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-1">
                    <User size={18} className="text-primary" />
                    শিক্ষকের পরিচিতি ও পাঠদান পদ্ধতি
                  </h3>
                  <p className="text-xs text-slate-500">শিক্ষকের নিজস্ব বক্তব্য ও পড়ানোর কৌশল</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-800 leading-relaxed font-medium">
                  {tutor.bio ? (
                    <p className="whitespace-pre-line">{tutor.bio}</p>
                  ) : (
                    <p className="text-slate-500 italic">
                      "আমি শিক্ষার্থীদের বেসিক ক্লিয়ার করে পাঠদানে বিশ্বাসী। নিয়মিত অধ্যায়ভিত্তিক পরীক্ষা, হোমওয়ার্ক মূল্যায়ন এবং দুর্বল বিষয়গুলোতে বিশেষ যত্ন দিয়ে শিক্ষার্থীকে পরীক্ষার জন্য শতভাগ প্রস্তুত করে তুলি।"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Reviews */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-4 text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Star size={24} className="fill-amber-400 text-amber-500" />
                </div>
                <h3 className="text-base font-black text-slate-900">অভিভাবক ও শিক্ষার্থীদের মতামত</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {reviewCount > 0
                    ? `এই শিক্ষক মোট ${reviewCount} টি পজিটিভ রিভিউ ও গড়ে ${rating.toFixed(1)} স্টার রেটিং পেয়েছেন।`
                    : 'টিউশন সম্পন্ন হওয়ার পর অভিভাবক ও শিক্ষার্থীরা এখানে তাদের মতামত যুক্ত করতে পারবেন।'}
                </p>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────── */}
            {/* Direct Hire / Tuition Request Form Card */}
            {/* ───────────────────────────────────────────────────────── */}
            <div id="hire-request-section" className="bg-white rounded-3xl border-2 border-primary/20 shadow-md p-6 sm:p-8 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    Direct Hire
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    এই শিক্ষককে আপনার টিউশনে হায়ার করুন
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আপনার টিউশনের চাহিদা পূরণ করে রিকোয়েস্ট পাঠান। আমাদের টিম দ্রুত আপনার সাথে যোগাযোগ করে টিউশন নিশ্চিত করবে।
                  </p>
                </div>
              </div>

              {submitSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-black text-emerald-950">টিউশন রিকোয়েস্ট সফলভাবে জমা হয়েছে!</h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    আমাদের প্রতিনিধি শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করে শিক্ষককে আপনার টিউশনে কনফার্ম করে দেবেন।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleHireSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">আপনার নাম (Guardian / Student)</label>
                      <input
                        type="text"
                        required
                        placeholder="আপনার পূর্ণ নাম লিখুন"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">মোবাইল নম্বর</label>
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">শিক্ষার্থীর শ্রেণী (Class)</label>
                      <input
                        type="text"
                        placeholder="যেমন: Class 9, HSC 1st Year"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">যে বিষয়গুলো পড়াতে হবে</label>
                      <input
                        type="text"
                        placeholder="যেমন: Math, Physics, Chemistry"
                        value={subjectsNeeded}
                        onChange={(e) => setSubjectsNeeded(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">অতিরিক্ত কোনো শর্ত বা বার্তা (ঐচ্ছিক)</label>
                    <textarea
                      rows={2}
                      placeholder="পড়ানোর সময়, দিন বা বিশেষ কোনো চাহিদা থাকলে লিখুন..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-primary text-white hover:bg-primary-dark rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                  >
                    <Send size={15} />
                    <span>{isSubmitting ? 'রিকোয়েস্ট পাঠানো হচ্ছে...' : 'হায়ার রিকোয়েস্ট পাঠান (Send Request)'}</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>

        {/* ─────────────────────────────────────────────────────────── */}
        {/* Suggested Tutors Section */}
        {/* ─────────────────────────────────────────────────────────── */}
        {suggestedTutors.length > 0 && (
          <div className="pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900">একই এলাকার অন্যান্য সেরা শিক্ষক</h3>
                <p className="text-xs text-slate-500">অনুরূপ অভিজ্ঞতা ও বিষয়ের অন্যান্য ভেরিফাইড শিক্ষক</p>
              </div>
              <Link
                to="/tutors"
                className="text-xs font-black text-primary hover:underline flex items-center gap-1"
              >
                সকল শিক্ষক দেখুন <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {suggestedTutors.map((st: any) => {
                const sName = st.name || st.userId?.name || 'Tutor';
                const sAvatar = st.photoUrl || st.userId?.avatar;
                const sSal = st.salary ? `৳ ${Number(st.salary).toLocaleString()}` : 'আলোচনা সাপেক্ষে';

                return (
                  <div
                    key={st.id || st._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={sAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sName)}`}
                          alt={sName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 line-clamp-1">{sName}</h4>
                        <p className="text-[11px] font-bold text-slate-500 line-clamp-1">{st.university || 'University Graduate'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                      <span className="text-emerald-700">{sSal}</span>
                      <Link
                        to={`/tutor/${st._id || st.id}`}
                        className="text-primary hover:underline font-black flex items-center gap-1"
                      >
                        প্রোফাইল দেখুন <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* Mobile Sticky Bottom Action Bar (App-like UX) */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-lg">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => {
              const hireForm = document.getElementById('hire-request-section');
              if (hireForm) {
                hireForm.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Send size={15} />
            <span>এই শিক্ষককে হায়ার রিকোয়েস্ট পাঠান</span>
          </button>
        </div>
      </div>

    </div>
  );
}
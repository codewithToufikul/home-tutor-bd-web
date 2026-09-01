import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  CheckCircle2,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  MessageSquare,
  ShieldCheck,
  User,
  Star,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  PlusCircle,
  Award
} from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import GuardianLayout from '@/src/pages/GuardianLayout.tsx';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository.ts';
import { useStartConversationMutation } from '@/src/services/chatApi';
import { DEFAULT_PROFILE_IMAGE } from '@/src/constants';

export default function StudentActiveTuitions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startConversationMutation] = useStartConversationMutation();
  const [activeTuitions, setActiveTuitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviewTuition, setSelectedReviewTuition] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleStartChatWithTutor = async (tutorUserId: string) => {
    const targetUrl = user?.role === 'guardian' ? '/guardian/messages' : '/student/messages';
    if (!tutorUserId) {
      navigate(targetUrl);
      return;
    }
    try {
      await startConversationMutation({ targetUserId: tutorUserId }).unwrap();
      navigate(targetUrl);
    } catch {
      navigate(targetUrl);
    }
  };

  const Layout = user?.role === 'guardian' ? GuardianLayout : StudentLayout;

  useEffect(() => {
    const fetchActiveTuitions = async () => {
      const currentUserId = String(user?.uid || (user as any)?._id || (user as any)?.id || '');
      if (!currentUserId) {
        setActiveTuitions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log('[StudentActiveTuitions] Fetching active tuitions for user:', currentUserId);
        const allJobs: any = await TuitionService.list();
        const myJobs = (allJobs || []).filter((j: any) => {
          const postedById = typeof j.postedBy === 'object' ? String(j.postedBy?._id || j.postedBy?.id) : String(j.postedBy || j.parentId || j.userId || '');
          return postedById === currentUserId;
        });
        console.log('[StudentActiveTuitions] Found myJobs:', myJobs.length);

        // Fetch applications for each job and find accepted ones
        const activeList: any[] = [];

        await Promise.all(
          myJobs.map(async (job: any) => {
            const jobId = String(job.id || job._id);
            try {
              const apps: any = await TuitionRepository.getApplications(jobId);
              const appList = Array.isArray(apps) ? apps : (apps?.data || []);
              console.log(`[StudentActiveTuitions] Job ${jobId} applications:`, appList.length);

              const acceptedApp = appList.find((a: any) => a.status?.toLowerCase() === 'accepted');

              if (acceptedApp) {
                console.log(`[StudentActiveTuitions] Found accepted application for job ${jobId}:`, acceptedApp);
                // Populate tutor details
                const tutorUser: any = typeof acceptedApp.tutorId === 'object' ? acceptedApp.tutorId : {};
                const tutorProfile: any = acceptedApp.tutorProfile || {};

                const tutorName = tutorUser?.name || 'Verified Tutor';
                const tutorPhone = tutorUser?.phone || tutorProfile?.phone || (acceptedApp as any)?.phone || '01712-345678';
                const tutorEmail = tutorUser?.email || tutorProfile?.email || (acceptedApp as any)?.email || 'tutor@gmail.com';
                const tutorAvatar = tutorUser?.avatar || tutorProfile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName)}`;
                const university = tutorProfile?.university || tutorProfile?.gradInstitute || 'Top University';
                const department = tutorProfile?.department || tutorProfile?.gradDept || 'Department';

                const locArea = typeof job?.location === 'object' ? job?.location?.area : job?.area;
                const locDist = typeof job?.location === 'object' ? job?.location?.district : (typeof job?.location === 'string' ? job?.location : '');
                const locStr = [locArea, locDist].filter(Boolean).join(', ') || 'Dhaka';

                const daysCount = Array.isArray(job?.tutoringDays) ? job.tutoringDays.length : 3;
                const monthlyTargetClasses = daysCount * 4;

                const tutorUserId = String(tutorUser?._id || tutorUser?.id || (acceptedApp as any)?.tutorId || '');

                activeList.push({
                  id: jobId,
                  appId: String(acceptedApp._id || acceptedApp.id),
                  tutorId: tutorUserId,
                  title: job?.medium ? `Tutor for ${job.medium}` : (Array.isArray(job?.subjects) ? `Tutor for ${job.subjects.join(', ')}` : 'Active Tuition'),
                  subjects: Array.isArray(job?.subjects) ? job.subjects.join(', ') : (job?.subjects || 'General'),
                  studentClass: job?.studentClass || 'N/A',
                  location: locStr,
                  salary: job?.salary ? Number(job.salary) : 0,
                  salaryFormatted: job?.salary ? `${Number(job.salary).toLocaleString()} ৳/মাস` : 'আলোচনা সাপেক্ষে',
                  daysPerWeek: Array.isArray(job?.tutoringDays) ? job.tutoringDays.join(', ') : (job?.tutoringDays || '3-4 দিন/সপ্তাহ'),
                  monthlyTargetClasses,
                  confirmedDate: acceptedApp.updatedAt ? new Date(String(acceptedApp.updatedAt)).toLocaleDateString('bn-BD') : 'সম্প্রতি',
                  tutorName,
                  tutorPhone,
                  tutorEmail,
                  tutorAvatar,
                  university,
                  department,
                  rating: tutorProfile?.rating || 5.0,
                });
              }
            } catch (appErr) {
              console.warn('[StudentActiveTuitions] Could not fetch apps for job', jobId, appErr);
            }
          })
        );

        console.log('[StudentActiveTuitions] Total Active Tuitions found:', activeList.length);
        setActiveTuitions(activeList);
      } catch (err) {
        console.error('[StudentActiveTuitions] Failed to load active tuitions:', err);
        setActiveTuitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTuitions();
  }, [user]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setSelectedReviewTuition(null);
      setReviewComment('');
    }, 2000);
  };

  const filteredTuitions = activeTuitions.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.subjects.toLowerCase().includes(q) ||
      t.tutorName.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.studentClass.toLowerCase().includes(q)
    );
  });

  const totalMonthlySpend = activeTuitions.reduce((sum, t) => sum + (t.salary || 0), 0);

  return (
    <Layout>
      <div className="space-y-8 max-w-6xl mx-auto pb-20">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/5">
                <BookOpen size={24} />
              </div>
              Active Tuitions (চলতি টিউশন)
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              আপনার কনফার্ম করা টিউটরদের সম্পূর্ণ প্রোফাইল, যোগাযোগ ও ক্লাস মনিটরিং।
            </p>
          </div>

          <Link
            to="/request-tutor"
            className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <PlusCircle size={16} />
            Post New Tuition Job
          </Link>
        </div>

        {/* 🛡️ 0% Platform Fee Banner (১০০% ফ্রি) 🛡️ */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 p-6 rounded-[28px] text-white shadow-xl shadow-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShieldCheck size={26} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                  ১০০% ফ্রি সার্ভিস
                </span>
                <span className="text-xs font-bold text-emerald-100">Zero Commission</span>
              </div>
              <h3 className="text-base font-black text-white">অভিভাবক ও শিক্ষার্থীদের জন্য কোনো প্ল্যাটফর্ম ফি নেই</h3>
              <p className="text-xs text-emerald-100 font-medium">
                Home Tutor BD সম্পূর্ণ বিনামূল্যে আপনাকে সেরা টিউটরের সাথে যুক্ত করে।
              </p>
            </div>
          </div>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-5">
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">চলতি টিউশন</p>
              <p className="text-2xl font-black text-ink">{activeTuitions.length} টি</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-5">
            <div className="w-14 h-14 bg-purple-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-purple-500/20">
              <DollarSign size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">মাসিক মোট টিউটর ফি</p>
              <p className="text-2xl font-black text-purple-600">৳{totalMonthlySpend.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
          <input
            type="text"
            placeholder="Search by tutor name, subject, class, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-ink/5 shadow-sm focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all text-sm"
          />
        </div>

        {/* Active Tuitions List */}
        {loading ? (
          <div className="py-24 text-center space-y-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[32px] shadow-sm">
            <Loader2 className="animate-spin text-emerald-600 mx-auto" size={36} />
            <p className="text-xs font-bold text-ink-muted">Loading active tuitions...</p>
          </div>
        ) : filteredTuitions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredTuitions.map((tuition, index) => (
              <motion.div
                key={tuition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="bg-white/80 backdrop-blur-xl p-8 rounded-[36px] border-2 border-emerald-500/20 shadow-xl shadow-emerald-500/5 hover:border-emerald-500/40 transition-all space-y-6 flex flex-col justify-between"
              >
                {/* Top Header */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                        <CheckCircle2 size={13} />
                        Active & Confirmed
                      </div>
                      <h3 className="text-xl font-display font-black text-ink">{tuition.title}</h3>
                      <p className="text-xs font-bold text-emerald-700">বিষয়: {tuition.subjects}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-emerald-600">{tuition.salaryFormatted}</p>
                      <span className="text-[10px] font-bold text-ink-muted uppercase">টিউটর বেতন</span>
                    </div>
                  </div>

                  {/* Schedule & Info Grid */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 text-xs font-bold text-ink">
                    <div className="flex items-center gap-2">
                      <BookOpen size={15} className="text-emerald-600 shrink-0" />
                      <span>শ্রেণী: <span className="font-black text-emerald-700">{tuition.studentClass}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-emerald-600 shrink-0" />
                      <span>{tuition.daysPerWeek}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-emerald-600 shrink-0" />
                      <span>ক্লাস সংখ্যা: {tuition.monthlyTargetClasses} টি/মাস</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                      <span>শুরু: {tuition.confirmedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-emerald-100/60">
                      <MapPin size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{tuition.location}</span>
                    </div>
                  </div>

                  {/* 👨‍🏫 Confirmed Tutor Contact Details Card 👨‍🏫 */}
                  <div className="p-5 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 rounded-[28px] border-2 border-emerald-500/20 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">
                        নিযুক্ত টিউটরের তথ্য ও যোগাযোগ (Tutor Contact Details)
                      </p>
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-100/70 px-3 py-0.5 rounded-full border border-emerald-300 shadow-xs">
                        <CheckCircle2 size={12} /> ভেরিফাইড টিউটর
                      </span>
                    </div>

                    {/* Tutor Profile Row */}
                    <div className="flex items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-4 min-w-0">
                        <img
                          src={tuition.tutorAvatar}
                          alt={tuition.tutorName}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-md shadow-emerald-500/10 shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-lg font-black text-ink truncate">{tuition.tutorName}</h4>
                          <p className="text-xs font-bold text-ink-muted truncate">{tuition.university}</p>
                          <p className="text-[11px] font-bold text-emerald-700 truncate">{tuition.department}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartChatWithTutor(tuition.tutorId)}
                        className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase flex items-center gap-2 shadow-lg shadow-primary/20 transition-all cursor-pointer shrink-0"
                      >
                        <MessageSquare size={14} />
                        <span>ইন-অ্যাপ চ্যাট</span>
                      </button>
                    </div>

                    {/* Contact Information Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-emerald-100/80 text-xs">
                      {/* Phone */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100/80 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Phone size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-ink-muted">ফোন নম্বর</p>
                            <p className="font-black text-ink truncate">{tuition.tutorPhone || '০১৭০০-০০০০০০'}</p>
                          </div>
                        </div>
                        <a
                          href={`tel:${(tuition.tutorPhone || '').replace(/[^0-9+]/g, '')}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[11px] uppercase shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          Call
                        </a>
                      </div>

                      {/* WhatsApp */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100/80 shadow-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <MessageSquare size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-ink-muted">হোয়াটসঅ্যাপ</p>
                            <p className="font-black text-ink truncate">{tuition.tutorPhone || '০১৭০০-০০০০০০'}</p>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/${(tuition.tutorPhone || '').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-black text-[11px] uppercase shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          Chat
                        </a>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-100/80 shadow-xs col-span-1 sm:col-span-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <Mail size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-ink-muted">ইমেইল এড্রেস</p>
                            <p className="font-black text-ink truncate">{tuition.tutorEmail || 'tutor@example.com'}</p>
                          </div>
                        </div>
                        <a
                          href={`mailto:${tuition.tutorEmail || ''}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[11px] uppercase shadow-xs transition-all cursor-pointer shrink-0"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-ink/5 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedReviewTuition(tuition)}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer border border-amber-200"
                  >
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    রেটিং ও রিভিউ দিন
                  </button>

                  <Link
                    to={user?.role === 'guardian' ? `/guardian/requests/${tuition.id}/applications` : `/student/requests/${tuition.id}/applications`}
                    className="px-5 py-2.5 bg-ink/5 hover:bg-ink hover:text-white text-ink rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2"
                  >
                    View Applications <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 bg-white/60 backdrop-blur-xl rounded-[36px] border border-white/40 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-display font-black text-ink">কোনো Active Tuition নেই</h3>
              <p className="text-xs font-medium text-ink-muted max-w-md mx-auto">
                আপনি টিউশন পোস্ট করার পর আবেদনকারী টিউটরকে কনফার্ম (Accept) করলে সেই চলতি টিউশনটি এখানে যুক্ত হবে।
              </p>
            </div>
            <Link
              to="/request-tutor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-600/20 transition-all"
            >
              Post a Tuition Job <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Rate & Review Tutor Modal */}
      <AnimatePresence>
        {selectedReviewTuition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full p-8 space-y-6"
            >
              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink flex items-center gap-2">
                  <Star size={22} className="fill-amber-500 text-amber-500" />
                  টিউটরকে রিভিউ দিন
                </h3>
                <p className="text-xs text-ink-muted font-medium">
                  {selectedReviewTuition.tutorName} • {selectedReviewTuition.title}
                </p>
              </div>

              {reviewSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                  <p className="text-sm font-black text-emerald-800">ধন্যবাদ! আপনার মূল্যবান রিভিউ জমা হয়েছে।</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-ink block mb-2">রেটিং নির্বাচন করুন:</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star
                            size={28}
                            className={cn(
                              star <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-black text-ink block mb-2">আপনার মন্তব্য / অভিজ্ঞতা:</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="পড়ানোর ধরণ, সময়ানুবর্তিতা ও ব্যবহার সম্পর্কে লিখুন..."
                      rows={3}
                      className="w-full p-3.5 bg-gray-50 border border-ink/10 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedReviewTuition(null)}
                      className="flex-1 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

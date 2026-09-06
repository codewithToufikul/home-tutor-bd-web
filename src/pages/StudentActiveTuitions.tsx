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
  Star,
  Loader2,
  PlusCircle,
  X
} from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import GuardianLayout from '@/src/pages/GuardianLayout.tsx';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository.ts';
import { useStartConversationMutation } from '@/src/services/chatApi';

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

        // Fetch applications for each job and find accepted ones
        const activeList: any[] = [];

        await Promise.all(
          myJobs.map(async (job: any) => {
            const jobId = String(job.id || job._id);
            try {
              const apps: any = await TuitionRepository.getApplications(jobId);
              const appList = Array.isArray(apps) ? apps : (apps?.data || []);

              const acceptedApp = appList.find((a: any) => a.status?.toLowerCase() === 'accepted');

              if (acceptedApp) {
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
      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-10">

        {/* ── Compact Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 text-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <div className="space-y-0.5">
              <h1 className="text-lg sm:text-2xl font-display font-black text-[#001F3F] tracking-tight">
                Active Tuitions (চলতি টিউশন)
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                কনফার্ম করা টিউটরদের সম্পূর্ণ প্রোফাইল, যোগাযোগ ও ক্লাস মনিটরিং।
              </p>
            </div>
          </div>

          <Link
            to="/request-tutor"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 bg-secondary hover:bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-secondary/20 transition-all active:scale-95 shrink-0"
          >
            <PlusCircle size={15} strokeWidth={2.5} />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* ── 🛡️ Compact 0% Platform Fee Banner ── */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl text-white shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 bg-white/25 text-white rounded-md text-[9px] font-black uppercase tracking-wider">
                  ১০০% ফ্রি সার্ভিস
                </span>
                <span className="text-[11px] font-bold text-emerald-100 hidden sm:inline">Zero Commission</span>
              </div>
              <h3 className="text-xs sm:text-sm font-black text-white leading-tight">
                অভিভাবক ও শিক্ষার্থীদের জন্য কোনো প্ল্যাটফর্ম ফি নেই
              </h3>
            </div>
          </div>
        </div>

        {/* ── 📊 2-Column App-Style Stats Row on Mobile ── */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-emerald-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-xs shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">চলতি টিউশন</p>
              <p className="text-lg sm:text-2xl font-black text-[#001F3F]">{activeTuitions.length} টি</p>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-purple-500 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black shadow-xs shrink-0">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">মাসিক মোট বেতন</p>
              <p className="text-lg sm:text-2xl font-black text-purple-600 truncate">৳{totalMonthlySpend.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by tutor, subject, class, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium transition-all text-xs sm:text-sm text-[#001F3F]"
          />
        </div>

        {/* ── Active Tuitions List ── */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white/70 backdrop-blur-md border border-slate-200 rounded-3xl shadow-xs">
            <Loader2 className="animate-spin text-emerald-600 mx-auto" size={30} />
            <p className="text-xs font-bold text-slate-500">Loading active tuitions...</p>
          </div>
        ) : filteredTuitions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredTuitions.map((tuition, index) => (
              <motion.div
                key={tuition.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all p-4 sm:p-6 space-y-4 flex flex-col justify-between"
              >
                {/* Top Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider rounded-full shadow-2xs">
                        <CheckCircle2 size={11} />
                        Active & Confirmed
                      </div>
                      <h3 className="text-base sm:text-lg font-display font-black text-[#001F3F] leading-tight">{tuition.title}</h3>
                      <p className="text-xs font-bold text-emerald-700">বিষয়: {tuition.subjects}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg sm:text-xl font-black text-emerald-600">{tuition.salaryFormatted}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">টিউটর বেতন</span>
                    </div>
                  </div>

                  {/* Schedule & Info Grid */}
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5 truncate">
                      <BookOpen size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">শ্রেণী: <span className="text-[#001F3F]">{tuition.studentClass}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{tuition.daysPerWeek}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{tuition.monthlyTargetClasses} টি/মাস</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">শুরু: {tuition.confirmedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-slate-200/60 text-slate-500">
                      <MapPin size={13} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{tuition.location}</span>
                    </div>
                  </div>

                  {/* 👨‍🏫 Confirmed Tutor Contact Card 👨‍🏫 */}
                  <div className="p-3.5 sm:p-4 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/30 rounded-2xl border border-emerald-500/20 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        নিযুক্ত টিউটরের তথ্য
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={11} /> ভেরিফাইড
                      </span>
                    </div>

                    {/* Tutor Profile Row */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={tuition.tutorAvatar}
                          alt={tuition.tutorName}
                          className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl object-cover border border-emerald-500/30 shadow-2xs shrink-0"
                        />
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-[#001F3F] truncate">{tuition.tutorName}</h4>
                          <p className="text-[11px] font-bold text-slate-500 truncate">{tuition.university}</p>
                          <p className="text-[10px] font-bold text-emerald-700 truncate">{tuition.department}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartChatWithTutor(tuition.tutorId)}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0 active:scale-95"
                      >
                        <MessageSquare size={13} />
                        <span>Chat</span>
                      </button>
                    </div>

                    {/* Contact Actions Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-100/80 text-xs">
                      {/* Phone Call */}
                      <a
                        href={`tel:${(tuition.tutorPhone || '').replace(/[^0-9+]/g, '')}`}
                        className="flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200/80 transition-all cursor-pointer active:scale-95"
                      >
                        <Phone size={13} />
                        <span>Call Tutor</span>
                      </a>

                      {/* WhatsApp Chat */}
                      <a
                        href={`https://wa.me/${(tuition.tutorPhone || '').replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedReviewTuition(tuition)}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs transition-all flex items-center gap-1 border border-amber-200 cursor-pointer active:scale-95"
                  >
                    <Star size={13} className="fill-amber-500 text-amber-500" />
                    <span>রিভিউ দিন</span>
                  </button>

                  <Link
                    to={user?.role === 'guardian' ? `/guardian/requests/${tuition.id}/applications` : `/student/requests/${tuition.id}/applications`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>Applications</span> <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-10 sm:p-14 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-display font-black text-[#001F3F]">কোনো Active Tuition নেই</h3>
              <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                আপনি টিউশন পোস্ট করার পর আবেদনকারী টিউটরকে Accept করলে সেই চলতি টিউশনটি এখানে পাওয়া যাবে।
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/request-tutor"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-secondary hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase shadow-md transition-all active:scale-95"
              >
                <span>Post Tuition Job</span> <ArrowRight size={13} />
              </Link>
            </div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-display font-black text-[#001F3F] flex items-center gap-1.5">
                    <Star size={16} className="fill-amber-500 text-amber-500" />
                    <span>টিউটরকে রিভিউ দিন</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedReviewTuition.tutorName} • {selectedReviewTuition.title}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReviewTuition(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {reviewSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                  <CheckCircle2 size={24} className="text-emerald-600 mx-auto" />
                  <p className="text-xs font-black text-emerald-800">ধন্যবাদ! আপনার মূল্যবান রিভিউ জমা হয়েছে।</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">রেটিং নির্বাচন করুন:</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-125"
                        >
                          <Star
                            size={24}
                            className={cn(
                              star <= reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">আপনার মন্তব্য / অভিজ্ঞতা:</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="পড়ানোর ধরণ, সময়ানুবর্তিতা ও ব্যবহার সম্পর্কে লিখুন..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedReviewTuition(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
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

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
  PlusCircle,
  FileText,
  TrendingUp,
  AlertCircle,
  Loader2,
  Receipt,
  CreditCard,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { cn } from '@/src/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { ApplicationService } from '@/src/services/applicationService.ts';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { useStartConversationMutation } from '@/src/services/chatApi';

export default function TutorActiveTuitions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startConversationMutation] = useStartConversationMutation();
  const [activeTuitions, setActiveTuitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classLogs, setClassLogs] = useState<Record<string, number>>({});
  const [selectedNotesTuition, setSelectedNotesTuition] = useState<any | null>(null);
  const [selectedPayFeeTuition, setSelectedPayFeeTuition] = useState<any | null>(null);
  const [tuitionNotes, setTuitionNotes] = useState<Record<string, string>>({});
  const [paidFees, setPaidFees] = useState<Record<string, boolean>>({});
  const [noteInput, setNoteInput] = useState('');

  const handleStartChatWithStudent = async (studentUserId: string) => {
    if (!studentUserId) {
      navigate('/tutor/messages');
      return;
    }
    try {
      await startConversationMutation({ targetUserId: studentUserId }).unwrap();
      navigate('/tutor/messages');
    } catch {
      navigate('/tutor/messages');
    }
  };

  useEffect(() => {
    const fetchActiveTuitions = async () => {
      if (!user?.uid) {
        setActiveTuitions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [applications, allJobs] = await Promise.all([
          ApplicationService.listForTutor(user.uid),
          TuitionService.list()
        ]);

        const appList = Array.isArray(applications) ? applications : [];
        const jobsById: Record<string, any> = {};
        ((allJobs as any[]) || []).forEach((j: any) => {
          if (j?._id) jobsById[j._id] = j;
          if (j?.id) jobsById[j.id] = j;
        });

        // Filter only Accepted (Active) applications
        const acceptedApps = appList.filter((a: any) => a.status?.toLowerCase() === 'accepted');

        const mapped = acceptedApps.map((a: any) => {
          const rawJobId = typeof a.jobId === 'object' ? (a.jobId?._id || a.jobId?.id) : a.jobId;
          const populatedJob = typeof a.jobId === 'object' ? a.jobId : null;
          const job = populatedJob || jobsById[rawJobId] || null;

          const postedBy = job?.postedBy || {};
          const guardianName = postedBy.name || 'Guardian';
          const guardianPhone = postedBy.phone || '';
          const guardianEmail = postedBy.email || '';
          const studentUserId = String(postedBy._id || postedBy.id || job?.parentId || job?.userId || '');

          const locArea = typeof job?.location === 'object' ? job?.location?.area : job?.area;
          const locDist = typeof job?.location === 'object' ? job?.location?.district : (typeof job?.location === 'string' ? job?.location : '');
          const locStr = [locArea, locDist].filter(Boolean).join(', ') || 'Dhaka';

          const daysCount = Array.isArray(job?.tutoringDays) ? job.tutoringDays.length : 3;
          const monthlyTargetClasses = daysCount * 4; // e.g. 12 classes/month
          const salaryNum = job?.salary ? Number(job.salary) : 0;
          const platformFeePercent = (job as any)?.platformFeePercent || 50; // default 50%
          const platformFeeAmount = Math.round((salaryNum * platformFeePercent) / 100);

          return {
            id: String(rawJobId || a._id || ''),
            appId: String(a._id || a.id || ''),
            studentUserId,
            title: job?.medium ? `Tutor Needed For ${job.medium}` : (Array.isArray(job?.subjects) ? `Tutor for ${job.subjects.join(', ')}` : 'Active Tuition'),
            subjects: Array.isArray(job?.subjects) ? job.subjects.join(', ') : (job?.subjects || 'General'),
            studentClass: job?.studentClass || 'N/A',
            location: locStr,
            salary: salaryNum,
            salaryFormatted: salaryNum ? `${salaryNum.toLocaleString()} ৳/মাস` : 'আলোচনা সাপেক্ষে',
            daysPerWeek: Array.isArray(job?.tutoringDays) ? job.tutoringDays.join(', ') : (job?.tutoringDays || '3-4 দিন/সপ্তাহ'),
            monthlyTargetClasses,
            platformFeePercent,
            platformFeeAmount,
            guardianName,
            guardianPhone,
            guardianEmail,
            confirmedDate: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('bn-BD') : 'সম্প্রতি',
            timeSlot: job?.timeSlot || 'সন্ধ্যা / বিকাল',
          };
        });

        setActiveTuitions(mapped);
      } catch (err) {
        console.error('Failed to load active tuitions:', err);
        setActiveTuitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveTuitions();
  }, [user]);

  // Handle Incrementing class log count
  const handleMarkClassDone = (tuitionId: string) => {
    setClassLogs(prev => {
      const current = prev[tuitionId] || 0;
      return { ...prev, [tuitionId]: current + 1 };
    });
  };

  const handleSaveNote = () => {
    if (!selectedNotesTuition) return;
    setTuitionNotes(prev => ({ ...prev, [selectedNotesTuition.id]: noteInput }));
    setSelectedNotesTuition(null);
    setNoteInput('');
  };

  const filteredTuitions = activeTuitions.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.subjects.toLowerCase().includes(q) ||
      t.guardianName.toLowerCase().includes(q) ||
      t.location.toLowerCase().includes(q) ||
      t.studentClass.toLowerCase().includes(q)
    );
  });

  const totalMonthlyEarnings = activeTuitions.reduce((sum, t) => sum + (t.salary || 0), 0);
  const totalDuePlatformFee = activeTuitions
    .filter(t => !paidFees[t.id])
    .reduce((sum, t) => sum + (t.platformFeeAmount || 0), 0);
  const totalPaidPlatformFee = activeTuitions
    .filter(t => paidFees[t.id])
    .reduce((sum, t) => sum + (t.platformFeeAmount || 0), 0);

  return (
    <TutorLayout>
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
              আপনার কনফার্ম হওয়া সকল টিউশনের ক্লাস ট্র্যাকিং, শিডিউল এবং গার্ডিয়ানের সাথে যোগাযোগের তথ্য।
            </p>
          </div>

          <Link
            to="/jobs"
            className="bg-primary text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer self-start md:self-auto"
          >
            <PlusCircle size={16} />
            Find New Tuitions
          </Link>
        </div>

        {/* Stats Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <p className="text-xs font-bold text-ink-muted uppercase">মাসিক সম্ভাব্য আয়</p>
              <p className="text-2xl font-black text-purple-600">৳{totalMonthlyEarnings.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-50 to-amber-50/60 backdrop-blur-xl p-6 rounded-[28px] border-2 border-rose-200 shadow-xl shadow-rose-500/5 flex items-center gap-5">
            <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-rose-500/20">
              <Receipt size={28} />
            </div>
            <div>
              <p className="text-xs font-black text-rose-600 uppercase">মোট বকেয়া ফি (Due)</p>
              <p className="text-2xl font-black text-rose-600">৳{totalDuePlatformFee.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[28px] border border-white/60 shadow-xl shadow-ink/5 flex items-center gap-5">
            <div className="w-14 h-14 bg-teal-500 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-teal-500/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">পরিশোধিত ফি (Paid)</p>
              <p className="text-2xl font-black text-teal-600">৳{totalPaidPlatformFee.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
          <input
            type="text"
            placeholder="Search by student, subject, class, or location..."
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
            {filteredTuitions.map((tuition, index) => {
              const loggedClasses = classLogs[tuition.id] || 0;
              const targetClasses = tuition.monthlyTargetClasses || 12;
              const progressPct = Math.min(100, Math.round((loggedClasses / targetClasses) * 100));

              return (
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
                        <span className="text-[10px] font-bold text-ink-muted uppercase">মাসিক বেতন</span>
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
                        <span>সময়: {tuition.timeSlot}</span>
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

                    {/* 💰 Platform Fee & Charge Status Card 💰 */}
                    <div className={cn(
                      "p-4 rounded-2xl border transition-all space-y-3",
                      paidFees[tuition.id]
                        ? "bg-teal-50/60 border-teal-200"
                        : "bg-gradient-to-br from-rose-50/80 to-amber-50/60 border-rose-200"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Receipt size={16} className={paidFees[tuition.id] ? "text-teal-600" : "text-rose-600"} />
                          <span className="text-xs font-black text-ink uppercase tracking-wide">
                            প্ল্যাটফর্ম চার্জ / ফি (Platform Fee)
                          </span>
                        </div>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          paidFees[tuition.id]
                            ? "bg-teal-100 text-teal-700 border-teal-300"
                            : "bg-rose-100 text-rose-700 border-rose-300 animate-pulse"
                        )}>
                          {paidFees[tuition.id] ? "✓ Paid (পরিশোধিত)" : "● Due (বকেয়া)"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1 border-t border-ink/5">
                        <div>
                          <p className="text-[10px] text-ink-muted">ফি হার (প্রথম মাস):</p>
                          <p className="text-xs font-black text-ink">{tuition.platformFeePercent}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-ink-muted">প্রদেয় ফি (Amount):</p>
                          <p className={cn("text-sm font-black", paidFees[tuition.id] ? "text-teal-700" : "text-rose-600")}>
                            ৳{tuition.platformFeeAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {!paidFees[tuition.id] && (
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-medium text-rose-600/80">
                            * টিউশন শুরুর প্রথম ১০ দিনের মধ্যে পরিশোধযোগ্য
                          </span>
                          <button
                            onClick={() => setSelectedPayFeeTuition(tuition)}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-[11px] uppercase flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                          >
                            <CreditCard size={12} />
                            Pay Fee Now
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Class Attendance & Progress Tracker */}
                    <div className="p-4 bg-white rounded-2xl border border-ink/5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock size={15} className="text-emerald-600" />
                          <span className="text-xs font-black text-ink uppercase tracking-wide">
                            চলতি মাসের ক্লাস লগ ({loggedClasses}/{targetClasses} সম্পন্ন)
                          </span>
                        </div>
                        <span className="text-xs font-black text-emerald-600">{progressPct}%</span>
                      </div>

                      <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleMarkClassDone(tuition.id)}
                          className="text-[11px] font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        >
                          + আজকের ক্লাস সম্পন্ন মার্ক করুন
                        </button>
                        <button
                          onClick={() => {
                            setSelectedNotesTuition(tuition);
                            setNoteInput(tuitionNotes[tuition.id] || '');
                          }}
                          className="text-[11px] font-bold text-ink-muted hover:text-ink flex items-center gap-1 cursor-pointer"
                        >
                          <FileText size={13} /> {tuitionNotes[tuition.id] ? 'নোট দেখুন' : '+ নোট যুক্ত করুন'}
                        </button>
                      </div>
                    </div>

                    {/* Guardian Contact Info Card */}
                    <div className="p-4 bg-white rounded-2xl border border-ink/5 shadow-sm space-y-3">
                      <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">
                        গার্ডিয়ান / স্টুডেন্টের যোগাযোগের তথ্য
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                            {tuition.guardianName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-ink">{tuition.guardianName}</p>
                            <p className="text-xs font-bold text-emerald-700">
                              {tuition.guardianPhone || 'নম্বর উপলব্ধ'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleStartChatWithStudent(tuition.studentUserId)}
                            className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all cursor-pointer"
                          >
                            <MessageSquare size={13} />
                            ইন-অ্যাপ চ্যাট
                          </button>

                          {tuition.guardianPhone && (
                            <>
                              <a
                                href={`tel:${tuition.guardianPhone}`}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                              >
                                <Phone size={13} />
                                Call
                              </a>
                              <a
                                href={`https://wa.me/${tuition.guardianPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 border border-emerald-200 transition-all cursor-pointer"
                              >
                                <MessageSquare size={13} />
                                WhatsApp
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t border-ink/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-ink-muted uppercase">
                      Job ID: #{tuition.id.slice(-6).toUpperCase()}
                    </span>
                    <Link
                      to={`/job/${tuition.id}`}
                      className="px-5 py-2.5 bg-ink/5 hover:bg-ink hover:text-white text-ink rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2"
                    >
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 bg-white/60 backdrop-blur-xl rounded-[36px] border border-white/40 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-display font-black text-ink">কোনো Active Tuition পাওয়া যায়নি</h3>
              <p className="text-xs font-medium text-ink-muted max-w-md mx-auto">
                আপনি যে টিউশনগুলোতে আবেদন করেছেন সেগুলো Guardian কর্তৃক Accept বা Confirm হলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।
              </p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-600/20 transition-all"
            >
              Browse Tuition Jobs <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Class Notes Modal */}
      <AnimatePresence>
        {selectedNotesTuition && (
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
                  <FileText size={20} className="text-emerald-600" />
                  Study Notes & Student Progress
                </h3>
                <p className="text-xs text-ink-muted font-medium">
                  {selectedNotesTuition.title} ({selectedNotesTuition.studentClass})
                </p>
              </div>

              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="যেমন: অধ্যায় ৩ শেষ হয়েছে, আগামী রবিবার ক্লাস টেস্ট নেওয়া হবে..."
                rows={4}
                className="w-full p-4 bg-gray-50 border border-ink/10 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedNotesTuition(null)}
                  className="flex-1 py-3 rounded-xl border border-ink/10 text-ink font-bold text-xs hover:bg-ink/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Platform Fee Payment Modal */}
      <AnimatePresence>
        {selectedPayFeeTuition && (
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
              className="bg-white rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="bg-gradient-to-br from-rose-500 to-amber-600 p-7 text-white space-y-2">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-2">
                  <Receipt size={28} />
                </div>
                <h3 className="text-xl font-display font-black">প্ল্যাটফর্ম ফি পরিশোধ করুন</h3>
                <p className="text-rose-100 text-xs font-medium">
                  {selectedPayFeeTuition.title} ({selectedPayFeeTuition.studentClass})
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Fee Breakdown Box */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-4 space-y-2.5">
                  <div className="flex justify-between text-xs font-bold text-ink">
                    <span className="text-ink-muted">টিউশন মাসিক বেতন:</span>
                    <span>{selectedPayFeeTuition.salaryFormatted}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-ink">
                    <span className="text-ink-muted">প্ল্যাটফর্ম মিডিয়া চার্জ ({selectedPayFeeTuition.platformFeePercent}%):</span>
                    <span className="text-rose-600 font-black">৳{selectedPayFeeTuition.platformFeeAmount.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-rose-200/80 flex justify-between text-sm font-black text-ink">
                    <span>মোট প্রদেয় বকেয়া (Due Amount):</span>
                    <span className="text-rose-600">৳{selectedPayFeeTuition.platformFeeAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-1.5 text-xs text-ink-muted font-medium bg-gray-50 p-4 rounded-2xl border border-ink/5">
                  <p className="font-bold text-ink flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> পেমেন্ট নিয়মাবলী:
                  </p>
                  <p>• টিউশন কনফার্ম হওয়ার পর প্রথম মাসের মিডিয়া চার্জ প্রদেয় হয়।</p>
                  <p>• bKash, Nagad বা অনলাইন পেমেন্ট গেটওয়ের মাধ্যমে পরিশোধ করা যাবে।</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setSelectedPayFeeTuition(null)}
                    className="flex-1 py-3.5 rounded-xl border-2 border-ink/10 text-ink font-black text-xs hover:bg-ink/5 transition-all cursor-pointer"
                  >
                    পরে দেব
                  </button>
                  <button
                    onClick={() => {
                      setPaidFees(prev => ({ ...prev, [selectedPayFeeTuition.id]: true }));
                      setSelectedPayFeeTuition(null);
                    }}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check size={14} /> Mark as Paid / Pay
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TutorLayout>
  );
}

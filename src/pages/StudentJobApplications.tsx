import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Users, Sparkles, CheckCircle2, ShieldCheck, 
  MapPin, BookOpen, Clock, Check, X, Phone, Mail, User, AlertTriangle,
  Shield, Eye, EyeOff, Lock, FileText, Star, Info, MessageSquare
} from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import GuardianLayout from './GuardianLayout';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository';
import { ApplicationRepository } from '@/src/repositories/applicationRepository';
import { useStartConversationMutation } from '@/src/services/chatApi';

export default function StudentJobApplications() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<any | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [shortlisted, setShortlisted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'applications' | 'matches'>('applications');

  const [startConversationMutation] = useStartConversationMutation();
  // Custom Modal State
  const [acceptModal, setAcceptModal] = useState<{ open: boolean; appId: string; tutorName: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<{ open: boolean; appId: string } | null>(null);
  const [successModal, setSuccessModal] = useState<{ open: boolean; message: string } | null>(null);

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

  const loadData = async () => {
    if (!jobId) return;
    setLoading(true);
    try {
      const [jobData, appsData, shortData] = await Promise.all([
        TuitionService.get(jobId),
        TuitionRepository.getApplications(jobId).catch(() => []),
        TuitionRepository.getShortlisted(jobId).catch(() => ({ shortlistedTutors: [] })),
      ]);

      setJob(jobData);
      setApplications(Array.isArray(appsData) ? appsData : []);
      
      // Filter only 85+ score matches
      const rawShortlist = Array.isArray(shortData)
        ? shortData
        : (shortData as any)?.shortlistedTutors || (jobData as any)?.shortlistedTutors || [];
      const filteredShortlist = rawShortlist.filter((m: any) => (m.score || 0) >= 85);
      setShortlisted(filteredShortlist);
    } catch (err) {
      console.error('Failed to load job applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [jobId]);

  const handleAcceptApp = async (appId: string, tutorName: string) => {
    setAcceptModal({ open: true, appId, tutorName });
  };

  const confirmAccept = async () => {
    if (!acceptModal) return;
    setAcceptModal(null);
    setActionLoading(true);
    try {
      await ApplicationRepository.accept(acceptModal.appId);
      setSuccessModal({ open: true, message: '🎉 অভিনন্দন! টিউটর সফলভাবে কনফার্ম করা হয়েছে। এখন যোগাযোগের তথ্য দৃশ্যমান হয়েছে।' });
      await loadData();
    } catch (err: any) {
      setSuccessModal({ open: true, message: `❌ ${err.message || 'সমস্যা হয়েছে। আবার চেষ্টা করুন।'}` });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApp = async (appId: string) => {
    setRejectModal({ open: true, appId });
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    setRejectModal(null);
    setActionLoading(true);
    try {
      await ApplicationRepository.reject(rejectModal.appId);
      setSuccessModal({ open: true, message: '✅ আবেদনটি প্রত্যাখ্যান করা হয়েছে।' });
      await loadData();
    } catch (err: any) {
      setSuccessModal({ open: true, message: `❌ ${err.message || 'সমস্যা হয়েছে।'}` });
    } finally {
      setActionLoading(false);
    }
  };

  const subjectsStr = Array.isArray(job?.subjects) ? job.subjects.join(', ') : job?.category || 'Tuition';
  const locStr = typeof job?.location === 'object' ? `${job.location?.area || ''}, ${job.location?.district || ''}` : `${job?.area || ''}, ${job?.location || ''}`;

  const Layout = user?.role === 'guardian' ? GuardianLayout : StudentLayout;
  const backPath = user?.role === 'guardian' ? '/guardian/requests' : '/student/requests';

  return (
    <Layout>
      {/* ───────────────────────────────────────────────────────── */}
      {/* Accept Confirmation Modal */}
      <AnimatePresence>
        {acceptModal?.open && (
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
              className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-display font-black">টিউটর নিশ্চিত করুন</h2>
                <p className="text-emerald-100 text-sm mt-1 font-medium">
                  <span className="text-white font-black">{acceptModal.tutorName}</span>-কে Accept করার আগে নিচের শর্তগুলো পড়ুন
                </p>
              </div>

              {/* Policy Content */}
              <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">

                {/* Privacy Policy */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-700 font-black text-sm">
                    <Lock size={16} /> গোপনীয়তা নীতি (Privacy Policy)
                  </div>
                  <ul className="space-y-1.5 text-xs text-blue-800 font-medium">
                    <li className="flex items-start gap-2"><EyeOff size={12} className="mt-0.5 shrink-0" /> Accept-এর আগে টিউটরের ব্যক্তিগত তথ্য (নাম, ফোন, ছবি) সম্পূর্ণ গোপন থাকে।</li>
                    <li className="flex items-start gap-2"><Eye size={12} className="mt-0.5 shrink-0" /> Accept করার পরেই শুধুমাত্র যোগাযোগের নম্বর ও প্রোফাইল দৃশ্যমান হবে।</li>
                    <li className="flex items-start gap-2"><Shield size={12} className="mt-0.5 shrink-0" /> টিউটরের ব্যক্তিগত তথ্য তৃতীয় পক্ষের সাথে শেয়ার করা সম্পূর্ণ নিষিদ্ধ।</li>
                  </ul>
                </div>

                {/* Platform Rules */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 font-black text-sm">
                    <FileText size={16} /> প্ল্যাটফর্ম বিধিমালা
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-800 font-medium">
                    <li className="flex items-start gap-2"><Star size={12} className="mt-0.5 shrink-0" /> একটি টিউশনে শুধুমাত্র একজন টিউটর Confirm করা যাবে।</li>
                    <li className="flex items-start gap-2"><Info size={12} className="mt-0.5 shrink-0" /> Accept করলে অন্য সকল আবেদন স্বয়ংক্রিয়ভাবে বাতিল হয়ে যাবে।</li>
                    <li className="flex items-start gap-2"><AlertTriangle size={12} className="mt-0.5 shrink-0" /> টিউটর নির্বাচনে সততা বজায় রাখুন — অহেতুক Accept/Reject প্ল্যাটফর্মে আপনার বিশ্বাসযোগ্যতা কমায়।</li>
                    <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 shrink-0" /> টিউশন সফলভাবে শেষ হলে রিভিউ দিন — এটি অন্য গার্ডিয়ানদের সিদ্ধান্ত নিতে সাহায্য করে।</li>
                  </ul>
                </div>

                {/* Contact Info Note */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                    <Phone size={16} /> Accept করলে কী হবে?
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-800 font-medium">
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0" /> টিউটরের পূর্ণ নাম, ফোন নম্বর ও ছবি দৃশ্যমান হবে।</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0" /> টিউটরও আপনার যোগাযোগের তথ্য দেখতে পাবেন।</li>
                    <li className="flex items-start gap-2"><CheckCircle2 size={12} className="mt-0.5 shrink-0" /> উভয়পক্ষই সরাসরি যোগাযোগ করতে পারবেন।</li>
                  </ul>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={() => setAcceptModal(null)}
                  className="flex-1 py-4 rounded-2xl border-2 border-ink/10 text-ink font-black text-sm hover:bg-ink/5 transition-all cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={confirmAccept}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check size={16} /> হ্যাঁ, Confirm করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Reject Confirmation Modal */}
      <AnimatePresence>
        {rejectModal?.open && (
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
              className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="bg-gradient-to-br from-rose-500 to-red-600 p-8 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                  <X size={32} />
                </div>
                <h2 className="text-2xl font-display font-black">আবেদন প্রত্যাখ্যান</h2>
                <p className="text-rose-100 text-sm mt-1 font-medium">আপনি কি নিশ্চিতভাবে এই আবেদনটি Reject করতে চান?</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
                  <p className="text-xs text-rose-800 font-medium leading-relaxed">
                    <span className="font-black">⚠️ মনে রাখুন:</span> Reject করলে এই টিউটর আর এই টিউশনে আবেদন করতে পারবেন না। প্রয়োজনে অন্য আবেদন দেখুন।
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setRejectModal(null)}
                    className="flex-1 py-4 rounded-2xl border-2 border-ink/10 text-ink font-black text-sm hover:bg-ink/5 transition-all cursor-pointer"
                  >
                    না, ফিরে যাই
                  </button>
                  <button
                    onClick={confirmReject}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-sm shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <X size={16} /> হ্যাঁ, Reject করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────── */}
      {/* Success / Error Toast Modal */}
      <AnimatePresence>
        {successModal?.open && (
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
              className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary text-3xl">
                {successModal.message.startsWith('❌') ? '❌' : '🎉'}
              </div>
              <p className="text-sm font-bold text-ink leading-relaxed">{successModal.message.replace(/^(🎉|✅|❌)\s*/, '')}</p>
              <button
                onClick={() => setSuccessModal(null)}
                className="w-full py-3 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                ঠিক আছে
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-28 lg:pb-16">
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
          >
            <ArrowLeft size={15} /> <span>Back to My Requests</span>
          </button>
        </div>

        {/* Job Header Card */}
        {job && (
          <div className="bg-white p-4 sm:p-6 lg:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full uppercase">
                  Job ID: {job.customId || `#${String(job._id || job.id).slice(-6)}`}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                  job.status === 'Matched' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Status: {job.status || 'Open'}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                বেতন: ৳ {job.salary ? job.salary.toLocaleString() : 'Negotiable'} / মাস
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-base sm:text-xl font-display font-black text-[#001F3F] leading-tight">
                Tutor Needed for {subjectsStr} ({job.studentClass || 'Class N/A'})
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs font-semibold text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <BookOpen size={14} className="text-secondary" /> {job.medium ? (job.medium.toLowerCase().includes('medium') || job.medium.toLowerCase().includes('version') ? job.medium : `${job.medium} Medium`) : 'General'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-secondary" /> {locStr}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-secondary" /> {job.tutoringDays?.join(', ') || 'Negotiable days'}
                </span>
              </div>
            </div>

            {/* Privacy Notice Banner (No Emojis) */}
            <div className="bg-amber-50/90 border border-amber-200 p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black mb-0.5 text-[#001F3F]">আবেদনকারী টিউটর প্রোফাইল তথ্য:</strong>
                টিউটরের আসল নাম, ছবি, শিক্ষা প্রতিষ্ঠান, যোগ্যতা ও অভিজ্ঞতা সরাসরি দেখা যাবে। শুধুমাত্র ব্যক্তিগত ফোন নম্বর ও ইমেইল টিউটর নিশ্চিত (Accept) করার পর উন্মুক্ত হবে।
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation (No Emojis, Clean Lucide Icons) */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'applications'
                ? 'bg-secondary text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Users size={15} /> <span>Received Applications ({applications.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'matches'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Sparkles size={15} /> <span>AI Matched Tutors ({shortlisted.length})</span>
          </button>
        </div>

        {/* Tab 1: Applications */}
        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-slate-400 animate-pulse">
            লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন...
          </div>
        ) : activeTab === 'applications' ? (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-ink/10 text-center space-y-3">
                <Users size={40} className="text-ink-muted/30 mx-auto" />
                <h3 className="text-base font-black text-ink">এখনও কোনো টিউটর আবেদন করেননি</h3>
                <p className="text-xs text-ink-muted">টিউটররা আপনার জবে আবেদন করলে এখানে তাদের তালিকা দেখতে পাবেন।</p>
              </div>
            ) : (
              applications.map((app) => {
                const appId = String(app._id || app.id);
                const isAccepted = app.status === 'Accepted';
                const tutorUser = app.tutorId || {};
                const tutorProfile = app.tutorProfile || {};
                const tutorSnapshot = app.tutorSnapshot || {};

                const tutorName = tutorUser.name || tutorSnapshot.name || 'Registered Tutor';
                const tutorAvatar = tutorUser.avatar || tutorSnapshot.avatar;
                const university = tutorProfile.university || tutorSnapshot.university || '';
                const department = tutorProfile.department || tutorSnapshot.department || '';
                const qualification = tutorProfile.qualification || tutorSnapshot.qualification || '';
                const experience = tutorProfile.experience || tutorSnapshot.experience || '';
                const isVerified = tutorProfile.isVerified !== undefined ? tutorProfile.isVerified : true;
                const rating = Number(tutorProfile.rating || 0);
                const reviewCount = Number(tutorProfile.reviewCount || 0);
                const totalCompleted = Number(tutorProfile.totalTuitionsCompleted || 0);

                return (
                  <motion.div
                    key={appId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-3xl border transition-all space-y-4 ${
                      isAccepted
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-ink/10 shadow-sm hover:border-ink/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl overflow-hidden border shadow-sm shrink-0 ${
                          isAccepted ? 'bg-emerald-600 text-white border-emerald-300' : 'bg-slate-100 text-ink-muted border-slate-200'
                        }`}>
                          {tutorAvatar ? (
                            <img 
                              src={tutorAvatar} 
                              alt={tutorName} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName || 'tutor')}`;
                              }}
                            />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName || 'tutor')}`} 
                              alt={tutorName} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-[#001F3F]">
                              {tutorName}
                            </h3>
                            {isVerified && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1 border border-emerald-200">
                                <ShieldCheck size={12} className="text-emerald-700" /> Verified Tutor
                              </span>
                            )}
                            {(app.isAutoShortlisted || (app.matchScore && app.matchScore >= 85)) && (
                              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full flex items-center gap-1 border border-purple-200">
                                <Sparkles size={12} className="text-purple-600" /> AI Matched ({app.matchScore || 90}%)
                              </span>
                            )}
                          </div>

                          {/* Academic Credentials & Performance Badges */}
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                            {/* Rating badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                              <Star size={13} className="text-amber-500 fill-amber-400" />
                              <span>{rating > 0 ? rating.toFixed(1) : '5.0'}</span>
                              {reviewCount > 0 && <span className="text-[10px] text-amber-700 font-semibold">({reviewCount})</span>}
                            </span>

                            {/* Total Tuitions Completed */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>{totalCompleted > 0 ? `${totalCompleted} টি সফল টিউশন` : 'নতুন ভেরিফাইড শিক্ষক'}</span>
                            </span>

                            {university && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800">
                                <BookOpen size={13} className="text-secondary" /> {university}
                              </span>
                            )}
                            {department && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                                {department}
                              </span>
                            )}
                            {qualification && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-100">
                                {qualification}
                              </span>
                            )}
                            {experience && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg border border-purple-100">
                                <Clock size={13} className="text-purple-700" /> {experience}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status & Match badge */}
                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                          isAccepted 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : app.status === 'Rejected' 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {isAccepted ? 'CONFIRMED' : app.status}
                        </span>
                      </div>
                    </div>

                    {/* Unlocked Contact Details (if confirmed) */}
                    {isAccepted ? (
                      <div className="bg-emerald-100/70 border border-emerald-300 p-4 rounded-2xl space-y-2">
                        <p className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-700" /> টিউটর কনফার্ম হয়েছে! যোগাযোগের তথ্য নিচে দেওয়া হলো:
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-950 pt-1">
                          {tutorUser.phone && (
                            <a href={`tel:${tutorUser.phone}`} className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm">
                              <Phone size={14} className="text-emerald-700" /> {tutorUser.phone}
                            </a>
                          )}
                          {tutorUser.email && (
                            <a href={`mailto:${tutorUser.email}`} className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all shadow-sm">
                              <Mail size={14} className="text-emerald-700" /> {tutorUser.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Masked Contact Info with clear note */
                      <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-xs text-slate-600 font-medium flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-2 font-bold text-slate-700">
                          <Lock size={14} className="text-amber-600" /> যোগাযোগ নম্বর: <span className="text-slate-500 font-normal">টিউশন নিশ্চিত (Accept) করার পর উন্মুক্ত হবে</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Mail size={14} /> ইমেইল: সুরক্ষিত (Hidden)
                        </span>
                      </div>
                    )}

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 text-xs text-slate-800 leading-relaxed">
                        <strong className="block text-[11px] font-black text-slate-500 uppercase tracking-wide mb-1">টিউটরের বার্তা / আবেদনপত্র:</strong>
                        "{app.coverLetter}"
                      </div>
                    )}

                    {/* Details row & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-ink/5 text-xs">
                      <div className="flex items-center gap-4 text-slate-600 font-bold flex-wrap">
                        {app.expectedSalary ? (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
                            প্রত্যাশিত বেতন: ৳{app.expectedSalary}
                          </span>
                        ) : null}
                        {app.availableTime && app.availableTime.length > 0 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                            পড়ানোর সময়: {app.availableTime.join(', ')}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {isAccepted && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartChatWithTutor(String(tutorUser?._id || tutorUser?.id || app.tutorId?._id || app.tutorId || ''))}
                            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <MessageSquare size={14} />
                            ইন-অ্যাপ চ্যাট
                          </button>
                        </div>
                      )}

                      {!isAccepted && app.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRejectApp(appId)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleAcceptApp(appId, tutorName)}
                            disabled={actionLoading}
                            className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Check size={15} /> Accept & Confirm Tutor
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          /* Tab 2: Auto-Matched Tutors */
          <div className="space-y-4">
            {shortlisted.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-ink/10 text-center space-y-3">
                <Sparkles size={40} className="text-purple-300 mx-auto" />
                <h3 className="text-base font-black text-ink">কোনো অটো-ম্যাচ টিউটর পাওয়া যায়নি</h3>
                <p className="text-xs text-ink-muted">সিস্টেম সক্রিয় টিউটরদের মধ্য থেকে স্বয়ংক্রিয়ভাবে উপযুক্ত টিউটর খুঁজে এখানে যুক্ত করবে।</p>
              </div>
            ) : (
              shortlisted.map((item, idx) => {
                const tutor = item.tutorId || {};
                const tutorUser = tutor.userId || {};
                const tutorName = tutorUser.name || 'Registered Tutor';
                const tutorAvatar = tutorUser.avatar;
                const rating = Number(tutor.rating || 0);
                const reviewCount = Number(tutor.reviewCount || 0);
                const totalCompleted = Number(tutor.totalTuitionsCompleted || 0);

                // Check if this tutor already has an application for this job
                const existingApp = applications.find(
                  (a) => String(a.tutorId?._id || a.tutorId) === String(tutorUser._id || tutor.userId),
                );
                const isAccepted = existingApp?.status === 'Accepted';

                return (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-3xl border border-purple-200/80 shadow-sm space-y-4 hover:border-purple-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl border border-purple-200 overflow-hidden shrink-0">
                          {tutorAvatar ? (
                            <img 
                              src={tutorAvatar} 
                              alt={tutorName} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName || 'tutor')}`;
                              }}
                            />
                          ) : (
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName || 'tutor')}`} 
                              alt={tutorName} 
                              className="w-full h-full object-cover" 
                            />
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-[#001F3F]">
                              {tutorName}
                            </h3>
                            {tutor.isVerified && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1 border border-emerald-200">
                                <ShieldCheck size={12} className="text-emerald-700" /> Verified Tutor
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700">
                            {/* Rating badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200">
                              <Star size={13} className="text-amber-500 fill-amber-400" />
                              <span>{rating > 0 ? rating.toFixed(1) : '5.0'}</span>
                              {reviewCount > 0 && <span className="text-[10px] text-amber-700 font-semibold">({reviewCount})</span>}
                            </span>

                            {/* Total Tuitions Completed */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              <span>{totalCompleted > 0 ? `${totalCompleted} টি সফল টিউশন` : 'নতুন ভেরিফাইড শিক্ষক'}</span>
                            </span>

                            {tutor.university && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800">
                                <BookOpen size={13} className="text-secondary" /> {tutor.university}
                              </span>
                            )}
                            {tutor.department && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                                {tutor.department}
                              </span>
                            )}
                            {tutor.qualification && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-100">
                                {tutor.qualification}
                              </span>
                            )}
                            {tutor.experience && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-800 rounded-lg border border-purple-100">
                                <Clock size={13} className="text-purple-700" /> {tutor.experience}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-black shadow-md">
                          <Sparkles size={13} /> AI Matched ({item.score || 90}%)
                        </span>
                      </div>
                    </div>

                    {/* Masked / Unlocked Contact */}
                    {isAccepted ? (
                      <div className="bg-emerald-100/70 border border-emerald-300 p-4 rounded-2xl space-y-2">
                        <p className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 size={16} className="text-emerald-700" /> টিউটর কনফার্ম হয়েছে! যোগাযোগের তথ্য:
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-950 pt-1">
                          {tutorUser.phone && (
                            <a href={`tel:${tutorUser.phone}`} className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all">
                              <Phone size={14} className="text-emerald-700" /> {tutorUser.phone}
                            </a>
                          )}
                          {tutorUser.email && (
                            <a href={`mailto:${tutorUser.email}`} className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all">
                              <Mail size={14} className="text-emerald-700" /> {tutorUser.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-xs text-slate-600 font-medium flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-2 font-bold text-slate-700">
                          <Lock size={14} className="text-amber-600" /> যোগাযোগ নম্বর: <span className="text-slate-500 font-normal">টিউশন নিশ্চিত (Accept) করার পর উন্মুক্ত হবে</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Mail size={14} /> ইমেইল: সুরক্ষিত (Hidden)
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-ink/5">
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl">
                        AI Recommended for your job requirements
                      </span>

                      {!isAccepted && (
                        <div className="flex items-center gap-2">
                          {existingApp ? (
                            <>
                              <button
                                onClick={() => handleRejectApp(String(existingApp._id || existingApp.id))}
                                disabled={actionLoading}
                                className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black transition-all cursor-pointer"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleAcceptApp(String(existingApp._id || existingApp.id), tutorName)}
                                disabled={actionLoading}
                                className="px-5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <Check size={15} /> Accept & Confirm Tutor
                              </button>
                            </>
                          ) : (
                            <Link
                              to={`/tutor/${tutor._id || tutor.id}`}
                              className="px-5 py-2.5 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-black shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
                            >
                              <Check size={15} /> View Full Profile & Hire
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </Layout>
  );
}

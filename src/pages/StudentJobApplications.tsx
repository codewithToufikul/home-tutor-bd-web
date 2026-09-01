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

      <div className="space-y-6 max-w-5xl mx-auto pb-20">
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 text-xs font-bold text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to My Requests
          </button>
        </div>

        {/* Job Header Card */}
        {job && (
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-ink/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase">
                  Job ID: {job.customId || `#${String(job._id || job.id).slice(-6)}`}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  job.status === 'Matched' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Status: {job.status || 'Open'}
                </span>
              </div>
              <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                বেতন: ৳ {job.salary ? job.salary.toLocaleString() : 'Negotiable'} / মাস
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#001F3F]">
                Tutor Needed for {subjectsStr} ({job.studentClass || 'Class N/A'})
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-muted mt-2">
                <span className="flex items-center gap-1 font-bold text-ink">
                  <BookOpen size={15} className="text-secondary" /> {job.medium} Medium
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={15} className="text-secondary" /> {locStr}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={15} className="text-secondary" /> {job.tutoringDays?.join(', ') || 'Negotiable days'}
                </span>
              </div>
            </div>

            {/* Privacy Notice Banner */}
            <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <ShieldCheck size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black mb-0.5">🛡️ ব্যক্তিগত তথ্যের সুরক্ষা নীতি (Privacy Policy):</strong>
                টিউশন নিশ্চিত (Accept) করার পূর্বে টিউটরের যোগ্যতা, অভিজ্ঞতা ও ম্যাচ স্কোর দেখা যাবে; কিন্তু ফোন নম্বর বা ব্যক্তিগত ছবি গোপন থাকবে। 
                টিউটর নির্বাচন (Accept) করার সাথে সাথে পূর্ণ যোগাযোগের তথ্য উন্মুক্ত হবে।
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-ink/10 pb-1">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-secondary text-white shadow-md'
                : 'bg-white text-ink-muted hover:text-ink border border-ink/5'
            }`}
          >
            <Users size={16} /> Received Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-ink-muted hover:text-ink border border-ink/5'
            }`}
          >
            <Sparkles size={16} /> 🤖 AI Matched Tutors ({shortlisted.length})
          </button>
        </div>

        {/* Tab 1: Applications */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-ink-muted animate-pulse">
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

                return (
                  <motion.div
                    key={appId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-3xl border transition-all space-y-4 ${
                      isAccepted
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-ink/10 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl overflow-hidden border shadow-sm ${
                          isAccepted ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-ink-muted'
                        }`}>
                          {isAccepted && tutorUser.avatar ? (
                            <img src={tutorUser.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={24} />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-[#001F3F]">
                              {tutorUser.name || 'Candidate Tutor'}
                            </h3>
                            {tutorProfile.isVerified && (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-full flex items-center gap-1">
                                <ShieldCheck size={12} /> Verified
                              </span>
                            )}
                            {(app.isAutoShortlisted || (app.matchScore && app.matchScore >= 85)) && (
                              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full flex items-center gap-1">
                                <Sparkles size={12} /> 🤖 AI Matched
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-ink-muted font-bold">
                            🎓 {tutorProfile.university || 'University Student / Graduate'}
                            {tutorProfile.department ? ` • ${tutorProfile.department}` : ''}
                            {tutorProfile.experience ? ` • ${tutorProfile.experience} অভিজ্ঞতা` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                        {(app.isAutoShortlisted || (app.matchScore && app.matchScore >= 85)) && (
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-black">
                            🤖 AI Recommended
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase ${
                          isAccepted 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : app.status === 'Rejected' 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
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
                            <a href={`tel:${tutorUser.phone}`} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all">
                              <Phone size={14} className="text-emerald-700" /> {tutorUser.phone}
                            </a>
                          )}
                          {tutorUser.email && (
                            <a href={`mailto:${tutorUser.email}`} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all">
                              <Mail size={14} className="text-emerald-700" /> {tutorUser.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Masked Contact Info */
                      <div className="bg-gray-50 border border-ink/5 p-3 rounded-2xl text-xs text-ink-muted font-medium flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-ink-muted/50" /> {tutorUser.phone || '🔒 টিউশন নিশ্চিত করার পর দৃশ্যমান হবে'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-ink-muted/50" /> {tutorUser.email || '🔒 Hidden'}
                        </span>
                      </div>
                    )}

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div className="bg-gray-50/70 p-3.5 rounded-2xl border border-ink/5 text-xs text-ink leading-relaxed">
                        <strong className="block text-[11px] font-black text-ink-muted uppercase mb-1">টিউটরের বার্তা / আবেদনপত্র:</strong>
                        "{app.coverLetter}"
                      </div>
                    )}

                    {/* Details row & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-ink/5 text-xs">
                      <div className="flex items-center gap-4 text-ink-muted font-bold">
                        {app.expectedSalary ? <span>প্রত্যাশিত বেতন: ৳{app.expectedSalary}</span> : null}
                        {app.availableTime && app.availableTime.length > 0 && (
                          <span>পড়ানোর সময়: {app.availableTime.join(', ')}</span>
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
                            onClick={() => handleAcceptApp(appId, tutorUser.name || 'Candidate Tutor')}
                            disabled={actionLoading}
                            className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
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

                // Check if this tutor already has an application for this job
                const existingApp = applications.find(
                  (a) => String(a.tutorId?._id || a.tutorId) === String(tutorUser._id || tutor.userId),
                );
                const isAccepted = existingApp?.status === 'Accepted';

                return (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-3xl border border-purple-200/80 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xl border border-purple-200">
                          <User size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-ink">
                              {tutorUser.name || 'Candidate Tutor'}
                            </h3>
                            {tutor.isVerified && <ShieldCheck size={16} className="text-emerald-600" />}
                          </div>
                          <p className="text-xs text-ink-muted font-bold mt-0.5">
                            🎓 {tutor.university || tutor.qualification || 'University Student'}
                            {tutor.department ? ` • ${tutor.department}` : ''}
                            {tutor.experience ? ` • ${tutor.experience} অভিজ্ঞতা` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-black shadow-md">
                          <Sparkles size={13} /> 🤖 AI Matched
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
                            <a href={`tel:${tutorUser.phone}`} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all">
                              <Phone size={14} className="text-emerald-700" /> {tutorUser.phone}
                            </a>
                          )}
                          {tutorUser.email && (
                            <a href={`mailto:${tutorUser.email}`} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-300 hover:bg-emerald-50 transition-all">
                              <Mail size={14} className="text-emerald-700" /> {tutorUser.email}
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-ink/5 p-3 rounded-2xl text-xs text-ink-muted font-medium flex items-center justify-between gap-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-ink-muted/50" /> {tutorUser.phone || '🔒 টিউশন নিশ্চিত করার পর দৃশ্যমান হবে'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-ink-muted/50" /> {tutorUser.email || '🔒 Hidden'}
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-ink/5">
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
                                onClick={() => handleAcceptApp(String(existingApp._id || existingApp.id), tutorUser.name || 'Candidate Tutor')}
                                disabled={actionLoading}
                                className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <Check size={15} /> Accept & Confirm Tutor
                              </button>
                            </>
                          ) : (
                            <Link
                              to={`/tutor/${tutor._id || tutor.id}`}
                              className="px-5 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-xl text-xs font-black shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
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

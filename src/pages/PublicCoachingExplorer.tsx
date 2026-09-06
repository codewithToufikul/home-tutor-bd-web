import StudentLayout from '@/src/components/StudentLayout.tsx';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  BookOpen,
  MapPin,
  Search,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  BadgeCheck,
} from 'lucide-react';
import Navbar from '@/src/components/Navbar.tsx';
import Footer from '@/src/components/Footer.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { CoachingPublicRepository } from '@/src/repositories/coachingRepository';
import { CoachingProfileRecord } from '@/src/repositories/coachingRepository';
import { apiPost } from '@/src/repositories/baseRepository';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function PublicCoachingExplorer({ isDashboard }: { isDashboard?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inDashboard = isDashboard || location.pathname.includes('/student/');
  const [coachingCenters, setCoachingCenters] = useState<CoachingProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCenters, setExpandedCenters] = useState<Set<string>>(new Set());

  const [selectedBatch, setSelectedBatch] = useState<{ coaching: CoachingProfileRecord; batch: any } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantInstitution, setApplicantInstitution] = useState('');
  const [applicantClass, setApplicantClass] = useState('');
  const [applicantNote, setApplicantNote] = useState('');

  useEffect(() => {
    const loadCenters = async () => {
      setLoading(true);
      try {
        const list = await CoachingPublicRepository.getAll();
        if (Array.isArray(list)) setCoachingCenters(list);
      } catch (err) {
        console.error('Failed to load coaching centers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCenters();
  }, []);

  const handleEnrollClick = (coaching: CoachingProfileRecord, batch: any) => {
    if (!user) {
      alert('ভর্তি হতে দয়া করে প্রথমে আপনার অ্যাকাউন্টে লগইন বা সাইন আপ করুন!');
      navigate('/login');
      return;
    }
    setSelectedBatch({ coaching, batch });
    setEnrollSuccess(false);
    setApplicantPhone((user as any)?.phone || '');
    setApplicantInstitution('');
    setApplicantClass(batch.className || '');
    setApplicantNote('');
  };

  const handleConfirmEnroll = async () => {
    if (!selectedBatch) return;
    setEnrolling(true);
    try {
      const coachingId = String((selectedBatch.coaching as any)._id || '');
      const batchId = String(selectedBatch.batch._id || '');
      await apiPost(`/enrollments/${coachingId}/batches/${batchId}/enroll`, {
        phone: applicantPhone,
        institution: applicantInstitution,
        studentClass: applicantClass,
        note: applicantNote,
      });
      setEnrollSuccess(true);
      setTimeout(() => {
        setEnrollSuccess(false);
        setSelectedBatch(null);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'ভর্তির জন্য আবেদন করতে সমস্যা হয়েছে।');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleCenterExpand = (id: string) => {
    setExpandedCenters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredCenters = coachingCenters.filter((c) =>
    (c.instituteName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.batches || []).some((b: any) => (b.subject || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const content = (
    <div className={`w-full ${inDashboard ? 'pb-24 lg:pb-6' : 'pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto'}`}>

      {/* HERO BANNER */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-purple-600 to-pink-500 p-5 sm:p-8 text-white shadow-xl shadow-primary/30 mb-4 sm:mb-6"
      >
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(white 1.2px, transparent 1.2px)', backgroundSize: '18px 18px' }}
        />
        <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-pink-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-wider border border-white/20">
            <Sparkles size={11} /> Verified Academic Coaching Centers
          </span>
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-display font-black leading-tight tracking-tight">
            খুঁজে নিন আপনার এলাকার সেরা কোচিং সেন্টার ও একাডেমীক ব্যাচ
          </h1>
          <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xl">
            অভিজ্ঞ শিক্ষক, নিয়মিত পরীক্ষা ও সেরা সিডিউলে সরাসরি ব্যাচে ভর্তি হোন আপনার পছন্দ অনুযায়ী।
          </p>
        </div>
      </motion.div>

      {/* SEARCH */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="relative mb-5 sm:mb-6"
      >
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search coaching centers by name, district, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3.5 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 placeholder:text-slate-400 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={15} />
          </button>
        )}
      </motion.div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded-lg w-2/3" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COACHING CENTERS LIST */}
      {!loading && (
        <div className="space-y-3 sm:space-y-4">
          {filteredCenters.length > 0 ? (
            filteredCenters.map((coaching, idx) => {
              const centerId = String((coaching as any)._id || idx);
              const isExpanded = expandedCenters.has(centerId);
              const batchCount = coaching.batches?.length || 0;

              return (
                <motion.div
                  key={centerId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
                >
                  {/* Header row */}
                  <div className="p-4 sm:p-5 flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/10">
                      <Building2 size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h2 className="text-sm sm:text-base font-black text-[#001F3F] leading-tight">{coaching.instituteName}</h2>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-full border border-emerald-200">
                          <BadgeCheck size={10} /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-primary shrink-0" />
                        <span className="truncate">{coaching.location || coaching.district || 'Dhaka'}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCenterExpand(centerId)}
                      className="flex flex-col items-center gap-0.5 shrink-0 cursor-pointer group"
                    >
                      <span className="text-[10px] font-black text-slate-400 group-hover:text-primary transition-colors whitespace-nowrap">
                        {batchCount} Batch{batchCount !== 1 ? 'es' : ''}
                      </span>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        isExpanded ? "bg-primary text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                      )}>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>
                  </div>

                  {/* Expandable batches */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="batches"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-slate-100 px-4 sm:px-5 py-4 space-y-3 bg-slate-50/60">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Available Batches ({batchCount})
                          </p>
                          {batchCount > 0 ? (
                            <div className="space-y-2.5">
                              {coaching.batches!.map((batch: any) => (
                                <div
                                  key={String(batch._id || Math.random())}
                                  className="bg-white rounded-xl border border-slate-200/80 p-3.5 space-y-3 shadow-2xs"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5 flex-1 min-w-0">
                                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                                        {batch.className}
                                      </span>
                                      <h3 className="text-sm font-black text-[#001F3F] leading-tight">{batch.batchName}</h3>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-[10px] text-slate-400 font-bold uppercase">Fee/Month</p>
                                      <p className="text-base font-black text-primary">৳{batch.fee}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {batch.subject && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg">
                                        <BookOpen size={10} className="text-secondary" /> {batch.subject}
                                      </span>
                                    )}
                                    {batch.schedule && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg">
                                        <Calendar size={10} className="text-purple-500" /> {batch.schedule}
                                      </span>
                                    )}
                                    {batch.seats && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg">
                                        <Users size={10} className="text-emerald-600" /> {batch.seats} Seats
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleEnrollClick(coaching, batch)}
                                    className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-black rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    Enroll Now <ArrowRight size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-5 text-center">
                              <BookOpen size={26} className="text-slate-300 mx-auto mb-1.5" />
                              <p className="text-xs font-bold text-slate-400">No active batches yet.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-2xl border border-slate-100 text-center space-y-3 shadow-sm"
            >
              <Building2 size={34} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-700">
                {searchQuery ? 'কোনো ফলাফল পাওয়া যায়নি' : 'কোনো কোচিং সেন্টার নেই'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {searchQuery ? 'অন্য কীওয়ার্ড দিয়ে সার্চ করুন।' : 'শীঘ্রই নতুন কোচিং সেন্টার যুক্ত হবে।'}
              </p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-black rounded-xl cursor-pointer">
                  <X size={13} /> Clear Search
                </button>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* ENROLLMENT BOTTOM-SHEET MODAL */}
      <AnimatePresence>
        {selectedBatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedBatch(null); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* Drag handle (mobile) */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
              </div>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="text-base font-black text-[#001F3F]">ব্যাচে ভর্তির আবেদন</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedBatch.coaching.instituteName}</p>
                </div>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                >
                  <X size={17} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {enrollSuccess ? (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={34} />
                    </div>
                    <h3 className="text-lg font-black text-[#001F3F]">ভর্তির আবেদন সফল! 🎉</h3>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      কোচিং সেন্টারটি আপনার আবেদন পেয়েছে এবং শীঘ্রই আপনার ফোনে যোগাযোগ করবে।
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {/* Batch summary */}
                    <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-primary mb-1">
                        <GraduationCap size={15} />
                        <span className="text-xs font-black uppercase tracking-wider">Batch Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                        <div>
                          <p className="text-slate-400 font-bold text-[10px] uppercase">Batch</p>
                          <p className="font-black text-slate-800">{selectedBatch.batch.batchName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold text-[10px] uppercase">Class</p>
                          <p className="font-black text-slate-800">{selectedBatch.batch.className}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold text-[10px] uppercase">Subject(s)</p>
                          <p className="font-black text-slate-800">{selectedBatch.batch.subject}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-bold text-[10px] uppercase">Monthly Fee</p>
                          <p className="font-black text-primary">৳{selectedBatch.batch.fee}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">আপনার তথ্য</p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">নাম</label>
                          <input disabled value={user?.name || ''} className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500">ইমেইল</label>
                          <input disabled value={user?.email || ''} className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">মোবাইল নম্বর *</label>
                          <input
                            type="text"
                            placeholder="01712345678"
                            value={applicantPhone}
                            onChange={(e) => setApplicantPhone(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">বর্তমান শ্রেণী</label>
                          <input
                            type="text"
                            placeholder="Class 10"
                            value={applicantClass}
                            onChange={(e) => setApplicantClass(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">স্কুল / কলেজের নাম</label>
                        <input
                          type="text"
                          placeholder="Dhaka Residential Model College"
                          value={applicantInstitution}
                          onChange={(e) => setApplicantInstitution(e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">অতিরিক্ত বার্তা (ঐচ্ছিক)</label>
                        <textarea
                          placeholder="শিফট পছন্দ, লক্ষ্য বিষয়, বা অন্য কোনো প্রশ্ন..."
                          value={applicantNote}
                          onChange={(e) => setApplicantNote(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sticky footer CTA */}
              {!enrollSuccess && (
                <div className="px-5 pb-6 pt-3 border-t border-slate-100 shrink-0">
                  <button
                    onClick={handleConfirmEnroll}
                    disabled={enrolling || !applicantPhone}
                    className="w-full py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enrolling ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        আবেদন পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Confirm &amp; Apply for Enrollment
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (inDashboard) {
    return <StudentLayout>{content}</StudentLayout>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">{content}</main>
      <Footer />
    </div>
  );
}

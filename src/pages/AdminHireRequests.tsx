import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Clock, Filter, User, Phone, MapPin, BookOpen, Calendar,
  CheckCircle2, AlertCircle, X, Eye, GraduationCap, Mail, Banknote,
  ExternalLink, RefreshCw, Send, UserCheck, Shield, Bookmark, Copy,
  Check, ArrowRight, UserCircle, CheckCheck, XCircle, Building2,
  DollarSign, Loader2, Sparkles, School, ShieldCheck, Briefcase,
  MessageCircle, PhoneCall
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { HireRepository, HireRequestRecord } from '@/src/repositories/hireRepository';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function AdminHireRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<HireRequestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'pending' | 'contacted' | 'confirmed' | 'rejected'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Modal State for Confirm & Assign Tuition
  const [selectedRequestForConfirm, setSelectedRequestForConfirm] = useState<HireRequestRecord | null>(null);
  const [confirmSalary, setConfirmSalary] = useState<number>(0);
  const [confirmPlatformFee, setConfirmPlatformFee] = useState<number>(0);
  const [confirmDaysPerWeek, setConfirmDaysPerWeek] = useState<string>('3 Days/Week');
  const [confirmStudentClass, setConfirmStudentClass] = useState<string>('');
  const [confirmSubjects, setConfirmSubjects] = useState<string>('');
  const [confirmDistrict, setConfirmDistrict] = useState<string>('Dhaka');
  const [confirmArea, setConfirmArea] = useState<string>('');
  const [confirmDetailedAddress, setConfirmDetailedAddress] = useState<string>('');
  const [confirmTuitionType, setConfirmTuitionType] = useState<string>('Home Tutoring');
  const [confirmNotes, setConfirmNotes] = useState<string>('');
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);

  const fetchRequests = async () => {
    try {
      setIsRefreshing(true);
      const data = await HireRepository.getAll();
      const list = Array.isArray(data) ? data : ((data as any)?.data || []);
      setRequests(list);
    } catch (err) {
      console.error('Failed to load direct hire requests:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Status Counts
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => !r.status || r.status.toLowerCase() === 'pending').length;
    const contacted = requests.filter((r) => r.status && r.status.toLowerCase() === 'contacted').length;
    const confirmed = requests.filter((r) => r.status && (r.status.toLowerCase() === 'confirmed' || r.status.toLowerCase() === 'approved')).length;
    const rejected = requests.filter((r) => r.status && (r.status.toLowerCase() === 'rejected' || r.status.toLowerCase() === 'cancelled')).length;
    return { total, pending, contacted, confirmed, rejected };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const statusLower = (r.status || 'pending').toLowerCase();
      if (activeStatusTab === 'pending' && statusLower !== 'pending') return false;
      if (activeStatusTab === 'contacted' && statusLower !== 'contacted') return false;
      if (activeStatusTab === 'confirmed' && statusLower !== 'confirmed' && statusLower !== 'approved') return false;
      if (activeStatusTab === 'rejected' && statusLower !== 'rejected' && statusLower !== 'cancelled') return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();

      const gName = (r.guardianName || (r.guardianId as any)?.name || '').toLowerCase();
      const gPhone = (r.guardianPhone || (r.guardianId as any)?.phone || '').toLowerCase();
      const tName = ((r.tutorId as any)?.name || (r.tutorProfileId as any)?.name || '').toLowerCase();
      const tPhone = ((r.tutorId as any)?.phone || '').toLowerCase();
      const sClass = (r.studentClass || '').toLowerCase();
      const subs = (Array.isArray(r.subjects) ? r.subjects.join(' ') : String(r.subjects || '')).toLowerCase();
      const area = (r.location?.area || (r.location as any)?.district || '').toLowerCase();

      return (
        gName.includes(q) ||
        gPhone.includes(q) ||
        tName.includes(q) ||
        tPhone.includes(q) ||
        sClass.includes(q) ||
        subs.includes(q) ||
        area.includes(q)
      );
    });
  }, [requests, activeStatusTab, searchQuery]);

  // Handle Quick Status Update (Mark Contacted / Reject)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await HireRepository.updateStatus(id, newStatus);
      setActionSuccessMsg(`স্ট্যাটাস পরিবর্তন করা হয়েছে: ${newStatus}`);
      fetchRequests();
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Failed to update status');
    }
  };

  // Open Confirm Modal
  const openConfirmModal = (req: HireRequestRecord) => {
    setSelectedRequestForConfirm(req);
    const tutorObj = (typeof req.tutorId === 'object' ? req.tutorId : {}) as any;
    const profileObj = (typeof req.tutorProfileId === 'object' ? req.tutorProfileId : {}) as any;

    const initialSalary = Number(req.salaryOffer) || Number(profileObj.salary) || 5000;
    setConfirmSalary(initialSalary);
    setConfirmPlatformFee(Math.round(initialSalary * 0.6));
    setConfirmDaysPerWeek('3 Days/Week');
    setConfirmStudentClass(req.studentClass || 'Class 9');
    setConfirmSubjects(Array.isArray(req.subjects) ? req.subjects.join(', ') : (req.subjects || 'General Subjects'));
    setConfirmDistrict(req.location?.district || profileObj.location?.district || 'Dhaka');
    setConfirmArea(req.location?.area || profileObj.location?.area || '');
    setConfirmDetailedAddress(req.location?.detailedAddress || '');
    setConfirmTuitionType('Home Tutoring');
    setConfirmNotes(req.requirements || '');
  };

  // Salary Change Handler inside Modal
  const handleSalaryChange = (newVal: number) => {
    setConfirmSalary(newVal);
    setConfirmPlatformFee(Math.round(newVal * 0.6));
  };

  // Submit Tuition Confirmation & Assignment
  const handleConfirmTuitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForConfirm || (!selectedRequestForConfirm._id && !selectedRequestForConfirm.id)) return;

    setIsSubmittingConfirm(true);
    try {
      const reqId = String(selectedRequestForConfirm._id || selectedRequestForConfirm.id);
      await HireRepository.confirmTuition(reqId, {
        salary: confirmSalary,
        platformFee: confirmPlatformFee,
        daysPerWeek: confirmDaysPerWeek,
        studentClass: confirmStudentClass,
        subjects: confirmSubjects.split(',').map((s) => s.trim()).filter(Boolean),
        location: {
          district: confirmDistrict,
          area: confirmArea,
          detailedAddress: confirmDetailedAddress,
        },
        tuitionType: confirmTuitionType,
        notes: confirmNotes,
      });

      setSelectedRequestForConfirm(null);
      setActionSuccessMsg('🎉 টিউশন সফলভাবে কনফার্ম করা হয়েছে এবং টিউটরের ড্যাশবোর্ডে পাঠানো হয়েছে!');
      fetchRequests();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'টিউশন কনফার্ম করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-2.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24 sm:pb-20 font-sans">

        {/* 🌟 1. Success Alert Banner */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-lg flex items-center justify-between gap-3 border border-emerald-700"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span className="truncate">{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="text-white/80 hover:text-white p-1 cursor-pointer shrink-0">
                <X size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🌟 2. Header Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white/80 backdrop-blur-xl p-4 sm:p-6 rounded-[22px] sm:rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
              <Sparkles size={12} />
              <span>Direct Hire & Matching Hub</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              ডাইরেক্ট টিউটর হায়ার রিকোয়েস্ট
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed">
              প্রোফাইল থেকে সরাসরি রিকোয়েস্ট করা টিউশনসমূহ পর্যবেক্ষণ, ফোন আলাপ এবং কনফার্ম করে টিউটরের অ্যাক্টিভ ড্যাশবোর্ডে এসাইন করুন।
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={isRefreshing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-white active:bg-slate-100 hover:bg-slate-50 text-slate-800 rounded-xl sm:rounded-2xl border border-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-primary' : ''} />
            <span>রিফ্রেশ করুন</span>
          </button>
        </div>

        {/* 📊 3. Stats Grid with Mobile Touch Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
          {[
            { id: 'all', label: 'মোট রিকোয়েস্ট', count: stats.total, icon: Briefcase, color: 'text-slate-900', bg: 'bg-slate-100', border: 'border-slate-200' },
            { id: 'pending', label: 'নতুন পেন্ডিং', count: stats.pending, icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
            { id: 'contacted', label: 'কথা বলা হয়েছে', count: stats.contacted, icon: PhoneCall, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            { id: 'confirmed', label: 'কনফার্মড / অ্যাক্টিভ', count: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { id: 'rejected', label: 'বাতিলকৃত', count: stats.rejected, icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
          ].map((item) => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveStatusTab(item.id as any)}
              className={cn(
                'p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between shadow-xs relative overflow-hidden',
                activeStatusTab === item.id
                  ? `${item.bg} ${item.border} ring-2 ring-primary/30 shadow-md`
                  : 'bg-white/80 backdrop-blur-md border-slate-200/80 hover:bg-slate-50'
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{item.label}</span>
                <item.icon size={14} className={cn("shrink-0", item.color)} />
              </div>
              <span className={cn('text-lg sm:text-2xl font-black mt-1.5 tabular-nums', item.color)}>{item.count}</span>
            </motion.button>
          ))}
        </div>

        {/* 🔍 4. Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-[24px] border border-white/60 shadow-md space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
          <div className="relative w-full sm:w-96">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="শিক্ষক, অভিভাবক, ফোন, বিষয় বা এলাকা..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2.5 sm:py-2 font-medium text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Smooth Horizontal Scrolling Tab Pills for Mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1 sm:mx-0 sm:px-0">
            {[
              { id: 'all', label: 'সকল', count: stats.total },
              { id: 'pending', label: 'পেন্ডিং', count: stats.pending },
              { id: 'contacted', label: 'কথা বলা হয়েছে', count: stats.contacted },
              { id: 'confirmed', label: 'কনফার্মড', count: stats.confirmed },
              { id: 'rejected', label: 'বাতিল', count: stats.rejected },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id as any)}
                className={cn(
                  'snap-start shrink-0 px-3 py-2 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-95',
                  activeStatusTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {tab.label} <span className="opacity-70 text-[10px]">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 📱 5. Requests List View (App-style Cards) */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 size={32} className="animate-spin text-primary mx-auto" />
            <p className="text-xs font-bold text-slate-500">রিকোয়েস্ট ডাটা লোড হচ্ছে...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <UserCheck size={28} />
            </div>
            <h3 className="text-base font-black text-slate-900">কোনো হায়ার রিকোয়েস্ট পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'আপনার সার্চ কুয়েরির সাথে কোনো রিকোয়েস্ট মেলেনি।' : 'বর্তমানে এই ক্যাটাগরিতে কোনো রিকোয়েস্ট নেই।'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5 sm:space-y-4">
            {filteredRequests.map((req) => {
              const reqId = String(req._id || req.id || '');
              const tutorUser = (typeof req.tutorId === 'object' ? req.tutorId : {}) as any;
              const tutorProfile = (typeof req.tutorProfileId === 'object' ? req.tutorProfileId : {}) as any;
              const guardianUser = (typeof req.guardianId === 'object' ? req.guardianId : {}) as any;

              const tutorName = tutorUser.name || tutorProfile.name || 'Tutor';
              const tutorAvatar = tutorUser.avatar || tutorProfile.photoUrl;
              const tutorPhone = tutorUser.phone || 'N/A';
              const tutorEmail = tutorUser.email || 'N/A';
              const tutorUni = tutorProfile.university || tutorProfile.gradInstitute || 'University';
              const tutorDept = tutorProfile.department || tutorProfile.gradDept || 'Department';
              const tutorSalary = tutorProfile.salary ? `৳ ${Number(tutorProfile.salary).toLocaleString()}` : 'আলোচনা সাপেক্ষে';

              const gName = req.guardianName || guardianUser.name || 'Guardian';
              const gPhone = req.guardianPhone || guardianUser.phone || 'N/A';
              const cleanGPhone = gPhone.replace(/[^0-9]/g, '');
              const gClass = req.studentClass || 'Not Specified';
              const gSubjects = Array.isArray(req.subjects) ? req.subjects.join(', ') : (req.subjects || 'General');
              const gSalary = req.salaryOffer ? `৳ ${req.salaryOffer}` : 'Negotiable';
              const gArea = req.location?.area || req.location?.district || 'Dhaka';

              const statusStr = (req.status || 'Pending').toLowerCase();
              const isConfirmed = statusStr === 'confirmed' || statusStr === 'approved';
              const isContacted = statusStr === 'contacted';
              const isPending = statusStr === 'pending';
              const isRejected = statusStr === 'rejected' || statusStr === 'cancelled';

              const reqDateFormatted = req.createdAt
                ? new Date(req.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Recent';

              return (
                <div
                  key={reqId}
                  className="bg-white/90 backdrop-blur-xl rounded-[22px] sm:rounded-3xl border border-slate-200/80 shadow-md hover:border-slate-300 transition-all p-3.5 sm:p-6 space-y-3.5 sm:space-y-4"
                >
                  {/* Top Bar: ID, Date, Status */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] sm:text-[11px] font-black rounded-lg font-mono shrink-0">
                        #{reqId.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate">
                        <Clock size={11} className="shrink-0" /> {reqDateFormatted}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isPending && (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] sm:text-[11px] font-black rounded-xl border border-amber-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> নতুন পেন্ডিং
                        </span>
                      )}
                      {isContacted && (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[10px] sm:text-[11px] font-black rounded-xl border border-blue-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> কথা বলা হয়েছে
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-black rounded-xl border border-emerald-200 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> কনফার্মড ও অ্যাক্টিভ
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] sm:text-[11px] font-black rounded-xl border border-slate-200 flex items-center gap-1.5">
                          <XCircle size={11} /> বাতিল
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Two-Column Box (Guardian Request & Target Tutor) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-5 items-start">

                    {/* Left Box: Student / Guardian (7 Cols) */}
                    <div className="lg:col-span-7 bg-slate-50/80 p-3.5 sm:p-5 rounded-2xl border border-slate-200/60 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] sm:text-xs font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              অভিভাবক / শিক্ষার্থী
                            </span>
                            {req.guardianId ? (
                              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                                Registered User
                              </span>
                            ) : (
                              <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                                Guest Request
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1 truncate">{gName}</h4>
                        </div>

                        {/* Phone & WhatsApp Quick Touch Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={`tel:${cleanGPhone}`}
                            className="p-2 sm:px-3 sm:py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-1 text-xs font-bold shadow-xs active:scale-95"
                            title="Call Guardian"
                          >
                            <Phone size={13} />
                            <span className="hidden sm:inline">কল করুন</span>
                          </a>
                          <a
                            href={`https://wa.me/880${cleanGPhone.slice(-10)}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${gName}, Home Tutor BD থেকে আপনার ${gClass} ডাইরেক্ট টিউটর হায়ার রিকোয়েস্ট (${tutorName}) সংক্রান্ত বিষয়ে যোগাযোগ করা হচ্ছে।`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 sm:px-3 sm:py-2 bg-[#25D366] active:bg-emerald-600 text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-1 text-xs font-bold shadow-xs active:scale-95"
                            title="WhatsApp Chat"
                          >
                            <MessageCircle size={13} />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                          <button
                            onClick={() => copyToClipboard(gPhone, `gphone-${reqId}`)}
                            className="p-2 bg-white text-slate-600 active:bg-slate-100 rounded-xl border border-slate-200 shadow-xs text-xs font-bold active:scale-95"
                            title="Copy Phone"
                          >
                            {copiedText === `gphone-${reqId}` ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      {/* Guardian Quick Info Grid (Touch Friendly) */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">মোবাইল নম্বর</span>
                          <span className="font-bold text-slate-800 font-mono text-[11px] sm:text-xs truncate block">{gPhone}</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">শ্রেণী</span>
                          <span className="font-bold text-slate-800 text-[11px] sm:text-xs truncate block">{gClass}</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">অফারকৃত বাজেট</span>
                          <span className="font-black text-emerald-700 text-[11px] sm:text-xs truncate block">{gSalary}</span>
                        </div>
                        <div className="col-span-2 p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">পড়ানোর বিষয়</span>
                          <span className="font-bold text-slate-800 text-[11px] sm:text-xs truncate block">{gSubjects}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1 p-2 bg-white rounded-xl border border-slate-100">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">এলাকা</span>
                          <span className="font-bold text-slate-800 flex items-center gap-1 text-[11px] sm:text-xs truncate">
                            <MapPin size={10} className="text-primary shrink-0" /> <span className="truncate">{gArea}</span>
                          </span>
                        </div>
                      </div>

                      {/* Requirements / Notes */}
                      {req.requirements && (
                        <div className="pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase mb-0.5">অভিভাবকের বিশেষ শর্ত / নোট:</span>
                          <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 font-medium text-[11px] sm:text-xs leading-relaxed">
                            "{req.requirements}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Box: Requested Tutor Details (5 Cols) */}
                    <div className="lg:col-span-5 bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          অনুরোধকৃত শিক্ষক
                        </span>
                        <Link
                          to={`/tutor/${tutorProfile._id || tutorUser._id || ''}`}
                          target="_blank"
                          className="text-[11px] font-black text-primary hover:underline flex items-center gap-1"
                        >
                          প্রোফাইল <ExternalLink size={11} />
                        </Link>
                      </div>

                      <div className="flex items-center gap-3 pt-0.5">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          <img
                            src={tutorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tutorName)}`}
                            alt={tutorName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 truncate">{tutorName}</h4>
                          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 truncate">{tutorDept} • {tutorUni}</p>
                        </div>
                      </div>

                      {/* Tutor Direct Contact Info for Admin */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5 text-xs font-medium">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-bold text-[11px]">শিক্ষকের ফোন:</span>
                          <div className="flex items-center gap-1.5">
                            <a href={`tel:${tutorPhone}`} className="font-bold text-slate-900 font-mono hover:text-primary text-[11px] sm:text-xs">
                              {tutorPhone}
                            </a>
                            <button
                              onClick={() => copyToClipboard(tutorPhone, `tphone-${reqId}`)}
                              className="text-slate-400 hover:text-slate-700 active:scale-90 p-0.5"
                            >
                              {copiedText === `tphone-${reqId}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-400 font-bold text-[11px]">ইমেইল:</span>
                          <span className="font-bold text-slate-700 truncate max-w-[140px] text-[11px]">{tutorEmail}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="text-slate-400 font-bold text-[11px]">প্রত্যাশিত বেতন:</span>
                          <span className="font-black text-emerald-700 text-xs">{tutorSalary}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Confirmed Details Snippet if confirmed */}
                  {isConfirmed && req.confirmedTuition && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCheck size={16} className="text-emerald-700 shrink-0" />
                        <span className="font-black text-emerald-950">
                          টিউশন কনফার্মড: বেতন ৳{req.confirmedTuition.salary?.toLocaleString()} | প্ল্যাটফর্ম ফি ৳{req.confirmedTuition.platformFee?.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800">
                        টিউটরের অ্যাক্টিভ ড্যাশবোর্ডে এসাইন করা হয়েছে
                      </span>
                    </div>
                  )}

                  {/* Action Buttons Toolbar — App-like full width touch buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {isPending && (
                      <button
                        onClick={() => handleUpdateStatus(reqId, 'Contacted')}
                        className="py-2.5 px-4 bg-blue-50 active:bg-blue-100 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <PhoneCall size={13} />
                        <span>কথা বলা হয়েছে (Mark Contacted)</span>
                      </button>
                    )}

                    {!isConfirmed && (
                      <button
                        onClick={() => openConfirmModal(req)}
                        className="py-2.5 px-5 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <CheckCircle2 size={14} />
                        <span>টিউশন কনফার্ম ও টিউটরকে এসাইন করুন</span>
                      </button>
                    )}

                    {!isRejected && !isConfirmed && (
                      <button
                        onClick={() => handleUpdateStatus(reqId, 'Rejected')}
                        className="py-2.5 px-3.5 bg-slate-100 active:bg-rose-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-98"
                      >
                        <X size={13} />
                        <span>বাতিল করুন</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 🔍 6. Confirm Tuition & Assign Modal — Bottom-Sheet on Mobile */}
        {/* ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedRequestForConfirm && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRequestForConfirm(null)}
                className="fixed inset-0"
              />

              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative bg-white rounded-t-[28px] sm:rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-7 space-y-4 z-10 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
              >
                {/* Mobile drag handle */}
                <div className="sm:hidden w-10 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2" />

                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Direct Tuition Confirmation
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 leading-tight truncate">
                      টিউশন কনফার্ম ও টিউটরের ড্যাশবোর্ডে পাঠান
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      উভয় পক্ষের সাথে চূড়ান্ত আলোচনার পর নিশ্চিতকৃত শর্তাবলী দিয়ে সেভ করুন।
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRequestForConfirm(null)}
                    className="p-2 text-slate-400 hover:text-slate-700 active:bg-slate-100 rounded-xl shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleConfirmTuitionSubmit} className="space-y-3.5 text-xs font-sans">

                  {/* Salary & Platform Fee Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">কনফার্মড মাসিক বেতন (Monthly Salary) ৳</label>
                      <input
                        type="number"
                        required
                        min={500}
                        value={confirmSalary}
                        onChange={(e) => handleSalaryChange(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">প্ল্যাটফর্ম ফি (Platform Fee - 60%) ৳</label>
                      <input
                        type="number"
                        required
                        value={confirmPlatformFee}
                        onChange={(e) => setConfirmPlatformFee(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 sm:py-2.5 font-bold text-emerald-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Class & Subjects */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">শিক্ষার্থীর শ্রেণী (Class)</label>
                      <input
                        type="text"
                        required
                        value={confirmStudentClass}
                        onChange={(e) => setConfirmStudentClass(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">পড়ানোর বিষয়সমূহ</label>
                      <input
                        type="text"
                        required
                        value={confirmSubjects}
                        onChange={(e) => setConfirmSubjects(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Days Per Week & Tuition Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">সপ্তাহে পড়ানোর দিন</label>
                      <select
                        value={confirmDaysPerWeek}
                        onChange={(e) => setConfirmDaysPerWeek(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      >
                        <option value="2 Days/Week">২ দিন / সপ্তাহ (2 Days)</option>
                        <option value="3 Days/Week">৩ দিন / সপ্তাহ (3 Days)</option>
                        <option value="4 Days/Week">৪ দিন / সপ্তাহ (4 Days)</option>
                        <option value="5 Days/Week">৫ দিন / সপ্তাহ (5 Days)</option>
                        <option value="6 Days/Week">৬ দিন / সপ্তাহ (6 Days)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">টিউশন টাইপ</label>
                      <select
                        value={confirmTuitionType}
                        onChange={(e) => setConfirmTuitionType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      >
                        <option value="Home Tutoring">হোম টিউশন (Home Tutoring)</option>
                        <option value="Online Tutoring">অনলাইন টিউশন (Online Tutoring)</option>
                        <option value="Group Tutoring">গ্রুপ টিউশন (Group Tutoring)</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">জেলা (District)</label>
                      <input
                        type="text"
                        value={confirmDistrict}
                        onChange={(e) => setConfirmDistrict(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 text-[11px] sm:text-xs">এলাকা (Area)</label>
                      <input
                        type="text"
                        value={confirmArea}
                        onChange={(e) => setConfirmArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px] sm:text-xs">বিস্তারিত ঠিকানা (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      placeholder="বাড়ি নম্বর, রোড নম্বর, লেন ইত্যাদি"
                      value={confirmDetailedAddress}
                      onChange={(e) => setConfirmDetailedAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Admin Notes */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px] sm:text-xs">অ্যাডমিন সমন্বয় বার্তা / নোট (ঐচ্ছিক)</label>
                    <textarea
                      rows={2}
                      placeholder="যেকোনো বিশেষ শর্ত বা উভয় পক্ষের সম্মতির সারাংশ..."
                      value={confirmNotes}
                      onChange={(e) => setConfirmNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white resize-none transition-all"
                    />
                  </div>

                  {/* Submit Button Toolbar */}
                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedRequestForConfirm(null)}
                      className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-slate-100 active:bg-slate-200 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all cursor-pointer text-center"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingConfirm}
                      className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl font-black shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                    >
                      {isSubmittingConfirm ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>কনফার্ম করা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>কনফার্ম করুন ও টিউটরকে পাঠান</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}

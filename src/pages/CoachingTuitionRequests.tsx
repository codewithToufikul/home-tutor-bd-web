import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History, MapPin, BookOpen,
  Sparkles, Users, ArrowRight, Eye, Check, X, ShieldCheck,
  Pencil, Trash2, Save, AlertTriangle, RefreshCw, PlusCircle
} from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository';
import { ApplicationRepository } from '@/src/repositories/applicationRepository';
import { Link } from 'react-router-dom';

export default function CoachingTuitionRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'matches' | 'applications' | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [shortlisted, setShortlisted] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [editJob, setEditJob] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRequests = async () => {
    if (!user) { setRequests([]); setLoading(false); return; }
    setLoading(true);
    try {
      const all: any = await TuitionService.list();
      const currentUserId = String(user.uid || (user as any)._id || (user as any).id || '');
      const mine = (all || []).filter((j: any) => {
        const postedById = typeof j.postedBy === 'object'
          ? String(j.postedBy?._id || j.postedBy?.id)
          : String(j.postedBy || j.parentId);
        return postedById === currentUserId;
      });
      mine.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return String(b._id || b.id || '').localeCompare(String(a._id || a.id || ''));
      });
      setRequests(mine);
    } catch (err) {
      console.error('Failed to load coaching tuition requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, [user]);

  const openApplicationsModal = async (job: any) => {
    setSelectedJob(job); setModalType('applications'); setModalLoading(true);
    try {
      const apps = await TuitionRepository.getApplications(String(job._id || job.id));
      setApplications(apps || []);
    } catch { setApplications([]); } finally { setModalLoading(false); }
  };

  const openMatchesModal = async (job: any) => {
    setSelectedJob(job); setModalType('matches'); setModalLoading(true);
    try {
      const res = await TuitionRepository.getShortlisted(String(job._id || job.id));
      setShortlisted(res?.shortlistedTutors || job.shortlistedTutors || []);
    } catch { setShortlisted(job.shortlistedTutors || []); } finally { setModalLoading(false); }
  };

  const handleAcceptApp = async (appId: string) => {
    if (!confirm('আপনি কি এই টিউটরকে নির্বাচন করতে নিশ্চিত?')) return;
    setActionLoading(true);
    try {
      await ApplicationRepository.accept(appId);
      alert('আবেদনটি সফলভাবে গ্রহণ করা হয়েছে!');
      if (selectedJob) await openApplicationsModal(selectedJob);
      loadRequests();
    } catch (err: any) { alert(err.message || 'সমস্যা হয়েছে।'); }
    finally { setActionLoading(false); }
  };

  const handleRejectApp = async (appId: string) => {
    if (!confirm('আপনি কি এই আবেদনটি প্রত্যাখ্যান করতে চান?')) return;
    setActionLoading(true);
    try {
      await ApplicationRepository.reject(appId);
      alert('আবেদনটি প্রত্যাখ্যান করা হয়েছে।');
      if (selectedJob) await openApplicationsModal(selectedJob);
      loadRequests();
    } catch (err: any) { alert(err.message || 'সমস্যা হয়েছে।'); }
    finally { setActionLoading(false); }
  };

  const openEditModal = (job: any) => {
    setEditJob(job);
    setEditForm({
      salary: job.salary || '',
      status: job.status || 'Open',
      subjects: Array.isArray(job.subjects) ? job.subjects.join(', ') : job.subjects || '',
      studentClass: job.studentClass || '',
      medium: job.medium || '',
      tuitionType: job.tuitionType || '',
      genderPreference: job.genderPreference || 'Any',
      tutoringDays: job.tutoringDays || '',
      duration: job.duration || '',
      tutorQualification: job.tutorQualification || '',
      requirements: job.requirements || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editJob) return;
    setEditLoading(true);
    try {
      const jobId = String(editJob._id || editJob.id);
      await TuitionService.update(jobId, {
        salary: Number(editForm.salary) || editJob.salary,
        status: editForm.status,
        subjects: editForm.subjects.split(',').map((s: string) => s.trim()).filter(Boolean),
        studentClass: editForm.studentClass,
        medium: editForm.medium,
        tuitionType: editForm.tuitionType,
        genderPreference: editForm.genderPreference,
        tutoringDays: editForm.tutoringDays,
        duration: editForm.duration,
        tutorQualification: editForm.tutorQualification,
        requirements: editForm.requirements,
      });
      setEditJob(null);
      await loadRequests();
    } catch (err: any) { alert(err.message || 'আপডেট করতে সমস্যা হয়েছে।'); }
    finally { setEditLoading(false); }
  };

  const handleDeleteJob = async (jobId: string) => {
    setDeleteLoading(true);
    try {
      await TuitionService.remove(jobId);
      setDeleteJobId(null);
      await loadRequests();
    } catch (err: any) { alert(err.message || 'মুছতে সমস্যা হয়েছে।'); }
    finally { setDeleteLoading(false); }
  };

  return (
    <CoachingLayout title="Tuition Posts & Management">
      <div className="space-y-4 sm:space-y-6 pb-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-5 rounded-2xl border border-ink/5 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight">My Tuition Posts & Applications</h1>
            <p className="text-xs text-ink-muted mt-0.5">আপনার পোস্ট করা টিউশনসমূহ, আবেদনকারী টিউটর এবং অটো-ম্যাচ করা শর্টলিস্ট দেখুন।</p>
          </div>
          <Link
            to="/request-tutor"
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            <PlusCircle size={15} />
            Post New Tuition
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-ink/5 p-6 animate-pulse h-32" />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && (
          <div className="space-y-3.5 sm:space-y-4">
            {requests.map((job) => {
              const jobId = String(job._id || job.id);
              const subjectsStr = Array.isArray(job.subjects) ? job.subjects.join(', ') : job.category || 'Tuition';
              const locStr = typeof job.location === 'object'
                ? `${job.location?.area || ''}, ${job.location?.district || ''}`
                : `${job.area || ''}, ${job.location || ''}`;
              const shortlistCount = job.shortlistedTutors?.length || 0;
              const mediumText = job.medium
                ? (job.medium.toLowerCase().includes('medium') || job.medium.toLowerCase().includes('version') ? job.medium : `${job.medium} Medium`)
                : 'General';

              return (
                <motion.div
                  key={jobId}
                  whileHover={{ y: -2 }}
                  className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-ink/5 shadow-sm space-y-3.5 sm:space-y-4 transition-all hover:shadow-md hover:border-primary/20"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-100 sm:border-none sm:pb-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        Job #{jobId.slice(-6).toUpperCase()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider ${
                        job.status === 'Matched' ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : job.status === 'Open' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        Status: {job.status || 'Open'}
                      </span>
                      <span className="text-[11px] font-bold text-ink-muted">
                        • {new Date(job.createdAt || Date.now()).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <Link to={`/job/${jobId}`} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-95" title="View Job Details">
                        <Eye size={15} />
                      </Link>
                      <button onClick={() => openEditModal(job)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all cursor-pointer border border-blue-200/80 active:scale-95" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteJobId(jobId)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200/80 active:scale-95" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black text-ink leading-snug">
                      Tutor Needed for {subjectsStr} ({job.studentClass || 'Class N/A'})
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-ink-muted pt-0.5">
                      <span className="inline-flex items-center gap-1 font-bold text-ink bg-slate-100/80 px-2 py-0.5 rounded-md">
                        <BookOpen size={13} className="text-primary shrink-0" /> {mediumText}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-md">
                        <MapPin size={13} className="text-primary shrink-0" />
                        <span className="truncate max-w-[200px] sm:max-w-none">{locStr || 'Location N/A'}</span>
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                        ৳ {job.salary ? job.salary.toLocaleString() : 'Negotiable'} / month
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 flex-1">
                      <button
                        onClick={() => openApplicationsModal(job)}
                        className="px-3.5 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                      >
                        <Users size={14} className="shrink-0" />
                        <span>View Applications</span>
                      </button>
                      <button
                        onClick={() => openMatchesModal(job)}
                        className="px-3 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-purple-200/80 active:scale-[0.98]"
                      >
                        <Sparkles size={14} className="text-purple-600 shrink-0" />
                        <span>Auto-Matched ({shortlistCount > 0 ? shortlistCount : 'Top 5'})</span>
                      </button>
                    </div>
                    <div className="flex sm:hidden items-center justify-between pt-1 border-t border-slate-100/80 gap-2">
                      <Link to={`/job/${jobId}`} className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95">
                        <Eye size={14} /> <span>View Post</span>
                      </Link>
                      <button onClick={() => openEditModal(job)} className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-all cursor-pointer border border-blue-200/80 active:scale-95 w-10 h-9 flex items-center justify-center shrink-0">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteJobId(jobId)} className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200/80 active:scale-95 w-10 h-9 flex items-center justify-center shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {requests.length === 0 && (
              <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl border border-ink/5 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
                  <History size={36} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-display font-black text-ink">No Tuition Posts Found</h3>
                  <p className="text-ink-muted text-xs max-w-sm mx-auto">আপনার কোচিং সেন্টার এখনও কোনো টিউশন পোস্ট করেনি।</p>
                </div>
                <Link to="/request-tutor" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 active:scale-95 transition-all">
                  <PlusCircle size={15} /> Post Tuition Now
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {editJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-[28px] p-4 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700">
                      <Pencil size={12} /> Edit Tuition Post
                    </div>
                    <h2 className="text-base sm:text-lg font-black text-ink leading-snug">
                      {editJob.subjects?.join(', ') || 'Tuition'} — {editJob.studentClass}
                    </h2>
                  </div>
                  <button onClick={() => setEditJob(null)} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer active:scale-95">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Subjects (comma separated)</label>
                    <input type="text" value={editForm.subjects} onChange={e => setEditForm((p: any) => ({ ...p, subjects: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Math, Physics, Chemistry" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Class / Course</label>
                    <input type="text" value={editForm.studentClass} onChange={e => setEditForm((p: any) => ({ ...p, studentClass: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Class 10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Monthly Salary (৳)</label>
                    <input type="number" value={editForm.salary} onChange={e => setEditForm((p: any) => ({ ...p, salary: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="5000" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Medium / Curriculum</label>
                    <select value={editForm.medium} onChange={e => setEditForm((p: any) => ({ ...p, medium: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white cursor-pointer">
                      {['Bangla Medium', 'English Medium', 'English Version', 'Madrasa', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tuition Type</label>
                    <select value={editForm.tuitionType} onChange={e => setEditForm((p: any) => ({ ...p, tuitionType: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white cursor-pointer">
                      {['Home Tuition', 'Online', 'Group Tuition', 'Coaching Center'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Tutor Gender</label>
                    <select value={editForm.genderPreference} onChange={e => setEditForm((p: any) => ({ ...p, genderPreference: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white cursor-pointer">
                      {['Any', 'Male', 'Female'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Days per Week</label>
                    <select value={editForm.tutoringDays} onChange={e => setEditForm((p: any) => ({ ...p, tutoringDays: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white cursor-pointer">
                      {['2 Days/Week', '3 Days/Week', '4 Days/Week', '5 Days/Week', '6 Days/Week', 'Daily'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Session Duration</label>
                    <select value={editForm.duration} onChange={e => setEditForm((p: any) => ({ ...p, duration: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white cursor-pointer">
                      {['1 Hour', '1.5 Hours', '2 Hours', '2.5 Hours', '3 Hours'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white cursor-pointer">
                      {['Open', 'Closed', 'Matched', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Expected Qualification</label>
                    <input type="text" value={editForm.tutorQualification} onChange={e => setEditForm((p: any) => ({ ...p, tutorQualification: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Graduate / Masters" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Additional Requirements</label>
                    <textarea rows={3} value={editForm.requirements} onChange={e => setEditForm((p: any) => ({ ...p, requirements: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" placeholder="Any special note for the tutor..." />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button onClick={() => setEditJob(null)} className="flex-1 sm:flex-initial px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all cursor-pointer active:scale-95 text-center">Cancel</button>
                  <button onClick={handleSaveEdit} disabled={editLoading} className="flex-1 sm:flex-initial px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-60 active:scale-95 text-center">
                    {editLoading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {editLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirm Modal */}
        <AnimatePresence>
          {deleteJobId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white w-full max-w-sm rounded-2xl sm:rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 text-center"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-200">
                  <AlertTriangle size={26} className="text-rose-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">Delete Tuition Post?</h3>
                  <p className="text-xs text-slate-500">এই টিউশন পোস্টটি স্থায়ীভাবে মুছে ফেলা হবে।</p>
                </div>
                <div className="flex gap-2.5 pt-1">
                  <button onClick={() => setDeleteJobId(null)} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all cursor-pointer active:scale-95">Cancel</button>
                  <button onClick={() => handleDeleteJob(deleteJobId)} disabled={deleteLoading} className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-60 active:scale-95 shadow-sm">
                    {deleteLoading ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Applications / Auto-Matches Modal */}
        <AnimatePresence>
          {modalType && selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-3xl rounded-2xl sm:rounded-[32px] p-4 sm:p-8 shadow-2xl border border-slate-200 space-y-4 sm:space-y-6 max-h-[88vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                  <div className="space-y-0.5 sm:space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                      {modalType === 'matches' ? <Sparkles size={13} /> : <Users size={13} />}
                      {modalType === 'matches' ? 'AI Auto-Matched Tutors' : 'Received Applications'}
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-ink line-clamp-1">
                      Job: {selectedJob.subjects?.join(', ') || 'Tuition'} ({selectedJob.studentClass})
                    </h2>
                  </div>
                  <button onClick={() => { setModalType(null); setSelectedJob(null); }} className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer active:scale-95">
                    <X size={18} />
                  </button>
                </div>

                {modalLoading ? (
                  <div className="py-16 text-center text-xs font-bold text-slate-400 animate-pulse">Loading details...</div>
                ) : modalType === 'applications' ? (
                  <div className="space-y-3 sm:space-y-4">
                    {applications.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <Users size={36} className="mx-auto text-slate-300" />
                        <p className="text-sm font-bold text-slate-800">এখনও কোনো আবেদন জমা পড়েনি।</p>
                        <p className="text-xs text-slate-400">টিউটররা আবেদন করলে এখানে তাদের তালিকা দেখতে পাবেন।</p>
                      </div>
                    ) : applications.map((app: any) => {
                      const appId = String(app._id || app.id);
                      const tutorUser = app.tutorId || {};
                      return (
                        <div key={appId} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-base overflow-hidden border shrink-0">
                                {tutorUser.avatar ? <img src={tutorUser.avatar} alt="" className="w-full h-full object-cover" /> : (tutorUser.name || 'T')[0].toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                                  {tutorUser.name || 'Tutor'}
                                  {app.isAutoShortlisted && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-black rounded-full">🤖 Auto Matched</span>}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-slate-500">{tutorUser.phone || tutorUser.email || 'Verified Tutor'}</p>
                              </div>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                              {app.matchScore !== undefined && app.matchScore !== null && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-black">
                                  <Sparkles size={11} /> Score: {app.matchScore}/100
                                </span>
                              )}
                              <span className="text-[10px] font-bold text-slate-500">Status: <span className="font-black text-slate-800">{app.status}</span></span>
                            </div>
                          </div>
                          {app.coverLetter && <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 italic">"{app.coverLetter}"</p>}
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-slate-100">
                            <div className="flex items-center gap-3 text-slate-500 font-bold">
                              {app.expectedSalary ? <span>Expected: ৳{app.expectedSalary}</span> : null}
                              {app.availableTime && app.availableTime.length > 0 && <span>Time: {app.availableTime.join(', ')}</span>}
                            </div>
                            {app.status === 'Pending' ? (
                              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button onClick={() => handleRejectApp(appId)} disabled={actionLoading} className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95">Reject</button>
                                <button onClick={() => handleAcceptApp(appId)} disabled={actionLoading} className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95">
                                  <Check size={14} /> Accept Tutor
                                </button>
                              </div>
                            ) : (
                              <span className={`px-3 py-1 rounded-full text-xs font-black ${app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{app.status}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {shortlisted.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <Sparkles size={36} className="mx-auto text-purple-300" />
                        <p className="text-sm font-bold text-slate-800">এখনও কোনো টিউটর ম্যাচ পাওয়া যায়নি।</p>
                        <p className="text-xs text-slate-400">সিস্টেম ব্যাকগ্রাউন্ডে সক্রিয় টিউটরদের সাথে ম্যাচ করছে।</p>
                      </div>
                    ) : shortlisted.map((item: any, idx: number) => {
                      const tutor = item.tutorId || {};
                      const tutorUser = tutor.userId || {};
                      const details = item.matchDetails || {};
                      return (
                        <div key={idx} className="bg-purple-50/50 border border-purple-200/70 rounded-2xl p-4 sm:p-5 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-base overflow-hidden shrink-0">
                                {tutorUser.avatar ? <img src={tutorUser.avatar} alt="" className="w-full h-full object-cover" /> : (tutorUser.name || 'T')[0].toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                                  {tutorUser.name || 'Top Tutor'}
                                  {tutor.isVerified && <ShieldCheck size={15} className="text-emerald-600 shrink-0" />}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-slate-500">{tutor.university || tutor.qualification || 'Experienced Tutor'}</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-black">
                                <Sparkles size={12} /> Score: {item.score || 0}/100
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 pt-1">
                            <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">Subject: {details.subjectScore || 0}/30</span>
                            <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">Location: {details.locationScore || 0}/20</span>
                            <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">Medium: {details.mediumScore || 0}/15</span>
                            <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">Salary: {details.salaryScore || 0}/10</span>
                            {details.bonusScore > 0 && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">Bonus: +{details.bonusScore}</span>}
                          </div>
                          {tutor._id && (
                            <div className="pt-2 flex justify-end">
                              <Link to={`/tutor/${tutor._id}`} className="w-full sm:w-auto text-center px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-1">
                                View Profile & Hire <ArrowRight size={13} />
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </CoachingLayout>
  );
}

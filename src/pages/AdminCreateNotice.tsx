import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Send, Trash2, PlusCircle,
  AlertCircle, CheckCircle2, Type,
  Users, Info, Clock, Megaphone, List,
  Calendar, FileText, AlertTriangle, RefreshCw, X, Eye
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext.tsx';
import {
  useCreateNoticeMutation,
  useGetAdminNoticesQuery,
  useDeleteNoticeMutation
} from '@/src/services/adminApi';

export default function AdminCreateNotice() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [audience, setAudience] = useState('All');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [displayUntil, setDisplayUntil] = useState('');
  const [content, setContent] = useState('');
  const [attachmentURL, setAttachmentURL] = useState('');

  // API Hooks
  const [createNoticeMutation, { isLoading: isSubmitting }] = useCreateNoticeMutation();
  const { data: adminNoticesData, isLoading: isLoadingNotices, refetch } = useGetAdminNoticesQuery(undefined);
  const [deleteNoticeMutation] = useDeleteNoticeMutation();

  const noticesList = (adminNoticesData as any)?.data || adminNoticesData || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Title and content are required.');
      return;
    }

    try {
      await createNoticeMutation({
        title: title.trim(),
        audience,
        priority,
        category,
        content: content.trim(),
        displayUntil: displayUntil ? new Date(displayUntil).toISOString() : null,
        attachmentURL: attachmentURL.trim() || '',
        isPublished: true,
      }).unwrap();

      setIsSuccess(true);
      setTitle('');
      setContent('');
      setDisplayUntil('');
      setAttachmentURL('');
      refetch();
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to create notice:', err);
      setErrorMsg(err?.data?.message || 'Failed to publish notice.');
    }
  };

  const handleDeleteNotice = async () => {
    if (!noticeToDelete) return;
    try {
      await deleteNoticeMutation(noticeToDelete).unwrap();
      setNoticeToDelete(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete notice:', err);
      alert('Failed to delete notice.');
    }
  };

  const inputClasses = "w-full bg-white/70 backdrop-blur-xl border border-ink/10 rounded-2xl py-3.5 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all shadow-sm placeholder:text-ink-muted/40";
  const labelClasses = "block text-[11px] font-black text-ink uppercase mb-1.5 ml-1 tracking-wider";

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
              <Megaphone size={28} />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-ink tracking-tight">
                Notice Board Management
              </h2>
              <p className="text-xs font-medium text-ink-muted mt-0.5">
                Broadcast instant notices & system announcements to tutors, students and guardians.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('create')}
              className={cn(
                "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === 'create'
                  ? "bg-white text-primary shadow-sm"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <PlusCircle size={14} /> New Notice
            </button>
            <button
              onClick={() => {
                setActiveTab('manage');
                refetch();
              }}
              className={cn(
                "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                activeTab === 'manage'
                  ? "bg-white text-primary shadow-sm"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <List size={14} /> Manage Notices ({noticesList.length})
            </button>
          </div>
        </div>

        {/* Global Error/Success Banner */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-between text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>Notice published successfully! In-app and push notifications sent to targeted users.</span>
              </div>
              <button onClick={() => setIsSuccess(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={14} />
              </button>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-600/20 flex items-center justify-between text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'create' ? (
          /* Create Form Section */
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[40px] border border-white/60 shadow-xl shadow-ink/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Notice Title */}
              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}>Notice Title*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted/50">
                    <Type size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g., জরুরি নোটিশ: পেমেন্ট পলিসি ও টিউশন ম্যাচিং আপডেট"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={cn(inputClasses, "pl-11")}
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Target Audience*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted/50">
                    <Users size={16} />
                  </div>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    required
                    className={cn(inputClasses, "pl-11 appearance-none")}
                  >
                    <option value="All">All Users (সকল টিউটর, অভিভাবক ও স্টুডেন্ট)</option>
                    <option value="Tutors">Tutors Only (শুধুমাত্র টিউটর)</option>
                    <option value="Guardians">Guardians Only (শুধুমাত্র অভিভাবক)</option>
                    <option value="Students">Students Only (শুধুমাত্র শিক্ষার্থী)</option>
                    <option value="Coaching">Coaching Centers Only (কোচিং সেন্টার)</option>
                  </select>
                </div>
              </div>

              {/* Notice Priority */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Priority Level*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted/50">
                    <Info size={16} />
                  </div>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    required
                    className={cn(inputClasses, "pl-11 appearance-none")}
                  >
                    <option value="High">High (জরুরি - লাল ব্যাজসহ হাইলাইট)</option>
                    <option value="Medium">Medium (গুরুত্বপূর্ণ)</option>
                    <option value="Low">Low (সাধারণ তথ্য)</option>
                  </select>
                </div>
              </div>

              {/* Notice Category */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Notice Category*</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted/50">
                    <Megaphone size={16} />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className={cn(inputClasses, "pl-11 appearance-none")}
                  >
                    <option value="General">General Announcement (সাধারণ ঘোষণা)</option>
                    <option value="Policy">Policy Update (নীতিমালা আপডেট)</option>
                    <option value="Event">Event / Holiday (ছুটি বা বিশেষ ইভেন্ট)</option>
                    <option value="System">System Maintenance (সার্ভার রক্ষণাবেক্ষণ)</option>
                  </select>
                </div>
              </div>

              {/* Expiration Date */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Display Until (Optional Expiration)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-ink-muted/50">
                    <Clock size={16} />
                  </div>
                  <input
                    type="date"
                    value={displayUntil}
                    onChange={(e) => setDisplayUntil(e.target.value)}
                    className={cn(inputClasses, "pl-11")}
                  />
                </div>
              </div>



              {/* Notice Content */}
              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}>Notice Content (বিস্তারিত বিবরণ)*</label>
                <textarea
                  placeholder="নোটিশের বিস্তারিত বার্তা বাংলায় বা ইংরেজিতে লিখুন..."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={cn(inputClasses, "min-h-[160px] py-4 resize-none")}
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center gap-3 pt-4 border-t border-ink/5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-sm py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 bg-primary text-white shadow-xl shadow-primary/25 hover:bg-primary-dark cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send size={16} /> Publish & Broadcast Notice</>
                )}
              </button>
              <p className="text-[10px] font-bold text-ink-muted/60 uppercase tracking-widest text-center">
                This notice will be broadcasted to targeted user dashboards & push notifications immediately.
              </p>
            </div>
          </form>
        ) : (
          /* Manage Existing Notices */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-ink uppercase tracking-wider">All Broadcasted Notices</h3>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-ink/10 text-xs font-bold text-ink-muted hover:text-primary transition-all shadow-sm"
              >
                <RefreshCw size={13} className={isLoadingNotices ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>

            {isLoadingNotices ? (
              <div className="py-16 text-center text-ink-muted bg-white/70 rounded-3xl">
                <RefreshCw size={24} className="animate-spin mx-auto text-primary mb-2" />
                <p className="text-xs font-bold">Loading notices list...</p>
              </div>
            ) : noticesList.length === 0 ? (
              <div className="py-16 text-center bg-white/70 rounded-3xl space-y-2">
                <Bell size={32} className="mx-auto text-ink-muted/40" />
                <h4 className="text-sm font-black text-ink">No Notices Published Yet</h4>
                <p className="text-xs text-ink-muted">Click "New Notice" tab above to create and broadcast your first notice.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {noticesList.map((notice: any) => (
                  <div
                    key={notice._id || notice.id}
                    className="bg-white/80 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-md uppercase",
                          notice.priority === 'High' ? "bg-rose-50 text-rose-600 border border-rose-200" :
                            notice.priority === 'Medium' ? "bg-amber-50 text-amber-600 border border-amber-200" :
                              "bg-blue-50 text-blue-600 border border-blue-200"
                        )}>
                          {notice.priority}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                          {notice.category}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          Audience: {notice.audience}
                        </span>
                        <span className="text-[10px] text-ink-muted flex items-center gap-1 ml-auto sm:ml-0">
                          <Calendar size={11} />
                          {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString('en-GB') : 'Recently'}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-ink">{notice.title}</h4>
                      <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed whitespace-pre-line">
                        {notice.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => setNoticeToDelete(notice._id || notice.id)}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                        title="Delete Notice"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {noticeToDelete && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNoticeToDelete(null)}
                className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/60 p-6 text-center space-y-4 z-10"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-black text-ink">Delete Notice?</h3>
                  <p className="text-xs text-ink-muted leading-relaxed">
                    Are you sure you want to delete this notice? It will no longer be visible on users' notice boards.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setNoticeToDelete(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 text-ink font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteNotice}
                    className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-black text-xs uppercase shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}

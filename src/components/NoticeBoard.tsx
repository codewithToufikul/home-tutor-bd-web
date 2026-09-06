import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell, Megaphone, Calendar, Clock, AlertTriangle,
  Info, CheckCircle2, Search, FileText, Download,
  ExternalLink, X, ShieldAlert, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { useGetNoticesQuery } from '@/src/services/adminApi';
import { cn } from '@/src/lib/utils';

export interface NoticeItem {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  audience: 'All' | 'Tutors' | 'Guardians' | 'Students' | 'Coaching';
  priority: 'Low' | 'Medium' | 'High';
  category: 'Policy' | 'Event' | 'System' | 'General';
  displayUntil?: string;
  attachmentURL?: string;
  attachmentName?: string;
  createdAt: string;
  createdBy?: {
    name?: string;
    avatar?: string;
    role?: string;
  };
}

interface NoticeBoardProps {
  userRole?: 'tutor' | 'student' | 'guardian' | 'coaching' | 'admin';
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  limit?: number;
}

export default function NoticeBoard({
  userRole,
  title = 'নোটিশ বোর্ড (Notice Board)',
  subtitle = 'গুরুত্বপূর্ণ নোটিশ, অ্যাকাউন্টিং আপডেট ও প্ল্যাটফর্মের নিয়মিত ঘোষণা',
  showHeader = true,
  limit,
}: NoticeBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNoticeModal, setActiveNoticeModal] = useState<NoticeItem | null>(null);

  const { data: noticesResponse, isLoading, refetch } = useGetNoticesQuery({
    audience: userRole,
  });

  const rawNotices = useMemo(() => {
    const list = (noticesResponse as { data?: NoticeItem[] } | undefined)?.data ?? (noticesResponse as any) ?? [];
    return Array.isArray(list) ? list : [];
  }, [noticesResponse]);

  const filteredNotices = useMemo(() => {
    return rawNotices.filter((notice: NoticeItem) => {
      const matchesCategory = selectedCategory === 'All' || notice.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        notice.title?.toLowerCase().includes(q) ||
        notice.content?.toLowerCase().includes(q) ||
        notice.category?.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [rawNotices, selectedCategory, searchQuery]);

  const displayedNotices = limit ? filteredNotices.slice(0, limit) : filteredNotices;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm animate-pulse">
            <AlertTriangle size={11} /> জরুরি (Urgent)
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <Info size={11} /> গুরুত্বপূর্ণ (Important)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-600 border border-blue-500/20">
            <Bell size={11} /> সাধারণ (General)
          </span>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    const map: Record<string, { label: string; color: string }> = {
      Policy: { label: 'পলিসি আপডেট', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      Event: { label: 'ইভেন্ট / ছুটি', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      System: { label: 'সিস্টেম রক্ষণাবেক্ষণ', color: 'bg-amber-50 text-amber-700 border-amber-200' },
      General: { label: 'সাধারণ নোটিশ', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    };
    const info = map[category] || { label: category || 'Announcement', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    return (
      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', info.color)}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner shrink-0">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-display font-black text-ink">{title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {rawNotices.length} মোট নোটিশ
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted">
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder="নোটিশ খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-ink/10 rounded-xl py-2 pl-9 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['All', 'General', 'Policy', 'Event', 'System'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
              selectedCategory === cat
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-white/80 text-ink-muted hover:text-ink hover:bg-white border border-ink/5'
            )}
          >
            {cat === 'All' ? 'সব নোটিশ (All)' : cat === 'Policy' ? 'পলিসি (Policy)' : cat === 'Event' ? 'ইভেন্ট (Event)' : cat === 'System' ? 'সিস্টেম (System)' : 'সাধারণ (General)'}
          </button>
        ))}
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-ink-muted bg-white/60 rounded-3xl border border-white/60">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-bold">নোটিশ লোড হচ্ছে...</p>
          </div>
        ) : displayedNotices.length === 0 ? (
          <div className="py-16 text-center bg-white/60 rounded-3xl border border-white/60 space-y-2">
            <div className="w-12 h-12 bg-ink/5 rounded-2xl flex items-center justify-center text-ink-muted mx-auto">
              <Bell size={24} />
            </div>
            <h4 className="text-sm font-black text-ink">কোনো নোটিশ পাওয়া যায়নি</h4>
            <p className="text-xs text-ink-muted max-w-sm mx-auto">
              এই মুহূর্তে আপনার জন্য কোনো নতুন নোটিশ নেই। নতুন নোটিশ আসলে এখানে দেখতে পাবেন।
            </p>
          </div>
        ) : (
          displayedNotices.map((notice: NoticeItem) => {
            const isHighPriority = notice.priority === 'High';
            return (
              <motion.div
                key={notice._id || notice.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'group p-5 md:p-6 rounded-3xl transition-all relative overflow-hidden cursor-pointer shadow-sm hover:shadow-md border',
                  isHighPriority
                    ? 'bg-rose-500/[0.03] border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/[0.06]'
                    : 'bg-white/80 backdrop-blur-xl border-white/60 hover:border-primary/30 hover:bg-white'
                )}
                onClick={() => setActiveNoticeModal(notice)}
              >
                {/* High Priority Left Indicator */}
                {isHighPriority && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-l-full" />
                )}

                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(notice.priority)}
                      {getCategoryBadge(notice.category)}
                      {notice.audience && notice.audience !== 'All' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-ink/5 text-ink-muted">
                          টার্গেট: {notice.audience}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                      <Calendar size={12} className="text-primary" />
                      <span>
                        {notice.createdAt
                          ? new Date(notice.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'সম্প্রতি'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Preview Content */}
                  <div>
                    <h4 className="text-base font-black text-ink group-hover:text-primary transition-colors leading-tight">
                      {notice.title}
                    </h4>
                    <p className="text-xs text-ink-muted mt-1.5 line-clamp-2 leading-relaxed whitespace-pre-line">
                      {notice.content}
                    </p>
                  </div>

                  {/* Bottom Footer: Attachment & Read More */}
                  <div className="flex items-center justify-between pt-2 border-t border-ink/5">
                    {notice.attachmentURL ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                        <FileText size={13} />
                        <span>সংযুক্তি ফাইল রয়েছে (Attachment)</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    <button className="text-xs font-black text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      বিস্তারিত পড়ুন <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Full Notice View Modal */}
      <AnimatePresence>
        {activeNoticeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveNoticeModal(null)}
              className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-white/60 overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPriorityBadge(activeNoticeModal.priority)}
                    {getCategoryBadge(activeNoticeModal.category)}
                  </div>
                  <h3 className="text-lg font-black leading-tight text-white">
                    {activeNoticeModal.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(activeNoticeModal.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                    {activeNoticeModal.displayUntil && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Clock size={13} />
                        মেয়াদ: {new Date(activeNoticeModal.displayUntil).toLocaleDateString('bn-BD')}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setActiveNoticeModal(null)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                <div className="prose prose-sm max-w-none text-ink text-sm leading-relaxed whitespace-pre-wrap">
                  {activeNoticeModal.content}
                </div>

                {/* Attachment Section */}
                {activeNoticeModal.attachmentURL && (
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-ink">সংযুক্ত ডকুমেন্ট (Attached File)</p>
                        <p className="text-[10px] text-ink-muted truncate max-w-[200px] sm:max-w-xs">
                          {activeNoticeModal.attachmentName || 'Notice Attachment'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={activeNoticeModal.attachmentURL}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                      <Download size={14} /> ডাউনলোড
                    </a>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-ink/10 flex justify-end shrink-0">
                <button
                  onClick={() => setActiveNoticeModal(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase transition-all"
                >
                  বন্ধ করুন (Close)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

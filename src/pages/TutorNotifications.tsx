import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Trash2,
  Search,
  Megaphone,
  AlertCircle,
  Info,
  Clock,
  ChevronRight,
  Loader2,
  CheckCheck
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { cn } from '@/src/lib/utils';
import { NotificationRepository } from '@/src/repositories/notificationRepository';

interface Notice {
  id: string;
  title: string;
  audience?: string;
  priority?: string;
  category?: string;
  content: string;
  date: string;
  isRead?: boolean;
  link?: string;
}

export default function TutorNotifications() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotices = async () => {
    try {
      setLoading(true);
      // Directly call user's notifications (instant response, no 403 admin route)
      const userNotifs = await NotificationRepository.getAll();

      const formattedNotifs: Notice[] = (Array.isArray(userNotifs) ? userNotifs : []).map((n: any) => ({
        id: String(n._id || n.id || ''),
        title: n.title || 'System Notification',
        content: n.message || n.content || '',
        date: n.createdAt || new Date().toISOString(),
        isRead: Boolean(n.isRead),
        priority: n.priority || (n.type === 'tutor_request' || n.type === 'hire_request' ? 'high' : 'medium'),
        category: n.type || 'system',
      }));

      setNotices(formattedNotifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await NotificationRepository.markAllRead();
      setNotices((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await NotificationRepository.remove(id);
      setNotices((current) => current.filter((notice) => notice.id !== id));
    } catch (error) {
      console.error('Failed to delete notice:', error);
    }
  };

  const getPriorityStyles = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-500 border-rose-100';
      case 'medium':
        return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'low':
        return 'bg-blue-50 text-blue-500 border-blue-100';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'policy':
        return <Info size={18} />;
      case 'event':
        return <Clock size={18} />;
      case 'system':
        return <AlertCircle size={18} />;
      default:
        return <Megaphone size={18} />;
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      (notice.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notice.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && notice.priority?.toLowerCase() === filter.toLowerCase();
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <TutorLayout>
      <div className="space-y-5 sm:space-y-8 max-w-5xl mx-auto pb-24 sm:pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-display font-black text-ink flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5 shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span>Notifications</span>
            </h1>
            <p className="text-xs sm:text-sm font-medium text-ink-muted">
              Stay updated with your applications, tuition offers, and admin messages.
            </p>
          </div>

          {notices.some(n => !n.isRead) && (
            <button
              onClick={handleMarkAllRead}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-ink/10 text-xs font-bold text-ink hover:text-primary hover:border-primary transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <CheckCheck size={16} className="text-primary" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-center justify-between bg-white/60 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-[28px] border border-white/40 shadow-lg shadow-ink/5">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide snap-x snap-mandatory">
            {['all', 'high', 'medium', 'low'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'snap-start flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer active:scale-95 text-center',
                  filter === f
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-ink-muted hover:bg-white/60 hover:text-ink'
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted/40" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 border border-white/60 rounded-xl py-2.5 sm:py-3 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-ink-muted/40"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {loading ? (
            <div className="py-20 sm:py-24 text-center space-y-3 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-[32px] shadow-sm">
              <Loader2 className="animate-spin text-primary mx-auto" size={30} />
              <p className="text-xs font-bold text-ink-muted">Loading notifications...</p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                {filteredNotices.map((notice, index) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      "bg-white/80 backdrop-blur-xl border rounded-2xl sm:rounded-[28px] md:rounded-[32px] p-4 sm:p-6 lg:p-7 shadow-lg shadow-ink/5 group hover:bg-white transition-all overflow-hidden relative",
                      !notice.isRead ? "border-primary/40 bg-primary/[0.02]" : "border-white/60"
                    )}
                  >
                    {notice.priority?.toLowerCase() === 'high' && (
                      <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-rose-500" />
                    )}

                    <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
                      {/* Left Icon */}
                      <div className={cn(
                        'w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm',
                        notice.priority?.toLowerCase() === 'high'
                          ? 'bg-rose-50 text-rose-500'
                          : notice.priority?.toLowerCase() === 'medium'
                            ? 'bg-amber-50 text-amber-500'
                            : 'bg-primary/10 text-primary'
                      )}>
                        {getCategoryIcon(notice.category)}
                      </div>

                      {/* Content Block */}
                      <div className="flex-1 min-w-0 space-y-2 sm:space-y-2.5">
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <h3 className="text-sm sm:text-base font-black text-ink leading-snug">
                                {notice.title}
                              </h3>
                              <span className={cn(
                                'px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider border',
                                getPriorityStyles(notice.priority)
                              )}>
                                {notice.priority}
                              </span>
                              {!notice.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold text-ink-muted/60 uppercase">
                              <span className="flex items-center gap-1"><Clock size={11} /> {formatDate(notice.date)}</span>
                              <span className="w-1 h-1 bg-ink/10 rounded-full" />
                              <span className="truncate">{notice.category}</span>
                            </div>
                          </div>

                          {/* Delete Action Button */}
                          <button
                            onClick={() => deleteNotice(notice.id)}
                            className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg sm:rounded-xl transition-all cursor-pointer shrink-0 active:scale-95"
                            title="Remove notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Content Body */}
                        <p className="text-xs sm:text-sm font-medium text-ink-muted leading-relaxed whitespace-pre-wrap">
                          {notice.content}
                        </p>

                        {notice.link && (
                          <div className="pt-1">
                            <button className="flex items-center gap-1.5 text-primary font-black text-[11px] uppercase tracking-wider group/btn cursor-pointer active:scale-95">
                              Learn More <ChevronRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredNotices.length === 0 && (
                <div className="py-16 sm:py-24 text-center space-y-3 sm:space-y-4 bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-[32px] shadow-sm">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto shadow-inner">
                    <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-ink-muted/20" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-display font-black text-ink">No notifications</h3>
                    <p className="text-xs font-medium text-ink-muted">You're all caught up! New notifications will appear here.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TutorLayout>
  );
}


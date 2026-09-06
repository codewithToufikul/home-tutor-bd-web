import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Trash2, Clock, Search, Sparkles, CheckCircle2, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { NotificationRepository, NotificationRecord } from '@/src/repositories/notificationRepository';

export default function StudentNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await NotificationRepository.getAll();
      setNotifications(Array.isArray(data) ? data : (data as any)?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const deleteNotif = async (id: string) => {
    try {
      await NotificationRepository.remove(id);
      setNotifications((prev) => prev.filter((n) => String(n._id || n.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await NotificationRepository.markAllRead();
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (n.title || '').toLowerCase().includes(q) ||
      (n.message || '').toLowerCase().includes(q);
    if (filter === 'unread') return matchesSearch && !n.isRead;
    return matchesSearch;
  });

  const getIcon = (type?: string) => {
    switch (type) {
      case 'system':
        return <Sparkles size={18} className="text-emerald-500" />;
      case 'application':
        return <CheckCircle2 size={18} className="text-blue-500" />;
      case 'alert':
        return <AlertCircle size={18} className="text-rose-500" />;
      default:
        return <Info size={18} className="text-primary" />;
    }
  };

  const handleNotificationClick = (notif: NotificationRecord) => {
    if (notif.referenceId) {
      navigate(`/student/requests/${notif.referenceId}/applications`);
    } else {
      navigate('/student/requests');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <StudentLayout>
      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto sm:px-0 pb-28 sm:pb-16">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none border sm:border-0 border-slate-200/80 shadow-2xs sm:shadow-none">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-xs shrink-0">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#001F3F] tracking-tight">My Notifications</h1>
              <p className="text-xs text-slate-500 mt-0.5">Stay updated with responses, tutor applications, and notices.</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="w-full sm:w-auto px-4 py-2.5 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCheck size={15} /> Mark all as read
            </button>
          )}
        </div>

        {/* Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 items-stretch sm:items-center justify-between bg-white p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs">
          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${filter === 'all'
                ? 'bg-white text-[#001F3F] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${filter === 'unread'
                ? 'bg-white text-[#001F3F] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-secondary focus:bg-white transition"
            />
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-xs animate-pulse">
            Loading notifications...
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((notif) => {
                const id = String(notif._id || notif.id);
                const isUnread = !notif.isRead;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 sm:p-5 rounded-2xl border transition-all flex items-start gap-3 sm:gap-4 cursor-pointer active:scale-[0.99] ${isUnread
                      ? 'bg-white border-secondary/30 shadow-xs ring-1 ring-secondary/15'
                      : 'bg-white/90 border-slate-200/80 hover:bg-white hover:border-slate-300'
                      }`}
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 mt-0.5 border border-slate-100">
                      {getIcon(notif.type)}
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-black text-[#001F3F] leading-snug">
                            {notif.title}
                          </h3>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-secondary shrink-0" />
                          )}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Clock size={11} />
                          {notif.createdAt
                            ? new Date(String(notif.createdAt)).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            : 'Just now'}
                        </span>
                      </div>

                      {/* Message */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">
                        {notif.message}
                      </p>

                      {/* Action CTA badge */}
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-white rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wide hover:bg-secondary/90 transition-all shadow-2xs">
                          View Applications & Tutors →
                        </span>
                      </div>
                    </div>

                    {/* Delete Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotif(id);
                      }}
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all shrink-0 cursor-pointer active:scale-90"
                      title="Delete notification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-16 text-center space-y-3 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                  <Bell size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">No notifications found</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">When you receive responses or notices, they will appear here.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

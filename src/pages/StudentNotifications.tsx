import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Trash2, Clock, Search, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { NotificationRepository, NotificationRecord } from '@/src/repositories/notificationRepository';

export default function StudentNotifications() {
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
        return <Sparkles size={20} className="text-emerald-500" />;
      case 'application':
        return <CheckCircle2 size={20} className="text-blue-500" />;
      case 'alert':
        return <AlertCircle size={20} className="text-rose-500" />;
      default:
        return <Info size={20} className="text-primary" />;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-lg shadow-secondary/10">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-display font-black text-ink">My Notifications</h1>
              <p className="text-xs text-ink-muted">Stay updated with enrollment responses, tutor applications, and notices.</p>
            </div>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllRead}
              className="px-4 py-2.5 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-2xl text-xs font-bold transition-all"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-ink/5 shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'all' ? 'bg-secondary text-white shadow-md' : 'text-ink-muted hover:text-ink'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === 'unread' ? 'bg-secondary text-white shadow-md' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-background rounded-xl text-xs font-bold outline-none border border-ink/5 focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="py-20 text-center text-ink-muted font-bold text-sm">Loading notifications...</div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((notif) => {
                const id = String(notif._id || notif.id);
                const isUnread = !notif.isRead;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-6 rounded-3xl border transition-all flex items-start gap-4 ${
                      isUnread
                        ? 'bg-white border-secondary/20 shadow-md ring-1 ring-secondary/10'
                        : 'bg-white/80 border-ink/5 hover:bg-white'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 mt-0.5 border border-ink/5">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-ink truncate">{notif.title}</h3>
                        <span className="text-[10px] font-bold text-ink-muted flex items-center gap-1">
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
                      <p className="text-xs text-ink-muted font-medium leading-relaxed">{notif.message}</p>
                    </div>

                    <button
                      onClick={() => deleteNotif(id)}
                      className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition-all shrink-0 cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-ink/5">
                <Bell size={40} className="text-ink-muted/30 mx-auto" />
                <h4 className="text-base font-bold text-ink">No notifications found</h4>
                <p className="text-xs text-ink-muted">When you receive notifications, they will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

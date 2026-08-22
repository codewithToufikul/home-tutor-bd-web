import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, Search, Sparkles, UserPlus, CreditCard, 
  MessageSquare, Briefcase, ChevronRight, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { NotificationRepository, NotificationRecord } from '@/src/repositories/notificationRepository';
import { cn } from '@/src/lib/utils';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const items = await NotificationRepository.getAll();
      setNotifications(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load admin notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'user_registration':
      case 'tutor_verification':
        return <UserPlus size={20} className="text-primary" />;
      case 'payment':
        return <CreditCard size={20} className="text-emerald-500" />;
      case 'tuition_job':
      case 'job_approval':
        return <Briefcase size={20} className="text-blue-500" />;
      case 'system':
        return <Sparkles size={20} className="text-purple-500" />;
      default:
        return <Info size={20} className="text-primary" />;
    }
  };

  const handleNotificationClick = async (notif: NotificationRecord) => {
    const notifId = String(notif._id || notif.id);
    if (!notif.isRead && notifId) {
      try {
        await NotificationRepository.remove(notifId);
        setNotifications((prev) =>
          prev.map((n) => (String(n._id || n.id) === notifId ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }

    const type = notif.type || '';
    const title = (notif.title || '').toLowerCase();

    if (type === 'tutor_verification' || type === 'tutor_approval' || title.includes('tutor') || title.includes('টিউটর')) {
      navigate('/admin/all-tutors');
    } else if (type === 'job_post' || type === 'tuition_job' || type === 'job_approval' || title.includes('job') || title.includes('জব')) {
      navigate('/admin/jobs-approve');
    } else if (type === 'hire_request' || title.includes('hire') || title.includes('হায়ার')) {
      navigate('/admin/hire-pending');
    } else if (type === 'coaching' || title.includes('coaching') || title.includes('কোচিং')) {
      navigate('/admin/coaching');
    } else if (type === 'application') {
      navigate('/admin/all-jobs');
    } else {
      navigate('/admin/users');
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

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await NotificationRepository.remove(id);
      setNotifications((prev) => prev.filter((n) => String(n._id || n.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((notif) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (notif.title || '').toLowerCase().includes(q) ||
      (notif.message || '').toLowerCase().includes(q);
    if (filter === 'unread') return matchesSearch && !notif.isRead;
    return matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-black text-ink tracking-tight flex items-center gap-3">
              <Bell className="text-primary" size={32} />
              System Notifications
            </h2>
            <p className="text-sm font-medium text-ink-muted">Stay updated with the latest platform activities.</p>
          </div>
          {notifications.some((n) => !n.isRead) && (
            <button 
              onClick={markAllRead}
              className="text-primary font-black text-xs uppercase tracking-widest hover:underline transition-all cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List Container */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden">
          <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setFilter('all')}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer", filter === 'all' ? "bg-primary text-white" : "text-ink-muted hover:bg-white")}
              >
                All ({notifications.length})
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer", filter === 'unread' ? "bg-primary text-white" : "text-ink-muted hover:bg-white")}
              >
                Unread ({notifications.filter(n => !n.isRead).length})
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/50" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/60 border border-ink/5 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 w-40 md:w-64" 
              />
            </div>
          </div>

          <div className="divide-y divide-ink/5">
            {loading ? (
              <div className="py-20 text-center text-ink-muted font-bold text-sm">Loading notifications...</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((notif) => {
                  const id = String(notif._id || notif.id);
                  const isUnread = !notif.isRead;

                  return (
                    <motion.div 
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "p-6 flex items-start gap-6 group hover:bg-white/90 transition-all cursor-pointer relative",
                        isUnread ? "bg-primary/[0.03]" : ""
                      )}
                    >
                      {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-r" />
                      )}
                      
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                        isUnread ? "bg-primary/10 text-primary shadow-md shadow-primary/10" : "bg-ink/5 text-ink-muted"
                      )}>
                        {getIcon(notif.type)}
                      </div>

                      <div className="flex-grow space-y-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn("text-sm text-ink truncate", isUnread ? "font-black" : "font-bold")}>
                            {notif.title || 'Notification'}
                          </h4>
                          <span className="text-[10px] font-bold text-ink-muted/60 shrink-0 flex items-center gap-1">
                            <Clock size={11} />
                            {notif.createdAt ? new Date(String(notif.createdAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-ink-muted leading-relaxed line-clamp-2">{notif.message}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={(e) => deleteNotification(id, e)}
                          className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={18} className="text-ink-muted/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto">
                <Bell size={32} />
              </div>
              <p className="text-sm font-bold text-ink-muted">No notifications found.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

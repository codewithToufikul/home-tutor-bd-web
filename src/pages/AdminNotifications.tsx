import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, Search, Sparkles, UserPlus, CreditCard, 
  MessageSquare, Briefcase, ChevronRight, Clock,
  CheckCheck, Filter, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { NotificationRepository, NotificationRecord } from '@/src/repositories/notificationRepository';
import { cn } from '@/src/lib/utils';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'tutor' | 'job'>('all');
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

  const getIconConfig = (type?: string) => {
    switch (type) {
      case 'user_registration':
      case 'tutor_verification':
      case 'tutor_approval':
        return {
          icon: <UserPlus size={18} className="text-primary" />,
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-600',
          badgeText: 'Tutor',
        };
      case 'payment':
        return {
          icon: <CreditCard size={18} className="text-teal-600" />,
          bg: 'bg-teal-50 border-teal-100 text-teal-600',
          badgeText: 'Payment',
        };
      case 'tuition_job':
      case 'job_approval':
      case 'job_post':
        return {
          icon: <Briefcase size={18} className="text-blue-600" />,
          bg: 'bg-blue-50 border-blue-100 text-blue-600',
          badgeText: 'Tuition',
        };
      case 'system':
        return {
          icon: <Sparkles size={18} className="text-purple-600" />,
          bg: 'bg-purple-50 border-purple-100 text-purple-600',
          badgeText: 'System',
        };
      default:
        return {
          icon: <Info size={18} className="text-primary" />,
          bg: 'bg-primary/10 border-primary/20 text-primary',
          badgeText: 'General',
        };
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

    if (!matchesSearch) return false;

    if (filter === 'unread') return !notif.isRead;
    if (filter === 'payment') return notif.type === 'payment';
    if (filter === 'tutor') return notif.type?.includes('tutor') || notif.type === 'user_registration';
    if (filter === 'job') return notif.type?.includes('job') || notif.type === 'tuition_job';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatRelativeTime = (dateStr?: string | Date) => {
    if (!dateStr) return 'Just now';
    const date = new Date(String(dateStr));
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-6 pb-28 px-0">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-3 px-1 sm:px-0">
          <div className="space-y-0.5">
            <h2 className="text-xl sm:text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Bell size={18} className="sm:w-5 sm:h-5" />
              </div>
              <span>System Notifications</span>
            </h2>
            <p className="text-[11px] sm:text-sm font-medium text-slate-500">
              Stay updated with real-time platform activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="flex items-center gap-1 text-primary hover:text-emerald-700 font-bold text-[11px] sm:text-xs transition-all cursor-pointer shrink-0 bg-primary/10 hover:bg-primary/15 px-2.5 sm:px-3 py-1.5 rounded-xl active:scale-95 border border-primary/20"
            >
              <CheckCheck size={13} />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </button>
          )}
        </div>

        {/* Notifications List Card Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Filter & Search Toolbar */}
          <div className="p-2.5 sm:p-4 border-b border-slate-100 flex flex-col gap-2.5 bg-slate-50/70">
            {/* Search Input */}
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search notifications by title or message..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-8 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900 placeholder:text-slate-400" 
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Pill Filter Tabs (Horizontal scroll on mobile) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
              <button 
                onClick={() => setFilter('all')}
                className={cn(
                  "py-1 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                  filter === 'all' 
                    ? "bg-primary text-white shadow-xs font-black" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                )}
              >
                All ({notifications.length})
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={cn(
                  "py-1 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1",
                  filter === 'unread' 
                    ? "bg-primary text-white shadow-xs font-black" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                )}
              >
                {unreadCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                Unread ({unreadCount})
              </button>
              <button 
                onClick={() => setFilter('payment')}
                className={cn(
                  "py-1 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                  filter === 'payment' 
                    ? "bg-primary text-white shadow-xs font-black" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                )}
              >
                Payments
              </button>
              <button 
                onClick={() => setFilter('tutor')}
                className={cn(
                  "py-1 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                  filter === 'tutor' 
                    ? "bg-primary text-white shadow-xs font-black" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                )}
              >
                Tutors
              </button>
              <button 
                onClick={() => setFilter('job')}
                className={cn(
                  "py-1 px-3 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                  filter === 'job' 
                    ? "bg-primary text-white shadow-xs font-black" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
                )}
              >
                Jobs
              </button>
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="py-16 text-center text-slate-400 font-bold text-xs">Loading notifications...</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filtered.map((notif) => {
                  const id = String(notif._id || notif.id);
                  const isUnread = !notif.isRead;
                  const config = getIconConfig(notif.type);

                  return (
                    <motion.div 
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        "p-3 sm:p-5 flex items-start gap-2.5 sm:gap-4 group hover:bg-slate-50/90 transition-all cursor-pointer relative active:bg-slate-100/70",
                        isUnread ? "bg-emerald-50/40" : "bg-white"
                      )}
                    >
                      {/* Unread Left Highlight Bar */}
                      {isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                      )}
                      
                      {/* Icon Badge */}
                      <div className={cn(
                        "w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 mt-0.5",
                        config.bg
                      )}>
                        {config.icon}
                      </div>

                      {/* Content Body */}
                      <div className="flex-grow space-y-1 min-w-0">
                        {/* Title Row with full wrap & Time */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className={cn(
                            "text-xs sm:text-sm text-slate-900 leading-snug break-words pr-1",
                            isUnread ? "font-black text-slate-950" : "font-bold text-slate-800"
                          )}>
                            {notif.title || 'System Notification'}
                          </h4>
                          
                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5">
                            <Clock size={11} className="shrink-0" />
                            <span className="whitespace-nowrap">{formatRelativeTime(notif.createdAt)}</span>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                        </div>
                        
                        {/* Message Description */}
                        <p className="text-[11px] sm:text-xs font-medium text-slate-600 leading-relaxed break-words line-clamp-3">
                          {notif.message}
                        </p>
                      </div>

                      {/* Action buttons (Delete & Chevron) */}
                      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 self-center pl-1">
                        <button 
                          onClick={(e) => deleteNotification(id, e)}
                          className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer active:scale-90"
                          title="Delete notification"
                        >
                          <Trash2 size={15} />
                        </button>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all hidden sm:block" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center space-y-3 px-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <Bell size={22} />
              </div>
              <p className="text-xs font-bold text-slate-500">No notifications found.</p>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setFilter('all'); }}
                  className="text-primary text-xs font-bold underline"
                >
                  Clear search & filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

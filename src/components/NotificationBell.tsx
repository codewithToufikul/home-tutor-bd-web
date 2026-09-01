import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { cn } from '@/src/lib/utils';
import { NotificationRepository, NotificationRecord } from '@/src/repositories/notificationRepository';

export default function NotificationBell({ role }: { role?: string }) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<NotificationRecord | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);
  const navigate = useNavigate();

  const triggerToast = useCallback((notif: NotificationRecord) => {
    setToast(notif);
    setTimeout(() => {
      setToast(null);
    }, 6000);
  }, []);

  const fetchNotifs = useCallback(async () => {
    try {
      const items = await NotificationRepository.getAll();
      if (Array.isArray(items)) {
        if (isInitialLoadRef.current) {
          items.forEach((n) => {
            const id = String(n._id || n.id);
            if (id) seenIdsRef.current.add(id);
          });
          isInitialLoadRef.current = false;
        } else {
          const newItems = items.filter((n) => {
            const id = String(n._id || n.id);
            return id && !seenIdsRef.current.has(id) && !n.isRead;
          });

          if (newItems.length > 0) {
            const newest = newItems[0];
            triggerToast(newest);
            newItems.forEach((n) => {
              const id = String(n._id || n.id);
              if (id) seenIdsRef.current.add(id);
            });
          }
        }

        setNotifications(items);
      }
    } catch {
      // Quiet fail
    }
  }, [triggerToast]);

  // 1. Setup Socket.IO connection for instant push notifications & Toast
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    const apiUrl = metaEnv?.VITE_API_URL || 'http://localhost:5001/api/v1';
    const socketUrl = apiUrl.replace('/api/v1', '');

    let socket: Socket | null = null;
    try {
      socket = io(socketUrl, {
        auth: { token },
        extraHeaders: { Authorization: `Bearer ${token}` },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('⚡ Socket.IO notification listener connected!');
      });

      socket.on('newNotification', (notif: NotificationRecord) => {
        console.log('🔔 Live Notification received via Socket:', notif);
        const notifId = String(notif._id || notif.id || `notif-${Date.now()}`);
        seenIdsRef.current.add(notifId);

        setNotifications((prev) => [notif, ...prev]);
        triggerToast(notif);
      });
    } catch (err) {
      console.warn('⚠️ Socket connection error:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [triggerToast]);

  // 2. Fallback polling every 5 seconds
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 5000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleItemClick = async (notif: NotificationRecord) => {
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

    setIsOpen(false);
    if (role === 'coaching') {
      navigate('/coaching/enrollments');
    } else if (role === 'admin') {
      if (notif.type === 'tutor_approval' || notif.type === 'tutor_verification') {
        navigate('/admin/all-tutors');
      } else if (notif.type === 'job_post' || notif.type === 'tuition_job') {
        navigate('/admin/jobs-approve');
      } else if (notif.type === 'hire_request') {
        navigate('/admin/hire-pending');
      } else if (notif.type === 'application') {
        navigate('/admin/all-jobs');
      } else {
        navigate('/admin/notifications');
      }
    } else if (role === 'tutor') {
      if (notif.type === 'job_approval' || notif.type === 'application') navigate('/tutor/applied');
      else if (notif.type === 'tutor_verification') navigate('/tutor/profile');
      else navigate('/tutor/notifications');
    } else if (role === 'guardian' || role === 'student') {
      navigate('/student/notifications');
    } else {
      navigate('/jobs');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await NotificationRepository.markAllRead();
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const allNotifPath =
    role === 'coaching'
      ? '/coaching/enrollments'
      : role === 'admin'
      ? '/admin/notifications'
      : role === 'tutor'
      ? '/tutor/notifications'
      : `/${role || 'student'}/dashboard`;

  return (
    <>
      {/* Toast Alert Popup (Top Right Toast) */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-6 left-4 right-4 sm:left-auto sm:right-6 z-[9999] sm:max-w-sm bg-[#001F3F] text-white p-4 rounded-3xl shadow-2xl border border-white/20 flex items-start gap-3.5 cursor-pointer backdrop-blur-xl ring-2 ring-primary/30"
            onClick={() => {
              handleItemClick(toast);
              setToast(null);
            }}
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/25 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div className="flex-grow space-y-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black text-white truncate">{toast.title || 'নতুন বিজ্ঞপ্তি'}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToast(null);
                  }}
                  className="text-white/60 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-[11px] text-white/85 line-clamp-2 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl transition-all relative cursor-pointer',
            isOpen
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'text-ink-muted bg-white/60 border border-ink/5 hover:bg-white hover:text-primary hover:shadow-sm'
          )}
          title="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-rose-500/20 animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Popup */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs sm:bg-transparent"
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="fixed left-3 right-3 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-2xl border border-ink/10 overflow-hidden z-50 origin-top"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-ink/5 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-ink text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-ink/5 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const isUnread = !notif.isRead;
                      return (
                        <div
                          key={String(notif._id || notif.id || Math.random())}
                          onClick={() => handleItemClick(notif)}
                          className={cn(
                            'p-4 flex items-start gap-3 hover:bg-primary/5 transition-all cursor-pointer group relative',
                            isUnread ? 'bg-primary/[0.04]' : ''
                          )}
                        >
                          {isUnread && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                          )}
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                              isUnread
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            <Bell size={16} />
                          </div>
                          <div className="flex-grow space-y-1 min-w-0">
                            <h4 className="text-xs font-black text-ink leading-tight truncate">
                              {notif.title || 'Notification'}
                            </h4>
                            <p className="text-[11px] text-ink-muted font-medium line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <p className="text-[9px] font-bold text-ink-muted/60">
                              {notif.createdAt
                                ? new Date(String(notif.createdAt)).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Just now'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center space-y-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto">
                        <Bell size={20} />
                      </div>
                      <p className="text-xs font-bold text-ink-muted">No notifications yet</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <Link
                  to={allNotifPath}
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3.5 text-center text-[10px] font-black text-primary uppercase tracking-widest bg-gray-50 hover:bg-primary hover:text-white transition-all border-t border-ink/5"
                >
                  View All Notifications
                </Link>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

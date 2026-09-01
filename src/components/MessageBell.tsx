import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGetConversationsQuery, ChatMessage } from '@/src/services/chatApi';
import { useAuth } from '@/src/context/AuthContext';
import { getSocket } from '@/src/lib/socket';
import { cn } from '@/src/lib/utils';

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  super_admin: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-800' },
  admin: { label: 'Admin', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  moderator: { label: 'Moderator', bg: 'bg-sky-100', text: 'text-sky-800' },
  student: { label: 'Student', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  guardian: { label: 'Guardian', bg: 'bg-amber-100', text: 'text-amber-800' },
  tutor: { label: 'Tutor', bg: 'bg-blue-100', text: 'text-blue-800' },
  coaching: { label: 'Coaching', bg: 'bg-rose-100', text: 'text-rose-800' },
};

const extractId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'object') return String(val._id || val.id || val.uid || '');
  return String(val);
};

export default function MessageBell({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserId = extractId(user);
  const currentUserRole = String(user?.role || '');

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<{
    senderName: string;
    senderAvatar: string;
    senderRole: string;
    message: string;
    conversationId: string;
  } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: convsData, refetch } = useGetConversationsQuery(undefined, {
    pollingInterval: 5000,
  });

  const conversations = useMemo(() => convsData?.data || [], [convsData]);

  // Destination path based on user role
  const messagesUrl = useMemo(() => {
    if (['admin', 'super_admin', 'moderator'].includes(currentUserRole)) {
      return '/admin/inbox';
    }
    if (currentUserRole === 'guardian') {
      return '/guardian/messages';
    }
    if (currentUserRole === 'tutor') {
      return '/tutor/messages';
    }
    return '/student/messages';
  }, [currentUserRole]);

  // Reset unread count when user visits their messages page
  useEffect(() => {
    if (location.pathname === messagesUrl) {
      setUnreadCount(0);
    }
  }, [location.pathname, messagesUrl]);

  // Trigger floating message toast
  const triggerMessageToast = useCallback((msg: any) => {
    if (!msg) return;
    const sender = typeof msg.senderId === 'object' && msg.senderId !== null ? msg.senderId : {};
    const senderIdStr = extractId(sender) || String(msg.senderId || '');

    // Don't toast messages sent by the logged in user
    if (senderIdStr && senderIdStr === currentUserId) return;

    const senderName = sender.name || 'New Message';
    const senderAvatar = sender.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(senderName)}`;
    const senderRole = sender.role || 'user';
    const convId = String(msg.conversationId || '');

    // Increment unread count
    setUnreadCount((prev) => prev + 1);

    setActiveToast({
      senderName,
      senderAvatar,
      senderRole,
      message: msg.message || 'You received a new message',
      conversationId: convId,
    });

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
  }, [currentUserId]);

  // Socket listener for live incoming messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      refetch();
      triggerMessageToast(msg);
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('receiveMessage', handleNewMessage);
    socket.on('new_message_notification', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('receiveMessage', handleNewMessage);
      socket.off('new_message_notification', handleNewMessage);
    };
  }, [refetch, triggerMessageToast]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenConversation = (convId?: string) => {
    setIsOpen(false);
    setActiveToast(null);
    setUnreadCount(0);
    navigate(messagesUrl);
  };

  return (
    <>
      {/* 🔔 Message Bell Icon Button */}
      <div className={cn("relative inline-block", className)} ref={dropdownRef}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setUnreadCount(0);
            }
          }}
          className={cn(
            "relative p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center",
            isOpen
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-gray-100/80 hover:bg-gray-200 text-ink-muted hover:text-ink"
          )}
          title="Messages & Support Hub"
        >
          <MessageSquare size={18} />

          {/* Active / Unread indicator badge ONLY when unreadCount > 0 */}
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md shadow-rose-500/30 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            </>
          )}
        </button>

        {/* 📬 Message Dropdown Popover */}
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs sm:bg-transparent"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="fixed left-3 right-3 top-20 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96 bg-white rounded-[28px] shadow-2xl border border-ink/10 p-4 z-50 space-y-3 overflow-hidden origin-top"
              >
              {/* Dropdown Header */}
              <div className="flex items-center justify-between pb-2 border-b border-ink/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <MessageSquare size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-ink leading-tight">Messages Hub</h4>
                    <p className="text-[10px] text-ink-muted">Recent conversations</p>
                  </div>
                </div>

                <Link
                  to={messagesUrl}
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-black uppercase text-primary hover:underline flex items-center gap-1"
                >
                  <span>Open Full Chat</span>
                  <ArrowRight size={11} />
                </Link>
              </div>

              {/* Conversations Preview List */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-ink/5">
                {conversations.length > 0 ? (
                  conversations.slice(0, 5).map((conv) => {
                    const other = conv.participants.find((p) => extractId(p) !== currentUserId) || conv.participants[0];
                    if (!other) return null;
                    const badge = ROLE_BADGES[other.role] || ROLE_BADGES.student;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => handleOpenConversation(conv._id)}
                        className="p-2.5 rounded-2xl hover:bg-gray-50 flex items-center gap-3 cursor-pointer transition-all"
                      >
                        <div className="relative shrink-0">
                          <img
                            src={other.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(other.name)}`}
                            alt={other.name}
                            className="w-10 h-10 rounded-xl object-cover border border-ink/10"
                          />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-black text-ink truncate">{other.name}</p>
                            {conv.lastMessageAt && (
                              <span className="text-[9px] text-ink-muted shrink-0">
                                {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={cn("px-1.5 py-0.2 rounded text-[8px] font-black uppercase shrink-0", badge.bg, badge.text)}>
                              {badge.label}
                            </span>
                            <p className="text-[10px] text-ink-muted truncate font-medium flex-1">
                              {conv.lastMessage || 'Start conversation...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                      <MessageCircle size={18} />
                    </div>
                    <p className="text-xs font-bold text-ink">No active conversations</p>
                    <p className="text-[10px] text-ink-muted">Click below to open chat portal.</p>
                  </div>
                )}
              </div>

              {/* View All Button */}
              <Link
                to={messagesUrl}
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-gray-50 hover:bg-primary hover:text-white text-ink text-center rounded-xl text-xs font-black uppercase tracking-wider block transition-all shadow-xs"
              >
                Go to Messages Portal
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>

      {/* 🚀 Floating Real-Time Message Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26 }}
            className="fixed top-5 right-5 z-[99999] max-w-sm w-full bg-white/95 backdrop-blur-2xl p-4 rounded-[28px] shadow-2xl border-2 border-primary/30 shadow-primary/20 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={activeToast.senderAvatar}
                    alt={activeToast.senderName}
                    className="w-12 h-12 rounded-2xl object-cover border border-ink/10 shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-black text-ink truncate">{activeToast.senderName}</h5>
                    {ROLE_BADGES[activeToast.senderRole] && (
                      <span className={cn(
                        "px-1.5 py-0.2 rounded text-[8px] font-black uppercase shrink-0",
                        ROLE_BADGES[activeToast.senderRole].bg,
                        ROLE_BADGES[activeToast.senderRole].text
                      )}>
                        {ROLE_BADGES[activeToast.senderRole].label}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-tight">
                    "{activeToast.message}"
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveToast(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-ink-muted hover:text-ink transition-colors cursor-pointer shrink-0"
              >
                <X size={15} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-ink/5">
              <button
                onClick={() => setActiveToast(null)}
                className="px-3 py-1.5 text-ink-muted hover:text-ink text-[11px] font-bold cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleOpenConversation(activeToast.conversationId)}
                className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[11px] font-black uppercase flex items-center gap-1 shadow-md shadow-primary/20 transition-all cursor-pointer"
              >
                <span>Reply / Open</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

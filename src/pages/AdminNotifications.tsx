import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, CheckCircle2, AlertCircle, Info, 
  Trash2, Filter, Search, MoreVertical,
  UserPlus, CreditCard, MessageSquare, Briefcase
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'New Tutor Registration', desc: 'Saiful Arafat has registered as a Physics tutor.', time: '2 mins ago', type: 'user', unread: true },
  { id: 2, title: 'Payment Received', desc: 'Tuition fee of 5000 BDT received from Rahim Ahmed.', time: '1 hour ago', type: 'payment', unread: true },
  { id: 3, title: 'New Job Request', desc: 'A new tuition job for Class 10 Math has been posted.', time: '3 hours ago', type: 'job', unread: false },
  { id: 4, title: 'New Message', desc: 'You have a new inquiry from Karim Ullah regarding tuition.', time: '5 hours ago', type: 'message', unread: false },
  { id: 5, title: 'System Update', desc: 'Platform maintenance scheduled for tomorrow at 2:00 AM.', time: '1 day ago', type: 'system', unread: false },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const formattedSaved = saved.map((n: any) => ({
      id: n.id,
      title: n.title,
      desc: n.message,
      time: n.time,
      type: 'job',
      unread: !n.isRead
    }));
    setNotifications([...formattedSaved, ...MOCK_NOTIFICATIONS]);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'user': return <UserPlus size={18} />;
      case 'payment': return <CreditCard size={18} />;
      case 'job': return <Briefcase size={18} />;
      case 'message': return <MessageSquare size={18} />;
      default: return <Info size={18} />;
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

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
          <button 
            onClick={markAllRead}
            className="text-primary font-black text-xs uppercase tracking-widest hover:underline transition-all"
          >
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[40px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden">
          <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-white/40">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setFilter('all')}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", filter === 'all' ? "bg-primary text-white" : "text-ink-muted hover:bg-white")}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('unread')}
                className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all", filter === 'unread' ? "bg-primary text-white" : "text-ink-muted hover:bg-white")}
              >
                Unread
              </button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted/50" />
              <input type="text" placeholder="Search..." className="bg-white/60 border border-ink/5 rounded-xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 w-40 md:w-64" />
            </div>
          </div>

          <div className="divide-y divide-ink/5">
            <AnimatePresence mode="popLayout">
              {notifications.filter(n => filter === 'all' || (filter === 'unread' && n.unread)).map((notif) => (
                <motion.div 
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "p-6 flex items-start gap-6 group hover:bg-white/60 transition-all cursor-pointer relative",
                    notif.unread ? "bg-primary/[0.02]" : ""
                  )}
                >
                  {notif.unread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    notif.unread ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-ink/5 text-ink-muted"
                  )}>
                    {getIcon(notif.type)}
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={cn("text-sm text-ink", notif.unread ? "font-black" : "font-bold")}>{notif.title}</h4>
                      <span className="text-[10px] font-bold text-ink-muted/60">{notif.time}</span>
                    </div>
                    <p className="text-xs font-medium text-ink-muted leading-relaxed">{notif.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                      className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-2 rounded-lg bg-ink/5 text-ink-muted hover:bg-ink/10 transition-all">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {notifications.length === 0 && (
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

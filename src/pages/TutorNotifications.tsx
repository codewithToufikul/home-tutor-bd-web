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
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { cn } from '@/src/lib/utils';

export default function TutorNotifications() {
  const [notices, setNotices] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allNotices = JSON.parse(localStorage.getItem('system_notices') || '[]');
    
    // Add seed notices if empty
    if (allNotices.length === 0) {
      const seeds = [
        {
          id: 1,
          title: 'Welcome to Tutor Dashboard!',
          audience: 'Tutors',
          priority: 'Medium',
          category: 'General',
          content: 'We are glad to have you on board. Start browsing for tuition jobs and build your profile.',
          date: new Date(Date.now() - 3600000).toISOString(),
          isRead: false
        },
        {
          id: 2,
          title: 'Update Your Profile Photo',
          audience: 'Tutors',
          priority: 'High',
          category: 'Policy',
          content: 'Professional profile photos get 70% more responses. Make sure to upload a clear face photo.',
          date: new Date(Date.now() - 86400000).toISOString(),
          isRead: false
        }
      ];
      localStorage.setItem('system_notices', JSON.stringify(seeds));
      setNotices(seeds);
    } else {
      // Filter for Tutors or All
      const tutorNotices = allNotices.filter((n: any) => n.audience === 'Tutors' || n.audience === 'All');
      setNotices(tutorNotices);
    }
  }, []);

  const deleteNotice = (id: number) => {
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    // Also update localStorage
    const allNotices = JSON.parse(localStorage.getItem('system_notices') || '[]');
    const newAllNotices = allNotices.filter((n: any) => n.id !== id);
    localStorage.setItem('system_notices', JSON.stringify(newAllNotices));
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-rose-50 text-rose-500 border-rose-100';
      case 'medium': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'low': return 'bg-blue-50 text-blue-500 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'policy': return <Info size={18} />;
      case 'event': return <Clock size={18} />;
      case 'system': return <AlertCircle size={18} />;
      default: return <Megaphone size={18} />;
    }
  };

  const filteredNotices = notices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         notice.content.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && notice.priority?.toLowerCase() === filter.toLowerCase();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <TutorLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/5">
                <Bell size={24} />
              </div>
              Notifications
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              Stay updated with the latest updates and announcements from the admin.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/40 backdrop-blur-xl p-4 rounded-[28px] border border-white/40 shadow-xl shadow-ink/5">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            {['all', 'high', 'medium', 'low'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-ink-muted hover:bg-white/60 hover:text-ink"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted/40" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 border border-white/40 rounded-xl py-3 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-ink-muted/30"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[32px] p-6 lg:p-8 shadow-xl shadow-ink/5 group hover:bg-white transition-all overflow-hidden relative"
              >
                {notice.priority?.toLowerCase() === 'high' && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:rotate-12",
                    notice.priority?.toLowerCase() === 'high' ? "bg-rose-50 text-rose-500" :
                    notice.priority?.toLowerCase() === 'medium' ? "bg-amber-50 text-amber-500" :
                    "bg-primary/5 text-primary"
                  )}>
                    {getCategoryIcon(notice.category)}
                  </div>

                  <div className="flex-grow space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-black text-ink">{notice.title}</h3>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border",
                            getPriorityStyles(notice.priority)
                          )}>
                            {notice.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-ink-muted/60 uppercase">
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(notice.date)}</span>
                          <span className="w-1 h-1 bg-ink/10 rounded-full" />
                          <span>{notice.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="p-3 text-rose-500 bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <p className="text-sm font-medium text-ink-muted leading-relaxed max-w-3xl">
                      {notice.content}
                    </p>

                    {notice.link && (
                      <button className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-wider group/btn">
                        Learn More <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotices.length === 0 && (
            <div className="py-32 text-center space-y-6 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[48px] shadow-2xl">
              <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto shadow-inner">
                <Bell size={40} className="text-ink-muted/20" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink">No notifications yet</h3>
                <p className="text-sm font-medium text-ink-muted">When admin sends a message, it will appear here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
}

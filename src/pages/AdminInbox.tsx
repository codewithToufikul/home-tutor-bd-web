import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Mail, Trash2, ChevronLeft, ChevronRight, 
  User, Mail as MailIcon, Calendar, MessageSquare,
  Eye, AlertCircle, X, CheckCircle2, Reply
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { ContactService } from '@/src/services/contactService';
import { cn } from '@/src/lib/utils';

// Inbox messages are stored in Firestore via ContactService

const ITEMS_PER_PAGE = 5;

export default function AdminInbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Load messages from Firestore
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await ContactService.list();
        if (active) setMessages(items as any[]);
      } catch (err) {
        console.error('Failed to load inbox messages:', err);
      }
    })();

    return () => { active = false };
  }, []);

  // Filtering Logic
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesSearch = msg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All'
        || (statusFilter === 'unread' && !msg.isRead)
        || (statusFilter === 'read' && msg.isRead);
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMessages.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMessages, currentPage]);

  const handleViewMessage = async (msg: any) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        await ContactService.markRead(msg.id);
        setMessages(messages.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
      } catch (err) {
        console.error('Failed to mark message read:', err);
      }
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await ContactService.remove(itemToDelete);
      setMessages(messages.filter(msg => msg.id !== itemToDelete));
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 relative pb-20">
        {/* Sticky Topbar Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-4 shrink-0">
              {/* Title */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm md:text-base font-display font-black text-ink leading-none">
                  Inbox & Inquiries
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search Inbox..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[100px]"
                >
                  <option value="All">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>

            {/* Total Count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
              <Mail size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredMessages.length}</span></span>
            </div>
          </div>
        </div>

        {/* Inbox Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Sender</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Subject</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Message Preview</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Date & Time</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedMessages.map((msg) => (
                    <motion.tr 
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "group hover:bg-white/40 transition-colors cursor-pointer",
                        msg.status === 'unread' ? "bg-primary/[0.02]" : ""
                      )}
                      onClick={() => handleViewMessage(msg)}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center">
                          {msg.status === 'unread' ? (
                            <div className="w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/40" />
                          ) : (
                            <CheckCircle2 size={14} className="text-ink-muted/30" />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className={cn("text-sm font-black text-ink", msg.status === 'unread' ? "font-black" : "font-bold")}>{msg.name}</span>
                          <span className="text-[10px] font-medium text-ink-muted">{msg.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn("text-sm text-ink", msg.status === 'unread' ? "font-black" : "font-medium")}>{msg.subject}</span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs text-ink-muted max-w-[200px] truncate">{msg.message}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink-muted">{msg.date}</span>
                          <span className="text-[10px] font-medium text-ink-muted/60">{msg.time}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleViewMessage(msg)}
                            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => setItemToDelete(msg.id)}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          <AnimatePresence mode="popLayout">
            {paginatedMessages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleViewMessage(msg)}
                className={cn(
                  "bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4 relative overflow-hidden",
                  msg.status === 'unread' ? "border-primary/20" : ""
                )}
              >
                {msg.status === 'unread' && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-[40px] flex items-center justify-center pl-3 pb-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase">{msg.id} • {msg.date}</p>
                    <h3 className={cn("text-base text-ink leading-tight", msg.status === 'unread' ? "font-black" : "font-bold")}>{msg.name}</h3>
                    <p className="text-xs font-medium text-ink-muted">{msg.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className={cn("text-sm text-ink", msg.status === 'unread' ? "font-black" : "font-bold")}>{msg.subject}</p>
                  <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">{msg.message}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-grow py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Eye size={14} /> Read Message
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setItemToDelete(msg.id); }}
                    className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95 transition-all border border-rose-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm">
              <span className="text-sm font-bold text-ink-muted">
                Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <MailIcon size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">Your inbox is empty</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any messages matching your current search or status filter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Message View Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-white/40 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-ink/5 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-black text-ink leading-tight">{selectedMessage.name}</h3>
                    <p className="text-xs font-medium text-ink-muted">{selectedMessage.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center text-ink-muted hover:text-primary transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedMessage.id}</span>
                    <span className="text-[10px] font-bold text-ink-muted uppercase">{selectedMessage.date} • {selectedMessage.time}</span>
                  </div>
                  <h4 className="text-xl font-black text-ink">{selectedMessage.subject}</h4>
                </div>
                
                <div className="p-6 bg-ink/[0.02] rounded-3xl border border-ink/5">
                  <p className="text-sm font-medium text-ink-muted leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-ink/5 bg-white/80 backdrop-blur-xl flex flex-col sm:flex-row gap-3">
                <button 
                  className="flex-1 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary-dark transition-all"
                >
                  <Reply size={16} /> Reply via Email
                </button>
                <button 
                  onClick={() => { setItemToDelete(selectedMessage.id); setSelectedMessage(null); }}
                  className="flex-1 py-4 rounded-2xl bg-rose-50 text-rose-500 font-black text-xs uppercase border border-rose-100 hover:bg-rose-500 hover:text-white transition-all"
                >
                  Delete Message
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-ink">Delete Message?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  Are you sure you want to delete this message? This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

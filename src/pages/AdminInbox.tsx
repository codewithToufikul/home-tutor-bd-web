import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Mail, Trash2, ChevronLeft, ChevronRight, 
  User, Mail as MailIcon, Calendar, MessageSquare,
  Eye, AlertCircle, X, CheckCircle2, Reply, Inbox as InboxIcon,
  Sparkles, Phone
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { ContactService } from '@/src/services/contactService';
import ChatInterface from '@/src/components/chat/ChatInterface';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 6;

export default function AdminInbox() {
  const [mainTab, setMainTab] = useState<'chat' | 'inquiries'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Load contact inquiries from Firestore
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const items = await ContactService.list();
        if (active) setMessages(items as any[]);
      } catch (err) {
        console.error('Failed to load inbox inquiries:', err);
      }
    })();

    return () => { active = false };
  }, []);

  // Filtering Logic for Inquiries
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesSearch =
        (msg.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (msg.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.message || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All'
        || (statusFilter === 'unread' && !msg.isRead)
        || (statusFilter === 'read' && msg.isRead);
      return matchesSearch && matchesStatus;
    });
  }, [messages, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / ITEMS_PER_PAGE));
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
      if (selectedMessage?.id === itemToDelete) setSelectedMessage(null);
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
    }
  };

  const unreadInquiriesCount = useMemo(() => {
    return messages.filter(m => !m.isRead).length;
  }, [messages]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">

        {/* 🎛️ Navigation Header Tabs (Live Chat vs Website Inquiries) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-[28px] border border-white/60 shadow-lg shadow-ink/5">
          <div className="flex items-center gap-2 p-1.5 bg-gray-100/80 rounded-2xl">
            <button
              onClick={() => setMainTab('chat')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                mainTab === 'chat'
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <MessageSquare size={16} />
              <span>Live Student & Tutor Chat</span>
            </button>

            <button
              onClick={() => setMainTab('inquiries')}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
                mainTab === 'inquiries'
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              <MailIcon size={16} />
              <span>Website Inquiries</span>
              {unreadInquiriesCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black">
                  {unreadInquiriesCount}
                </span>
              )}
            </button>
          </div>

          <p className="text-xs font-bold text-ink-muted hidden lg:block">
            {mainTab === 'chat'
              ? 'Real-time communication with students, guardians, and tutors.'
              : 'Public messages submitted via website contact form.'}
          </p>
        </div>

        {/* 💬 TAB 1: Live Chat Interface */}
        {mainTab === 'chat' ? (
          <ChatInterface
            headerTitle="Student & Tutor Chat Hub"
            headerSubtitle="Direct real-time messaging between students, tutors, and admin staff with instant notifications."
            theme="admin"
          />
        ) : (
          /* 📨 TAB 2: Website Inquiries & Contact Forms */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
              <div>
                <h2 className="text-xl font-display font-black text-ink">Public Contact Form Submissions</h2>
                <p className="text-xs text-ink-muted">Inquiries sent from the website contact page.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    placeholder="Search inquiries..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-ink/5 bg-gray-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Sender</th>
                      <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Subject</th>
                      <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Message Snippet</th>
                      <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black text-ink-muted uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {paginatedMessages.length > 0 ? (
                      paginatedMessages.map((msg, index) => (
                        <tr key={msg.id || index} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="space-y-0.5">
                              <p className="text-xs font-black text-ink">{msg.name || 'Anonymous'}</p>
                              <p className="text-[11px] text-ink-muted">{msg.email}</p>
                              {msg.phone && <p className="text-[10px] text-emerald-600 font-bold">{msg.phone}</p>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold text-ink max-w-[180px] truncate">{msg.subject || 'General Inquiry'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-ink-muted max-w-[280px] truncate font-medium">{msg.message}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-ink-muted font-medium">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              msg.isRead ? "bg-gray-100 text-gray-700" : "bg-emerald-100 text-emerald-800"
                            )}>
                              {msg.isRead ? 'Read' : 'New'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewMessage(msg)}
                                className="p-2 hover:bg-primary/10 text-primary rounded-xl transition-all cursor-pointer"
                                title="View Inquiry"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => setItemToDelete(msg.id)}
                                className="p-2 hover:bg-rose-50 text-rose-600 rounded-xl transition-all cursor-pointer"
                                title="Delete Inquiry"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-xs font-bold text-ink-muted">
                          No website inquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 Inquiry Modal */}
        <AnimatePresence>
          {selectedMessage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedMessage(null)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative bg-white rounded-[36px] shadow-2xl border border-white/40 max-w-lg w-full p-6 sm:p-8 z-10 space-y-6 overflow-hidden"
              >
                <div className="flex items-start justify-between border-b border-ink/5 pb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-primary/10 text-primary rounded-md">
                      Inquiry Details
                    </span>
                    <h3 className="text-xl font-display font-black text-ink mt-2">{selectedMessage.subject || 'General Inquiry'}</h3>
                  </div>
                  <button onClick={() => setSelectedMessage(null)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted font-bold">From:</span>
                      <span className="font-black text-ink">{selectedMessage.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-ink-muted font-bold">Email:</span>
                      <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 font-bold hover:underline">{selectedMessage.email}</a>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted font-bold">Phone:</span>
                        <a href={`tel:${selectedMessage.phone}`} className="text-emerald-600 font-bold hover:underline">{selectedMessage.phone}</a>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-white border border-ink/10 rounded-2xl space-y-1">
                    <p className="text-[10px] font-black uppercase text-ink-muted">Message:</p>
                    <p className="text-ink font-medium leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/5">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Inquiry')}`}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md shadow-primary/20"
                  >
                    <Reply size={14} /> Reply via Email
                  </a>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}

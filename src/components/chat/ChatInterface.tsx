import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Search, User, Phone, MessageSquare, ShieldCheck,
  CheckCheck, Check, Clock, Plus, Sparkles, X, Loader2,
  RefreshCw, Smile, ArrowLeft, MoreVertical, ExternalLink,
  ChevronRight, Circle, UserPlus
} from 'lucide-react';
import {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useStartConversationMutation,
  useMarkAsReadMutation,
  useGetChatContactsQuery,
  useLazySearchChatUsersQuery,
  ChatParticipant,
  ChatMessage,
  ConversationItem
} from '@/src/services/chatApi';
import { useAuth } from '@/src/context/AuthContext';
import { getSocket } from '@/src/lib/socket';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  super_admin: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-800', icon: '👑' },
  admin: { label: 'Admin', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '🛡️' },
  moderator: { label: 'Moderator', bg: 'bg-sky-100', text: 'text-sky-800', icon: '⚖️' },
  student: { label: 'Student', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: '🎓' },
  guardian: { label: 'Guardian', bg: 'bg-amber-100', text: 'text-amber-800', icon: '👨‍👩‍👦' },
  tutor: { label: 'Tutor', bg: 'bg-blue-100', text: 'text-blue-800', icon: '👨‍🏫' },
  coaching: { label: 'Coaching', bg: 'bg-rose-100', text: 'text-rose-800', icon: '🏫' },
};

const extractId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'object') return String(val._id || val.id || val.uid || '');
  return String(val);
};

interface ChatInterfaceProps {
  defaultRecipientRole?: 'staff' | 'student' | 'tutor';
  headerTitle?: string;
  headerSubtitle?: string;
  theme?: 'admin' | 'student' | 'guardian' | 'tutor';
}

export default function ChatInterface({
  defaultRecipientRole,
  headerTitle = 'Messages & Support',
  headerSubtitle = 'Real-time messaging between students, tutors, and admin staff',
  theme = 'admin'
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const currentUserId = extractId(user);
  const currentUserRole = String(user?.role || '');

  // UI State
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'tutors' | 'staff'>('all');
  const [inputText, setInputText] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // RTK Query Hooks
  const { data: convsData, isLoading: loadingConvs, refetch: refetchConvs } = useGetConversationsQuery(undefined, {
    pollingInterval: 5000,
  });
  const { data: contactsData, isLoading: loadingContacts } = useGetChatContactsQuery();
  const [searchUsers, { data: searchResults, isFetching: isSearching }] = useLazySearchChatUsersQuery();

  const { data: messagesData, isLoading: loadingMessages, refetch: refetchMessages } = useGetMessagesQuery(
    { conversationId: selectedConversationId || '' },
    { skip: !selectedConversationId, pollingInterval: 4000 }
  );

  const [sendMessageMutation, { isLoading: isSending }] = useSendMessageMutation();
  const [startConversationMutation, { isLoading: isStartingConv }] = useStartConversationMutation();
  const [markAsReadMutation] = useMarkAsReadMutation();

  const conversations = useMemo(() => convsData?.data || [], [convsData]);
  const messages = useMemo(() => messagesData?.data || [], [messagesData]);

  // Find other participant for selected conversation
  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c._id === selectedConversationId) || null;
  }, [conversations, selectedConversationId]);

  const otherParticipant: ChatParticipant | null = useMemo(() => {
    if (!selectedConversation || !Array.isArray(selectedConversation.participants)) return null;
    const other = selectedConversation.participants.find(
      (p) => extractId(p) !== currentUserId
    );
    return other || selectedConversation.participants[0] || null;
  }, [selectedConversation, currentUserId]);

  // Socket Connection Setup
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleReceiveMessage = (newMsg: ChatMessage) => {
      if (newMsg.conversationId === selectedConversationId) {
        refetchMessages();
        markAsReadMutation({ conversationId: newMsg.conversationId });
      }
      refetchConvs();
    };

    const handleTyping = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === selectedConversationId) {
        setOtherUserTyping(true);
      }
    };

    const handleStopTyping = ({ conversationId }: { conversationId: string }) => {
      if (conversationId === selectedConversationId) {
        setOtherUserTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    if (selectedConversationId) {
      socket.emit('join_room', { conversationId: selectedConversationId });
      markAsReadMutation({ conversationId: selectedConversationId });
    }

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      if (selectedConversationId) {
        socket.emit('leave_room', { conversationId: selectedConversationId });
      }
    };
  }, [selectedConversationId, refetchMessages, refetchConvs, markAsReadMutation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherUserTyping]);

  // Auto-select first conversation
  useEffect(() => {
    if (!selectedConversationId && conversations.length > 0) {
      setSelectedConversationId(conversations[0]._id);
    }
  }, [conversations, selectedConversationId]);

  // Filtered Conversations (100% null safe)
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (!conv || !Array.isArray(conv.participants)) return false;
      const other = conv.participants.find((p) => extractId(p) !== currentUserId) || conv.participants[0];
      if (!other) return false;

      const otherName = String(other.name || '').toLowerCase();
      const otherEmail = String(other.email || '').toLowerCase();
      const otherPhone = String(other.phone || '');
      const query = searchQuery.trim().toLowerCase();

      const matchesSearch = !query || otherName.includes(query) || otherEmail.includes(query) || otherPhone.includes(query);
      if (!matchesSearch) return false;

      const otherRole = String(other.role || '');
      if (activeTab === 'students') {
        return otherRole === 'student' || otherRole === 'guardian';
      }
      if (activeTab === 'tutors') {
        return otherRole === 'tutor';
      }
      if (activeTab === 'staff') {
        return ['admin', 'super_admin', 'moderator'].includes(otherRole);
      }

      return true;
    });
  }, [conversations, currentUserId, searchQuery, activeTab]);

  // Handle Input Typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!socket || !selectedConversationId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: selectedConversationId });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { conversationId: selectedConversationId });
    }, 1500);
  };

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !selectedConversationId || !otherParticipant) return;

    const receiverId = extractId(otherParticipant);
    setInputText('');

    const socket = getSocket();
    if (socket) {
      socket.emit('stop_typing', { conversationId: selectedConversationId });
      socket.emit('send_message', {
        conversationId: selectedConversationId,
        receiverId,
        message: trimmed,
        type: 'text',
      });
    }

    try {
      await sendMessageMutation({
        conversationId: selectedConversationId,
        receiverId,
        message: trimmed,
      }).unwrap();
      refetchMessages();
      refetchConvs();
    } catch (err) {
      console.error('Failed to send message via HTTP mutation:', err);
    }
  };

  // Start or open conversation with a target user
  const handleStartChatWithUser = async (targetUser: ChatParticipant) => {
    const targetUserId = extractId(targetUser);
    if (!targetUserId) return;

    try {
      const res = await startConversationMutation({ targetUserId }).unwrap();
      if (res.data?._id) {
        setSelectedConversationId(res.data._id);
        setIsNewChatModalOpen(false);
        setShowMobileChat(true);
        refetchConvs();
      }
    } catch (err: any) {
      alert(err?.data?.message || err?.message || 'Failed to start conversation.');
    }
  };

  // Quick preset chips
  const quickReplies = useMemo(() => {
    if (currentUserRole === 'student' || currentUserRole === 'guardian') {
      return [
        'Hi, I need help finding a tutor.',
        'Can you check my tuition post status?',
        'How do I confirm a hired tutor?',
        'Thank you so much!'
      ];
    }
    return [
      'Hello! How can we assist you today?',
      'Your request is being reviewed by our team.',
      'We have matched qualified tutors for your post.',
      'Please let us know if you need any further help.'
    ];
  }, [currentUserRole]);

  return (
    <div className="space-y-6">
      {/* 🌟 Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/60 shadow-xl shadow-ink/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
            <MessageSquare size={14} />
            Live Messaging Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-ink tracking-tight">
            {headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted font-medium">
            {headerSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsNewChatModalOpen(true)}
          className="px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus size={16} />
          <span>New Conversation</span>
        </button>
      </div>

      {/* 💬 Main 2-Pane Chat Box (Solid Flex Layout) */}
      <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl shadow-ink/5 overflow-hidden flex flex-col md:flex-row h-[680px]">

        {/* 📋 Left Sidebar: Conversations List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 shrink-0 border-r border-slate-200/80 flex flex-col h-full bg-slate-50/70",
          showMobileChat ? "hidden md:flex" : "flex"
        )}>
          {/* Search & Tabs */}
          <div className="p-4 space-y-3 border-b border-slate-200/80 bg-white">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-hide text-[11px] font-black">
              {[
                { id: 'all', label: 'All' },
                { id: 'students', label: 'Students' },
                { id: 'tutors', label: 'Tutors' },
                { id: 'staff', label: 'Staff' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer whitespace-nowrap text-center",
                    activeTab === tab.id
                      ? "bg-white text-ink shadow-xs"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loadingConvs ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                <p className="text-xs text-ink-muted font-bold">Loading chats...</p>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const other = conv.participants.find((p) => extractId(p) !== currentUserId) || conv.participants[0];
                if (!other) return null;

                const isSelected = conv._id === selectedConversationId;
                const badge = ROLE_BADGES[other.role] || ROLE_BADGES.student;

                return (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setSelectedConversationId(conv._id);
                      setShowMobileChat(true);
                    }}
                    className={cn(
                      "p-4 flex items-center gap-3.5 cursor-pointer transition-all hover:bg-white",
                      isSelected ? "bg-white border-l-4 border-primary shadow-sm" : "bg-transparent"
                    )}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={other.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(other.name || 'user')}`}
                        alt={other.name || 'User'}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-black text-ink truncate">{other.name || 'User'}</h4>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-ink-muted font-medium shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-black uppercase shrink-0", badge.bg, badge.text)}>
                          {badge.icon} {badge.label}
                        </span>
                        <p className="text-[11px] text-ink-muted truncate font-medium flex-1">
                          {conv.lastMessage || 'No messages yet...'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 px-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                  <MessageSquare size={22} />
                </div>
                <p className="text-xs font-black text-ink">No conversations found</p>
                <p className="text-[11px] text-ink-muted">Click "New Conversation" to start chatting with students, tutors, or admin staff.</p>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Start New Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 💬 Right Chat Thread */}
        <div className={cn(
          "flex-1 flex flex-col h-full bg-white min-w-0",
          !showMobileChat ? "hidden md:flex" : "flex"
        )}>
          {selectedConversation && otherParticipant ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white flex items-center justify-between gap-3 shrink-0 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-2 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="relative shrink-0">
                    <img
                      src={otherParticipant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherParticipant.name || 'user')}`}
                      alt={otherParticipant.name || 'User'}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-ink truncate">{otherParticipant.name || 'User'}</h3>
                      {ROLE_BADGES[otherParticipant.role] && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-black uppercase",
                          ROLE_BADGES[otherParticipant.role].bg,
                          ROLE_BADGES[otherParticipant.role].text
                        )}>
                          {ROLE_BADGES[otherParticipant.role].icon} {ROLE_BADGES[otherParticipant.role].label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      Active Online
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {otherParticipant.phone && otherParticipant.phone !== 'N/A' && (
                    <>
                      <a
                        href={`tel:${otherParticipant.phone}`}
                        className="px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5"
                        title="Call Phone"
                      >
                        <Phone size={13} />
                        <span className="hidden sm:inline">Call</span>
                      </a>

                      <a
                        href={`https://wa.me/${otherParticipant.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1.5"
                        title="WhatsApp Chat"
                      >
                        <MessageSquare size={13} className="text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
                {loadingMessages ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                    <p className="text-xs text-ink-muted font-bold">Loading conversation...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const senderId = extractId(msg.senderId);
                    const isMe = Boolean(currentUserId && senderId === currentUserId);

                    const senderAvatar = typeof msg.senderId === 'object' && msg.senderId?.avatar
                      ? msg.senderId.avatar
                      : (isMe ? (user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'me')}`) : (otherParticipant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(otherParticipant.name || 'user')}`));

                    return (
                      <motion.div
                        key={msg._id || index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("flex items-end gap-2.5 w-full", isMe ? "justify-end" : "justify-start")}
                      >
                        {/* Avatar only on other user's messages */}
                        {!isMe && (
                          <img
                            src={senderAvatar}
                            alt="Sender"
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0 mb-1 shadow-2xs"
                          />
                        )}

                        <div className={cn(
                          "max-w-[78%] sm:max-w-md p-4 text-xs leading-relaxed space-y-1.5 shadow-sm",
                          isMe
                            ? "bg-primary text-white rounded-2xl rounded-tr-xs shadow-primary/20"
                            : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-xs"
                        )}>
                          <p className="font-medium whitespace-pre-wrap">{msg.message}</p>
                          <div className={cn(
                            "flex items-center justify-end gap-1 text-[9px]",
                            isMe ? "text-white/80" : "text-ink-muted"
                          )}>
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              msg.isRead ? <CheckCheck size={12} className="text-white" /> : <Check size={12} className="text-white/70" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="text-sm font-black text-ink">Start the conversation</h4>
                    <p className="text-xs text-ink-muted max-w-sm mx-auto">
                      Send a message or pick from the suggested quick replies below to begin chatting.
                    </p>
                  </div>
                )}

                {/* Other user is typing animation */}
                {otherUserTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-xs text-ink-muted font-bold pl-2"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span>{otherParticipant.name} is typing...</span>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Pills */}
              <div className="px-4 py-2 border-t border-slate-200/80 bg-slate-50/80 overflow-x-auto scrollbar-hide flex items-center gap-1.5 shrink-0">
                {quickReplies.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(chip);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-primary/10 hover:text-primary text-ink-muted rounded-xl text-[11px] font-bold border border-slate-200 whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Box Footer */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-3 shrink-0">
                <input
                  type="text"
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={handleInputChange}
                  className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary/40 rounded-2xl px-4 py-3 text-xs font-medium text-ink focus:outline-none transition-all shadow-2xs"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="px-5 py-3 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/5">
                <MessageSquare size={36} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-lg font-black text-ink">Select or Start a Chat</h3>
                <p className="text-xs text-ink-muted font-medium">
                  Choose a conversation from the left sidebar or click below to connect with students, tutors, or staff.
                </p>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer"
              >
                + Start New Chat
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 🚀 New Conversation Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNewChatModalOpen(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-[36px] shadow-2xl border border-white/40 max-w-lg w-full p-6 sm:p-8 z-10 space-y-6 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-display font-black text-ink">Start a New Conversation</h3>
                  <p className="text-xs text-ink-muted">Select a staff contact or search any student/tutor.</p>
                </div>
                <button
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-ink-muted transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search User Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
                <input
                  type="text"
                  placeholder="Search user by name, email, or phone..."
                  value={userSearchTerm}
                  onChange={(e) => {
                    setUserSearchTerm(e.target.value);
                    if (e.target.value.trim().length > 1) {
                      searchUsers(e.target.value.trim());
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 focus:bg-white border border-ink/10 focus:border-primary/30 rounded-2xl text-xs font-bold text-ink focus:outline-none transition-all"
                />
              </div>

              {/* Contacts / Search Results List */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-72 divide-y divide-ink/5">
                {isSearching ? (
                  <div className="py-12 text-center">
                    <Loader2 className="animate-spin text-primary mx-auto" size={24} />
                  </div>
                ) : userSearchTerm.trim().length > 1 && searchResults?.data ? (
                  searchResults.data.length > 0 ? (
                    searchResults.data.map((u) => {
                      const badge = ROLE_BADGES[u.role] || ROLE_BADGES.student;
                      return (
                        <div
                          key={u._id}
                          onClick={() => handleStartChatWithUser(u)}
                          className="p-3 rounded-2xl hover:bg-gray-50 flex items-center justify-between gap-3 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'user')}`}
                              alt={u.name || 'User'}
                              className="w-10 h-10 rounded-xl object-cover border border-ink/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-ink truncate">{u.name}</p>
                              <p className="text-[10px] text-ink-muted truncate">{u.email}</p>
                            </div>
                          </div>

                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0", badge.bg, badge.text)}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-ink-muted font-bold">
                      No users found matching "{userSearchTerm}".
                    </div>
                  )
                ) : contactsData?.data && contactsData.data.length > 0 ? (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-ink-muted tracking-wider px-2 pb-1">
                      {currentUserRole === 'student' || currentUserRole === 'guardian' ? 'Admin Support Team' : 'Available Contacts'}
                    </p>
                    {contactsData.data.map((contact) => {
                      const badge = ROLE_BADGES[contact.role] || ROLE_BADGES.admin;
                      return (
                        <div
                          key={contact._id}
                          onClick={() => handleStartChatWithUser(contact)}
                          className="p-3 rounded-2xl hover:bg-primary/5 flex items-center justify-between gap-3 cursor-pointer transition-all border border-transparent hover:border-primary/20"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(contact.name || 'contact')}`}
                              alt={contact.name || 'Contact'}
                              className="w-10 h-10 rounded-xl object-cover border border-ink/10 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-black text-ink truncate">{contact.name}</p>
                              <p className="text-[10px] text-ink-muted truncate">{contact.email}</p>
                            </div>
                          </div>

                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0", badge.bg, badge.text)}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-ink-muted font-bold">
                    Type a name, email, or phone number above to find users.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

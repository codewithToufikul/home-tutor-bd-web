import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Search, Phone, MessageSquare,
  CheckCheck, Check, X, Loader2,
  ArrowLeft, MoreVertical, UserPlus, Paperclip,
  Image as ImageIcon, FileText, Download, Eye,
  ExternalLink
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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
} from '@/src/services/chatApi';
import { useAuth } from '@/src/context/AuthContext';
import { getSocket } from '@/src/lib/socket';
import { uploadFileWithProgress } from '@/src/repositories/storageRepository';
import { cn } from '@/src/lib/utils';

const ROLE_BADGES: Record<string, { label: string; bg: string; text: string }> = {
  super_admin: { label: 'Super Admin', bg: 'bg-purple-100', text: 'text-purple-800' },
  admin:       { label: 'Admin',       bg: 'bg-indigo-100', text: 'text-indigo-800' },
  moderator:   { label: 'Moderator',   bg: 'bg-sky-100',    text: 'text-sky-800'    },
  student:     { label: 'Student',     bg: 'bg-emerald-100',text: 'text-emerald-800'},
  guardian:    { label: 'Guardian',    bg: 'bg-amber-100',  text: 'text-amber-800'  },
  tutor:       { label: 'Tutor',       bg: 'bg-blue-100',   text: 'text-blue-800'   },
  coaching:    { label: 'Coaching',    bg: 'bg-rose-100',   text: 'text-rose-800'   },
};

const extractId = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'object') return String(val._id || val.id || val.uid || '');
  return String(val);
};

const fmtTime = (d: string) =>
  new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDateLabel = (d: string): string => {
  const dt = new Date(d);
  const today = new Date();
  const yest = new Date(); yest.setDate(today.getDate() - 1);
  if (dt.toDateString() === today.toDateString()) return 'Today';
  if (dt.toDateString() === yest.toDateString()) return 'Yesterday';
  return dt.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' });
};

const diceavatar = (name?: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name || 'user')}&backgroundColor=b6e3f4`;

const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleanUrl = url.split('?')[0].toLowerCase();

  // Document file extensions are NOT images
  if (/\.(pdf|doc|docx|xls|xlsx|csv|txt|zip|rar|7z|tar|gz|ppt|pptx|json|xml)$/i.test(cleanUrl)) {
    return false;
  }

  // Image extensions
  if (/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)$/i.test(cleanUrl)) {
    return true;
  }

  // Cloudinary image upload URLs that are not documents
  if (url.includes('/image/upload/') && !/\.(pdf|doc|docx|xls|xlsx|csv|txt|zip|rar|7z|tar|gz|ppt|pptx|json|xml)/i.test(url)) {
    return true;
  }

  return false;
};

const getDocInfo = (url?: string, messageText?: string) => {
  let name = (messageText || '').replace(/^📄\s*/, '').trim();
  if (!name || name === 'attachment' || name === 'file' || name === 'Document File') {
    if (url) {
      try {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1]?.split('?')[0];
        name = decodeURIComponent(lastPart || 'Document');
      } catch {
        name = 'Document';
      }
    } else {
      name = 'Document';
    }
  }

  const extMatch = name.match(/\.([a-zA-Z0-9]+)$/) || (url ? url.match(/\.([a-zA-Z0-9]+)(\?.*)?$/) : null);
  const ext = (extMatch ? extMatch[1] : 'file').toLowerCase();

  let badgeBg = 'bg-slate-700 text-white';
  let badgeLabel = ext.toUpperCase().slice(0, 4);
  let cardBg = 'bg-slate-50/90 border-slate-200';

  if (['pdf'].includes(ext)) {
    badgeBg = 'bg-rose-500 text-white';
    badgeLabel = 'PDF';
    cardBg = 'bg-rose-50/70 border-rose-200';
  } else if (['doc', 'docx'].includes(ext)) {
    badgeBg = 'bg-blue-600 text-white';
    badgeLabel = 'DOC';
    cardBg = 'bg-blue-50/70 border-blue-200';
  } else if (['xls', 'xlsx', 'csv'].includes(ext)) {
    badgeBg = 'bg-emerald-600 text-white';
    badgeLabel = 'XLS';
    cardBg = 'bg-emerald-50/70 border-emerald-200';
  } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    badgeBg = 'bg-amber-600 text-white';
    badgeLabel = 'ZIP';
    cardBg = 'bg-amber-50/70 border-amber-200';
  } else if (['txt', 'log'].includes(ext)) {
    badgeBg = 'bg-zinc-600 text-white';
    badgeLabel = 'TXT';
    cardBg = 'bg-zinc-50 border-zinc-200';
  }

  return { name, ext, badgeBg, badgeLabel, cardBg };
};

interface ChatInterfaceProps {
  defaultRecipientRole?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  theme?: string;
  /** If provided, auto-opens/starts a conversation with this userId */
  initialUserId?: string;
  /** If provided, auto-opens this conversation by id */
  initialConversationId?: string;
}

export default function ChatInterface({
  headerTitle = 'Messages',
  headerSubtitle = 'Real-time messaging',
  initialUserId,
  initialConversationId,
}: ChatInterfaceProps) {
  const [searchParams] = useSearchParams();
  const urlConvId = searchParams.get('conversationId') || initialConversationId || undefined;
  const urlUserId = searchParams.get('userId') || initialUserId || undefined;

  const { user } = useAuth();
  const currentUserId = extractId(user);
  const currentUserRole = String((user as any)?.role || '');

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all'|'students'|'tutors'|'staff'>('all');
  const [inputText, setInputText] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);

  // ── Attachment & Upload state ─────────────────────────────────────────
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; name?: string; type: 'image' | 'pdf' | 'doc' } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data: convsData, isLoading: loadingConvs, refetch: refetchConvs } =
    useGetConversationsQuery(undefined, { pollingInterval: 5000 });
  const { data: contactsData } = useGetChatContactsQuery();
  const [searchUsers, { data: searchResults, isFetching: isSearching }] = useLazySearchChatUsersQuery();

  const { data: msgsData, isLoading: loadingMsgs, refetch: refetchMsgs } = useGetMessagesQuery(
    { conversationId: selectedConvId || '' },
    { skip: !selectedConvId, pollingInterval: 3000 }
  );

  const [sendMsg, { isLoading: isSending }] = useSendMessageMutation();
  const [startConv, { isLoading: isStarting }] = useStartConversationMutation();
  const [markRead] = useMarkAsReadMutation();

  const conversations = useMemo(() => convsData?.data || [], [convsData]);
  const messages = useMemo(() => msgsData?.data || [], [msgsData]);

  const selectedConv = useMemo(
    () => conversations.find(c => c._id === selectedConvId) || null,
    [conversations, selectedConvId]
  );
  const otherP: ChatParticipant | null = useMemo(() => {
    if (!selectedConv?.participants) return null;
    return selectedConv.participants.find(p => extractId(p) !== currentUserId)
      || selectedConv.participants[0] || null;
  }, [selectedConv, currentUserId]);

  const otherId = extractId(otherP);
  const isOtherOnline = otherId ? onlineUserIds.includes(otherId) : false;

  /* ── Socket Listeners ── */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onMsg = (m: ChatMessage) => {
      if (m.conversationId === selectedConvId) {
        refetchMsgs();
        markRead({ conversationId: m.conversationId });
      }
      refetchConvs();
    };

    const onTyping = ({ conversationId }: any) => {
      if (conversationId === selectedConvId) setOtherTyping(true);
    };

    const onStop = ({ conversationId }: any) => {
      if (conversationId === selectedConvId) setOtherTyping(false);
    };

    const onOnlineUsers = (users: string[]) => {
      if (Array.isArray(users)) {
        setOnlineUserIds(users.map(u => String(u)));
      }
    };

    const onUserOnline = ({ userId }: { userId: string }) => {
      if (userId) {
        setOnlineUserIds(prev => Array.from(new Set([...prev, String(userId)])));
      }
    };

    const onUserOffline = ({ userId }: { userId: string }) => {
      if (userId) {
        setOnlineUserIds(prev => prev.filter(id => id !== String(userId)));
      }
    };

    socket.on('receive_message', onMsg);
    socket.on('receiveMessage', onMsg);
    socket.on('typing', onTyping);
    socket.on('stop_typing', onStop);
    socket.on('online_users', onOnlineUsers);
    socket.on('onlineUsers', onOnlineUsers);
    socket.on('user_online', onUserOnline);
    socket.on('user_offline', onUserOffline);

    if (selectedConvId) {
      socket.emit('join_room', { conversationId: selectedConvId });
      markRead({ conversationId: selectedConvId });
    }

    return () => {
      socket.off('receive_message', onMsg);
      socket.off('receiveMessage', onMsg);
      socket.off('typing', onTyping);
      socket.off('stop_typing', onStop);
      socket.off('online_users', onOnlineUsers);
      socket.off('onlineUsers', onOnlineUsers);
      socket.off('user_online', onUserOnline);
      socket.off('user_offline', onUserOffline);
      if (selectedConvId) socket.emit('leave_room', { conversationId: selectedConvId });
    };
  }, [selectedConvId, refetchMsgs, refetchConvs, markRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping, uploading]);

  // Reactive URL parameter & initial prop sync effect (conversationId or userId)
  const lastTargetKeyRef = useRef<string>('');
  useEffect(() => {
    const targetKey = `${urlConvId || ''}:${urlUserId || ''}`;

    // Case 1: Specific conversation ID provided in URL or props
    if (urlConvId) {
      if (selectedConvId !== urlConvId) {
        setSelectedConvId(urlConvId);
        setShowMobileChat(true);
      }
      lastTargetKeyRef.current = targetKey;
      return;
    }

    // Case 2: Specific target user ID provided in URL or props
    if (urlUserId) {
      if (loadingConvs) return; // Wait until conversation list is fetched

      const existing = conversations.find(c =>
        c.participants?.some(p => extractId(p) === urlUserId)
      );

      if (existing?._id) {
        if (selectedConvId !== existing._id) {
          setSelectedConvId(existing._id);
          setShowMobileChat(true);
        }
        lastTargetKeyRef.current = targetKey;
      } else if (lastTargetKeyRef.current !== targetKey) {
        // Conversation doesn't exist yet -> automatically start/create one with target user
        lastTargetKeyRef.current = targetKey;
        startConv({ targetUserId: urlUserId })
          .unwrap()
          .then(res => {
            if (res.data?._id) {
              setSelectedConvId(res.data._id);
              setShowMobileChat(true);
              refetchConvs();
            }
          })
          .catch(e => console.warn('Auto-start conversation failed:', e));
      }
      return;
    }

    // Case 3: No specific conversation/user requested -> default to first conversation if none selected
    if (!selectedConvId && conversations.length > 0) {
      setSelectedConvId(conversations[0]._id);
    }
  }, [urlConvId, urlUserId, loadingConvs, conversations, startConv, refetchConvs, selectedConvId]);

  const filtered = useMemo(() => conversations.filter(conv => {
    if (!conv?.participants) return false;
    const other = conv.participants.find(p => extractId(p) !== currentUserId) || conv.participants[0];
    if (!other) return false;
    const q = searchQuery.trim().toLowerCase();
    if (q && !String(other.name || '').toLowerCase().includes(q) && !String(other.email || '').toLowerCase().includes(q)) return false;
    const r = String(other.role || '');
    if (activeTab === 'students') return r === 'student' || r === 'guardian';
    if (activeTab === 'tutors') return r === 'tutor';
    if (activeTab === 'staff') return ['admin','super_admin','moderator'].includes(r);
    return true;
  }), [conversations, currentUserId, searchQuery, activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!socket || !selectedConvId) return;
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', { conversationId: selectedConvId });
    }
    if (typingRef.current) clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('stop_typing', { conversationId: selectedConvId });
    }, 1500);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const t = inputText.trim();
    if (!t || !selectedConvId || !otherP) return;
    const receiverId = extractId(otherP);
    setInputText('');
    const socket = getSocket();
    if (socket) {
      socket.emit('stop_typing', { conversationId: selectedConvId });
      socket.emit('send_message', { conversationId: selectedConvId, receiverId, message: t, type: 'text' });
    }
    try {
      await sendMsg({ conversationId: selectedConvId, receiverId, message: t, type: 'text' }).unwrap();
      refetchMsgs();
      refetchConvs();
    } catch {}
    inputRef.current?.focus();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, forceType?: 'image' | 'file') => {
    const file = e.target.files?.[0];
    if (!file || !selectedConvId || !otherP) return;
    e.target.value = '';
    setAttachmentMenuOpen(false);

    const isImg = forceType === 'image' || file.type.startsWith('image/');
    setUploading(true);
    setUploadProgress(10);
    const receiverId = extractId(otherP);

    try {
      const uploadedUrl = await uploadFileWithProgress(
        file,
        'home-tutor-bd/chat-attachments',
        (percent) => setUploadProgress(percent)
      );
      const msgType = isImg ? 'image' : 'file';
      const msgText = isImg ? '📷 Image' : `📄 ${file.name}`;

      const socket = getSocket();
      if (socket) {
        socket.emit('send_message', {
          conversationId: selectedConvId,
          receiverId,
          message: msgText,
          type: msgType,
          attachments: [uploadedUrl],
        });
      }

      await sendMsg({
        conversationId: selectedConvId,
        receiverId,
        message: msgText,
        type: msgType,
        attachments: [uploadedUrl],
      }).unwrap();

      refetchMsgs();
      refetchConvs();
    } catch (err: any) {
      alert(err?.message || 'Failed to upload attachment.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleStartChat = async (target: ChatParticipant) => {
    const targetId = extractId(target);
    if (!targetId) return;
    try {
      const res = await startConv({ targetUserId: targetId }).unwrap();
      if (res.data?._id) {
        setSelectedConvId(res.data._id);
        setNewChatOpen(false);
        setShowMobileChat(true);
        refetchConvs();
      }
    } catch (e: any) {
      alert(e?.data?.message || 'Failed to start conversation.');
    }
  };

  const quickReplies = useMemo(() => {
    if (currentUserRole === 'student' || currentUserRole === 'guardian') {
      return ['Hi, I need help finding a tutor.', 'Can you check my tuition post status?', 'How do I confirm a hired tutor?', 'Thank you!'];
    }
    return ['Hello! How can we assist?', 'Your request is being reviewed.', 'We matched tutors for your post.', 'Let us know if you need help.'];
  }, [currentUserRole]);

  /* Group messages by date */
  const msgGroups = useMemo(() => {
    const groups: { label: string; msgs: ChatMessage[] }[] = [];
    let cur = '';
    for (const m of messages) {
      const lbl = fmtDateLabel(m.createdAt);
      if (lbl !== cur) {
        cur = lbl;
        groups.push({ label: lbl, msgs: [m] });
      } else {
        groups[groups.length - 1].msgs.push(m);
      }
    }
    return groups;
  }, [messages]);

  const av = (p?: ChatParticipant | null, name?: string) =>
    (p as any)?.avatar || diceavatar(name || p?.name);

  return (
    <div className="flex flex-col h-full w-full max-h-full overflow-hidden select-none">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'image')}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar,.tar,.gz"
        className="hidden"
        onChange={(e) => handleFileUpload(e, 'file')}
      />

      {/* ══ 2-Pane Messenger Layout ══════════════════════════════════════ */}
      <div className="flex flex-1 h-full min-h-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl">

        {/* ─── Sidebar ──────────────────────────────────────────── */}
        <div className={cn(
          "w-full md:w-[320px] lg:w-[360px] shrink-0 border-r border-slate-200 flex flex-col bg-white h-full min-h-0",
          showMobileChat ? "hidden md:flex" : "flex"
        )}>
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F0F2F5] border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2.5">
              <img src={av(user as any, (user as any)?.name)} alt="me" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs" />
              <div>
                <span className="text-sm font-black text-[#111B21] block leading-tight">{headerTitle}</span>
                <span className="text-[10px] font-bold text-slate-400 block">{headerSubtitle}</span>
              </div>
            </div>
            <button
              onClick={() => setNewChatOpen(true)}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer text-[#54656F]"
              title="New Conversation"
            >
              <UserPlus size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2 bg-white shrink-0">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search or start new chat"
                className="w-full pl-8 pr-3 py-2 bg-[#F0F2F5] rounded-lg text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-200 bg-white shrink-0">
            {(['all','students','tutors','staff'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer",
                  activeTab === tab ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                {tab === 'all' ? 'All' : tab === 'students' ? 'Students' : tab === 'tutors' ? 'Tutors' : 'Staff'}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loadingConvs ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={22} className="animate-spin text-primary" />
                <p className="text-xs text-slate-400 font-bold">Loading chats...</p>
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(conv => {
                const other = conv.participants.find(p => extractId(p) !== currentUserId) || conv.participants[0];
                if (!other) return null;
                const otherPid = extractId(other);
                const isUserOnline = otherPid ? onlineUserIds.includes(otherPid) : false;
                const isSelected = conv._id === selectedConvId;
                const badge = ROLE_BADGES[other.role] || ROLE_BADGES.student;
                return (
                  <div
                    key={conv._id}
                    onClick={() => { setSelectedConvId(conv._id); setShowMobileChat(true); }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-slate-50",
                      isSelected ? "bg-[#F0F2F5]" : "hover:bg-[#F5F6F6]"
                    )}
                  >
                    <div className="relative shrink-0">
                      <img src={av(other)} alt={other.name || ''} className="w-12 h-12 rounded-full object-cover border border-slate-100" />
                      {isUserOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Online" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-[13px] font-black text-[#111B21] truncate">{other.name || 'User'}</h4>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] text-slate-400 shrink-0">{fmtTime(conv.lastMessageAt)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded shrink-0", badge.bg, badge.text)}>{badge.label}</span>
                        <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 px-6 text-center space-y-3">
                <MessageSquare size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-black text-slate-500">No conversations yet</p>
                <button onClick={() => setNewChatOpen(true)} className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black cursor-pointer">
                  Start Chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── Chat Thread ──────────────────────────────────────── */}
        <div className={cn("flex-1 flex flex-col min-w-0 h-full bg-[#EFEAE2]", !showMobileChat ? "hidden md:flex" : "flex")}>
          {selectedConv && otherP ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[#F0F2F5] border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setShowMobileChat(false)} className="md:hidden p-1.5 hover:bg-slate-200 rounded-full cursor-pointer"><ArrowLeft size={18} /></button>
                  <div className="relative shrink-0">
                    <img src={av(otherP)} alt={otherP.name || ''} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-xs" />
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#F0F2F5]",
                      isOtherOnline ? "bg-emerald-500" : "bg-slate-300"
                    )} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-[#111B21] truncate">{otherP.name || 'User'}</h3>
                      {ROLE_BADGES[otherP.role] && (
                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded uppercase", ROLE_BADGES[otherP.role].bg, ROLE_BADGES[otherP.role].text)}>
                          {ROLE_BADGES[otherP.role].label}
                        </span>
                      )}
                    </div>
                    {/* Dynamic Active Online / Offline Indicator */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("w-2 h-2 rounded-full", isOtherOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                      <span className={cn("text-[11px] font-bold", isOtherOnline ? "text-emerald-600" : "text-slate-500")}>
                        {otherTyping ? "typing..." : isOtherOnline ? "Active Online" : "Offline"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {(otherP as any).phone && (otherP as any).phone !== 'N/A' && (
                    <a href={`tel:${(otherP as any).phone}`} className="p-2 rounded-full hover:bg-slate-200 text-[#54656F] transition-colors"><Phone size={17} /></a>
                  )}
                  <button className="p-2 rounded-full hover:bg-slate-200 text-[#54656F] cursor-pointer"><MoreVertical size={17} /></button>
                </div>
              </div>

              {/* Message Thread */}
              <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 min-h-0"
                style={{ background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFklEQVR42mNk+M9Qz0AEYBxVSF+FABJADveax7FMAAAAASUVORK5CYII=') repeat, #E5DDD5" }}
              >
                {loadingMsgs ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 size={22} className="animate-spin text-primary" />
                    <p className="text-xs text-slate-500 font-bold">Loading messages...</p>
                  </div>
                ) : msgGroups.length > 0 ? (
                  <>
                    {msgGroups.map(group => (
                      <div key={group.label}>
                        {/* Date separator */}
                        <div className="flex justify-center my-3">
                          <span className="text-[10px] font-semibold text-[#54656F] bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-xs">
                            {group.label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {group.msgs.map((msg, idx) => {
                            const senderId = extractId(msg.senderId);
                            const isMe = Boolean(currentUserId && senderId === currentUserId);
                            const prev = idx > 0 ? group.msgs[idx - 1] : null;
                            const samePrev = prev && extractId(prev.senderId) === senderId;
                            const hasAttachments = Array.isArray(msg.attachments) && msg.attachments.length > 0;
                            const firstAttachment = hasAttachments ? msg.attachments![0] : '';
                            const isImgAttachment = msg.type === 'image' || (msg.type !== 'file' && isImageUrl(firstAttachment));

                            return (
                              <motion.div
                                key={msg._id || idx}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.12 }}
                                className={cn("flex items-end gap-1.5", isMe ? "justify-end" : "justify-start")}
                              >
                                {!isMe && (
                                  <div className="w-7 shrink-0">
                                    {!samePrev ? (
                                      <img src={av(otherP)} alt="" className="w-7 h-7 rounded-full object-cover shadow-xs" />
                                    ) : <div className="w-7" />}
                                  </div>
                                )}

                                {/* WhatsApp-style Bubble */}
                                <div className={cn(
                                  "relative max-w-[85%] sm:max-w-[420px] p-2 shadow-xs",
                                  isMe
                                    ? "bg-[#D9FDD3] text-[#111B21] rounded-[12px] rounded-tr-[4px]"
                                    : "bg-white text-[#111B21] rounded-[12px] rounded-tl-[4px]",
                                  !samePrev && "relative"
                                )}>
                                  {/* Bubble Tails */}
                                  {!samePrev && isMe && (
                                    <span className="absolute -right-[5px] top-0 border-t-[8px] border-t-[#D9FDD3] border-l-[6px] border-l-transparent" style={{ borderStyle: 'solid' }} />
                                  )}
                                  {!samePrev && !isMe && (
                                    <span className="absolute -left-[5px] top-0 border-t-[8px] border-t-white border-r-[6px] border-r-transparent" style={{ borderStyle: 'solid' }} />
                                  )}

                                  {/* Image Attachment Rendering */}
                                  {hasAttachments && isImgAttachment && (
                                    <div className="mb-1 rounded-lg overflow-hidden relative group cursor-pointer border border-black/5 bg-slate-100">
                                      <img
                                        src={firstAttachment}
                                        alt="attachment"
                                        className="w-full max-h-64 object-cover rounded-lg hover:scale-[1.02] transition-transform duration-200"
                                        onClick={() => setPreviewMedia({ url: firstAttachment, name: 'Image', type: 'image' })}
                                      />
                                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur rounded-md p-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewMedia({ url: firstAttachment, name: 'Image', type: 'image' });
                                          }}
                                          className="p-1 text-white hover:text-emerald-300 cursor-pointer"
                                          title="View full"
                                        >
                                          <Eye size={14} />
                                        </button>
                                        <a
                                          href={firstAttachment}
                                          download
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="p-1 text-white hover:text-emerald-300 cursor-pointer"
                                          title="Download"
                                        >
                                          <Download size={14} />
                                        </a>
                                      </div>
                                    </div>
                                  )}

                                  {/* Document / File Attachment Rendering */}
                                  {hasAttachments && !isImgAttachment && (() => {
                                    const doc = getDocInfo(firstAttachment, msg.message);
                                    return (
                                      <div className="my-1 min-w-[220px] sm:min-w-[270px] max-w-full">
                                        <div className={cn("p-2.5 rounded-xl border flex items-center justify-between gap-2.5 shadow-2xs transition-all", doc.cardBg)}>
                                          <div
                                            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setPreviewMedia({ url: firstAttachment, name: doc.name, type: doc.ext === 'pdf' ? 'pdf' : 'doc' })}
                                          >
                                            <div className={cn("w-9 h-9 rounded-lg flex flex-col items-center justify-center font-black text-[10px] tracking-wider shadow-xs shrink-0", doc.badgeBg)}>
                                              <span>{doc.badgeLabel}</span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-xs font-bold text-slate-900 truncate" title={doc.name}>
                                                {doc.name}
                                              </p>
                                              <p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">
                                                {doc.badgeLabel} Document
                                              </p>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-1 shrink-0">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewMedia({ url: firstAttachment, name: doc.name, type: doc.ext === 'pdf' ? 'pdf' : 'doc' });
                                              }}
                                              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0 transition-transform active:scale-90 hover:text-emerald-600 cursor-pointer"
                                              title="Preview Document"
                                            >
                                              <Eye size={15} />
                                            </button>
                                            <a
                                              href={firstAttachment}
                                              target="_blank"
                                              rel="noreferrer"
                                              download
                                              className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 shadow-xs border border-slate-200/80 flex items-center justify-center shrink-0 transition-transform active:scale-90 hover:text-emerald-600"
                                              title="Download File"
                                            >
                                              <Download size={15} />
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Text Message Content */}
                                  {(!hasAttachments || (
                                    msg.message &&
                                    !msg.message.startsWith('📷 Image') &&
                                    !msg.message.startsWith('📄') &&
                                    msg.message !== 'attachment' &&
                                    msg.message !== 'file'
                                  )) && (
                                    <p className="text-[13px] leading-snug whitespace-pre-wrap break-words px-1">
                                      {msg.message}
                                    </p>
                                  )}

                                  <div className="flex items-center justify-end gap-1 mt-0.5 pr-1">
                                    <span className="text-[10px] text-[#667781]">{fmtTime(msg.createdAt)}</span>
                                    {isMe && (msg.isRead
                                      ? <CheckCheck size={14} className="text-[#53BDEB]" />
                                      : <Check size={14} className="text-[#667781]" />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="bg-white/80 backdrop-blur rounded-2xl px-5 py-4 text-center shadow-xs">
                      <MessageSquare size={22} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-500">No messages yet. Say hello!</p>
                    </div>
                  </div>
                )}

                {/* Uploading indicator with live percentage */}
                {uploading && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end pr-2 my-2">
                    <div className="bg-white rounded-2xl p-3 shadow-md border border-slate-200 min-w-[240px] max-w-[280px] flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Loader2 size={16} className="animate-spin text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 leading-tight">Uploading attachment...</p>
                            <p className="text-[10px] text-slate-400 font-medium">Please wait a moment</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600 shrink-0">{uploadProgress}%</span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-200 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Typing dots */}
                <AnimatePresence>
                  {otherTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-end gap-1.5"
                    >
                      <img src={av(otherP)} alt="" className="w-7 h-7 rounded-full object-cover shadow-xs" />
                      <div className="bg-white rounded-[12px] rounded-tl-[4px] px-4 py-3 shadow-xs flex items-center gap-1">
                        {[0, 0.15, 0.3].map(delay => (
                          <motion.span
                            key={delay}
                            className="w-2 h-2 bg-[#8696A0] rounded-full"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.75, delay, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              <div className="flex gap-2 px-4 py-1.5 bg-[#F0F2F5] border-t border-slate-200 overflow-x-auto shrink-0 scrollbar-none">
                {quickReplies.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => { setInputText(r); inputRef.current?.focus(); }}
                    className="text-[11px] font-semibold bg-white hover:bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-200 shrink-0 shadow-2xs transition-colors cursor-pointer"
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-[#F0F2F5] border-t border-slate-200 shrink-0 relative">
                {/* Attachment Menu Popup */}
                <AnimatePresence>
                  {attachmentMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-16 left-4 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 flex flex-col gap-1 z-30 min-w-[170px]"
                    >
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors cursor-pointer w-full text-left"
                      >
                        <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <ImageIcon size={18} />
                        </span>
                        <span>ছবি পাঠান (Image)</span>
                      </button>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors cursor-pointer w-full text-left"
                      >
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText size={18} />
                        </span>
                        <span>ডকুমেন্ট (PDF/Doc)</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSend} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                    className={cn(
                      "p-2.5 rounded-full transition-colors cursor-pointer shrink-0",
                      attachmentMenuOpen ? "bg-slate-300 text-slate-800" : "hover:bg-slate-200 text-[#54656F]"
                    )}
                    title="Attach image or document"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    ref={inputRef}
                    value={inputText}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    disabled={uploading}
                    className="flex-1 px-4 py-2.5 bg-white rounded-xl text-xs font-medium text-[#111B21] placeholder-slate-400 focus:outline-none shadow-xs border border-transparent focus:border-emerald-300"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending || uploading}
                    className="p-2.5 rounded-full bg-[#00A884] hover:bg-[#008f6f] disabled:opacity-40 text-white transition-all cursor-pointer shadow-md disabled:cursor-not-allowed shrink-0 active:scale-95"
                  >
                    {isSending || uploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-[#E5DDD5] flex items-center justify-center shadow-inner">
                <MessageSquare size={38} className="text-[#8696A0]" />
              </div>
              <div className="max-w-sm space-y-1">
                <h3 className="text-base font-black text-[#111B21]">Home Tutor BD Messenger</h3>
                <p className="text-xs font-medium text-[#667781] leading-relaxed">
                  Select a chat on the left or click <strong className="text-primary">+</strong> to start messaging verified tutors and admin support.
                </p>
              </div>
              <button
                onClick={() => setNewChatOpen(true)}
                className="px-5 py-2.5 bg-[#00A884] hover:bg-[#008f6f] text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer"
              >
                + New Conversation
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Rich Preview Modal (Image & PDF / Document) ── */}
      <AnimatePresence>
        {previewMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewMedia(null)}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          >
            <div
              className={cn(
                "relative flex flex-col bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all",
                previewMedia.type === 'pdf' ? "w-full max-w-4xl h-[85vh]" : "max-w-4xl max-h-[90vh]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-black/50 border-b border-white/10 text-white shrink-0">
                <div className="flex items-center gap-2 min-w-0 pr-4">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {previewMedia.name || 'Attachment Preview'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <Download size={14} /> Download
                  </a>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    onClick={() => setPreviewMedia(null)}
                    className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 min-h-0 flex items-center justify-center p-2 sm:p-4 overflow-auto bg-black/30">
                {previewMedia.type === 'pdf' ? (
                  <iframe
                    src={`${previewMedia.url}#toolbar=1`}
                    title="PDF Preview"
                    className="w-full h-full rounded-xl bg-white border-0 shadow-lg"
                  />
                ) : previewMedia.type === 'image' ? (
                  <img
                    src={previewMedia.url}
                    alt={previewMedia.name || 'Preview'}
                    className="max-w-full max-h-[75vh] rounded-xl object-contain shadow-2xl"
                  />
                ) : (
                  <div className="p-8 text-center space-y-4 max-w-md bg-white/10 rounded-2xl border border-white/10">
                    <div className="w-14 h-14 rounded-2xl bg-primary/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{previewMedia.name || 'Document File'}</p>
                      <p className="text-xs text-slate-300 mt-1">This document format can be opened directly or downloaded.</p>
                    </div>
                    <a
                      href={previewMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
                    >
                      <Download size={16} /> Download & Open
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── New Chat Contact Modal ── */}
      <AnimatePresence>
        {newChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNewChatOpen(false)}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-ink">New Conversation</h3>
                  <p className="text-xs text-ink-muted">Select a user to start messaging</p>
                </div>
                <button onClick={() => setNewChatOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-ink-muted cursor-pointer"><X size={18} /></button>
              </div>

              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={userSearchTerm}
                    onChange={e => { setUserSearchTerm(e.target.value); searchUsers(e.target.value); }}
                    placeholder="Search by name, email or phone..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {isSearching ? (
                  <div className="py-8 text-center"><Loader2 size={20} className="animate-spin mx-auto text-primary" /></div>
                ) : (userSearchTerm ? searchResults?.data : contactsData?.data)?.length ? (
                  (userSearchTerm ? searchResults?.data : contactsData?.data)?.map(c => {
                    const badge = ROLE_BADGES[c.role] || ROLE_BADGES.student;
                    const cId = extractId(c);
                    const isContactOnline = cId ? onlineUserIds.includes(cId) : false;
                    return (
                      <div
                        key={c._id}
                        onClick={() => handleStartChat(c)}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <div className="relative shrink-0">
                          <img src={av(c)} alt="" className="w-10 h-10 rounded-full object-cover" />
                          {isContactOnline && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-ink truncate">{c.name}</p>
                          <p className="text-[10px] text-ink-muted truncate">{c.email}</p>
                        </div>
                        <span className={cn("text-[9px] font-black px-2 py-0.5 rounded", badge.bg, badge.text)}>{badge.label}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs font-bold text-slate-400">No users found</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, X, RotateCcw, MessageCircle, ExternalLink, 
  Sparkles, ChevronRight, HelpCircle, User, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { getBotResponse, DEFAULT_QUICK_CHIPS, ChatbotResponse } from '@/src/lib/chatbotKnowledge';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  chips?: string[];
  actionLink?: ChatbotResponse['actionLink'];
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'স্বাগতম! আমি **Home Tutor AI Assistant**। 🎓\n\nওয়েবসাইট, টিউটর খোঁজা, টিউটর হওয়া বা আইটি সার্ভিস সম্পর্কিত যেকোনো তথ্য জানতে নিচে ক্লিক করুন অথবা যেকোনো প্রশ্ন লিখুন:',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      chips: DEFAULT_QUICK_CHIPS,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Realistic slight delay for assistant response
    setTimeout(() => {
      const botReply = getBotResponse(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: botReply.chips,
        actionLink: botReply.actionLink,
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: 'চ্যাট হিস্ট্রি রিসেট করা হয়েছে! আপনাকে কীভাবে সহায়তা করতে পারি?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: DEFAULT_QUICK_CHIPS,
      },
    ]);
  };

  // Format markdown bold (**text**) and newlines cleanly
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Process bold markers **
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={idx} className="block min-h-[1rem]">
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-ink">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={pIdx} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono font-bold">{part.slice(1, -1)}</code>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-28 md:bottom-8 right-6 z-50 flex items-center gap-3">
        {/* Tooltip badge */}
        {!isOpen && hasUnread && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-primary/20 shadow-xl shadow-primary/10 text-xs font-bold text-ink cursor-pointer group hover:border-primary/40 transition-all"
          >
            <Sparkles size={14} className="text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span>Need Help? <strong className="text-primary">Chat with AI</strong></span>
            <ChevronRight size={14} className="text-ink-muted group-hover:translate-x-0.5 transition-transform" />
          </motion.div>
        )}

        {/* Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all relative cursor-pointer",
            isOpen 
              ? "bg-slate-900 text-white shadow-slate-900/30" 
              : "bg-gradient-to-tr from-primary to-emerald-500 text-white shadow-primary/30"
          )}
          aria-label="Open AI Chatbot"
        >
          {isOpen ? (
            <X size={26} />
          ) : (
            <>
              <Bot size={28} className="animate-pulse" />
              {/* Online pulse ping */}
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white" />
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Chatbot Modal Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 md:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[540px] max-h-[82vh] bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-[#001F3F] via-slate-900 to-primary text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner relative">
                  <Bot size={22} className="text-emerald-300" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm text-white flex items-center gap-1.5">
                    Home Tutor AI
                    <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded-md uppercase border border-emerald-400/30">Online</span>
                  </h3>
                  <p className="text-[11px] text-white/70 font-medium">Ask anything in বাংলা or English</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="p-2 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col space-y-2",
                    msg.sender === 'user' ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {msg.sender === 'bot' && (
                      <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mb-1 border border-primary/20">
                        <Bot size={16} />
                      </div>
                    )}

                    <div
                      className={cn(
                        "p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs space-y-2",
                        msg.sender === 'user'
                          ? "bg-primary text-white font-medium rounded-br-none"
                          : "bg-white text-slate-700 border border-slate-200/80 rounded-bl-none"
                      )}
                    >
                      <div>{renderFormattedText(msg.text)}</div>

                      {/* Action CTA Button if attached */}
                      {msg.actionLink && (
                        <div className="pt-2 border-t border-slate-100">
                          {msg.actionLink.isExternal ? (
                            <a
                              href={msg.actionLink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors"
                            >
                              <MessageCircle size={13} />
                              <span>{msg.actionLink.label}</span>
                              <ExternalLink size={11} />
                            </a>
                          ) : (
                            <Link
                              to={msg.actionLink.url}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-[11px] font-bold shadow-xs transition-colors"
                            >
                              <span>{msg.actionLink.label}</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold px-1">
                    {msg.timestamp}
                  </span>

                  {/* Suggestion Chips */}
                  {msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-9">
                      {msg.chips.map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 bg-white hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 transition-all text-left shadow-xs cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Direct WhatsApp Action Bar */}
            <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-bold flex items-center gap-1">
                <HelpCircle size={13} className="text-primary" /> সরাসরি মানুষের সাথে কথা বলুন:
              </span>
              <a
                href="https://wa.me/8801928325460?text=Hello%20Home%20Tutor%20Provider%20BD,%20I%20need%20support."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-700 font-black hover:underline"
              >
                <MessageCircle size={13} className="text-emerald-600" /> WhatsApp
              </a>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="এখানে প্রশ্ন লিখুন (Write question)..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isTyping}
                className="w-10 h-10 bg-primary hover:bg-primary-dark text-white rounded-xl flex items-center justify-center shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

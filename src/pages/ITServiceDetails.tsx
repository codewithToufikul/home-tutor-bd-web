import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Clock, MessageSquare, 
  Phone, Sparkles, ChevronRight, Zap, Code2, Star, Check, 
  Share2, Cpu, Layers, Loader2,
  Laptop, Smartphone, Database, Rocket, Terminal, FileCode, 
  CheckCheck, HelpCircle, ChevronDown, ChevronUp,
  Shield, Server, HeartHandshake, ArrowRight
} from 'lucide-react';
import { useGetServiceByIdQuery, useGetServicesQuery } from '@/src/services/itServiceApi';
import { useAuth } from '@/src/context/AuthContext';
import { useStartConversationMutation } from '@/src/services/chatApi';
import { cn } from '@/src/lib/utils';

const CATEGORY_NAMES: Record<string, string> = {
  web_development: 'Web Development',
  app_development: 'Mobile Apps',
  ui_ux_design: 'UI/UX Design',
  custom_software: 'Custom ERP & Software',
  digital_marketing: 'Digital Marketing & SEO',
  cloud_devops: 'Cloud & DevOps',
  ai_data_solutions: 'AI & Data Solutions',
  other: 'IT Solutions',
};

const DEFAULT_FAQS = [
  {
    q: 'Do I get 100% full ownership of the source code?',
    a: 'Yes! Upon project completion and final milestone handover, all source code, design files, repositories, and credentials are 100% transferred to you with full commercial rights.',
  },
  {
    q: 'How do you ensure project timeline and quality?',
    a: 'We follow strict Agile sprints with weekly milestone demos. You get direct access to a dedicated project manager and live staging URLs to test features in real-time.',
  },
  {
    q: 'What happens if we need bug fixes or maintenance after launch?',
    a: 'Every custom project comes with a complimentary 3-Month Free Warranty & Maintenance period covering bug fixes, minor tweaks, and server monitoring.',
  },
  {
    q: 'Can you sign a Non-Disclosure Agreement (NDA)?',
    a: 'Absolutely. We treat your intellectual property with utmost secrecy and routinely sign mutual NDAs before reviewing detailed specifications or codebases.',
  },
  {
    q: 'Can we request customized payment milestones?',
    a: 'Yes, we structure payments in transparent milestones (e.g. 30% kickoff, 40% demo milestone, 30% final deployment handover).',
  },
];

export default function ITServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [customRequirement, setCustomRequirement] = useState('');
  const [showInquirySent, setShowInquirySent] = useState(false);

  const [startConversationMutation, { isLoading: isStartingChat }] = useStartConversationMutation();

  const { data: serviceData, isLoading, isError } = useGetServiceByIdQuery(id || '', {
    skip: !id,
  });

  const { data: allServicesData } = useGetServicesQuery({ isActive: true });

  const service = serviceData?.data;

  // Related services (exclude current one)
  const relatedServices = useMemo(() => {
    if (!allServicesData?.data || !service) return [];
    return allServicesData.data
      .filter((s) => s._id !== service._id)
      .slice(0, 3);
  }, [allServicesData, service]);

  const handleStartChatWithAdmin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const messagesUrl = ['admin', 'super_admin', 'moderator'].includes(user.role)
      ? '/admin/inbox'
      : user.role === 'guardian'
      ? '/guardian/messages'
      : user.role === 'tutor'
      ? '/tutor/messages'
      : '/student/messages';

    navigate(messagesUrl);
  };

  const handleQuickInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRequirement.trim()) return;
    setShowInquirySent(true);
    setTimeout(() => {
      handleStartChatWithAdmin();
    }, 1200);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-[#F0FDF9]/40 to-white">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Cpu className="absolute inset-0 m-auto text-primary animate-pulse" size={24} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-ink">Loading Technical Specifications</p>
          <p className="text-xs font-semibold text-slate-400">Fetching service architecture & deliverables...</p>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="max-w-xl mx-auto my-20 bg-white rounded-[36px] p-10 sm:p-14 text-center space-y-6 border border-slate-200/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
          <Code2 size={36} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-ink">Service Not Available</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            This technical service may have been moved, updated, or temporarily disabled by the administration.
          </p>
        </div>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/25 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Browse All IT Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EBFDF8]/80 via-[#F6FAF9]/60 to-white pb-28 relative overflow-hidden">
      
      {/* 🔮 Animated Floating Tech Vectors in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Glowing Orbs */}
        <div className="absolute top-0 right-10 w-[36rem] h-[36rem] bg-cyan-400/12 rounded-full blur-3xl -translate-y-1/3" />
        <div className="absolute top-1/4 left-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-emerald-400/10 rounded-full blur-3xl" />

        {/* Tech Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Floating Lucide Tech Icons */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-28 left-[6%] text-teal-600/20"
        >
          <Laptop size={60} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 22, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-44 right-[8%] text-cyan-600/20"
        >
          <Terminal size={52} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -16, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-[42%] left-[3%] text-emerald-600/20"
        >
          <Cpu size={56} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute top-[58%] right-[5%] text-indigo-600/15"
        >
          <Database size={54} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -22, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
          className="absolute top-[75%] left-[8%] text-teal-600/20"
        >
          <Rocket size={48} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute top-[88%] right-[12%] text-primary/15"
        >
          <Smartphone size={50} strokeWidth={1.2} />
        </motion.div>
      </div>

      {/* 🌟 Top Navigation & Breadcrumbs Header */}
      <section className="relative pt-8 pb-10 border-b border-teal-900/5 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <span>Home</span>
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <Link to="/services" className="hover:text-primary transition-colors">
                IT & Software Services
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-primary font-bold truncate max-w-xs">{service.title}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleShare}
                className="px-3.5 py-2 bg-white/90 hover:bg-white border border-slate-200/80 hover:border-primary text-slate-700 hover:text-primary rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <Share2 size={14} />
                <span>{copied ? 'Copied Link!' : 'Share'}</span>
              </button>
              <Link
                to="/services"
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </Link>
            </div>
          </div>

          {/* Main Title Block with Curved Underline */}
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider border border-primary/20 shadow-2xs">
                <Zap size={13} className="fill-primary/20" />
                <span>{CATEGORY_NAMES[service.category] || 'IT Service'}</span>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200/70">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Verified Enterprise Standard</span>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-800 rounded-full text-xs font-bold border border-amber-200/70">
                <Star size={13} className="text-amber-500 fill-amber-400" />
                <span>5.0 (48+ Completed Projects)</span>
              </div>
            </div>

            <h1 className="relative inline-block text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#001F3F] tracking-tight leading-tight">
              {service.title}
              <svg
                className="absolute left-0 -bottom-2 sm:-bottom-3.5 w-full h-3 sm:h-4 text-primary/70 pointer-events-none"
                viewBox="0 0 300 20"
                preserveAspectRatio="none"
                fill="none"
              >
                <path
                  d="M2 12 C 60 2, 120 18, 180 8 C 220 2, 260 14, 298 6"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-3xl pt-2">
              {service.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* 📐 Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* 💻 Left Column: Deep Technical Specs & Features (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Banner Image with Live Tech Badge */}
            {service.thumbnail && (
              <div className="rounded-[2.5rem] overflow-hidden border border-slate-200/90 shadow-2xl h-80 sm:h-[420px] relative bg-slate-950 group">
                <img
                  src={service.thumbnail}
                  alt={service.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                
                {/* Floating Tags in Banner */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-black/60 text-white text-xs font-black uppercase tracking-wider backdrop-blur-md border border-white/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Custom Engineering
                  </span>
                </div>

                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-white">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Department</span>
                    <h3 className="text-lg font-black">{CATEGORY_NAMES[service.category] || 'Software Services'}</h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {service.deliveryTime && (
                      <span className="px-4 py-2 rounded-2xl bg-black/70 text-white text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                        <Clock size={14} className="text-amber-400" />
                        <span>Est. Delivery: {service.deliveryTime}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 🏆 Why Choose Our IT Engineering Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {[
                { icon: ShieldCheck, title: '3-Month Warranty', desc: 'Free Maintenance', color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60' },
                { icon: Code2, title: 'Clean Architecture', desc: 'Full Git Ownership', color: 'text-teal-600 bg-teal-50 border-teal-200/60' },
                { icon: Rocket, title: '99.9% Uptime', desc: 'Fast & Scalable', color: 'text-cyan-600 bg-cyan-50 border-cyan-200/60' },
                { icon: HeartHandshake, title: '1-on-1 Support', desc: 'Dedicated Manager', color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60' },
              ].map((metric, i) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm flex flex-col items-start gap-2 hover:shadow-md transition-all"
                  >
                    <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center border", metric.color)}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-ink">{metric.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{metric.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 📝 Detailed Overview & Technical Scope */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-ink">Service Scope & Technical Overview</h3>
                  <p className="text-xs text-slate-500 font-medium">Full description of development architecture, modules, and execution strategy.</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0">
                  <Terminal size={20} />
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {service.fullDescription}
              </div>
            </div>

            {/* ✨ Included Features & Deliverables Grid */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
                <div className="space-y-1 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-black text-ink">What's Included & Deliverables</h3>
                    <p className="text-xs text-slate-500 font-medium">Standard modules, guarantees, and assets included in this solution.</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCheck size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {service.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/80 hover:bg-primary/5 rounded-2xl border border-slate-200/70 flex items-start gap-3.5 transition-all group hover:border-primary/30"
                    >
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🚀 4-Step Agile Development Lifecycle */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-ink">Development Lifecycle</h3>
                  <p className="text-xs text-slate-500 font-medium">Transparent, agile process from requirement collection to cloud deployment.</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <Rocket size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: '01', title: 'Discovery & Plan', desc: 'Architecture blueprint, requirement scoping & tech choice.', icon: Layers },
                  { step: '02', title: 'UI/UX Design', desc: 'Interactive Figma wireframes, prototype & user journey.', icon: Laptop },
                  { step: '03', title: 'Agile Coding', desc: 'Clean frontend & backend development with weekly milestone demos.', icon: Code2 },
                  { step: '04', title: 'QA & Cloud Launch', desc: 'Security audit, speed optimization & server deployment.', icon: Server },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-slate-50/90 border border-slate-200/80 hover:bg-white hover:border-primary/40 hover:shadow-lg transition-all space-y-3 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-primary px-2.5 py-1 rounded-xl bg-primary/10 uppercase tracking-wider">
                          Step {item.step}
                        </span>
                        <Icon size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <h4 className="text-xs font-black text-ink">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🛠 Tech Stack & Tools */}
            {service.technologies && service.technologies.length > 0 && (
              <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
                <div className="space-y-1 pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-display font-black text-ink">Tech Stack & Frameworks</h3>
                    <p className="text-xs text-slate-500 font-medium">Enterprise grade, modern, high-performance technology tools.</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Cpu size={20} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {service.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-primary hover:text-white text-slate-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border border-slate-200/80 shadow-2xs cursor-default flex items-center gap-1.5"
                    >
                      <Code2 size={14} className="text-primary group-hover:text-white" />
                      <span>{tech}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ❓ Frequently Asked Questions (FAQ) */}
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
              <div className="space-y-1 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-ink">Frequently Asked Questions</h3>
                  <p className="text-xs text-slate-500 font-medium">Common questions about workflow, source code ownership & support.</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <HelpCircle size={20} />
                </div>
              </div>

              <div className="space-y-3">
                {DEFAULT_FAQS.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-2xl border transition-all overflow-hidden",
                        isOpen ? "border-primary/40 bg-teal-50/30" : "border-slate-200/80 bg-slate-50/60"
                      )}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-black text-ink">{faq.q}</span>
                        {isOpen ? <ChevronUp size={18} className="text-primary shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 sm:px-5 pb-5 text-xs text-slate-600 font-medium leading-relaxed"
                          >
                            {faq.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* 💼 Right Column: Sticky Consultation & Order Sidebar (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border-2 border-primary/25 shadow-2xl space-y-6 sticky top-24">
              
              {/* Header Status */}
              <div className="space-y-2 pb-5 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Senior Architects Online</span>
                </div>

                <h4 className="text-xl font-display font-black text-[#001F3F] pt-1">
                  Start Custom Project
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Discuss your project scope, timeline & get an immediate technical proposal from our engineering leads.
                </p>
              </div>

              {/* Quick Specification Highlights */}
              <div className="space-y-2.5 text-xs">
                {service.deliveryTime && (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70">
                    <span className="font-bold text-slate-500 flex items-center gap-2">
                      <Clock size={16} className="text-primary" /> Delivery Time:
                    </span>
                    <span className="font-black text-ink">{service.deliveryTime}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70">
                  <span className="font-bold text-slate-500 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-600" /> Free Warranty:
                  </span>
                  <span className="font-black text-emerald-700">3 Months Free Support</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70">
                  <span className="font-bold text-slate-500 flex items-center gap-2">
                    <FileCode size={16} className="text-purple-600" /> Source Code:
                  </span>
                  <span className="font-black text-purple-700">100% Full Ownership</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70">
                  <span className="font-bold text-slate-500 flex items-center gap-2">
                    <Shield size={16} className="text-cyan-600" /> Privacy & NDA:
                  </span>
                  <span className="font-black text-cyan-700">Guaranteed Protection</span>
                </div>
              </div>

              {/* Quick Requirement Note Form */}
              <form onSubmit={handleQuickInquirySubmit} className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Quick Requirement / Message (Optional):
                </label>
                <textarea
                  rows={2}
                  value={customRequirement}
                  onChange={(e) => setCustomRequirement(e.target.value)}
                  placeholder="e.g., I need an E-commerce platform with bKash payment gateway..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary/40 rounded-2xl text-xs font-medium text-ink focus:outline-none transition-all resize-none"
                />

                {showInquirySent && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Connecting you to Admin Chat...</span>
                  </div>
                )}

                {/* 💬 Primary CTA: Direct Admin Chat */}
                <button
                  type="button"
                  onClick={handleStartChatWithAdmin}
                  disabled={isStartingChat}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <MessageSquare size={16} />
                  <span>💬 Chat Directly with Admin</span>
                </button>
              </form>

              {/* WhatsApp CTA */}
              <div className="space-y-2.5">
                <a
                  href={`https://wa.me/8801700000000?text=${encodeURIComponent(`Hello Home Tutor BD IT Team, I am interested in: ${service.title}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-black text-xs uppercase tracking-wider border border-emerald-200/80 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <MessageSquare size={15} className="text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="tel:+8801700000000"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  <span>Call Hotline: +880 1700-000000</span>
                </a>
              </div>

              {/* Trust Badge */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <CheckCheck size={18} />
                </div>
                <span>Strict code quality standard. Milestone escrow protection & verified tech stack.</span>
              </div>

            </div>
          </div>

        </div>

        {/* 🌟 Related / Other IT Solutions Carousel/Grid */}
        {relatedServices.length > 0 && (
          <div className="mt-20 pt-12 border-t border-teal-900/10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                  <Sparkles size={13} />
                  <span>Explore More Solutions</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-[#001F3F]">
                  Other Technical Services
                </h3>
              </div>

              <Link
                to="/services"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary hover:text-primary-dark transition-colors"
              >
                <span>View All Services</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((rel) => (
                <div
                  key={rel._id}
                  className="bg-white rounded-[2rem] p-6 border border-slate-200/80 hover:border-primary/40 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {rel.thumbnail && (
                      <div className="h-44 rounded-2xl overflow-hidden relative bg-slate-900">
                        <img
                          src={rel.thumbnail}
                          alt={rel.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 bg-black/70 text-white rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                            {CATEGORY_NAMES[rel.category] || 'IT'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="text-base font-black text-ink group-hover:text-primary transition-colors line-clamp-1">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {rel.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      ⏱ {rel.deliveryTime || 'Custom'}
                    </span>
                    <Link
                      to={`/services/${rel._id}`}
                      className="inline-flex items-center gap-1 text-xs font-black text-primary hover:text-primary-dark uppercase tracking-wider group-hover:translate-x-1 transition-all"
                    >
                      <span>Explore</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

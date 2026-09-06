import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight, CheckCircle2, MessageSquare, Zap, Sparkles,
  Code2, Laptop, Smartphone, Database, Cpu, Cloud, Rocket, Terminal, Layers, Server, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetServicesQuery, ITServiceItem } from '@/src/services/itServiceApi';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';

const DEFAULT_SERVICES: Partial<ITServiceItem>[] = [
  {
    _id: 'web-dev-preset',
    title: 'Custom Web Application Development',
    slug: 'custom-web-development',
    category: 'web_development',
    shortDescription: 'Modern, blazing-fast web applications built with React, Next.js, Node.js, and scalable cloud databases.',
    deliveryTime: '5–10 Days',
    features: ['Responsive UI & UX', 'Fullstack API Integration', 'SEO & Fast Performance', 'Admin Dashboard Included'],
    technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'app-dev-preset',
    title: 'Mobile App Development (iOS & Android)',
    slug: 'mobile-app-development',
    category: 'app_development',
    shortDescription: 'Cross-platform native-performance mobile applications using Flutter & React Native with push notifications.',
    deliveryTime: '10–20 Days',
    features: ['Cross-Platform iOS & Android', 'Firebase & API Sync', 'Play Store & App Store Publish', 'Real-time Messaging'],
    technologies: ['Flutter', 'React Native', 'Firebase', 'REST API'],
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'ui-ux-preset',
    title: 'UI/UX Design & Brand Prototyping',
    slug: 'ui-ux-design',
    category: 'ui_ux_design',
    shortDescription: 'World-class, high-converting Figma UI/UX designs, wireframes, and design systems for web and mobile.',
    deliveryTime: '3–7 Days',
    features: ['Interactive Figma Prototypes', 'Modern Design Systems', 'User Journey & Wireframing', 'Developer-Ready Assets'],
    technologies: ['Figma', 'Adobe XD', 'Prototyping', 'Design Systems'],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'custom-software-preset',
    title: 'School & Tuition Management ERP',
    slug: 'school-tuition-management-software',
    category: 'custom_software',
    shortDescription: 'Complete automation software for schools, coaching centers, and tuition academies with billing and SMS.',
    deliveryTime: '15–30 Days',
    features: ['Student & Staff Portal', 'Automated Fee & Invoicing', 'SMS & Attendance System', 'Analytics & Reports'],
    technologies: ['React', 'Express', 'PostgreSQL', 'Cloud Backup'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  },
];

const CATEGORY_NAMES: Record<string, string> = {
  web_development: 'Web Development',
  app_development: 'Mobile Apps',
  ui_ux_design: 'UI/UX Design',
  custom_software: 'Custom Software',
  digital_marketing: 'Digital Marketing',
  cloud_devops: 'Cloud & DevOps',
  ai_data_solutions: 'AI & Data',
  other: 'IT Solutions',
};

export default function ITServicesSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: servicesData } = useGetServicesQuery({ isActive: true });

  const displayedServices = useMemo(() => {
    const rawList = servicesData?.data && servicesData.data.length > 0 ? servicesData.data : DEFAULT_SERVICES;
    if (selectedCategory === 'all') return rawList;
    return rawList.filter((s) => s.category === selectedCategory);
  }, [servicesData, selectedCategory]);

  const handleConsultChat = () => {
    const targetUrl = !user
      ? '/login'
      : ['admin', 'super_admin', 'moderator'].includes(user.role)
        ? '/admin/inbox'
        : user.role === 'guardian'
          ? '/guardian/messages'
          : user.role === 'tutor'
            ? '/tutor/messages'
            : '/student/messages';
    navigate(targetUrl);
  };

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-gradient-to-b from-teal-500/10 via-emerald-500/5 to-transparent border-y border-ink/5">
      {/* Ambient Tech Glow Orbs */}
      <div className="absolute top-0 right-10 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-10 w-[32rem] h-[32rem] bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Futuristic Dot-Matrix Tech Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#0D9488 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* ── ANIMATED FLOATING IT & SOFTWARE VECTORS ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* 1. Floating Code Laptop (Top Left) */}
        <motion.div
          animate={{
            y: [0, -18, 0],
            rotate: [0, 8, -6, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-10 left-[4%] text-primary/20 sm:text-primary/25"
        >
          <Laptop size={48} className="transform -rotate-6" />
        </motion.div>

        {/* 2. Floating Mobile Device (Top Right) */}
        <motion.div
          animate={{
            y: [0, 18, 0],
            rotate: [0, -10, 8, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
          className="absolute top-12 right-[6%] text-emerald-500/25 sm:text-emerald-500/30"
        >
          <Smartphone size={44} className="transform rotate-12" />
        </motion.div>

        {/* 3. Floating CPU Tech Core (Bottom Left) */}
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotate: [0, 360],
          }}
          transition={{
            y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
          }}
          className="absolute bottom-16 left-[5%] text-teal-600/20 sm:text-teal-600/25"
        >
          <Cpu size={50} />
        </motion.div>

        {/* 4. Floating Cloud Database (Bottom Center-Right) */}
        <motion.div
          animate={{
            y: [0, 16, 0],
            rotate: [0, -6, 6, 0],
          }}
          transition={{
            duration: 7.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
          className="absolute bottom-12 right-[20%] text-cyan-600/20 hidden md:block"
        >
          <Database size={42} />
        </motion.div>

        {/* 5. Floating Rocket Launch (Center Right) */}
        <motion.div
          animate={{
            y: [0, -16, 0],
            rotate: [0, 8, -4, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute top-[42%] right-[3%] text-amber-500/30"
        >
          <Rocket size={40} />
        </motion.div>

        {/* 6. Floating Code Terminal / Syntax (Center Left) */}
        <motion.div
          animate={{
            y: [0, 14, 0],
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute top-[48%] left-[2%] text-primary/20"
        >
          <Terminal size={38} />
        </motion.div>

        {/* 7. Code Syntax Watermarks */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-20 left-[40%] text-primary/20 font-mono text-2xl font-black tracking-widest hidden lg:block"
        >
          {'<CodePlatform />'}
        </motion.div>

        <motion.div
          animate={{
            y: [0, 12, 0],
            opacity: [0.12, 0.3, 0.12],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
          className="absolute bottom-20 left-[35%] text-emerald-600/20 font-mono text-2xl font-black tracking-widest hidden lg:block"
        >
          {'const app = express()'}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header with curved underline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <h2 className="relative inline-block text-2xl md:text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#001F3F] tracking-tight">
              <span className="text-primary">IT & Software</span> Services
              <svg
                className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 text-primary/70"
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
            </h2>
            <p className="text-xs md:text-sm sm:text-base text-ink-muted font-medium leading-relaxed pt-2">
              Beyond tutoring — our in-house engineering team builds world-class websites, mobile apps, ERPs, and custom software for your business, school, or startup.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3.5 bg-ink hover:bg-primary text-white rounded-2xl text-xs md:text-sm font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 shrink-0 self-start md:self-auto group cursor-pointer"
          >
            <span>Browse All IT Services</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All Services', icon: Sparkles },
            { id: 'web_development', label: 'Web Development', icon: Code2 },
            { id: 'app_development', label: 'Mobile Apps', icon: Smartphone },
            { id: 'ui_ux_design', label: 'UI/UX Design', icon: Layers },
            { id: 'custom_software', label: 'Custom Software', icon: Cpu },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border",
                  isActive
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-[1.03]"
                    : "bg-white/90 text-ink-muted hover:text-ink hover:bg-white border-slate-200/80 shadow-xs"
                )}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-primary"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedServices.slice(0, 4).map((service, index) => {
            const serviceId = service._id || service.slug || String(index);
            const detailUrl = `/services/${service.slug || service._id}`;

            return (
              <motion.div
                key={serviceId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/80 hover:border-primary/40 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={service.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-primary tracking-wider shadow-sm border border-white/40">
                      {CATEGORY_NAMES[service.category || 'web_development'] || 'IT Service'}
                    </span>
                    {service.deliveryTime && (
                      <span className="absolute bottom-3 left-3 text-white text-[11px] font-bold px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
                        ⏱ {service.deliveryTime}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-ink group-hover:text-primary transition-colors line-clamp-2">
                        {service.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 font-medium">
                        {service.shortDescription}
                      </p>
                    </div>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        {service.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tech Pills */}
                    {service.technologies && service.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {service.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 bg-slate-100/90 rounded-md text-[10px] font-bold text-slate-600 border border-slate-200/50">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-auto flex items-center justify-end gap-2">
                  <Link
                    to={detailUrl}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={handleConsultChat}
                    className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <MessageSquare size={13} />
                    <span>Consult</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-primary via-teal-700 to-[#001F3F] rounded-[2.5rem] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-3 max-w-xl z-10">
            <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Rocket size={13} />
              <span>Custom Software Requirement?</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-black leading-tight">
              Need a custom website, mobile app, or tuition ERP?
            </h3>
            <p className="text-xs sm:text-sm text-white/85 font-medium">
              Chat directly with our senior software engineers for free consultation, estimation, and quotation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 z-10">
            <Link
              to="/services"
              className="px-6 py-3.5 bg-white text-primary hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer font-bold"
            >
              Browse All Services
            </Link>
            <button
              onClick={handleConsultChat}
              className="px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl text-xs font-black uppercase tracking-wider border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageSquare size={15} />
              <span>Chat with Admin</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

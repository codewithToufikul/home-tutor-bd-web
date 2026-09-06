import { motion } from 'motion/react';
import { 
  UserPlus, ShieldCheck, Award, CheckCircle, 
  Sparkles, BadgeCheck, Star, GraduationCap
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const SELECTION_STEPS = [
  {
    step: 'Step 1',
    title: 'Strict Application',
    desc: 'Tutors from BUET, DU, Medical & top-tier universities apply with verified academic records.',
    icon: UserPlus,
    color: 'bg-[#E8F0FE] text-[#2563EB] border-[#BFDBFE]',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    stat: 'Top 15% Screened',
  },
  {
    step: 'Step 2',
    title: 'Document Verification',
    desc: 'Our team manually verifies original university IDs, National NID, and academic certificates.',
    icon: ShieldCheck,
    color: 'bg-[#FCE8E6] text-[#DC2626] border-[#FECACA]',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    stat: '100% Background Check',
  },
  {
    step: 'Step 3',
    title: 'Skill Assessment',
    desc: 'Candidates undergo live mock interviews to evaluate teaching methodology & communication.',
    icon: Award,
    color: 'bg-[#E6F4EA] text-[#16A34A] border-[#BBF7D0]',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    stat: 'Rigorous Interview',
  },
  {
    step: 'Step 4',
    title: 'Quality Onboarding',
    desc: 'Only the most capable tutors are onboarded with ongoing student review monitoring.',
    icon: CheckCircle,
    color: 'bg-[#FEF7E0] text-[#D97706] border-[#FDE68A]',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    stat: 'Top 5% Selected',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white via-[#F0FDF9]/60 to-white">
      {/* Background Vectors, Floating Orbs & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/3 -left-24 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-24 w-[32rem] h-[32rem] bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-emerald-400/5 rounded-full blur-3xl" />

        {/* Delicate Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating Lucide Tuition & Trust Icons */}
        <motion.div
          animate={{ y: [0, -18, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-24 left-[7%] text-teal-600/15 hidden sm:block"
        >
          <ShieldCheck size={58} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -12, 0] }}
          transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-36 right-[8%] text-cyan-600/15 hidden sm:block"
        >
          <Award size={54} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -15, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-28 left-[10%] text-emerald-600/15 hidden sm:block"
        >
          <GraduationCap size={56} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-24 right-[12%] text-amber-500/15 hidden sm:block"
        >
          <Star size={48} strokeWidth={1.2} />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header with Signature Curved Underline */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest shadow-2xs"
          >
            <Sparkles size={14} className="fill-primary/20 text-primary" />
            <span>Excellence & Trust • Rigorous Quality Standards</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative inline-block text-3xl sm:text-4xl lg:text-[44px] font-display font-black text-[#001F3F] tracking-tight leading-tight"
          >
            Why Choose Us?
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
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed pt-2 max-w-2xl mx-auto"
          >
            We ensure unparalleled tuition quality across Bangladesh through our strict 4-phase tutor vetting and background verification process.
          </motion.p>
        </div>

        {/* 4-Step Connected Selection Process */}
        <div className="relative">
          
          {/* Wave connecting line (Desktop only) */}
          <svg className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 hidden lg:block pointer-events-none z-0" viewBox="0 0 1200 100" fill="none">
            <path 
              d="M0 50 C 150 50, 150 10, 300 10 C 450 10, 450 90, 600 90 C 750 90, 750 10, 900 10 C 1050 10, 1050 50, 1200 50" 
              stroke="url(#gradient-path-why)" 
              strokeWidth="2.5" 
              strokeDasharray="8 8" 
            />
            <defs>
              <linearGradient id="gradient-path-why" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0D9488" stopOpacity="0" />
                <stop offset="0.2" stopColor="#0D9488" stopOpacity="0.8" />
                <stop offset="0.8" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="1" stopColor="#10B981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative z-10">
            {SELECTION_STEPS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.45 }}
                  whileHover={{ y: -8 }}
                  className="p-7 sm:p-8 rounded-[2.5rem] bg-white border border-slate-200/90 hover:border-primary/40 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col items-center text-center space-y-5 group relative overflow-hidden"
                >
                  {/* Step Top Badge */}
                  <div className="flex items-center justify-between w-full">
                    <span className="px-3 py-1 bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary rounded-full text-[11px] font-black text-slate-600 uppercase tracking-wider transition-colors">
                      {item.step}
                    </span>
                    <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", item.badgeBg)}>
                      {item.stat}
                    </span>
                  </div>

                  {/* Icon Container with Layered Circle */}
                  <div className="relative pt-2">
                    <div className="relative p-1 rounded-[2.2rem] bg-gradient-to-tr from-transparent via-slate-100 to-transparent group-hover:via-primary/20 transition-all duration-500">
                      <div className={cn("w-20 h-20 rounded-[1.9rem] flex items-center justify-center transition-all duration-500 group-hover:rotate-3 group-hover:scale-105 shadow-md border", item.color)}>
                        <Icon size={34} strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2.5 flex-1 flex flex-col justify-start">
                    <h3 className="text-lg sm:text-xl font-display font-black text-[#001F3F] group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                      {item.desc}
                    </p>
                  </div>

                  {/* Micro Trust Indicator at bottom */}
                  <div className="pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <BadgeCheck size={14} className="text-emerald-500" />
                    <span>Quality Verified</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

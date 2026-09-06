import { motion } from 'motion/react';
import {
  UserPlus,
  FileText,
  Users,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROADMAP_STEPS = [
  {
    step: '01',
    title: 'Create Profile',
    desc: 'Sign up as a student or parent in under 1 minute with basic contact info.',
    tag: '1 Min Setup',
    icon: UserPlus,
    iconBg: 'bg-teal-50 text-teal-600 border-teal-100',
  },
  {
    step: '02',
    title: 'Post Requirements',
    desc: 'Specify subject, class, location, days per week, and budget preferences.',
    tag: 'Free Submission',
    icon: FileText,
    iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    step: '03',
    title: 'Get Verified CVs',
    desc: 'Receive curated tutor profiles from top universities within 24 hours.',
    tag: 'Verified Match',
    icon: Users,
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    step: '04',
    title: 'Trial & Confirm',
    desc: 'Attend a free demo class, evaluate teaching style, and finalize tutor.',
    tag: 'Risk-Free Trial',
    icon: GraduationCap,
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
  },
];

export default function HowToConnectSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-white via-slate-50/60 to-white">
      {/* Ambient background glow & dot grid */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[22rem] bg-teal-300/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="text-center flex flex-col items-center justify-center space-y-3 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[11px] font-bold uppercase tracking-wider"
          >
            <Sparkles size={13} className="text-primary" />
            <span>How It Works</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="relative inline-block text-2xl sm:text-3xl lg:text-4xl font-display font-black text-[#001F3F] tracking-tight"
          >
            How to Connect?
            <svg
              className="absolute left-0 -bottom-2 w-full h-2.5 text-primary/60 pointer-events-none"
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
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-xs sm:text-sm text-slate-500 font-medium max-w-lg mx-auto pt-1"
          >
            Follow these 4 simple steps to find and appoint your perfect home or online tutor.
          </motion.p>
        </div>

        {/* Minimalist Connected Roadmap */}
        <div className="relative">
          {/* Desktop Horizontal Connecting Track */}
          <div className="hidden lg:block absolute top-7 left-[8%] right-[8%] h-[2px] bg-slate-200 z-0">
            <div className="h-full w-full bg-gradient-to-r from-teal-400 via-blue-400 via-indigo-400 to-amber-400 opacity-60 rounded-full" />
          </div>

          {/* Mobile Vertical Connecting Track */}
          <div className="block lg:hidden absolute top-6 bottom-6 left-6 w-[2px] bg-gradient-to-b from-teal-400 via-indigo-400 to-amber-400 opacity-50 z-0" />

          {/* 4 Compact Roadmap Steps Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
            {ROADMAP_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.35 }}
                  className="group relative flex flex-row lg:flex-col items-start gap-4 lg:gap-3"
                >
                  {/* Step Node Marker */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-200 shadow-xs group-hover:shadow-md group-hover:border-primary/40 transition-all duration-300 flex items-center justify-center relative z-10">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border ${item.iconBg} group-hover:scale-105 transition-transform duration-300`}>
                        <Icon size={18} strokeWidth={2.2} />
                      </div>
                    </div>
                    {/* Step Number Tag */}
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-[#001F3F] text-white text-[9px] font-black tracking-wider shadow-xs z-20">
                      {item.step}
                    </span>
                  </div>

                  {/* Minimalist Compact Card */}
                  <div className="flex-1 w-full bg-white/95 backdrop-blur-xs rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-2.5">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-display font-bold text-slate-800 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200/60 text-[10px] font-semibold text-slate-500">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <CheckCircle2 size={11} className="text-teal-500" /> Step {idx + 1}
                      </span>
                      <span className="text-[10px] text-primary font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center">
                        Proceed <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Minimalist Bottom Bar / Quick Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:py-3.5 sm:px-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 hidden sm:flex">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Need a tutor quickly?</p>
              <p className="text-[11px] text-slate-500">Get matched with top verified tutors within 24 hours.</p>
            </div>
          </div>

          <Link
            to="/request-tutor"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs tracking-wide transition-all shadow-sm hover:shadow-md cursor-pointer shrink-0"
          >
            <span>Request a Tutor</span>
            <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

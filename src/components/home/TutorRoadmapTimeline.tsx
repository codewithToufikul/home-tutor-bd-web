import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, ShieldCheck, Briefcase, GraduationCap, 
  ArrowRight, Sparkles, Clock, 
  Check, Zap, Coins,
  Search, Award
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const STEPS = [
  {
    step: '01',
    title: 'Create Your Free Profile',
    tagline: 'Quick 2-minute registration',
    description: 'Sign up with your mobile number, select your university, preferred teaching subjects, classes, and tutoring locations.',
    icon: UserPlus,
    accentColor: 'from-teal-500 to-emerald-600',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    features: ['Quick Mobile OTP verification', 'Select preferred locations & tuition types (Online / Home)', 'Choose subjects & mediums'],
    visualPreview: {
      value: '2 Mins Setup',
      icon: Clock,
      chip: 'Instant Activation',
    },
    cta: { text: 'Register as Tutor', link: '/register' },
  },
  {
    step: '02',
    title: 'Complete Profile (80%+)',
    tagline: 'Get Verified & Build Trust',
    description: 'Upload your student ID, certificates, and NID for verification. Verified tutors receive 5x more tuition calls from guardians.',
    icon: ShieldCheck,
    accentColor: 'from-blue-500 to-cyan-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    features: ['Upload university ID & academic credentials', 'Verified badge displayed on tutor card', 'Boosts profile ranking in search results'],
    visualPreview: {
      value: 'Verified Tutor Badge',
      icon: Award,
      chip: '5x More Hiring Rate',
    },
    cta: { text: 'Complete Profile', link: '/for-tutors' },
  },
  {
    step: '03',
    title: 'Apply for Desired Tuition Jobs',
    tagline: 'Daily 100+ Live Tuition Posts',
    description: 'Browse our live tuition job board filtered by district, salary, class, and subjects. Apply with 1-click directly.',
    icon: Briefcase,
    accentColor: 'from-indigo-500 to-purple-600',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    features: ['Live notifications for matching tuitions', 'Direct salary & schedule negotiation', 'Apply to unlimited job posts daily'],
    visualPreview: {
      value: '100+ Daily Live Jobs',
      icon: Search,
      chip: 'Area & Subject Filter',
    },
    cta: { text: 'Browse Job Board', link: '/jobs' },
  },
  {
    step: '04',
    title: 'Demo Class & Start Tutoring',
    tagline: 'Guaranteed Payouts & Success',
    description: 'Deliver an impressive demo class, finalize your schedule with parents, and start your successful teaching career with secure payments.',
    icon: GraduationCap,
    accentColor: 'from-amber-500 to-emerald-600',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    features: ['Professional demo class support', 'Guaranteed monthly tuition fees security', 'Build 5-star reputation with student reviews'],
    visualPreview: {
      value: '100% Secure Payout',
      icon: Coins,
      chip: '5-Star Reviews',
    },
    cta: { text: 'Start Teaching Now', link: '/register' },
  },
];

export default function TutorRoadmapTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-white via-[#F0FDF9]/50 to-white">
      {/* Background Vectors & Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/4 -left-20 w-[28rem] h-[28rem] bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-cyan-400/10 rounded-full blur-3xl" />
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating background Lucide vectors */}
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[5%] text-teal-600/15 hidden sm:block"
        >
          <GraduationCap size={56} />
        </motion.div>
        <motion.div
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-24 right-[6%] text-cyan-600/15 hidden sm:block"
        >
          <Award size={52} />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-16">
        
        {/* Section Header with Curved Underline */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest shadow-2xs"
          >
            <Zap size={14} className="fill-primary/20 text-primary" />
            <span>How It Works • 4-Step Roadmap</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative inline-block text-2xl sm:text-4xl lg:text-[44px] font-display font-black text-[#001F3F] tracking-tight leading-tight"
          >
            The ways Tutors can connect with us
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
            Join Bangladesh's most trusted tuition platform in 4 transparent, verified steps and connect with hundreds of prospective parents today.
          </motion.p>
        </div>

        {/* ROADMAP TIMELINE CONTAINER */}
        <div className="relative">
          
          {/* DESKTOP CENTRAL CONNECTING LINE (lg screen and above) */}
          <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-1.5 bg-gradient-to-b from-teal-400 via-cyan-500 to-emerald-500 rounded-full opacity-40 shadow-[0_0_14px_rgba(13,148,136,0.6)]" />

          {/* MOBILE / TABLET LEFT ROADMAP LINE (< lg screens) */}
          <div className="block lg:hidden absolute left-5 sm:left-7 top-6 bottom-8 w-1 bg-gradient-to-b from-teal-500 via-cyan-500 to-emerald-500 rounded-full opacity-40 shadow-[0_0_10px_rgba(13,148,136,0.4)]" />

          {/* TIMELINE STEPS */}
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {STEPS.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const Icon = item.icon;
              const PreviewIcon = item.visualPreview.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  onMouseEnter={() => setActiveStep(idx)}
                  className="relative"
                >
                  {/* Mobile & Tablet View (< lg screens) */}
                  <div className="block lg:hidden pl-12 sm:pl-16 relative">
                    
                    {/* Step Node Icon on Mobile Line */}
                    <div className="absolute left-1 sm:left-3 top-4 -translate-x-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border-2 border-primary shadow-lg flex items-center justify-center z-20">
                      <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white font-black text-xs bg-gradient-to-tr shadow-inner", item.accentColor)}>
                        {item.step}
                      </div>
                      {/* Pulse effect */}
                      <div className="absolute inset-0 rounded-2xl border border-primary/50 animate-ping opacity-30 pointer-events-none" />
                    </div>

                    {/* Step Card on Mobile (No top colored stripe) */}
                    <div className="p-5 sm:p-7 rounded-[2rem] bg-white border border-slate-200/90 shadow-xl space-y-4 relative overflow-hidden">
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr shadow-md shadow-teal-500/20", item.accentColor)}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-wider block">
                              Phase {item.step}
                            </span>
                            <h3 className="text-base sm:text-lg font-display font-black text-[#001F3F]">
                              {item.title}
                            </h3>
                          </div>
                        </div>

                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0", item.badgeColor)}>
                          {item.visualPreview.chip}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {item.description}
                      </p>

                      {/* Feature Bullet List */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        {item.features.map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-[11px] text-slate-700 font-medium">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={9} strokeWidth={3} />
                            </div>
                            <span className="leading-tight">{feat}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Action Row */}
                      <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                        <Link
                          to={item.cta.link}
                          className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary hover:text-primary-dark"
                        >
                          <span>{item.cta.text}</span>
                          <ArrowRight size={13} />
                        </Link>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-xl border border-slate-200/70 text-[10px] font-bold text-slate-600">
                          <PreviewIcon size={12} className="text-primary" />
                          <span>{item.visualPreview.value}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop View (lg screens and above - Zig Zag) */}
                  <div
                    className={cn(
                      "hidden lg:flex items-center gap-12",
                      isEven ? "flex-row" : "flex-row-reverse"
                    )}
                  >
                    {/* Left or Right Step Card (No top colored stripe) */}
                    <div className="w-1/2">
                      <div
                        className={cn(
                          "p-8 rounded-[2.5rem] bg-white border border-slate-200/90 hover:border-primary/50 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-6 group relative overflow-hidden",
                          activeStep === idx && "ring-2 ring-primary/20 shadow-primary/10"
                        )}
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-tr shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform", item.accentColor)}>
                              <Icon size={24} />
                            </div>
                            <div>
                              <span className="text-[11px] font-black text-primary uppercase tracking-wider block">
                                Step {item.step}
                              </span>
                              <span className="text-xs font-bold text-slate-400">
                                {item.tagline}
                              </span>
                            </div>
                          </div>

                          <span className={cn("px-3 py-1 rounded-full text-[11px] font-bold border", item.badgeColor)}>
                            {item.visualPreview.chip}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2">
                          <h3 className="text-2xl font-display font-black text-[#001F3F] group-hover:text-primary transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Feature Checklist */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {item.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                              <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <Check size={11} strokeWidth={3} />
                              </div>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>

                        {/* Card Footer CTA */}
                        <div className="pt-2 flex items-center justify-between">
                          <Link
                            to={item.cta.link}
                            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:text-primary-dark group/link"
                          >
                            <span>{item.cta.text}</span>
                            <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                          </Link>

                          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] font-bold text-slate-600">
                            <PreviewIcon size={13} className="text-primary" />
                            <span>{item.visualPreview.value}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Central Node Pill Badge (Desktop center anchor) */}
                    <div className="shrink-0 w-16 h-16 rounded-3xl bg-white border-4 border-primary/20 shadow-xl flex items-center justify-center relative z-20 group hover:scale-110 transition-transform">
                      <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-sm bg-gradient-to-tr shadow-inner", item.accentColor)}>
                        {item.step}
                      </div>
                      <div className="absolute inset-0 rounded-3xl border-2 border-primary/40 animate-ping pointer-events-none opacity-40" />
                    </div>

                    {/* Opposite Side Visual Illustrative Card (Desktop 5 cols) */}
                    <div className="w-1/2 flex items-center justify-center">
                      <div className="w-full max-w-md p-6 rounded-[2rem] bg-gradient-to-br from-slate-50/90 via-white to-teal-50/30 border border-slate-200/80 shadow-md space-y-4 hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                          <span className="flex items-center gap-1.5 text-slate-600 font-bold">
                            <Sparkles size={14} className="text-amber-500" />
                            <span>Roadmap Highlight</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                            Phase {idx + 1}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-black text-xs">
                                {item.step}
                              </div>
                              <span className="text-xs font-black text-ink">{item.title}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                            {item.tagline} • Designed for optimal student-tutor match.
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                          <span className="text-[11px] font-bold text-slate-400">Estimated Duration:</span>
                          <span className="font-bold text-ink">{idx === 0 ? '2 Mins' : idx === 1 ? '1 Hour' : idx === 2 ? 'Instant' : '24-48 Hours'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Quick Action Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 bg-gradient-to-r from-teal-900 via-primary to-emerald-900 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10 max-w-xl">
            <span className="px-3 py-0.5 sm:py-1 rounded-full bg-white/15 text-emerald-300 text-[11px] sm:text-xs font-black uppercase tracking-wider backdrop-blur-md inline-block">
              Over 10,000+ Active Tutors
            </span>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-black tracking-tight leading-tight">
              Ready to Start Your Tutoring Journey?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
              Create your profile today and get discovered by thousands of guardians looking for expert tutors across Bangladesh.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 shrink-0 w-full md:w-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-[#001F3F] hover:bg-emerald-50 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition-all text-center active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserPlus size={16} className="text-primary" />
              <span>Register as Tutor</span>
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-wider backdrop-blur-md transition-all text-center active:scale-95 flex items-center justify-center gap-2"
            >
              <Search size={15} />
              <span>Browse Tuition Jobs</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Quote, ChevronLeft, ChevronRight, 
  CheckCircle2, Sparkles, MessageCircle, Heart,
  ShieldCheck, GraduationCap, BookOpen
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sumiya Akter",
    role: "HSC 2026 Examinee",
    institution: "Viqarunnisa Noon School & College",
    subject: "Physics & Higher Math",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Cleared all my Physics concepts within a month!",
    content: "The physics tutor I found here helped me clear all my basic concepts. I went from struggling with calculus equations to genuinely loving the subject. My marks in college term exams jumped from 62 to 91! Highly recommended for serious students.",
    verifiedBadge: "Verified Student",
    gradeScore: "Score: 91/100",
  },
  {
    id: 2,
    name: "Engr. Rahat Ahmed",
    role: "Parent of Class 9 Student",
    institution: "St. Joseph Higher Secondary School",
    subject: "Science & English",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Seamless matching & exceptional BUET tutor",
    content: "Finding a punctual, morally upright and top-tier tutor in Dhanmondi was always stressful. Home Tutor BD matched us with a BUET CSE tutor in less than 24 hours. The demo class was superb and my son's study discipline has improved drastically.",
    verifiedBadge: "Verified Guardian",
    gradeScore: "Parent Review",
  },
  {
    id: 3,
    name: "Kamrul Hassan",
    role: "Parent of O-Level Candidate",
    institution: "Scholastica, Uttara",
    subject: "Chemistry & Pure Math",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Reliable background verification gave us total peace of mind",
    content: "The security and background check standards here are unmatched. Our Chemistry tutor from Dhaka University is patient, punctual, and knows the Cambridge syllabus inside out. We are completely satisfied with the service.",
    verifiedBadge: "Verified Guardian",
    gradeScore: "A* Target Achieved",
  },
  {
    id: 4,
    name: "Nabila Islam",
    role: "Class 8 Student",
    institution: "Rajuk Uttara Model College",
    subject: "General Math & ICT",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    rating: 5,
    title: "Math is now my favorite subject!",
    content: "I used to be terrified of algebraic formulas and geometry proofs. My tutor teaches with real-world examples and friendly interactive problem solving. My recent class test result was the highest in our section!",
    verifiedBadge: "Verified Student",
    gradeScore: "1st in Class Test",
  },
];

const TRUST_STATS = [
  { value: "4.9 / 5.0", label: "Average Rating", icon: Star, color: "text-amber-500" },
  { value: "98.6%", label: "Parent Satisfaction", icon: Heart, color: "text-rose-500" },
  { value: "15,000+", label: "Successful Tuitions", icon: GraduationCap, color: "text-teal-600" },
  { value: "100%", label: "Verified Tutors", icon: ShieldCheck, color: "text-emerald-600" },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const current = TESTIMONIALS[currentIndex];

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white via-[#F0FDF9]/50 to-white">
      {/* Background Glow & Floating Vectors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/4 -left-20 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[32rem] h-[32rem] bg-cyan-400/10 rounded-full blur-3xl" />
        
        {/* Dot Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[6%] text-teal-600/15 hidden sm:block"
        >
          <Quote size={60} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 18, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-24 right-[7%] text-cyan-600/15 hidden sm:block"
        >
          <MessageCircle size={54} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -14, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/2 right-[5%] text-amber-500/15 hidden sm:block"
        >
          <Star size={50} strokeWidth={1.2} />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14 sm:space-y-16">
        
        {/* Section Header with Curved Underline */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest shadow-2xs"
          >
            <Sparkles size={14} className="fill-primary/20 text-primary" />
            <span>Real Feedback • Verified Guardians & Students</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative inline-block text-3xl sm:text-4xl lg:text-[44px] font-display font-black text-[#001F3F] tracking-tight leading-tight"
          >
            What People Say
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
            Hear from parents and students across Bangladesh whose academic results and confidence transformed with our verified tutors.
          </motion.p>
        </div>

        {/* Main Testimonial Showcase Card (No top colored stripe/border) */}
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="p-8 sm:p-12 lg:p-14 rounded-[3rem] bg-white border border-slate-200 shadow-2xl shadow-primary/10 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8 lg:gap-12 group"
              >
                {/* Large Decorative Watermark Quote Icon */}
                <div className="absolute -bottom-6 right-6 text-slate-100 pointer-events-none select-none">
                  <Quote size={160} strokeWidth={1} />
                </div>

                {/* Left Column: Avatar & Trust Badges */}
                <div className="flex flex-col items-center text-center shrink-0 space-y-4 relative z-10">
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] p-1 bg-gradient-to-tr from-primary via-cyan-400 to-emerald-400 shadow-xl">
                      <img
                        src={current.avatar}
                        alt={current.name}
                        className="w-full h-full object-cover rounded-[2.2rem] bg-slate-100"
                      />
                    </div>

                    {/* Star Badge on Avatar */}
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-amber-500 to-amber-400 text-white p-2.5 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center">
                      <Star size={18} className="fill-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-bold border border-emerald-200/70">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>{current.verifiedBadge}</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 block">
                      {current.gradeScore}
                    </span>
                  </div>
                </div>

                {/* Right Column: Quote, Content & Author Meta */}
                <div className="flex-1 space-y-5 text-center lg:text-left relative z-10">
                  
                  {/* Star Rating & Subject Pill */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-between gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(current.rating)].map((_, i) => (
                        <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                      ))}
                      <span className="text-xs font-black text-ink ml-1.5">5.0 / 5.0</span>
                    </div>

                    <span className="px-3.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen size={13} />
                      <span>{current.subject}</span>
                    </span>
                  </div>

                  {/* Highlighted Quote Title */}
                  <h3 className="text-xl sm:text-2xl font-display font-black text-[#001F3F] leading-snug">
                    "{current.title}"
                  </h3>

                  {/* Main Testimonial Body */}
                  <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed italic">
                    "{current.content}"
                  </p>

                  {/* Author Information */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="text-center lg:text-left">
                      <h4 className="text-base sm:text-lg font-display font-black text-ink">
                        {current.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {current.role} • <span className="text-primary font-bold">{current.institution}</span>
                      </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2 pt-2 sm:pt-0">
                      <button
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                        aria-label="Previous Testimonial"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-primary hover:text-white text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                        aria-label="Next Testimonial"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center justify-center gap-2.5 mt-8">
            {TESTIMONIALS.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(i);
                }}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                  currentIndex === i
                    ? "w-10 bg-primary shadow-md shadow-primary/30"
                    : "w-2.5 bg-slate-200 hover:bg-slate-300"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust & Satisfaction Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-4">
          {TRUST_STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 sm:p-6 rounded-[2rem] bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex items-center gap-4 text-left"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-200/60 shrink-0", stat.color)}>
                  <Icon size={22} />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-display font-black text-[#001F3F] leading-tight">
                    {stat.value}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

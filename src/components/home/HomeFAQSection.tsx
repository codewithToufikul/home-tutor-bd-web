import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const FAQS = [
  {
    q: "How do I request a tutor?",
    a: "You can request a tutor by submitting our simple requirement form. Specify your class, subject, location, days per week, and budget. Our academic coordinators will match and provide you with top shortlisted profiles within 24 hours.",
    category: "Matching"
  },
  {
    q: "Is there any registration fee for parents or students?",
    a: "No, there is absolutely zero registration or platform fee for students and parents. Our tutor search and matchmaking service is completely free. You only pay the tutor their agreed monthly salary.",
    category: "Cost & Fees"
  },
  {
    q: "How do you verify the tutors?",
    a: "Every tutor undergoes strict verification. We verify their National ID (NID), university student ID card, academic marksheets, and background history before approving their profile.",
    category: "Safety"
  },
  {
    q: "What happens if I'm not satisfied with the tutor?",
    a: "We provide a 2-day trial class session. If you feel the tutor's teaching style does not match your expectations, we will provide an instant replacement at no additional charge.",
    category: "Guarantee"
  },
  {
    q: "How is the tutor's salary determined?",
    a: "The salary is based on the student's grade/curriculum (Bangla Medium, English Medium, English Version), number of weekly sessions, location, and the tutor's qualification and experience.",
    category: "Pricing"
  }
];

export default function HomeFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white border-t border-slate-100">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: FAQ Header & Accordion (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header */}
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider shadow-2xs"
              >
                <HelpCircle size={14} className="text-primary" />
                <span>Got Questions? • Quick Answers</span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="relative inline-block text-3xl sm:text-4xl lg:text-[44px] font-display font-black text-[#001F3F] tracking-tight leading-tight"
              >
                Frequently Asked <span className="text-primary">Questions</span>
                <svg
                  className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 text-primary/70 pointer-events-none"
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
                className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-xl pt-1"
              >
                Everything you need to know about our tutoring platform, verification standards, trial sessions, and matching process.
              </motion.p>
            </div>

            {/* Accordion List */}
            <div className="space-y-3 pt-2">
              {FAQS.map((faq, idx) => {
                const isOpen = openIndex === idx;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.06 }}
                    className={cn(
                      "rounded-2xl border transition-all duration-300 overflow-hidden",
                      isOpen
                        ? "bg-white border-primary/40 shadow-md ring-1 ring-primary/10"
                        : "bg-white/90 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFAQ(idx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                          isOpen ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                        )}>
                          0{idx + 1}
                        </span>
                        <span className={cn(
                          "text-xs sm:text-sm font-display font-bold transition-colors",
                          isOpen ? "text-[#001F3F]" : "text-slate-700 hover:text-slate-900"
                        )}>
                          {faq.q}
                        </span>
                      </div>

                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300",
                        isOpen ? "bg-primary/10 text-primary rotate-180" : "bg-slate-100 text-slate-400"
                      )}>
                        <ChevronDown size={16} />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100">
                            <p className="pt-2">{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Contact Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-500"
            >
              <span className="font-semibold text-slate-700">Still have questions?</span>
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
              >
                <span>Contact our support team</span>
                <ArrowRight size={12} />
              </Link>
            </motion.div>

          </div>

          {/* RIGHT COLUMN: Illustration & Trust Elements (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Ambient Background Circle */}
            <div className="absolute w-[85%] aspect-square rounded-full bg-gradient-to-tr from-teal-400/15 via-cyan-300/10 to-transparent blur-2xl pointer-events-none -z-0" />

            {/* Illustration Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-[420px] rounded-3xl bg-white/80 backdrop-blur-md p-4 sm:p-6 border border-slate-200/80 shadow-xl overflow-hidden group"
            >
              {/* Illustration Image */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src="/faq_illustration.jpg"
                  alt="Frequently Asked Questions Illustration"
                  className="w-full h-auto object-contain max-h-[380px] group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Floating Trust Badge Top Right */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-6 right-6 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-none">100% Free</p>
                  <p className="text-[9px] text-slate-500 leading-tight">For Students & Parents</p>
                </div>
              </motion.div>

              {/* Floating Trust Badge Bottom Left */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute bottom-6 left-6 px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Clock size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-800 leading-none">24h Fast Match</p>
                  <p className="text-[9px] text-slate-500 leading-tight">Verified University Tutors</p>
                </div>
              </motion.div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}

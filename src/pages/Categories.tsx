import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ChevronRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Layers,
  CheckCircle2,
  Users,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { CATEGORIES_DATA } from '@/src/constants';
import { Link } from 'react-router-dom';

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Total subjects calculation
  const totalSubjectsCount = useMemo(() => {
    return CATEGORIES_DATA.reduce((acc, cat) => acc + cat.items.length, 0);
  }, []);

  // Filter categories by query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (activeCategory) {
        return CATEGORIES_DATA.filter(cat => cat.id === activeCategory);
      }
      return CATEGORIES_DATA;
    }

    return CATEGORIES_DATA.map(cat => {
      const matchesCategoryTitle = cat.title.toLowerCase().includes(q);
      const matchingItems = cat.items.filter(item =>
        item.toLowerCase().includes(q)
      );

      if (matchesCategoryTitle) {
        return cat;
      }

      if (matchingItems.length > 0) {
        return {
          ...cat,
          items: matchingItems
        };
      }

      return null;
    }).filter((cat): cat is typeof CATEGORIES_DATA[0] => cat !== null && (!activeCategory || cat.id === activeCategory));
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">

      {/* ── HERO SECTION ── */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#F0FDF9]/90 via-[#F8FAFC] to-slate-50/60 border-b border-slate-200/80">
        {/* Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none select-none z-0">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[48rem] h-[24rem] bg-teal-300/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider shadow-2xs mx-auto"
          >
            <Sparkles size={14} className="text-primary" />
            <span>Curriculum & Subject Directory • {CATEGORIES_DATA.length} Categories • {totalSubjectsCount}+ Subjects</span>
          </motion.div>

          {/* Heading with Curved SVG Underline */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="relative inline-block text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#001F3F] tracking-tight leading-tight"
            >
              Explore <span className="text-primary">Categories & Subjects</span>
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
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto pt-1"
            >
              Find verified home and online tutors across English Medium, Bangla Medium, Admission Prep, Language Training, and Professional Skills.
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative group bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-900/5 hover:border-primary/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all p-1.5 flex items-center">
              <div className="pl-3.5 pr-2 text-slate-400 group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search subjects, classes (e.g. O Level, Class 9, IELTS, Python, BCS)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 px-2 bg-transparent text-sm sm:text-base text-[#001F3F] placeholder:text-slate-400 outline-none font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors mr-1 cursor-pointer"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
              <Link
                to="/request-tutor"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shrink-0 shadow-sm"
              >
                <span>Request Tutor</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── STICKY CATEGORY FILTER PILLS ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs py-3">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">

            {/* "All" button */}
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer",
                activeCategory === null
                  ? "bg-[#001F3F] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
              )}
            >
              <Layers size={13} />
              <span>All Categories</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-md text-[10px] font-black",
                activeCategory === null ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              )}>
                {CATEGORIES_DATA.length}
              </span>
            </button>

            {/* Category Pills */}
            {CATEGORIES_DATA.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(isSelected ? null : cat.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer group",
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white text-slate-600 hover:text-primary hover:border-primary/30 border border-slate-200/80"
                  )}
                >
                  <Icon size={13} className={cn("transition-transform group-hover:scale-110", isSelected ? "text-white" : "text-primary")} />
                  <span>{cat.title}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-md text-[10px] font-black",
                    isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary"
                  )}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 space-y-10 sm:space-y-12">

        {/* Results count header if searching */}
        {searchQuery && (
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Showing matching subjects for: <strong className="text-primary font-bold">"{searchQuery}"</strong>
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Categories Sections Grid */}
        <div className="space-y-8 sm:space-y-10">
          {filteredCategories.map((category, catIdx) => {
            const Icon = category.icon;

            return (
              <motion.section
                key={category.id}
                id={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * (catIdx % 4), duration: 0.35 }}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-7 space-y-5"
              >
                {/* Category Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-display font-black text-[#001F3F] tracking-tight">
                        {category.title}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">
                        {category.items.length} Subjects & Class Modules Available
                      </p>
                    </div>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      to={`/jobs?category=${encodeURIComponent(category.title)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-700 text-xs font-bold transition-colors"
                    >
                      <Briefcase size={13} className="text-slate-400" />
                      <span>View Jobs</span>
                    </Link>

                    <Link
                      to={`/tutors?category=${encodeURIComponent(category.title)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Users size={13} />
                      <span>Find Tutors</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>

                {/* Subject Badges / Micro Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                  {category.items.map((subject, itemIdx) => (
                    <Link
                      key={subject}
                      to={`/jobs?category=${encodeURIComponent(category.title)}&search=${encodeURIComponent(subject)}`}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white border border-slate-200/70 hover:border-primary/40 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:bg-primary group-hover:scale-125 transition-all shrink-0" />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors truncate">
                          {subject}
                        </span>
                      </div>
                      <ChevronRight size={13} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>

                {/* Category Bottom Prompt */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/70 px-4 py-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-teal-600 shrink-0" />
                    <span>Need a dedicated tutor for <strong>{category.title}</strong>?</span>
                  </div>
                  <Link
                    to="/request-tutor"
                    className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>Post a Free Request</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
              <Search size={30} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-display font-bold text-[#001F3F]">
                No matching subjects found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn't find any subjects matching "<span className="font-semibold text-slate-700">{searchQuery}</span>". Try searching for classes, mediums, or skills.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                }}
                className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer"
              >
                Clear Search & Show All
              </button>
            </div>
          </motion.div>
        )}

        {/* ── BOTTOM CALL TO ACTION BANNER ── */}
        <div className="rounded-3xl bg-gradient-to-r from-[#001F3F] via-[#0A2E5C] to-[#001F3F] p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              Can't find your exact subject or curriculum?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Tell us your custom learning needs. Our academic team matches you with specialized teachers within 24 hours.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative z-10 w-full sm:w-auto justify-center">
            <Link
              to="/request-tutor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>Request a Tutor Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

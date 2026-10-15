import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Users,
  Briefcase,
  X,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { CATEGORIES_DATA } from '@/src/constants';
import { Link } from 'react-router-dom';

const CARD_GRADIENTS = [
  'from-blue-600 to-cyan-500',
  'from-pink-500 to-rose-500',
  'from-emerald-600 to-teal-500',
  'from-red-500 to-orange-500',
  'from-violet-600 to-purple-500',
  'from-indigo-600 to-blue-500',
  'from-cyan-600 to-sky-500',
  'from-orange-500 to-amber-500',
  'from-teal-600 to-green-500',
  'from-green-600 to-emerald-500',
  'from-slate-700 to-slate-500',
  'from-yellow-500 to-amber-400',
  'from-zinc-700 to-slate-600',
  'from-purple-600 to-violet-500',
];

const CARD_LIGHT_BG = [
  'bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100',
  'bg-pink-50 border-pink-100 text-pink-700 hover:bg-pink-100',
  'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100',
  'bg-red-50 border-red-100 text-red-700 hover:bg-red-100',
  'bg-violet-50 border-violet-100 text-violet-700 hover:bg-violet-100',
  'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100',
  'bg-cyan-50 border-cyan-100 text-cyan-700 hover:bg-cyan-100',
  'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100',
  'bg-teal-50 border-teal-100 text-teal-700 hover:bg-teal-100',
  'bg-green-50 border-green-100 text-green-700 hover:bg-green-100',
  'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200',
  'bg-yellow-50 border-yellow-100 text-yellow-700 hover:bg-yellow-100',
  'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200',
  'bg-purple-50 border-purple-100 text-purple-700 hover:bg-purple-100',
];

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const totalSubjectsCount = useMemo(() => {
    return CATEGORIES_DATA.reduce((acc, cat) => acc + cat.items.length, 0);
  }, []);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (activeCategory) return CATEGORIES_DATA.filter(cat => cat.id === activeCategory);
      return CATEGORIES_DATA;
    }
    return CATEGORIES_DATA.map(cat => {
      const matchesCategoryTitle = cat.title.toLowerCase().includes(q);
      const matchingItems = cat.items.filter((item: string) => item.toLowerCase().includes(q));
      if (matchesCategoryTitle) return cat;
      if (matchingItems.length > 0) return { ...cat, items: matchingItems };
      return null;
    }).filter((cat): cat is typeof CATEGORIES_DATA[0] =>
      cat !== null && (!activeCategory || cat.id === activeCategory)
    );
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* HERO */}
      <section className="relative pt-10 pb-14 overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#0A2E5C] to-[#0D3B72]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60rem] h-48 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider"
          >
            <Sparkles size={13} className="text-teal-300" />
            {CATEGORIES_DATA.length} Categories • {totalSubjectsCount}+ Subjects
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight"
          >
            কোন বিষয়ে <span className="text-teal-300">টিউটর</span> দরকার?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }}
            className="text-sm text-slate-300 max-w-xl mx-auto"
          >
            নিচ থেকে আপনার পছন্দের ক্যাটাগরি বা বিষয় খুঁজুন এবং সেরা টিউটর খুঁজে নিন।
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
              <Search size={18} className="absolute left-4 text-slate-400" />
              <input
                type="text"
                placeholder="যেমন: Class 9, IELTS, Guitar, BCS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="p-2 mr-2 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer">
                  <X size={15} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* STICKY PILLS */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            <button
              type="button" onClick={() => setActiveCategory(null)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer border",
                activeCategory === null ? "bg-[#001F3F] text-white border-[#001F3F] shadow" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              <BookOpen size={12} />
              সব ক্যাটাগরি
              <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-black", activeCategory === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>
                {CATEGORIES_DATA.length}
              </span>
            </button>

            {CATEGORIES_DATA.map((cat, idx) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id} type="button"
                  onClick={() => setActiveCategory(isSelected ? null : cat.id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 cursor-pointer border",
                    isSelected
                      ? `bg-gradient-to-r ${CARD_GRADIENTS[idx % CARD_GRADIENTS.length]} text-white border-transparent shadow`
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  )}
                >
                  <Icon size={12} />
                  {cat.title.length > 22 ? cat.title.slice(0, 22) + '…' : cat.title}
                  <span className={cn("px-1.5 py-0.5 rounded-md text-[10px] font-black", isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500")}>
                    {cat.items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {searchQuery && (
          <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-600 font-medium">
              "<strong className="text-primary">{searchQuery}</strong>" এর রেজাল্ট দেখাচ্ছে
            </p>
            <button onClick={() => setSearchQuery('')} className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer">Clear</button>
          </div>
        )}

        {filteredCategories.map((category, catIdx) => {
          const Icon = category.icon;
          const gradient = CARD_GRADIENTS[catIdx % CARD_GRADIENTS.length];
          const subjectBg = CARD_LIGHT_BG[catIdx % CARD_LIGHT_BG.length];

          return (
            <motion.section
              key={category.id} id={category.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.04 * (catIdx % 5), duration: 0.35 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Gradient Header */}
              <div className={cn("relative bg-gradient-to-r p-6 sm:p-8 text-white overflow-hidden", gradient)}>
                {category.image && (
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${category.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg shrink-0">
                      <Icon size={28} strokeWidth={2} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{category.title}</h2>
                      <p className="text-sm text-white/75 font-medium mt-0.5">{category.items.length}টি বিষয় পাওয়া যাচ্ছে</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Link
                      to={`/jobs?category=${encodeURIComponent(category.title)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold transition-all"
                    >
                      <Briefcase size={13} /> টিউশন খালি আছে
                    </Link>
                    <Link
                      to={`/tutors?category=${encodeURIComponent(category.title)}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-800 text-xs font-black transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Users size={13} /> টিউটর খুঁজুন <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Subject Grid */}
              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">
                  📚 যে বিষয়গুলো শেখানো হয়
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
                  {category.items.map((subject: string) => (
                    <Link
                      key={subject}
                      to={`/jobs?category=${encodeURIComponent(category.title)}&search=${encodeURIComponent(subject)}`}
                      className={cn(
                        "group flex items-center justify-between px-3.5 py-3 rounded-2xl border font-bold text-sm transition-all duration-150 active:scale-95 shadow-xs hover:shadow-md cursor-pointer",
                        subjectBg
                      )}
                    >
                      <span className="truncate pr-1">{subject}</span>
                      <ArrowRight size={13} className="shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-xs text-slate-500">
                  <span className="font-medium"><strong className="text-slate-700">{category.title}</strong> এর জন্য টিউটর দরকার?</span>
                  <Link to="/request-tutor" className="font-black text-primary hover:text-primary-dark inline-flex items-center gap-1 whitespace-nowrap">
                    বিনামূল্যে রিকোয়েস্ট করুন <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.section>
          );
        })}

        {filteredCategories.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto"
          >
            <div className="text-5xl">🔍</div>
            <h3 className="text-lg font-black text-slate-800">কোনো বিষয় পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">"{searchQuery}" নামে কিছু নেই। অন্য কিছু খুঁজুন।</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory(null); }}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all cursor-pointer"
            >
              সব দেখুন
            </button>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-[#001F3F] via-[#0A2E5C] to-[#001F3F] p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 text-center md:text-left relative z-10">
            <h3 className="text-xl sm:text-2xl font-black text-white">আপনার বিষয় তালিকায় নেই?</h3>
            <p className="text-sm text-slate-300">কাস্টম রিকোয়েস্ট করুন — ২৪ ঘণ্টার মধ্যে বিশেষজ্ঞ টিউটর পেয়ে যাবেন।</p>
          </div>
          <Link
            to="/request-tutor"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-dark text-white font-black text-sm transition-all shadow-lg active:scale-95 shrink-0"
          >
            টিউটর রিকোয়েস্ট করুন <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}

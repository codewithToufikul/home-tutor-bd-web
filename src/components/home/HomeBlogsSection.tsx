import { motion } from 'motion/react';
import {
  ArrowRight, BookOpen, Clock, Calendar,
  ChevronRight, Eye, Layers, Newspaper, GraduationCap,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetBlogsQuery } from '@/src/services/adminApi';

export default function HomeBlogsSection() {
  const { data: blogsResponse, isLoading } = useGetBlogsQuery({ limit: 4 });

  const blogs = (blogsResponse as any)?.data?.blogs || (blogsResponse as any)?.blogs || (blogsResponse as any)?.data || [];

  if (!isLoading && blogs.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-b from-white via-[#F0FDF9]/50 to-white">
      {/* 🔮 Animated Floating Vectors & Ambient Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/4 -left-20 w-[28rem] h-[28rem] bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[30rem] h-[30rem] bg-cyan-400/10 rounded-full blur-3xl" />
        
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(#0D9488 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Floating background Lucide vectors */}
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-[6%] text-teal-600/15 hidden sm:block"
        >
          <BookOpen size={54} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 16, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-32 right-[7%] text-cyan-600/15 hidden sm:block"
        >
          <Newspaper size={50} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, -16, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-24 left-[9%] text-emerald-600/15 hidden sm:block"
        >
          <GraduationCap size={52} strokeWidth={1.2} />
        </motion.div>

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          className="absolute bottom-20 right-[10%] text-amber-500/15 hidden sm:block"
        >
          <Sparkles size={46} strokeWidth={1.2} />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12 sm:space-y-14">
        {/* 🌟 Section Header with Shortened Title & Curved Underline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-black uppercase tracking-widest shadow-2xs"
          >
            <BookOpen size={14} className="fill-primary/20 text-primary" />
            <span>Education Blog & Career Guides</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative inline-block text-3xl sm:text-4xl lg:text-[44px] font-display font-black text-[#001F3F] tracking-tight leading-tight"
          >
            Latest Educational Articles
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
            Expert tips on exam preparation, study techniques, and academic success.
          </motion.p>
        </div>

        {/* 4 Blogs Responsive Grid (Preserved Article Card Design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-ink/5 space-y-4 animate-pulse">
                <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-full bg-slate-200 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            ))
          ) : (
            blogs.slice(0, 4).map((blog: any, index: number) => {
              const targetUrl = `/blog/${blog.slug || blog._id || blog.id}`;
              return (
                <motion.article
                  key={blog._id || blog.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="bg-white rounded-[28px] border border-ink/5 hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                >
                  <div className="space-y-3.5">
                    {/* Cover Image */}
                    <Link to={targetUrl} className="block relative h-44 overflow-hidden m-2.5 rounded-[20px] bg-slate-100">
                      <img
                        src={blog.coverImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-ink text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {blog.category || 'Tuition Tips'}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                          <Clock size={10} /> {blog.readTimeMinutes || 4} min
                        </span>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="px-5 pb-1 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-ink-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-primary" />
                          {blog.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString('bn-BD', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                            : 'সম্প্রতি'}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[110px]">{blog.authorName || 'Editorial Team'}</span>
                      </div>

                      <h3 className="text-base font-display font-black text-ink group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        <Link to={targetUrl}>
                          {blog.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-ink-muted leading-relaxed font-medium line-clamp-2">
                        {blog.excerpt || blog.content?.slice(0, 100) + '...'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 mt-3 border-t border-ink/5 flex items-center justify-between bg-slate-50/40">
                    <Link
                      to={targetUrl}
                      className="text-[11px] font-black text-primary flex items-center gap-1 group-hover:gap-1.5 transition-all"
                    >
                      Read <ChevronRight size={13} />
                    </Link>

                    <span className="text-[10px] font-semibold text-ink-muted/70 flex items-center gap-1">
                      <Eye size={11} /> {blog.views || 0}
                    </span>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>

        {/* View More Button */}
        <div className="flex justify-center pt-2">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#001F3F] hover:bg-primary text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-xl shadow-[#001F3F]/15 hover:shadow-primary/25 hover:-translate-y-0.5 group cursor-pointer"
          >
            <Layers size={16} className="text-primary-300 group-hover:text-white transition-colors" />
            <span>Read All Blogs</span>
            <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

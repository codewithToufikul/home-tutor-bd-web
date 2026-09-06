import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, BookOpen, Clock, Calendar, 
  ArrowRight, Eye, Sparkles, Filter, X,
  TrendingUp, Award, ChevronRight, User
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGetBlogsQuery } from '@/src/services/adminApi';
import { cn } from '@/src/lib/utils';

const BLOG_CATEGORIES = [
  'All',
  'Study Hacks & Tips',
  'Admission Guidance',
  'Parenting & Education',
  'Tutor Success Stories',
  'Career & Skills',
  'Exam Preparation',
  'Notice & Updates'
];

export default function Blogs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: blogsResponse, isLoading } = useGetBlogsQuery({
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    search: searchQuery.trim() || undefined,
    page: currentPage,
    limit: 12
  });

  const blogs = (blogsResponse as any)?.data?.blogs || (blogsResponse as any)?.blogs || (blogsResponse as any)?.data || [];
  const pagination = (blogsResponse as any)?.data?.pagination || { total: blogs.length, pages: 1 };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchQuery.trim()) {
      searchParams.set('search', searchQuery.trim());
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const featuredBlog = blogs[0];
  const gridBlogs = blogs.slice(1);

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-ink pb-24">
      {/* Editorial Header Section */}
      <section className="relative pt-16 pb-14 border-b border-ink/5 bg-gradient-to-b from-slate-50/80 via-white to-white overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              <BookOpen size={14} />
              <span>Knowledge Hub & Insights</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-ink tracking-tight leading-[1.15]">
              শিক্ষা, গাইডলাইন ও ক্যারিয়ারের সম্পূর্ণ ব্লগ
            </h1>
            <p className="text-base sm:text-lg text-ink-muted leading-relaxed font-medium">
              অভিজ্ঞ শিক্ষক ও বিশেষজ্ঞদের প্রস্তুতকৃত টিউটরিং টিপস, ভর্তি পরীক্ষার গাইডলাইন এবং শিক্ষার্থীদের সফল হওয়ার সহজ কৌশল জানুন।
            </p>
          </div>

          {/* Search Bar & Filters */}
          <div className="flex flex-col md:flex-row items-center gap-4 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ব্লগ বা বিষয় লিখে সার্চ করুন..."
                className="w-full pl-12 pr-10 py-4 bg-white rounded-2xl border border-ink/10 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm font-medium shadow-sm transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchParams.delete('search');
                    setSearchParams(searchParams);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </form>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white border border-ink/10 hover:border-primary/40 text-slate-700 hover:text-primary"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="w-full h-96 bg-slate-200 rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-ink/5 space-y-4">
                  <div className="w-full h-48 bg-slate-200 rounded-2xl" />
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-6 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-3/4 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-ink/10 p-8 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-ink-muted flex items-center justify-center mx-auto">
              <BookOpen size={30} />
            </div>
            <h3 className="text-xl font-display font-bold text-ink">কোনো আর্টিকেল পাওয়া যায়নি</h3>
            <p className="text-xs text-ink-muted">
              অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা ফিল্টার রিসেট করুন।
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSearchParams({});
              }}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-primary/90 transition-all"
            >
              সকল ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <>
            {/* Featured Hero Article (Shows on page 1 with no deep filter) */}
            {featuredBlog && currentPage === 1 && (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[36px] border border-ink/5 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden group"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 lg:p-10">
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={13} /> Featured Story
                      </span>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider">
                        {featuredBlog.category || 'General'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-ink group-hover:text-primary transition-colors leading-tight">
                      <Link to={`/blog/${featuredBlog.slug || featuredBlog._id || featuredBlog.id}`}>
                        {featuredBlog.title}
                      </Link>
                    </h2>

                    <p className="text-sm sm:text-base text-ink-muted leading-relaxed font-medium line-clamp-3">
                      {featuredBlog.excerpt || featuredBlog.content?.slice(0, 200) + '...'}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-ink-muted pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                          <User size={14} />
                        </div>
                        <span className="text-ink font-bold">{featuredBlog.authorName || 'Editorial Team'}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-primary" />
                        <span>
                          {featuredBlog.createdAt
                            ? new Date(featuredBlog.createdAt).toLocaleDateString('bn-BD', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'সম্প্রতি'}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-primary" />
                        <span>{featuredBlog.readTimeMinutes || 4} min read</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/blog/${featuredBlog.slug || featuredBlog._id || featuredBlog.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all group/btn"
                      >
                        <span>সম্পূর্ণ আর্টিকেল পড়ুন</span>
                        <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 h-72 sm:h-96 rounded-3xl overflow-hidden bg-slate-100 relative">
                    <img
                      src={featuredBlog.coverImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'}
                      alt={featuredBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </motion.article>
            )}

            {/* Articles Grid */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                <h3 className="text-xl font-display font-black text-ink flex items-center gap-2">
                  <TrendingUp size={20} className="text-primary" />
                  <span>সকল প্রকাশিত আর্টিকেল ({blogs.length})</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(currentPage === 1 ? gridBlogs : blogs).map((blog: any, index: number) => {
                  const targetUrl = `/blog/${blog.slug || blog._id || blog.id}`;
                  return (
                    <motion.article
                      key={blog._id || blog.id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-[32px] border border-ink/5 hover:border-primary/20 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
                    >
                      <div className="space-y-4">
                        {/* Cover Image */}
                        <Link to={targetUrl} className="block relative h-56 overflow-hidden m-3 rounded-[24px]">
                          <img
                            src={blog.coverImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'}
                            alt={blog.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-ink text-[10px] font-black uppercase tracking-wider shadow-sm">
                              {blog.category || 'Tuition Tips'}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3">
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                              <Clock size={11} /> {blog.readTimeMinutes || 4} min read
                            </span>
                          </div>
                        </Link>

                        {/* Content */}
                        <div className="px-6 pb-2 space-y-2">
                          <div className="flex items-center gap-3 text-[11px] font-bold text-ink-muted">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-primary" />
                              {blog.createdAt
                                ? new Date(blog.createdAt).toLocaleDateString('bn-BD', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : 'সম্প্রতি'}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{blog.authorName || 'Editorial Team'}</span>
                          </div>

                          <h3 className="text-lg font-display font-black text-ink group-hover:text-primary transition-colors leading-snug line-clamp-2">
                            <Link to={targetUrl}>
                              {blog.title}
                            </Link>
                          </h3>

                          <p className="text-xs text-ink-muted leading-relaxed font-medium line-clamp-3">
                            {blog.excerpt || blog.content?.slice(0, 140) + '...'}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-4 mt-4 border-t border-ink/5 flex items-center justify-between">
                        <Link
                          to={targetUrl}
                          className="text-[11px] font-black text-primary flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          সম্পূর্ণ আর্টিকেল পড়ুন <ChevronRight size={14} />
                        </Link>

                        <span className="text-[11px] font-semibold text-ink-muted/70 flex items-center gap-1">
                          <Eye size={12} /> {blog.views || 0}
                        </span>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                {Array.from({ length: pagination.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      currentPage === i + 1
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-white border border-ink/10 text-slate-700 hover:border-primary"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

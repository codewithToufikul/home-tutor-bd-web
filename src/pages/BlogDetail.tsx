import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Calendar, Clock, User, Eye, ArrowLeft, Share2, 
  Check, Copy, Facebook, Linkedin, Bookmark, 
  Sparkles, Tag, ChevronRight, BookOpen, AlertCircle,
  MessageCircle, Send
} from 'lucide-react';
import { useGetBlogByIdOrSlugQuery } from '@/src/services/adminApi';
import { cn } from '@/src/lib/utils';

export default function BlogDetail() {
  const { id: slugOrId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { data: blogResponse, isLoading, isError } = useGetBlogByIdOrSlugQuery(slugOrId || '', {
    skip: !slugOrId
  });

  const blog = (blogResponse as any)?.data?.blog || (blogResponse as any)?.data || (blogResponse as any)?.blog;
  const relatedBlogs = (blogResponse as any)?.data?.relatedBlogs || [];

  // Scroll progress for reading bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scroll = `${(totalScroll / windowHeight) * 100}`;
        setScrollProgress(Number(scroll));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update document title for SEO
  useEffect(() => {
    if (blog?.title) {
      document.title = `${blog.title} | Home Tutor BD Blog`;
    }
    return () => {
      document.title = 'Home Tutor Provider BD';
    };
  }, [blog?.title]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: 'facebook' | 'whatsapp' | 'linkedin') => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(blog?.title || 'Home Tutor BD Article');

    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-pulse space-y-8">
          <div className="h-6 w-32 bg-slate-200 rounded-full" />
          <div className="h-12 w-full bg-slate-200 rounded-2xl" />
          <div className="h-6 w-64 bg-slate-200 rounded-lg" />
          <div className="w-full h-80 bg-slate-200 rounded-3xl" />
          <div className="space-y-4 pt-6">
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 rounded" />
            <div className="h-4 w-4/6 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !blog) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-ink/5 text-center space-y-6 shadow-xl shadow-ink/5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-black text-ink">ব্লগ বা আর্টিকেলটি পাওয়া যায়নি</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              অনুরোধকৃত আর্টিকেলটি হয়তো সরিয়ে ফেলা হয়েছে অথবা লিংকটি সঠিক নয়।
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Link
              to="/blogs"
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              সকল ব্লগ দেখুন
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-slate-100 text-ink rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
            >
              হোমে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink relative selection:bg-primary/20 selection:text-primary">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary via-teal-500 to-primary z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-10">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink-muted hover:text-primary transition-colors cursor-pointer py-1"
          >
            <ArrowLeft size={16} />
            <span>পেছনে ফিরে যান</span>
          </button>

          <nav className="flex items-center gap-2 text-xs text-ink-muted font-medium">
            <Link to="/" className="hover:text-ink">হোম</Link>
            <ChevronRight size={12} />
            <Link to="/blogs" className="hover:text-ink">ব্লগ</Link>
            <ChevronRight size={12} />
            <span className="text-primary font-bold truncate max-w-[150px] sm:max-w-xs">{blog.category || 'আর্টিকেল'}</span>
          </nav>
        </div>

        {/* Header Content */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
              {blog.category || 'Tuition Tips'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-semibold">
              <Clock size={13} className="text-primary" />
              <span>{blog.readTimeMinutes || 4} মিনিট পড়ার সময়</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-ink-muted font-semibold">
              <Eye size={13} className="text-primary" />
              <span>{blog.views || 1} বার পঠিত</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-ink tracking-tight leading-[1.2]">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-lg sm:text-xl text-ink-muted/90 font-serif leading-relaxed border-l-4 border-primary pl-4 py-1 italic">
              {blog.excerpt}
            </p>
          )}

          {/* Author & Published Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-ink/10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-teal-400 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <User size={22} className="text-primary" />
                </div>
              </div>
              <div>
                <div className="font-bold text-sm text-ink">{blog.authorName || 'Home Tutor Editorial Team'}</div>
                <div className="text-xs text-ink-muted flex items-center gap-2">
                  <span>শিক্ষা ও টিউটরিং বিষয়ক গবেষক</span>
                  <span>•</span>
                  <span>
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString('bn-BD', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'সম্প্ৰতি'}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSocialShare('facebook')}
                title="Share on Facebook"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#1877F2] hover:text-white text-ink/70 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Facebook size={16} />
              </button>
              <button
                onClick={() => handleSocialShare('whatsapp')}
                title="Share on WhatsApp"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#25D366] hover:text-white text-ink/70 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <MessageCircle size={16} />
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                title="Share on LinkedIn"
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-[#0A66C2] hover:text-white text-ink/70 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              >
                <Linkedin size={16} />
              </button>
              <button
                onClick={handleCopyLink}
                title="Copy Link"
                className={cn(
                  "px-3 h-9 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm",
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 hover:bg-ink hover:text-white text-ink"
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {blog.coverImage && (
          <div className="rounded-[32px] overflow-hidden shadow-2xl shadow-ink/10 border border-ink/5 max-h-[500px] w-full bg-slate-100">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover max-h-[500px]"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Article Body Content */}
        <article className="prose prose-lg sm:prose-xl max-w-none text-ink/90 font-serif leading-relaxed pt-4 border-b border-ink/10 pb-12">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h2 className="text-2xl sm:text-3xl font-display font-black text-ink mt-8 mb-4 border-b border-ink/10 pb-2">
                  {children}
                </h2>
              ),
              h2: ({ children }) => (
                <h3 className="text-xl sm:text-2xl font-display font-black text-[#001F3F] mt-7 mb-3">
                  {children}
                </h3>
              ),
              h3: ({ children }) => (
                <h4 className="text-lg sm:text-xl font-display font-bold text-ink mt-6 mb-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6 font-sans">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside pl-6 mb-6 space-y-2 text-slate-700 font-sans">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside pl-6 mb-6 space-y-2 text-slate-700 font-sans">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary bg-primary/5 p-4 sm:p-6 rounded-r-2xl my-6 text-slate-800 italic font-serif">
                  {children}
                </blockquote>
              ),
              strong: ({ children }) => (
                <strong className="font-black text-ink">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-bold underline decoration-primary/40 hover:decoration-primary transition-all"
                >
                  {children}
                </a>
              ),
            }}
          >
            {blog.content || ''}
          </ReactMarkdown>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-8">
              <span className="text-xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5 mr-2">
                <Tag size={14} /> ট্যাগসমূহ:
              </span>
              {blog.tags.map((tag: string, idx: number) => (
                <Link
                  key={idx}
                  to={`/blogs?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-slate-100 hover:bg-primary/10 hover:text-primary rounded-xl text-xs font-semibold text-slate-600 transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        {/* Author Bio Box */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-ink/5 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <User size={36} />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h4 className="font-display font-black text-lg text-ink">
                {blog.authorName || 'Home Tutor Editorial Team'}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider self-center sm:self-auto">
                Verified Author
              </span>
            </div>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-sans">
              হোম টিউটর প্রোভাইডার বাংলাদেশ-এর বিশেষজ্ঞ কনটেন্ট টিম শিক্ষার্থী, অভিভাবক এবং শিক্ষকদের জন্য তথ্যভিত্তিক ও কার্যকর টিউটোরিয়াল নিয়মিত প্রকাশ করে।
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-br from-[#001F3F] via-slate-900 to-[#001F3F] rounded-[32px] p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} />
              <span>দক্ষ গৃহশিক্ষক প্রয়োজন?</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-display font-black tracking-tight leading-snug">
              আপনার সন্তানের জন্য আজই সেরা হোম বা অনলাইন টিউটর বুক করুন
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              বুয়েট, ঢাবি, মেডিকেল ও শীর্ষ বিশ্ববিদ্যালয়ের যাচাইকৃত শিক্ষকদের সাথে সরাসরি যোগাযোগ করুন।
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/request-tutor"
                className="px-6 py-3.5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-primary/20"
              >
                টিউটর রিকোয়েস্ট দিন
              </Link>
              <Link
                to="/tutors"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
              >
                টিউটরদের তালিকা দেখুন
              </Link>
            </div>
          </div>
        </div>

        {/* Related Blogs Section */}
        {relatedBlogs && relatedBlogs.length > 0 && (
          <section className="space-y-6 pt-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-display font-black text-ink">সম্পর্কিত আরো আর্টিকেল</h3>
                <p className="text-xs text-ink-muted">এই বিষয়ের সাথে প্রাসঙ্গিক অন্যান্য প্রয়োজনীয় ব্লগ</p>
              </div>
              <Link
                to="/blogs"
                className="text-xs font-black uppercase tracking-wider text-primary hover:underline"
              >
                সকল ব্লগ দেখুন →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBlogs.map((item: any, i: number) => {
                const targetUrl = `/blog/${item.slug || item._id || item.id}`;
                return (
                  <Link
                    key={item._id || i}
                    to={targetUrl}
                    className="bg-white rounded-2xl border border-ink/5 hover:border-primary/30 p-4 space-y-3 group shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={item.coverImage || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                        {item.category || 'General'}
                      </span>
                      <h4 className="font-display font-bold text-sm text-ink group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

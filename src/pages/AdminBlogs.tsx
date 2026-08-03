import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Newspaper, Trash2, PlusCircle, 
  ChevronLeft, ChevronRight, Calendar, User, 
  Eye, CheckCircle2, Clock, AlertCircle, X, Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { BlogService } from '@/src/services/blogService';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 5;

interface BlogItem {
  id: string;
  title: string;
  author: string;
  category: string;
  date: string;
  views: number;
  status: string;
  image?: string;
  content?: string;
}

export default function AdminBlogs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const items = await BlogService.list();
        if (!active) return;

        setBlogs((items as any[]).map((item) => ({
          id: item.id,
          title: item.title || 'Untitled Blog',
          author: item.author || item.authorId || 'Admin',
          category: item.category || 'General',
          date: item.date || String(item.createdAt || new Date().toISOString()).slice(0, 10),
          views: Number(item.views || 0),
          status: String(item.status ?? (item.isPublished ? 'Approved' : 'Pending')),
          image: item.image || `https://picsum.photos/seed/${item.id || 'blog'}/400/250`,
          content: item.content || '',
        })));
      } catch (err) {
        console.error('Failed to load blogs:', err);
      }
    })();

    return () => { active = false; };
  }, []);

  // Filtering Logic
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           blog.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           blog.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || blog.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [blogs, searchQuery, statusFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE);
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const toggleStatus = async (id: string) => {
    const currentBlog = blogs.find((blog) => blog.id === id);
    if (!currentBlog) return;

    const newStatus = currentBlog.status === 'Approved' ? 'Pending' : 'Approved';

    try {
      await BlogService.update(id, { status: newStatus });
      setBlogs(blogs.map((blog) => (
        blog.id === id ? { ...blog, status: newStatus } : blog
      )));
    } catch (err) {
      console.error('Failed to update blog status:', err);
    }
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      await BlogService.remove(blogToDelete);
      setBlogs(blogs.filter((blog) => blog.id !== blogToDelete));
      setBlogToDelete(null);
    } catch (err) {
      console.error('Failed to delete blog:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 relative pb-20">
        {/* Sticky Topbar Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            <div className="flex items-center gap-4 shrink-0">
              {/* Title */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm md:text-base font-display font-black text-ink leading-none">
                  Blog Management
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search Blogs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[100px]"
                >
                  <option value="All">All Status</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Total Count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
              <Newspaper size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredBlogs.length}</span></span>
            </div>
          </div>
        </div>

        {/* Blogs Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center w-12">#</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Cover</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Title & Code</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Author</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Category</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Date</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">Status</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedBlogs.map((blog, index) => (
                    <motion.tr 
                      key={blog.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted text-center">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-ink/5 shadow-sm">
                          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-[200px]">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-ink truncate" title={blog.title}>{blog.title}</span>
                          <span className="text-[10px] font-mono font-bold text-primary">{blog.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted">{blog.author}</td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-ink-muted">{blog.date}</td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => toggleStatus(blog.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all active:scale-95",
                            blog.status === 'Approved' 
                              ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                              : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          )}
                        >
                          {blog.status}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setSelectedBlog(blog)}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95"
                          >
                            <Eye size={14} />
                          </button>
                          <button 
                            onClick={() => setBlogToDelete(blog.id)}
                            className="p-2 rounded-lg bg-[#FB7185] text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          <AnimatePresence mode="popLayout">
            {paginatedBlogs.map((blog) => (
              <motion.div
                key={blog.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/40 shadow-md shrink-0">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-black text-primary uppercase">{blog.id}</p>
                    <h3 className="text-sm font-black text-ink leading-tight truncate">{blog.title}</h3>
                    <p className="text-[11px] font-medium text-ink-muted">By {blog.author}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center py-3 border-y border-ink/5">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                    {blog.category}
                  </span>
                  <button 
                    onClick={() => toggleStatus(blog.id)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all",
                      blog.status === 'Approved' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}
                  >
                    {blog.status}
                  </button>
                </div>

                <div className="flex gap-3 pt-1">
                  <button 
                    onClick={() => setSelectedBlog(blog)}
                    className="flex-1 py-3 rounded-2xl bg-primary/10 text-primary text-[10px] font-black uppercase flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button 
                    onClick={() => setBlogToDelete(blog.id)}
                    className="w-12 h-12 rounded-2xl bg-[#FB7185] text-white shadow-lg shadow-rose-500/20 flex items-center justify-center active:scale-95 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm">
              <span className="text-sm font-bold text-ink-muted">
                Page <span className="text-primary">{currentPage}</span> of {totalPages}
              </span>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredBlogs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <Newspaper size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No blogs found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any blogs matching your search criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Blog Detail Preview Modal */}
      <AnimatePresence>
        {selectedBlog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBlog(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-white/40 overflow-hidden"
            >
              <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-white/80 backdrop-blur-xl">
                <h3 className="text-base font-black text-ink truncate">{selectedBlog.title}</h3>
                <button 
                  onClick={() => setSelectedBlog(null)}
                  className="w-8 h-8 rounded-lg bg-ink/5 flex items-center justify-center text-ink-muted hover:text-primary transition-all"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="h-48 rounded-2xl overflow-hidden">
                  <img src={selectedBlog.image} alt={selectedBlog.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-ink-muted">
                  <span>By {selectedBlog.author}</span>
                  <span>•</span>
                  <span>{selectedBlog.date}</span>
                </div>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  {selectedBlog.content}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {blogToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBlogToDelete(null)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-ink">Delete Blog?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  Are you sure you want to delete this blog post? This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setBlogToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
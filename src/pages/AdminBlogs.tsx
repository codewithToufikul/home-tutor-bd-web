import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Newspaper, Trash2, PlusCircle, 
  ChevronLeft, ChevronRight, Calendar, User, 
  Eye, CheckCircle2, Clock, AlertCircle, X, Image as ImageIcon,
  Edit3, Send, Sparkles, Tag, BookOpen, ExternalLink, RefreshCw, List,
  UploadCloud, Loader2, Check, FileImage
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { 
  useGetAdminBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation
} from '@/src/services/adminApi';
import { uploadFileWithProgress } from '@/src/repositories/storageRepository';
import { compressImage } from '@/src/utils/imageCompressor';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 8;

const BLOG_CATEGORIES = [
  'Tuition Tips',
  'Study Guides',
  'Parents Guide',
  'Career & Skills',
  'Platform Updates',
  'General',
];

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&q=80',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&q=80',
];

export default function AdminBlogs() {
  const [activeTab, setActiveTab] = useState<'manage' | 'create'>('manage');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State for Creating / Editing
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Tuition Tips');
  const [authorName, setAuthorName] = useState('Home Tutor Editorial');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Image Upload & Compression State
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState<{
    original: string;
    compressed: string;
    ratio: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modals
  const [selectedBlogForPreview, setSelectedBlogForPreview] = useState<any | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // RTK Query Hooks
  const { data: blogsResponse, isLoading, refetch } = useGetAdminBlogsQuery(undefined);
  const [createBlogMutation, { isLoading: isSubmitting }] = useCreateBlogMutation();
  const [updateBlogMutation] = useUpdateBlogMutation();
  const [deleteBlogMutation] = useDeleteBlogMutation();

  const rawBlogs = useMemo(() => {
    const list = (blogsResponse as any)?.data?.blogs || (blogsResponse as any)?.blogs || (blogsResponse as any)?.data || blogsResponse || [];
    return Array.isArray(list) ? list : [];
  }, [blogsResponse]);

  // Filtering Logic
  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rawBlogs.filter((blog: any) => {
      const matchesSearch =
        !query ||
        [blog.title, blog.authorName, blog.slug, blog.category, blog.content]
          .some((val) => String(val || '').toLowerCase().includes(query));

      const matchesCat = categoryFilter === 'All' || blog.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [rawBlogs, searchQuery, categoryFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / ITEMS_PER_PAGE));
  const paginatedBlogs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBlogs, currentPage]);

  const resetForm = () => {
    setEditingBlogId(null);
    setTitle('');
    setSlug('');
    setCategory('Tuition Tips');
    setAuthorName('Home Tutor Editorial');
    setCoverImage(PRESET_COVERS[0]);
    setExcerpt('');
    setContent('');
    setTagsInput('');
    setIsFeatured(false);
    setIsPublished(true);
    setCompressionStats(null);
    setIsUploadingImage(false);
    setIsCompressing(false);
    setUploadProgress(0);
    setErrorMsg(null);
  };

  const handleEditClick = (blog: any) => {
    setEditingBlogId(blog._id || blog.id);
    setTitle(blog.title || '');
    setSlug(blog.slug || '');
    setCategory(blog.category || 'Tuition Tips');
    setAuthorName(blog.authorName || 'Home Tutor Editorial');
    setCoverImage(blog.coverImage || PRESET_COVERS[0]);
    setExcerpt(blog.excerpt || '');
    setContent(blog.content || '');
    setTagsInput(Array.isArray(blog.tags) ? blog.tags.join(', ') : '');
    setIsFeatured(Boolean(blog.isFeatured));
    setIsPublished(blog.isPublished !== false);
    setCompressionStats(null);
    setActiveTab('create');
  };

  // Image Upload Handler with Automatic Compression
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    try {
      setErrorMsg(null);
      setIsCompressing(true);
      setUploadProgress(5);

      // 1. Compress Image
      const compressed = await compressImage(file, 1600, 1000, 0.82);
      setCompressionStats({
        original: compressed.originalSizeFormatted,
        compressed: compressed.compressedSizeFormatted,
        ratio: compressed.compressionRatio,
      });

      setIsCompressing(false);
      setIsUploadingImage(true);

      // 2. Upload to Cloudinary via backend endpoint
      const uploadedUrl = await uploadFileWithProgress(
        compressed.file,
        'home-tutor-bd/blogs',
        (progress) => setUploadProgress(progress)
      );

      setCoverImage(uploadedUrl);
      setIsUploadingImage(false);
      setActionSuccessMsg('Cover image compressed & uploaded to R2! ⚡');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Image compression/upload failed:', err);
      setIsCompressing(false);
      setIsUploadingImage(false);
      setErrorMsg(err.message || 'Failed to upload cover image.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !content.trim()) {
      setErrorMsg('Blog title and content are required.');
      return;
    }

    if (isUploadingImage || isCompressing) {
      setErrorMsg('Please wait for the cover image to finish uploading.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category,
      authorName: authorName.trim() || 'Home Tutor Editorial',
      coverImage: coverImage.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      tags,
      isFeatured,
      isPublished,
    };

    try {
      if (editingBlogId) {
        await updateBlogMutation({ id: editingBlogId, ...payload }).unwrap();
        setActionSuccessMsg('Blog post updated successfully! 🎉');
      } else {
        await createBlogMutation(payload).unwrap();
        setActionSuccessMsg('New blog post published successfully! 🚀');
      }

      resetForm();
      setActiveTab('manage');
      refetch();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Failed to save blog:', err);
      setErrorMsg(err?.data?.message || 'Failed to save blog post.');
    }
  };

  const togglePublishStatus = async (blog: any) => {
    const nextStatus = !blog.isPublished;
    try {
      await updateBlogMutation({
        id: blog._id || blog.id,
        isPublished: nextStatus,
      }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      alert('Failed to update status.');
    }
  };

  const confirmDelete = async () => {
    if (!blogToDelete) return;
    try {
      await deleteBlogMutation(blogToDelete).unwrap();
      setActionSuccessMsg('Blog post deleted successfully.');
      setBlogToDelete(null);
      refetch();
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete blog:', err);
      alert('Failed to delete blog post.');
    }
  };

  const inputClasses = "w-full bg-white/70 backdrop-blur-xl border border-ink/10 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-white transition-all shadow-sm placeholder:text-ink-muted/40";
  const labelClasses = "block text-[11px] font-black text-ink uppercase mb-1.5 ml-1 tracking-wider";

  return (
    <AdminLayout>
      <div className="space-y-6 relative pb-20 max-w-7xl mx-auto">
        {/* Sticky Header Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-7 bg-primary rounded-full shadow-sm shadow-primary/30" />
              <div>
                <h2 className="text-base md:text-lg font-display font-black text-ink leading-tight flex items-center gap-2">
                  Blog & Content Management
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {rawBlogs.length} Articles
                  </span>
                </h2>
                <p className="text-[11px] font-medium text-ink-muted">
                  Create, publish and manage educational articles displayed on the homepage & blog portal.
                </p>
              </div>
            </div>

            {/* Action Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => {
                    setActiveTab('manage');
                    resetForm();
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'manage'
                      ? "bg-white text-primary shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  <List size={14} /> All Blogs ({rawBlogs.length})
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('create');
                  }}
                  className={cn(
                    "px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === 'create'
                      ? "bg-white text-primary shadow-sm"
                      : "text-ink-muted hover:text-ink"
                  )}
                >
                  <PlusCircle size={14} /> {editingBlogId ? 'Edit Article' : 'Write Article'}
                </button>
              </div>

              <Link
                to="/blogs"
                target="_blank"
                className="p-2.5 rounded-2xl bg-white border border-ink/10 text-ink-muted hover:text-primary transition-all shadow-sm"
                title="View Public Blogs Page"
              >
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Global Success / Error Toast */}
        <AnimatePresence>
          {actionSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-between text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{actionSuccessMsg}</span>
              </div>
              <button onClick={() => setActionSuccessMsg(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={14} />
              </button>
            </motion.div>
          )}

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 bg-rose-600 text-white rounded-2xl shadow-lg shadow-rose-500/20 flex items-center justify-between text-xs font-bold"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'manage' ? (
          /* Manage Blogs Tab */
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80 group">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title, author, category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/70 border border-ink/10 rounded-xl py-2 pl-10 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 shadow-sm"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide">
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/70 border border-ink/10 rounded-xl py-2 px-3 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                >
                  <option value="All">All Categories ({rawBlogs.length})</option>
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat} ({rawBlogs.filter((b: any) => b.category === cat).length})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => refetch()}
                  className="p-2 rounded-xl bg-white border border-ink/10 text-ink-muted hover:text-primary transition-all shadow-sm shrink-0"
                  title="Refresh Blogs"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin text-primary' : ''} />
                </button>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="bg-white/80 backdrop-blur-xl rounded-[32px] border border-white/60 shadow-xl shadow-ink/5 overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary text-white select-none">
                      <th className="px-4 py-4 text-[10px] font-black uppercase text-center w-12">#</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase w-24">Cover</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase">Article Title & Slug</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase">Category</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase">Author</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Views</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Status</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {isLoading ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-ink-muted">
                          <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-2" />
                          <span className="text-xs font-bold">Loading articles...</span>
                        </td>
                      </tr>
                    ) : paginatedBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center">
                          <Newspaper size={32} className="mx-auto text-ink-muted/40 mb-2" />
                          <h4 className="text-sm font-black text-ink">No Blog Posts Found</h4>
                          <p className="text-xs text-ink-muted">Click "Write Article" to publish your first blog post.</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedBlogs.map((blog: any, index: number) => (
                        <tr key={blog._id || blog.id} className="group hover:bg-white/60 transition-colors">
                          <td className="px-4 py-4 text-xs font-bold text-ink-muted text-center">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>

                          {/* Cover Thumbnail */}
                          <td className="px-4 py-4">
                            <div className="w-20 h-12 rounded-xl overflow-hidden border border-ink/10 shadow-sm bg-slate-100">
                              <img
                                src={blog.coverImage || PRESET_COVERS[0]}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </td>

                          {/* Title & Slug */}
                          <td className="px-4 py-4 max-w-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <h4
                                  onClick={() => setSelectedBlogForPreview(blog)}
                                  className="text-xs font-black text-ink hover:text-primary cursor-pointer transition-colors leading-tight line-clamp-1"
                                  title={blog.title}
                                >
                                  {blog.title}
                                </h4>
                                {blog.isFeatured && (
                                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[8px] font-black uppercase">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-ink-muted font-mono truncate">
                                /blog/{blog.slug}
                              </p>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-black uppercase">
                              {blog.category || 'General'}
                            </span>
                          </td>

                          {/* Author & Date */}
                          <td className="px-4 py-4">
                            <div className="text-xs font-bold text-ink">{blog.authorName || 'Admin'}</div>
                            <div className="text-[10px] text-ink-muted">
                              {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-GB') : 'Recently'}
                            </div>
                          </td>

                          {/* Views */}
                          <td className="px-4 py-4 text-center">
                            <span className="text-xs font-black text-ink flex items-center justify-center gap-1">
                              <Eye size={12} className="text-primary" />
                              {blog.views || 0}
                            </span>
                          </td>

                          {/* Publish Status Toggle */}
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => togglePublishStatus(blog)}
                              className={cn(
                                "px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm",
                                blog.isPublished
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                              )}
                              title="Click to toggle publish status"
                            >
                              {blog.isPublished ? 'Published' : 'Draft'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Open Public Page */}
                              <Link
                                to={`/blog/${blog.slug || blog._id || blog.id}`}
                                target="_blank"
                                className="p-2 rounded-xl bg-ink/5 text-ink hover:bg-ink hover:text-white transition-all shadow-sm"
                                title="View Live Article"
                              >
                                <ExternalLink size={13} />
                              </Link>

                              {/* Edit */}
                              <button
                                onClick={() => handleEditClick(blog)}
                                className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-95"
                                title="Edit Blog Post"
                              >
                                <Edit3 size={13} />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => setBlogToDelete(blog._id || blog.id)}
                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                                title="Delete Blog Post"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {paginatedBlogs.map((blog: any) => (
                <div
                  key={blog._id || blog.id}
                  className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-md space-y-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={blog.coverImage || PRESET_COVERS[0]}
                      alt={blog.title}
                      className="w-20 h-16 rounded-xl object-cover border border-ink/10 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-black uppercase">
                        {blog.category}
                      </span>
                      <h4 className="text-xs font-black text-ink leading-tight line-clamp-2">{blog.title}</h4>
                      <p className="text-[10px] text-ink-muted">By {blog.authorName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-ink/5">
                    <button
                      onClick={() => togglePublishStatus(blog)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase",
                        blog.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(blog)}
                        className="p-2 rounded-lg bg-primary/10 text-primary"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setBlogToDelete(blog._id || blog.id)}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 py-4 px-2">
                <p className="text-xs font-medium text-ink-muted">
                  Showing <span className="font-bold text-ink">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                  <span className="font-bold text-ink">{Math.min(currentPage * ITEMS_PER_PAGE, filteredBlogs.length)}</span> of{' '}
                  <span className="font-bold text-ink">{filteredBlogs.length}</span> articles
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-white border border-ink/10 text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-3 py-1.5 bg-white border border-ink/10 rounded-xl text-xs font-bold text-ink shadow-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-white border border-ink/10 text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Write / Create / Edit Form */
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl p-6 sm:p-10 rounded-[40px] border border-white/60 shadow-xl shadow-ink/5 space-y-8">
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div>
                <h3 className="text-base font-display font-black text-ink">
                  {editingBlogId ? 'Edit Blog Article' : 'Write & Publish New Article'}
                </h3>
                <p className="text-xs text-ink-muted">Fill out the details below to publish directly to the website.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('manage');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-ink transition-colors"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}>Article Title (শিরোনাম)*</label>
                <input
                  type="text"
                  placeholder="e.g., How to Become a Successful Home Tutor in Bangladesh"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(inputClasses, "text-sm font-bold")}
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Category (ক্যাটাগরি)*</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={cn(inputClasses, "appearance-none cursor-pointer")}
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Author Name */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Author Name (লেখকের নাম)*</label>
                <input
                  type="text"
                  placeholder="e.g., Home Tutor Editorial / Engr. Toufikul Islam"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* Custom Slug (Optional) */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Custom URL Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., successful-tutor-guide (auto-generated if empty)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className={labelClasses}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Tuition, Study Hacks, HSC, University"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={inputClasses}
                />
              </div>

              {/* 📸 Direct Cloudinary Cover Image Upload with Automatic Compression */}
              <div className="md:col-span-2 space-y-3">
                <label className={labelClasses}>
                  Cover Image (সরাসরি ইমেজ আপলোড - Cloudflare R2)*
                </label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Dropzone & Upload Button */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "lg:col-span-7 border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
                      dragOver
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-ink/15 hover:border-primary/50 bg-white/50 hover:bg-primary/5"
                    )}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                      {isCompressing ? (
                        <Loader2 className="animate-spin" size={24} />
                      ) : isUploadingImage ? (
                        <UploadCloud className="animate-bounce" size={24} />
                      ) : (
                        <UploadCloud size={26} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-black text-ink">
                        {isCompressing
                          ? 'ইমেজ কম্প্রেস ও সাইজ অপ্টিমাইজ করা হচ্ছে...'
                          : isUploadingImage
                          ? `R2-তে আপলোড হচ্ছে (${uploadProgress}%)...`
                          : 'কভার ইমেজ আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ করুন'}
                      </p>
                      <p className="text-[10px] text-ink-muted">
                        সাপোর্ট: JPG, PNG, WEBP (স্বয়ংক্রিয়ভাবে কম্প্রেস হয়ে সাইজ ছোট হবে)
                      </p>
                    </div>

                    {/* Real-time Compression Stats Badge */}
                    {compressionStats && !isCompressing && !isUploadingImage && (
                      <div className="mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                        <Check size={12} />
                        <span>
                          কম্প্রেসড: {compressionStats.original} → {compressionStats.compressed} ({compressionStats.ratio}% সেভ)
                        </span>
                      </div>
                    )}

                    {/* Upload Progress Bar */}
                    {(isUploadingImage || isCompressing) && (
                      <div className="w-full mt-3 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Image Preview & Details */}
                  <div className="lg:col-span-5 bg-white/70 border border-ink/10 rounded-3xl p-3.5 space-y-2.5">
                    <p className="text-[10px] font-black text-ink-muted uppercase">বর্তমান কভার প্রিভিউ:</p>
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-100 border border-ink/10 shadow-sm">
                      <img
                        src={coverImage}
                        alt="Blog Cover Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="absolute bottom-2 right-2 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black text-white text-[10px] font-bold backdrop-blur-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={11} /> ছবি পরিবর্তন করুন
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="অথবা কভার ছবির সরাসরি URL লিখুন"
                        className="w-full bg-white border border-ink/10 rounded-xl py-1.5 px-2.5 text-[10px] font-mono text-ink-muted focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Cover Picks */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-ink-muted uppercase">অথবা কিউরেটেড প্রিসেট থেকে বেছে নিন:</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_COVERS.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setCoverImage(url);
                          setCompressionStats(null);
                        }}
                        className={cn(
                          "h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                          coverImage === url ? "border-primary ring-2 ring-primary/30" : "border-ink/10 opacity-70 hover:opacity-100"
                        )}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Excerpt / Summary */}
              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}>Short Excerpt / Summary (সংক্ষিপ্ত বিবরণ)</label>
                <textarea
                  placeholder="Brief 1-2 sentence preview for cards and search results..."
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className={cn(inputClasses, "resize-none")}
                />
              </div>

              {/* Full Article Content */}
              <div className="md:col-span-2 space-y-1.5">
                <label className={labelClasses}>Article Content (সম্পূর্ণ প্রবন্ধ / বিবরণ)*</label>
                <p className="text-[10px] text-ink-muted mb-1">
                  Supports Markdown headings (###), bullet points, and clean paragraphs.
                </p>
                <textarea
                  placeholder="Write your detailed article here..."
                  required
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={cn(inputClasses, "resize-y font-mono text-xs leading-relaxed")}
                />
              </div>

              {/* Toggles */}
              <div className="md:col-span-2 flex flex-wrap items-center gap-6 pt-2 border-t border-ink/5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary rounded accent-primary"
                  />
                  <span>Mark as Featured Article (হোমপেজ ও ব্লগে হাইলাইট হবে)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-primary rounded accent-primary"
                  />
                  <span>Publish Immediately (সরাসরি লাইভ হবে)</span>
                </label>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-ink/5">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('manage');
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 text-ink font-bold text-xs uppercase hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage || isCompressing}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || isUploadingImage || isCompressing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Send size={15} /> {editingBlogId ? 'Update Article' : 'Publish Article'}</>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Preview Modal */}
        <AnimatePresence>
          {selectedBlogForPreview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedBlogForPreview(null)}
                className="absolute inset-0 bg-ink/50 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-[32px] p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl border border-ink/10"
              >
                <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase">
                      {selectedBlogForPreview.category}
                    </span>
                    <h3 className="text-lg font-display font-black text-ink mt-1">
                      {selectedBlogForPreview.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedBlogForPreview(null)}
                    className="p-2 rounded-xl hover:bg-slate-100 text-ink-muted hover:text-ink cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="h-56 rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src={selectedBlogForPreview.coverImage}
                    alt={selectedBlogForPreview.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-sans">
                  {selectedBlogForPreview.content}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-ink/10">
                  <Link
                    to={`/blog/${selectedBlogForPreview.slug || selectedBlogForPreview._id}`}
                    target="_blank"
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-dark"
                  >
                    Open Live Article
                  </Link>
                  <button
                    onClick={() => setSelectedBlogForPreview(null)}
                    className="px-5 py-2.5 bg-slate-100 rounded-xl text-xs font-bold hover:bg-slate-200 text-ink"
                  >
                    Close
                  </button>
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
                className="absolute inset-0 bg-ink/50 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-ink/10 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Trash2 size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-ink">Delete Blog Post?</h4>
                  <p className="text-xs text-ink-muted">
                    This action cannot be undone. The article will be permanently removed.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setBlogToDelete(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
                  >
                    Delete Permanently
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
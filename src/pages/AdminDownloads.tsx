import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Download, FileText, Trash2, PlusCircle,
  ChevronLeft, ChevronRight, FileDown, Calendar,
  HardDrive, Eye, AlertCircle, X, Upload, Users,
  EyeOff, Check, Loader2, CloudUpload
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import {
  useGetAdminDownloadsQuery,
  useUploadDownloadFileMutation,
  useDeleteDownloadFileMutation,
  useToggleDownloadPublishedMutation,
  type DownloadFile,
} from '@/src/services/downloadApi';
import { cn } from '@/src/lib/utils';

const ITEMS_PER_PAGE = 8;

const CATEGORIES = ['Lecture Notes', 'Syllabus', 'E-Book', 'Question Bank', 'Lab Manual', 'Diagrams', 'Study Guide', 'General'];
const ROLES = [
  { value: 'all', label: 'All Users', color: 'bg-violet-100 text-violet-700' },
  { value: 'student', label: 'Students', color: 'bg-blue-100 text-blue-700' },
  { value: 'tutor', label: 'Tutors', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'coaching', label: 'Coaching', color: 'bg-amber-100 text-amber-700' },
  { value: 'guardian', label: 'Guardians', color: 'bg-rose-100 text-rose-700' },
];

function RoleBadge({ role }: { role: string }) {
  const r = ROLES.find(x => x.value === role);
  return (
    <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-black uppercase', r?.color ?? 'bg-ink/5 text-ink-muted')}>
      {r?.label ?? role}
    </span>
  );
}

export default function AdminDownloads() {
  const { data: rawFiles, isLoading } = useGetAdminDownloadsQuery();
  const [uploadFile] = useUploadDownloadFileMutation();
  const [deleteFile] = useDeleteDownloadFileMutation();
  const [togglePublished] = useToggleDownloadPublishedMutation();

  const files: DownloadFile[] = useMemo(() => {
    if (Array.isArray(rawFiles)) return rawFiles;
    if (Array.isArray((rawFiles as any)?.data)) return (rawFiles as any).data;
    if (Array.isArray((rawFiles as any)?.files)) return (rawFiles as any).files;
    return [];
  }, [rawFiles]);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Lecture Notes');
  const [targetRoles, setTargetRoles] = useState<string[]>(['all']);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return files.filter((f: DownloadFile) => {
      const q = searchQuery.toLowerCase();
      const matchSearch = f.title?.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'All' || f.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [files, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const toggleRole = (role: string) => {
    if (role === 'all') {
      setTargetRoles(['all']);
      return;
    }
    setTargetRoles(prev => {
      const without = prev.filter(r => r !== 'all');
      if (without.includes(role)) {
        const next = without.filter(r => r !== role);
        return next.length ? next : ['all'];
      }
      return [...without, role];
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) setSelectedFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('targetRoles', JSON.stringify(targetRoles));

    try {
      // Simulate progress while uploading
      const interval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 10, 85));
      }, 300);
      await uploadFile(formData).unwrap();
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        resetModal();
      }, 800);
    } catch (err) {
      console.error('Upload failed:', err);
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setCategory('Lecture Notes');
    setTargetRoles(['all']);
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteFile(itemToDelete).unwrap();
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 relative pb-20">

        {/* Topbar */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-3 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-1 h-5 bg-primary rounded-full" />
                <h2 className="text-sm md:text-base font-display font-black text-ink leading-none">
                  Download & PDF Zone
                </h2>
              </div>

              <div className="relative group shrink-0">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-36 md:w-52 bg-white/60 backdrop-blur border border-white/40 rounded-lg py-2 pl-8 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 shadow-sm"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-white/60 backdrop-blur border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 shadow-sm"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                <FileText size={13} className="text-primary" />
                <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filtered.length}</span></span>
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle size={14} /> Upload File
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-primary animate-spin" />
            <p className="text-sm font-medium text-ink-muted">Loading files...</p>
          </div>
        )}

        {/* Desktop Table */}
        {!isLoading && (
          <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5">
                    {['#', 'File', 'Category', 'Size', 'Target', 'Date', 'Downloads', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-5 text-[10px] font-black text-ink-muted uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  <AnimatePresence mode="popLayout">
                    {paginated.map((item: DownloadFile, idx: number) => (
                      <motion.tr
                        key={item._id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="group hover:bg-white/40 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-bold text-ink-muted">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                              <FileDown size={18} />
                            </div>
                            <div>
                              <p className="text-xs font-black text-ink leading-tight max-w-[200px] truncate">{item.title}</p>
                              <p className="text-[10px] font-bold text-primary/70 uppercase">{item.fileType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black whitespace-nowrap">{item.category}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-ink-muted whitespace-nowrap">{item.fileSize}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(item.targetRoles || ['all']).map(r => <RoleBadge key={r} role={r} />)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-ink-muted whitespace-nowrap">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : '—'}
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-black text-ink">{item.downloadsCount}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={cn(
                            'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase',
                            item.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                          )}>
                            {item.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={item.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"
                            >
                              <Eye size={14} />
                            </a>
                            <button
                              onClick={() => togglePublished(item._id)}
                              className={cn('p-2 rounded-xl transition-all', item.isPublished
                                ? 'bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white'
                                : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                              )}
                              title={item.isPublished ? 'Unpublish' : 'Publish'}
                            >
                              {item.isPublished ? <EyeOff size={14} /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => setItemToDelete(item._id)}
                              className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
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
        )}

        {/* Mobile Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            <AnimatePresence mode="popLayout">
              {paginated.map((item: DownloadFile) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white/60 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                        <FileDown size={22} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink leading-tight">{item.title}</p>
                        <p className="text-[10px] font-bold text-primary/70 uppercase">{item.fileType} · {item.fileSize}</p>
                      </div>
                    </div>
                    <span className={cn('px-2 py-1 rounded-lg text-[9px] font-black uppercase shrink-0', item.isPublished ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
                      {item.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(item.targetRoles || ['all']).map(r => <RoleBadge key={r} role={r} />)}
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-ink/5 text-xs">
                    <div><p className="text-[10px] text-ink-muted font-black uppercase flex items-center gap-1"><Calendar size={9} /> Uploaded</p><p className="font-bold text-ink">{item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : '—'}</p></div>
                    <div><p className="text-[10px] text-ink-muted font-black uppercase flex items-center gap-1"><Download size={9} /> Downloads</p><p className="font-bold text-primary">{item.downloadsCount}</p></div>
                  </div>

                  <div className="flex gap-2">
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="flex-1 py-2.5 rounded-2xl bg-primary text-white text-[10px] font-black uppercase flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20">
                      <Eye size={13} /> View
                    </a>
                    <button onClick={() => togglePublished(item._id)} className={cn('flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-1.5', item.isPublished ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600')}>
                      {item.isPublished ? <><EyeOff size={13} /> Unpublish</> : <><Check size={13} /> Publish</>}
                    </button>
                    <button onClick={() => setItemToDelete(item._id)} className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 rounded-xl bg-white/60 border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 shadow-sm">
              <ChevronLeft size={18} />
            </button>
            <div className="px-4 py-2 bg-white/60 border border-white/40 rounded-xl shadow-sm text-sm font-bold text-ink-muted">
              Page <span className="text-primary">{currentPage}</span> of {totalPages}
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 rounded-xl bg-white/60 border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 shadow-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <FileText size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">No files found</h3>
              <p className="text-sm font-medium text-ink-muted mt-1 max-w-xs">Upload a PDF or document to get started.</p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Upload Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetModal} className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 space-y-6 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <CloudUpload size={18} />
                  </div>
                  <h3 className="text-lg font-display font-black text-ink">Upload New File</h3>
                </div>
                <button onClick={resetModal} className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">File Title *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. HSC Physics Chapter 1 Notes"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-background border border-ink/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">Description (optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Short description about this file..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-background border border-ink/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-background border border-ink/10 rounded-2xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Target Roles */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-ink-muted uppercase flex items-center gap-2">
                    <Users size={12} /> Send To *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map(role => {
                      const active = targetRoles.includes(role.value);
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => toggleRole(role.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all',
                            active
                              ? `${role.color} border-current shadow-sm`
                              : 'bg-ink/5 text-ink-muted border-transparent hover:bg-ink/10'
                          )}
                        >
                          {active && <Check size={10} className="inline mr-1" />}
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-ink-muted font-medium">Push notification will be sent to selected roles.</p>
                </div>

                {/* File Drop Zone */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">Document (PDF, DOCX, PPT, etc.) *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={cn(
                      'w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all',
                      dragActive ? 'border-primary bg-primary/5' : 'border-ink/15 hover:border-primary/40 hover:bg-ink/2'
                    )}
                  >
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center transition-colors', dragActive ? 'bg-primary/10 text-primary' : 'bg-ink/5 text-ink-muted')}>
                      <Upload size={22} />
                    </div>
                    {selectedFile ? (
                      <div className="text-center">
                        <p className="text-sm font-black text-ink">{selectedFile.name}</p>
                        <p className="text-[11px] text-ink-muted font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-bold text-ink-muted">Drop file here or <span className="text-primary">browse</span></p>
                        <p className="text-[11px] text-ink-muted mt-1">PDF, DOCX, PPT, PNG up to 25MB</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.webp" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] ?? null)} />
                </div>

                {/* Progress bar */}
                <AnimatePresence>
                  {isUploading && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                      <div className="flex justify-between text-[11px] font-bold text-ink-muted">
                        <span>Uploading to R2...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-ink/10 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} transition={{ ease: 'easeOut' }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={resetModal} className="flex-1 py-3.5 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all cursor-pointer">Cancel</button>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile || !title.trim()}
                    className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isUploading
                      ? <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                      : <><HardDrive size={16} /> Upload & Notify</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setItemToDelete(null)} className="absolute inset-0 bg-ink/20 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 text-center space-y-6 z-10"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-ink">Delete File?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">This will permanently remove the file from the Download Zone. Users will lose access immediately.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all cursor-pointer">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-4 rounded-2xl bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Download, FileText, Trash2, PlusCircle, 
  ChevronLeft, ChevronRight, FileDown, Calendar, 
  HardDrive, Eye, AlertCircle, Filter, X, Upload
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';

const MOCK_DOWNLOADS = [
  { id: 'DL-001', title: 'HSC Physics Note 2024', category: 'Lecture Notes', type: 'PDF', size: '4.2 MB', date: '12/03/2026', downloads: 1240, status: 'Public' },
  { id: 'DL-002', title: 'Class 10 Math Syllabus', category: 'Syllabus', type: 'PDF', size: '1.5 MB', date: '15/03/2026', downloads: 850, status: 'Public' },
  { id: 'DL-003', title: 'English Grammar Guide', category: 'E-Book', type: 'PDF', size: '12.8 MB', date: '18/03/2026', downloads: 2100, status: 'Public' },
  { id: 'DL-004', title: 'Admission Question Bank', category: 'Question Bank', type: 'PDF', size: '8.4 MB', date: '20/03/2026', downloads: 3400, status: 'Private' },
  { id: 'DL-005', title: 'Chemistry Lab Manual', category: 'Lab Manual', type: 'DOCX', size: '2.1 MB', date: '22/03/2026', downloads: 420, status: 'Public' },
  { id: 'DL-006', title: 'Biology Diagram Sheet', category: 'Diagrams', type: 'JPG', size: '5.6 MB', date: '25/03/2026', downloads: 980, status: 'Public' },
];

const ITEMS_PER_PAGE = 5;

export default function AdminDownloads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [downloads, setDownloads] = useState(MOCK_DOWNLOADS);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // 🌟 নতুন ফাইল আপলোড মোডালের স্টেট
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileCategory, setNewFileCategory] = useState('Lecture Notes');
  const [newFileStatus, setNewFileStatus] = useState('Public');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Filtering Logic
  const filteredDownloads = useMemo(() => {
    return downloads.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [downloads, searchQuery, categoryFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredDownloads.length / ITEMS_PER_PAGE);
  const paginatedDownloads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDownloads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDownloads, currentPage]);

  const confirmDelete = () => {
    if (itemToDelete) {
      setDownloads(downloads.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  // 🌟 ফাইল হ্যান্ডেল করার এবং লিস্টে যোগ করার ফাংশন
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileTitle.trim()) return;

    const newEntry = {
      id: `DL-00${downloads.length + 1}`,
      title: newFileTitle,
      category: newFileCategory,
      type: selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF' : 'PDF',
      size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '2.5 MB',
      date: new Date().toLocaleDateString('en-GB'),
      downloads: 0,
      status: newFileStatus
    };

    setDownloads([newEntry, ...downloads]);
    setNewFileTitle('');
    setSelectedFile(null);
    setIsUploadModalOpen(false);
  };

  const categories = ['All', ...new Set(MOCK_DOWNLOADS.map(d => d.category))];

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
                  Download & PDF Zone
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search Files..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <select 
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 px-3 text-[11px] font-bold text-ink-muted appearance-none focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm min-w-[120px]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle size={14} /> Upload New File
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
                <FileText size={14} className="text-primary" />
                <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredDownloads.length}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Downloads Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-ink/5">
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Serial</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">File Title</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Category</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Type & Size</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase">Upload Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Downloads</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-ink-muted uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedDownloads.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="group hover:bg-white/40 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-bold text-ink-muted">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <FileDown size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-ink leading-tight">{item.title}</span>
                            <span className="text-[10px] font-mono font-bold text-primary uppercase">{item.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink">{item.type}</span>
                          <span className="text-[10px] font-medium text-ink-muted">{item.size}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-ink-muted">{item.date}</td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-black text-ink">{item.downloads.toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                          item.status === 'Public' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 cursor-pointer">
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => setItemToDelete(item.id)}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 cursor-pointer"
                          >
                            <Trash2 size={16} />
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
            {paginatedDownloads.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                      <FileDown size={24} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-primary uppercase">{item.id}</p>
                      <h3 className="text-base font-black text-ink leading-tight">{item.title}</h3>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase",
                    item.status === 'Public' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  )}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-ink/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase flex items-center gap-1.5">
                      <Filter size={10} /> Category
                    </p>
                    <p className="text-xs font-bold text-ink">{item.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase flex items-center gap-1.5">
                      <HardDrive size={10} /> Size
                    </p>
                    <p className="text-xs font-bold text-ink">{item.size} ({item.type})</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase flex items-center gap-1.5">
                      <Calendar size={10} /> Uploaded
                    </p>
                    <p className="text-xs font-bold text-ink">{item.date}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase flex items-center gap-1.5">
                      <Download size={10} /> Downloads
                    </p>
                    <p className="text-xs font-bold text-primary">{item.downloads.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-grow py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <Eye size={14} /> View File
                  </button>
                  <button 
                    onClick={() => setItemToDelete(item.id)}
                    className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center active:scale-95 transition-all border border-rose-100 cursor-pointer"
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
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
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
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Empty State */}
        {filteredDownloads.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <FileText size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No files found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any files matching your current search or category filter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 Upload New File Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 space-y-6 z-10"
            >
              <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                <h3 className="text-xl font-display font-black text-ink">Upload New File</h3>
                <button 
                  onClick={() => setIsUploadModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">File Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. HSC Physics Chapter 1 Note"
                    value={newFileTitle}
                    onChange={(e) => setNewFileTitle(e.target.value)}
                    className="w-full bg-background border border-ink/10 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">Category *</label>
                  <select 
                    value={newFileCategory}
                    onChange={(e) => setNewFileCategory(e.target.value)}
                    className="w-full bg-background border border-ink/10 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="E-Book">E-Book</option>
                    <option value="Question Bank">Question Bank</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Diagrams">Diagrams</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">Status *</label>
                  <select 
                    value={newFileStatus}
                    onChange={(e) => setNewFileStatus(e.target.value)}
                    className="w-full bg-background border border-ink/10 rounded-2xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink-muted uppercase">Select Document (PDF, DOCX, JPG) *</label>
                  <input 
                    type="file"
                    required
                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-ink-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="flex-1 py-3.5 rounded-2xl bg-ink/5 text-ink font-bold text-xs hover:bg-ink/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-primary text-white font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload size={16} /> Upload File
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
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-ink/20 backdrop-blur-sm"
            />
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
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  Are you sure you want to delete this file? This action will permanently remove it from the zone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-4 rounded-2xl bg-ink/5 text-ink font-bold text-sm hover:bg-ink/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 rounded-2xl bg-[#EF4444] text-white font-bold text-sm shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer"
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
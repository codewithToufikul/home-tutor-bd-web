import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Download, FileDown, FileText, BookOpen,
  Loader2, ExternalLink, Calendar, Tag
} from 'lucide-react';
import {
  useGetMyDownloadsQuery,
  useTrackDownloadMutation,
  type DownloadFile,
} from '@/src/services/downloadApi';
import { cn } from '@/src/lib/utils';

const CATEGORIES = ['All', 'Lecture Notes', 'Syllabus', 'E-Book', 'Question Bank', 'Lab Manual', 'Diagrams', 'Study Guide', 'General'];

const FILE_TYPE_COLOR: Record<string, string> = {
  PDF: 'bg-rose-50 text-rose-600',
  DOCX: 'bg-blue-50 text-blue-600',
  DOC: 'bg-blue-50 text-blue-600',
  PPT: 'bg-orange-50 text-orange-600',
  PPTX: 'bg-orange-50 text-orange-600',
  PNG: 'bg-emerald-50 text-emerald-600',
  JPG: 'bg-emerald-50 text-emerald-600',
};

function FileTypeIcon({ type }: { type: string }) {
  return (
    <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0', FILE_TYPE_COLOR[type] || 'bg-ink/5 text-ink-muted')}>
      {type || 'FILE'}
    </div>
  );
}

interface DownloadZoneProps {
  className?: string;
}

export default function DownloadZone({ className }: DownloadZoneProps) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const { data: rawData, isLoading } = useGetMyDownloadsQuery({ category: category === 'All' ? undefined : category });
  const [trackDownload] = useTrackDownloadMutation();

  const files: DownloadFile[] = useMemo(() => {
    if (Array.isArray(rawData)) return rawData;
    if (Array.isArray(rawData?.files)) return rawData.files;
    if (Array.isArray((rawData as any)?.data?.files)) return (rawData as any).data.files;
    if (Array.isArray((rawData as any)?.data)) return (rawData as any).data;
    return [];
  }, [rawData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return files;
    const q = search.toLowerCase();
    return files.filter(f =>
      f.title?.toLowerCase().includes(q) ||
      f.category?.toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q)
    );
  }, [files, search]);

  const handleDownload = async (file: DownloadFile) => {
    await trackDownload(file._id);
    window.open(file.fileUrl, '_blank');
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <FileDown size={20} />
        </div>
        <div>
          <h2 className="text-base font-display font-black text-ink leading-none">Download Zone</h2>
          <p className="text-xs font-medium text-ink-muted mt-0.5">Lecture notes, PDFs & study materials</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/60 backdrop-blur border border-white/40 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3 py-2 rounded-xl text-[11px] font-black transition-all whitespace-nowrap border',
                category === cat
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                  : 'bg-white/60 text-ink-muted border-white/40 hover:border-primary/30 hover:text-primary'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-primary animate-spin" />
          <p className="text-sm font-medium text-ink-muted">Loading files...</p>
        </div>
      )}

      {/* File Grid */}
      {!isLoading && (
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(file => (
                <motion.div
                  key={file._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-lg shadow-ink/5 p-5 flex flex-col gap-3 hover:shadow-xl hover:shadow-ink/8 transition-all"
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <FileTypeIcon type={file.fileType} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-black text-ink leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {file.title}
                      </h3>
                      {file.description && (
                        <p className="text-[11px] font-medium text-ink-muted mt-1 line-clamp-2 leading-relaxed">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      <Tag size={9} /> {file.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-ink-muted">
                      <Calendar size={9} /> {file.createdAt ? new Date(file.createdAt).toLocaleDateString('en-GB') : '—'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-ink-muted">
                      <Download size={9} /> {file.downloadsCount} downloads
                    </span>
                    <span className="text-[10px] font-medium text-ink-muted">{file.fileSize}</span>
                  </div>

                  {/* Download button */}
                  <button
                    onClick={() => handleDownload(file)}
                    className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all font-black text-[11px] uppercase shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                  >
                    <Download size={14} /> Download
                    <ExternalLink size={11} className="opacity-60" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center gap-4 text-center"
            >
              <div className="w-16 h-16 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-base font-black text-ink">No files available</h3>
                <p className="text-sm font-medium text-ink-muted mt-1 max-w-xs">
                  {search ? 'Try a different search term or category.' : 'No study materials have been shared yet. Check back later.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Stats footer */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex items-center gap-2 pt-2 text-[11px] font-medium text-ink-muted">
          <BookOpen size={12} />
          <span>{filtered.length} file{filtered.length !== 1 ? 's' : ''} available in this category</span>
        </div>
      )}
    </div>
  );
}

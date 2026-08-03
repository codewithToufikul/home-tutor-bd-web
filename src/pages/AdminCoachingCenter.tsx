import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, School, Trash2, ChevronLeft, ChevronRight, 
  MapPin, Users, Calendar, BookOpen, 
  GraduationCap, Image as ImageIcon, AlertCircle, ExternalLink
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { CoachingService } from '@/src/services/coachingService';
import { cn } from '@/src/lib/utils';

const TakaIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <span className={cn("inline-flex items-center justify-center font-bold", className)} style={{ fontSize: size }}>
    ৳
  </span>
);

const ITEMS_PER_PAGE = 5;

interface CoachingCenterItem {
  id: string;
  logo: string;
  name: string;
  className: string;
  subject: string;
  admissionCost: string;
  currentStudents: string;
  startDate: string;
  address: string;
  licensePhoto: string;
}

export default function AdminCoachingCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [coachingList, setCoachingList] = useState<CoachingCenterItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filtering Logic
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const items = await CoachingService.list();
        if (!active) return;
        setCoachingList((items as any[]).map((item) => ({
          id: item.id,
          logo: item.logo || `https://picsum.photos/seed/${item.id || 'coaching'}/100/100`,
          name: item.name || 'Coaching Center',
          className: item.className || 'All Classes',
          subject: item.subject || 'All Subjects',
          admissionCost: item.admissionCost || 'N/A',
          currentStudents: item.currentStudents || '0',
          startDate: item.startDate || String(item.createdAt || new Date().toISOString()).slice(0, 10),
          address: item.address || 'Unknown',
          licensePhoto: item.licensePhoto || `https://picsum.photos/seed/${item.id || 'license'}/400/600`,
        })));
      } catch (err) {
        console.error('Failed to load coaching centers:', err);
      }
    })();

    return () => { active = false; };
  }, []);

  const filteredCoaching = useMemo(() => {
    return coachingList.filter(item => {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             item.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
             item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [coachingList, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCoaching.length / ITEMS_PER_PAGE);
  const paginatedCoaching = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCoaching.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCoaching, currentPage]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await CoachingService.remove(itemToDelete);
      setCoachingList(coachingList.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    } catch (err) {
      console.error('Failed to delete coaching center:', err);
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
                  Coaching Center Management
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search Coaching..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-lg py-2 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Total Count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10 shrink-0">
              <School size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredCoaching.length}</span></span>
            </div>
          </div>
        </div>

        {/* Coaching Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center w-12">#</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Logo</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Name</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Class</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Subject</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">A. Cost</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">C. Student</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">S. Date</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Address</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">License Photo</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedCoaching.map((item, index) => (
                    <motion.tr 
                      key={item.id}
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
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-ink/5 shadow-sm">
                          <img src={item.logo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-black text-ink">{item.name}</span>
                      </td>
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted">{item.className}</td>
                      <td className="px-4 py-4 text-xs font-medium text-ink-muted">{item.subject}</td>
                      <td className="px-4 py-4 text-xs font-black text-primary">{item.admissionCost}</td>
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted">{item.currentStudents}</td>
                      <td className="px-4 py-4 text-xs font-medium text-ink-muted">{item.startDate}</td>
                      <td className="px-4 py-4 text-xs font-medium text-ink-muted max-w-[150px] truncate" title={item.address}>
                        {item.address}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => setSelectedLicense(item.licensePhoto)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase hover:bg-primary/20 transition-all"
                        >
                          <ImageIcon size={12} /> View
                        </button>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => setItemToDelete(item.id)}
                          className="p-2 rounded-lg bg-[#FB7185] text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                        >
                          <Trash2 size={14} />
                        </button>
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
            {paginatedCoaching.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/40 shadow-md shrink-0">
                    <img src={item.logo} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase">#{item.id}</p>
                    <h3 className="text-base font-black text-ink leading-tight">{item.name}</h3>
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <MapPin size={12} className="text-primary" />
                      <p className="text-[11px] font-medium">{item.address}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-ink/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Class</p>
                    <p className="text-xs font-bold text-ink">{item.className}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Cost</p>
                    <p className="text-xs font-black text-primary">{item.admissionCost}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Students</p>
                    <p className="text-xs font-bold text-ink">{item.currentStudents}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Start Date</p>
                    <p className="text-xs font-bold text-ink">{item.startDate}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setSelectedLicense(item.licensePhoto)}
                    className="flex-1 py-3 rounded-2xl bg-primary/10 text-primary text-[10px] font-black uppercase flex items-center justify-center gap-2"
                  >
                    <ImageIcon size={14} /> License
                  </button>
                  <button 
                    onClick={() => setItemToDelete(item.id)}
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
        {filteredCoaching.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <School size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No coaching centers found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any coaching centers matching your search criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* License Photo Modal */}
      <AnimatePresence>
        {selectedLicense && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLicense(null)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-white/40 overflow-hidden"
            >
              <div className="p-6 border-b border-ink/5 flex items-center justify-between bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                <h3 className="text-lg font-black text-ink">License Photo</h3>
                <button 
                  onClick={() => setSelectedLicense(null)}
                  className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center text-ink-muted hover:text-primary transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <img 
                  src={selectedLicense} 
                  alt="License" 
                  className="w-full h-auto rounded-2xl shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 border-t border-ink/5 bg-white/80 backdrop-blur-xl flex justify-end">
                <button 
                  onClick={() => setSelectedLicense(null)}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-black text-xs uppercase shadow-lg shadow-primary/20"
                >
                  Close Preview
                </button>
              </div>
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
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl border border-white/40 p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black text-ink">Delete Center?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  Are you sure you want to delete this coaching center? This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
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

function X({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

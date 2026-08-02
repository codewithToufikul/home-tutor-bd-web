import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Clock, CheckSquare, Filter, ChevronLeft, ChevronRight, 
  User, Phone, MapPin, BookOpen, Calendar,
  CheckCircle2, AlertCircle, X
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';

const MOCK_HIRE_REQUESTS = [
  { 
    id: 'REQ-H001', 
    tutorName: 'Jane Smith', 
    tutorId: 'TUTOR-002', 
    tutorArea: 'Chittagong, Bangladesh',
    tutorPhone: '8801987654321',
    subject: 'Math',
    category: 'School',
    salary: '4000৳',
    tuitionStart: 'Start March',
    guardianName: 'Mrs. Johnson',
    guardianId: 'PARENT-002',
    guardianArea: 'Chittagong, Bangladesh',
    guardianPhone: '8801712345678',
    applyDate: '1/19/2025 11:52:31 PM',
    status: 'pending'
  },
  { 
    id: 'REQ-H002', 
    tutorName: 'Alice Brown', 
    tutorId: 'TUTOR-003', 
    tutorArea: 'Sylhet, Bangladesh',
    tutorPhone: '8801912345678',
    subject: 'Grammar',
    category: 'Home',
    salary: '6000৳',
    tuitionStart: 'Start April',
    guardianName: 'Mr. Ahmed',
    guardianId: 'PARENT-003',
    guardianArea: 'Sylhet, Bangladesh',
    guardianPhone: '8801934567890',
    applyDate: '1/19/2025 11:52:31 PM',
    status: 'pending'
  },
];

const ITEMS_PER_PAGE = 5;

export default function AdminHirePending() {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState(MOCK_HIRE_REQUESTS);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtering Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesTab = req.status === activeTab;
      const matchesSearch = req.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           req.tutorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           req.guardianName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [requests, activeTab, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  const handleApprove = (id: string) => {
    setRequests(requests.map(req => req.id === id ? { ...req, status: 'approved' } : req));
  };

  const handleCancel = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
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
                  Hire Tutor Request Pending
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-48 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search..."
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
              <Clock size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredRequests.length}</span></span>
            </div>
          </div>
        </div>

        {/* Tab System */}
        <div className="flex gap-4 p-1.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-lg shadow-ink/5 max-w-md mx-auto md:mx-0">
          <button 
            onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300",
              activeTab === 'pending' 
                ? "bg-[#F59E0B] text-white shadow-lg shadow-amber-500/20" 
                : "text-ink-muted hover:bg-ink/5"
            )}
          >
            Pending
          </button>
          <button 
            onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
            className={cn(
              "flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300",
              activeTab === 'approved' 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-ink-muted hover:bg-ink/5"
            )}
          >
            Approve
          </button>
        </div>

        {/* Requests Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#EF4444] text-white">
                  <th className="px-4 py-4 text-[10px] font-black uppercase text-center w-12">#</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    <div className="flex flex-col">
                      <span>Tutor Name</span>
                      <span className="opacity-70">Tutor Id</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    <div className="flex flex-col">
                      <span>Tutor Area</span>
                      <span className="opacity-70">Tutor Phone</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    <div className="flex flex-col">
                      <span>Job Subject</span>
                      <span className="opacity-70">Job Category</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    <div className="flex flex-col">
                      <span>Job Salary</span>
                      <span className="opacity-70">Tuition Start</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    <div className="flex flex-col">
                      <span>Guardian Name</span>
                      <span className="opacity-70">Guardian Id</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">
                    <div className="flex flex-col">
                      <span>Guardian Area</span>
                      <span className="opacity-70">Guardian Phone</span>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase">A. Date</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedRequests.map((req, index) => (
                    <motion.tr 
                      key={req.id}
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
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-ink">{req.tutorName}</span>
                          <span className="text-[10px] font-bold text-ink-muted/60 uppercase">{req.tutorId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-ink-muted">{req.tutorArea}</span>
                          <span className="text-[10px] font-bold text-primary">{req.tutorPhone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-ink-muted">{req.subject}</span>
                          <span className="text-[10px] font-medium text-ink-muted/60">{req.category}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-primary">{req.salary}</span>
                          <span className="text-[10px] font-medium text-ink-muted/60">{req.tuitionStart}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-ink">{req.guardianName}</span>
                          <span className="text-[10px] font-bold text-ink-muted/60 uppercase">{req.guardianId}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-ink-muted">{req.guardianArea}</span>
                          <span className="text-[10px] font-bold text-primary">{req.guardianPhone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[10px] font-medium text-ink-muted leading-tight">
                        {req.applyDate}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-center gap-1.5">
                          {req.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleApprove(req.id)}
                                className="w-full px-2 py-1.5 rounded-lg bg-[#10B981] text-white text-[9px] font-black uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleCancel(req.id)}
                                className="w-full px-2 py-1.5 rounded-lg bg-[#FB7185] text-white text-[9px] font-black uppercase shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <span className="flex items-center gap-1 text-primary font-black text-[9px] uppercase">
                              <CheckCircle2 size={12} /> Approved
                            </span>
                          )}
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
            {paginatedRequests.map((req, index) => (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">
                      #{(currentPage - 1) * ITEMS_PER_PAGE + index + 1} • {req.tutorId}
                    </p>
                    <h3 className="text-lg font-black text-ink leading-tight">{req.tutorName}</h3>
                    <div className="flex items-center gap-1.5 text-ink-muted">
                      <Phone size={12} className="text-primary" />
                      <p className="text-[11px] font-bold">{req.tutorPhone}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-ink/5 rounded-lg text-[10px] font-black text-ink-muted uppercase">
                      {req.category}
                    </span>
                    <p className="text-sm font-black text-primary">{req.salary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-ink/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Subject</p>
                    <p className="text-xs font-bold text-ink">{req.subject}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Guardian</p>
                    <p className="text-xs font-bold text-ink">{req.guardianName}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Tutor Area</p>
                    <p className="text-xs font-medium text-ink-muted">{req.tutorArea}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {req.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 py-3 rounded-2xl bg-[#10B981] text-white text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleCancel(req.id)}
                        className="flex-1 py-3 rounded-2xl bg-[#FB7185] text-white text-[10px] font-black uppercase shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="w-full py-3 rounded-2xl bg-primary/10 text-primary flex items-center justify-center gap-2 text-[10px] font-black uppercase">
                      <CheckCircle2 size={16} /> Approved
                    </div>
                  )}
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
        {filteredRequests.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <AlertCircle size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No requests found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any {activeTab} hire requests matching your current search.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

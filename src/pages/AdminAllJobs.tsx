import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Briefcase, Trash2, ChevronLeft, ChevronRight, 
  MapPin, Clock, BookOpen, GraduationCap,
  Users, Globe, AlertCircle, CheckCircle2, XCircle
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useGetAllTuitionJobsQuery, useApproveJobMutation, useDeleteJobMutation } from '@/src/services/adminApi.ts';

const ITEMS_PER_PAGE = 10;

export default function AdminAllJobs() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const { data: jobsData, isLoading, refetch } = useGetAllTuitionJobsQuery(undefined);
  const [approveJob] = useApproveJobMutation();
  const [deleteJobMutation] = useDeleteJobMutation();

  // Normalize backend jobs to fit table view
  const rawJobs: any[] = useMemo(() => {
    const items = (jobsData as any)?.data ?? jobsData ?? [];
    if (!Array.isArray(items)) return [];
    return items.map((j: any) => ({
      ...j,
      id: String(j._id || j.id || ''),
      customId: j.customId || '',
      address: typeof j.location === 'object' ? `${j.location?.area || ''}, ${j.location?.district || ''}` : (j.location || j.address || ''),
      salary: j.salary || 0,
      perWeek: Array.isArray(j.tutoringDays) ? j.tutoringDays.join(', ') : (j.perWeek || 'N/A'),
      className: j.studentClass || j.className || 'N/A',
      subject: Array.isArray(j.subjects) ? j.subjects.join(', ') : (j.subject || 'All'),
      gender: j.genderPreference || j.gender || 'Any',
      medium: j.medium || 'N/A',
      category: j.category || j.medium || 'General',
      approvalStatus: j.approvalStatus || 'Pending',
    }));
  }, [jobsData]);

  // Filtering + Tab Logic
  const filteredJobs = useMemo(() => {
    return rawJobs.filter(job => {
      const matchesSearch =
        (job.customId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job._id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location?.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.location?.area || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.subjects || []).join(',').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.studentClass || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || job.approvalStatus === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [rawJobs, searchQuery, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  const handleApprove = async (id: string) => {
    try { await approveJob({ id, approvalStatus: 'Approved' }).unwrap(); refetch(); }
    catch (err) { console.error('Approve failed:', err); }
  };
  const handleReject = async (id: string) => {
    try { await approveJob({ id, approvalStatus: 'Rejected' }).unwrap(); refetch(); }
    catch (err) { console.error('Reject failed:', err); }
  };
  const confirmDelete = async () => {
    if (jobToDelete) {
      try { await deleteJobMutation(jobToDelete).unwrap(); refetch(); }
      catch (err) { console.error('Delete failed:', err); }
      setJobToDelete(null);
    }
  };

  const getSubjectColor = (subject?: string) => {
    if (!subject || subject === 'All') return 'bg-emerald-500 text-white';
    if (subject.includes(',')) return 'bg-slate-600 text-white';
    return 'bg-sky-400 text-white';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Approved') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
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
                  All Tuition Jobs
                </h2>
              </div>

              {/* Search Bar */}
              <div className="relative w-32 md:w-64 group shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-muted group-focus-within:text-primary transition-colors">
                  <Search size={14} />
                </div>
                <input 
                  type="text"
                  placeholder="Search Tuition Code..."
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
              <Briefcase size={14} className="text-primary" />
              <span className="text-[11px] font-bold text-ink-muted">Total: <span className="text-primary">{filteredJobs.length}</span></span>
            </div>
          </div>
        </div>

        {/* Jobs Table Section */}
        <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center w-12">#</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Address</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Salary</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Per week</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Class</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">Subject</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Tui.Code</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Gender</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase">Medium</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">Category</th>
                  <th className="px-4 py-5 text-[10px] font-black uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                <AnimatePresence mode="popLayout">
                  {paginatedJobs.map((job, index) => (
                    <motion.tr 
                      key={job.id}
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
                      <td className="px-4 py-4 text-xs font-medium text-ink-muted max-w-[150px] truncate" title={job.address}>
                        {job.address}
                      </td>
                      <td className="px-4 py-4 text-xs font-black text-primary">{job.salary}</td>
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted">{job.perWeek}</td>
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted">{job.className}</td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn("inline-block px-2 py-1 rounded text-[9px] font-black uppercase", getSubjectColor(job.subject))}>
                          {job.subject}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs font-mono font-black text-primary">{job.customId || job.id.slice(-6)}</td>
                      <td className="px-4 py-4 text-xs font-bold text-ink-muted">{job.gender}</td>
                      <td className="px-4 py-4 text-[10px] font-bold text-ink-muted leading-tight max-w-[120px]">
                        {job.medium}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-1 bg-sky-500 text-white text-[9px] font-black uppercase rounded">
                          {job.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button 
                          onClick={() => setJobToDelete(job.id)}
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
            {paginatedJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-lg shadow-ink/5 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase">{job.id}</p>
                    <div className="flex items-center gap-1.5 text-ink">
                      <MapPin size={14} className="text-primary shrink-0" />
                      <h3 className="text-sm font-black leading-tight">{job.address}</h3>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 rounded-lg text-[10px] font-black text-primary uppercase">
                    {job.className}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-ink/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Salary</p>
                    <p className="text-xs font-black text-primary flex items-center gap-1">
                      <TakaIcon size={12} />
                      {job.salary}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Per Week</p>
                    <p className="text-xs font-bold text-ink">{job.perWeek}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-[10px] font-black text-ink-muted uppercase">Subject</p>
                    <p className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase", getSubjectColor(job.subject))}>
                      {job.subject}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <div className="flex-grow flex flex-col gap-1">
                    <p className="text-[9px] font-black text-ink-muted uppercase">Medium: <span className="text-ink">{job.medium}</span></p>
                    <p className="text-[9px] font-black text-ink-muted uppercase">Gender: <span className="text-ink">{job.gender}</span></p>
                  </div>
                  <button 
                    onClick={() => setJobToDelete(job.id)}
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
        {filteredJobs.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <Briefcase size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-ink">No jobs found</h3>
              <p className="text-sm font-medium text-ink-muted max-w-xs">
                We couldn't find any tuition jobs matching your search criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {jobToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setJobToDelete(null)}
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
                <h3 className="text-2xl font-display font-black text-ink">Delete Job?</h3>
                <p className="text-sm font-medium text-ink-muted leading-relaxed">
                  Are you sure you want to delete this tuition job? This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setJobToDelete(null)}
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

function TakaIcon({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <div 
      style={{ width: size, height: size, fontSize: size * 0.9 }} 
      className={cn("flex items-center justify-center font-black leading-none", className)}
    >
      ৳
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, CheckCircle2, AlertCircle, ChevronLeft, 
  ChevronRight, BookOpen, GraduationCap, MapPin, Clock
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { useGetPendingJobsQuery, useApproveJobMutation } from '@/src/services/adminApi';

const ITEMS_PER_PAGE = 5;

export default function AdminJobsApprove() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: jobsData, isLoading } = useGetPendingJobsQuery(undefined);
  const [approveJobMutation] = useApproveJobMutation();

  const requests = useMemo(() => {
    const raw = (jobsData as { data?: unknown[] } | undefined)?.data ?? [];
    return (raw as any[]).map((j) => ({
      id: j._id || j.id,
      tutorName: j.postedBy?.name || 'Guardian User',
      tutorArea: j.postedBy?.email || 'Dhaka',
      tutorId: `JOB-${(j._id || j.id).slice(-4).toUpperCase()}`,
      className: j.studentClass || 'Class N/A',
      subject: Array.isArray(j.subjects) ? j.subjects.join(', ') : j.subject || 'All Subjects',
      salary: j.salary || 0,
      medium: j.medium || 'Bangla',
      perWeek: j.daysPerWeek ? `${j.daysPerWeek} Days` : '3 Days',
      jobArea: `${j.location?.area || j.area || ''}, ${j.location?.district || j.district || ''}`,
      status: j.approvalStatus === 'Approved' ? 'approved' : 'pending',
    }));
  }, [jobsData]);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        req.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.jobArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.tutorId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = activeTab === 'pending' ? req.status === 'pending' : req.status === 'approved';
      return matchesSearch && matchesTab;
    });
  }, [requests, searchQuery, activeTab]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRequests, currentPage]);

  const handleApprove = async (id: string) => {
    try {
      await approveJobMutation({ id, approvalStatus: 'Approved' }).unwrap();
    } catch (error) {
      console.error('Failed to approve job:', error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await approveJobMutation({ id, approvalStatus: 'Rejected' }).unwrap();
    } catch (error) {
      console.error('Failed to reject job:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-black text-ink">Job Approvals</h1>
            <p className="text-sm font-medium text-ink-muted">Approve or reject tuition job postings submitted by parents/students.</p>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/40 shadow-sm">
            <button
              onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'pending'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Pending Approval
            </button>
            <button
              onClick={() => { setActiveTab('approved'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'approved'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Approved History
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted">
            <Search size={18} />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by job ID, subject, or location..."
            className="w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl py-4 pl-14 pr-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-white/40 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-2xl shadow-ink/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-ink/5 bg-ink/5">
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Posted By</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Class</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Subject</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Salary</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Medium</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest">Location</th>
                    <th className="px-6 py-5 text-[11px] font-black text-ink-muted uppercase tracking-widest text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  <AnimatePresence mode="popLayout">
                    {paginatedRequests.map((req) => (
                      <motion.tr 
                        key={req.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/60 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-black text-primary">{req.tutorId}</p>
                            <p className="text-sm font-bold text-ink">{req.tutorName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-ink">{req.className}</td>
                        <td className="px-6 py-4 text-xs font-bold text-ink">{req.subject}</td>
                        <td className="px-6 py-4 text-xs font-black text-primary">৳{req.salary}</td>
                        <td className="px-6 py-4 text-xs font-bold text-ink">{req.medium}</td>
                        <td className="px-6 py-4 text-xs font-medium text-ink-muted">{req.jobArea}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {req.status === 'pending' ? (
                              <>
                                <button 
                                  onClick={() => handleApprove(req.id)}
                                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleCancel(req.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#EF4444] text-white text-[10px] font-black uppercase shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="flex items-center gap-1.5 text-primary font-black text-[10px] uppercase">
                                <CheckCircle2 size={14} /> Approved
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
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-10 h-10 rounded-xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center text-ink-muted hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="px-4 py-2 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl shadow-sm text-sm font-bold text-ink-muted">
              Page <span className="text-primary">{currentPage}</span> of {totalPages}
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

        {filteredRequests.length === 0 && !isLoading && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted">
              <AlertCircle size={40} />
            </div>
            <h3 className="text-xl font-black text-ink">No requests found</h3>
            <p className="text-sm font-medium text-ink-muted max-w-xs">
              No {activeTab} job postings found matching your query.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

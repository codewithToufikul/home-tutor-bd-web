import { motion } from 'motion/react';
import { 
  Briefcase, 
  Clock, 
  MapPin, 
  ChevronRight,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { cn } from '@/src/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { ApplicationService } from '@/src/services/applicationService.ts';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionJob } from '@/src/types';

export default function TutorAppliedJobs() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplied = async () => {
      if (!user?.uid) {
        setAppliedJobs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const apps = await ApplicationService.listForTutor(user.uid);
        const allJobs = await TuitionService.list();
        const jobsById: Record<string, TuitionJob> = {};
        ((allJobs as TuitionJob[]) || []).forEach((j) => { if (j && j.id) jobsById[j.id] = j; });

        const mapped = (Array.isArray(apps) ? apps : []).map((a: any) => {
          const job = jobsById[a.jobId];
          return {
            id: a.jobId || a.id || '',
            title: job ? job.medium + ' Tuition' : (a.title || 'Tuition Opportunity'),
            location: job ? `${job.area}, ${job.location}` : (a.location || 'Unknown'),
            salary: job ? `${job.salary} ৳/mo` : (a.salary ? `${a.salary} ৳` : 'N/A'),
            status: a.status ?? 'pending',
            date: a.createdAt || '',
            category: job?.category || a.category || 'General',
            daysPerWeek: job?.tutoringDays || a.daysPerWeek || 'N/A'
          };
        });

        setAppliedJobs(mapped);
      } catch (error) {
        console.error('Failed to load applied jobs:', error);
        setAppliedJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplied();
  }, [user]);

  const filteredJobs = appliedJobs.filter(job => {
    const matchesFilter = activeFilter === 'All' || job.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const STATUS_FILTERS = ['All', 'Pending', 'Shortlisted', 'Hired', 'Rejected'];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-500 border-amber-100';
      case 'Shortlisted': return 'bg-emerald-50 text-emerald-500 border-emerald-100';
      case 'Hired': return 'bg-primary/10 text-primary border-primary/20';
      case 'Rejected': return 'bg-rose-50 text-rose-500 border-rose-100';
      default: return 'bg-ink/5 text-ink-muted border-ink/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={14} />;
      case 'Shortlisted': return <CheckCircle2 size={14} />;
      case 'Hired': return <CheckCircle2 size={14} />;
      case 'Rejected': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <TutorLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink">
              Applied Jobs
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              Track and manage all your job applications in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-ink/5 shadow-sm">
              <p className="text-[10px] font-black text-ink-muted uppercase">Total Applied</p>
              <p className="text-xl font-black text-primary">{appliedJobs.length}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl border border-ink/5 shadow-sm">
              <p className="text-[10px] font-black text-ink-muted uppercase">Shortlisted</p>
              <p className="text-xl font-black text-emerald-500">{appliedJobs.filter(j => j.status.toLowerCase() === 'shortlisted').length}</p>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={20} />
            <input 
              type="text" 
              placeholder="Search by job title or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-ink/5 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all whitespace-nowrap",
                  activeFilter === filter 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white text-ink-muted border border-ink/5 hover:bg-primary/5 hover:text-primary"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 hover:bg-white transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <Briefcase size={28} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-black text-ink group-hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1.5",
                          getStatusStyles(job.status)
                        )}>
                          {getStatusIcon(job.status)}
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold text-ink-muted">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {job.location}</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> {job.daysPerWeek}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-primary" /> Applied {job.date}</span>
                        <span className="px-2 py-0.5 bg-ink/5 rounded text-[10px] uppercase">{job.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-8 pt-4 lg:pt-0 border-t lg:border-t-0 border-ink/5">
                    <div className="text-left lg:text-right">
                      <p className="text-lg font-black text-primary">{job.salary}</p>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Job ID: {job.id}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-6 py-3 bg-ink/5 text-ink font-black text-xs uppercase rounded-xl hover:bg-ink hover:text-white transition-all">
                        Details
                      </button>
                      <button className="p-3 text-ink-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 text-center space-y-4">
              <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto">
                <Search size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink">No applications found</h3>
                <p className="text-ink-muted font-medium">Try adjusting your search or filters to find what you're looking for.</p>
              </div>
              <button 
                onClick={() => { setActiveFilter('All'); setSearchQuery(''); }}
                className="text-primary font-black text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination Placeholder */}
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button className="w-10 h-10 rounded-xl border border-ink/5 bg-white flex items-center justify-center text-ink-muted hover:text-primary transition-all disabled:opacity-50" disabled>
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/20">1</button>
            <button className="w-10 h-10 rounded-xl border border-ink/5 bg-white flex items-center justify-center text-ink font-black text-sm hover:bg-primary/5 hover:text-primary transition-all">2</button>
            <button className="w-10 h-10 rounded-xl border border-ink/5 bg-white flex items-center justify-center text-ink-muted hover:text-primary transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </TutorLayout>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, MapPin, BookOpen, GraduationCap, 
  Calendar, Clock, ChevronRight, Search, Filter, 
  PlayCircle, User, Layout, CheckSquare, Square, ChevronDown,
  ChevronLeft, Home
} from 'lucide-react';
import type { TuitionJob } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { AREAS, CLASSES, CATEGORIES_DATA } from '@/src/constants';
import { useGetTuitionJobsQuery } from '@/src/services/tuitionApi';

const DISTRICTS = ['Dhaka', 'Sylhet', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [searchId, setSearchId] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tuitionType, setTuitionType] = useState('All');
  const [genderPref, setGenderPref] = useState('All');
  const [district, setDistrict] = useState('All');
  const [area, setArea] = useState('All');
  const [category, setCategory] = useState(initialCategory);
  const [studentClass, setStudentClass] = useState('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchId), 350);
    return () => window.clearTimeout(timeout);
  }, [searchId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tuitionType, genderPref, district, area, category, studentClass, itemsPerPage]);

  // ── RTK Query replaces SearchService/Firestore pagination ──────────────
  const queryParams = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(district !== 'All' ? { district } : {}),
    ...(area !== 'All' ? { area } : {}),
    ...(category !== 'All' ? { subject: category } : {}),
    ...(studentClass !== 'All' ? { studentClass } : {}),
    ...(tuitionType !== 'All' ? { tuitionType } : {}),
    ...(genderPref !== 'All' ? { gender: genderPref } : {}),
    page: currentPage,
    limit: itemsPerPage,
  }), [debouncedSearch, district, area, category, studentClass, tuitionType, genderPref, currentPage, itemsPerPage]);

  const { data: jobsData, isLoading, isFetching } = useGetTuitionJobsQuery(queryParams);

  const jobs: TuitionJob[] = useMemo(() => {
    const raw = (jobsData as any)?.data ?? [];
    if (!Array.isArray(raw)) return [];

    return raw.map((j: any) => {
      const locArea = typeof j.location === 'object' ? String(j.location?.area || '') : String(j.area || '');
      const locDistrict = typeof j.location === 'object' ? String(j.location?.district || '') : String(typeof j.location === 'string' ? j.location : '');
      return {
        ...j,
        id: String(j._id || j.id || ''),
        location: locDistrict,
        area: locArea,
        studentClass: j.studentClass || 'N/A',
        subjects: Array.isArray(j.subjects) ? j.subjects : [j.subject || 'General'],
        salary: Number(j.salary || 0),
        medium: j.medium || 'Bangla Medium',
        tuitionType: j.tuitionType || 'Home Tuition',
        genderPreference: j.genderPreference || 'Any',
        tutoringDays: Array.isArray(j.tutoringDays) ? j.tutoringDays : [],
        createdAt: j.createdAt || new Date().toISOString(),
      };
    }) as TuitionJob[];
  }, [jobsData]);

  const totalItems: number = (jobsData as any)?.meta?.total ?? jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const hasMore = currentPage < totalPages;
  // Sync category state with URL param if it changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
    } else {
      setCategory('All');
    }
    setCurrentPage(1);
  }, [searchParams]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setCurrentPage(1);
    if (val === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', val);
    }
    setSearchParams(searchParams);
  };

  // Jobs come filtered from the backend via RTK Query
  const activeJobs = jobs;

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-sm text-ink-muted font-medium">
            Showing <span className="text-ink font-bold">{activeJobs.length > 0 ? 1 : 0}-{activeJobs.length}</span> of <span className="text-ink font-bold">{activeJobs.length}</span> jobs
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">Show:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-ink/10 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filter - Fixed Layout */}
          <aside className="lg:w-80 w-full space-y-6 lg:sticky lg:top-28">
            <div className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-6">
              <h2 className="text-lg font-display font-bold text-ink border-b border-ink/5 pb-3">Advance Filter</h2>
              
              {/* Search By Job Id */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Search By Job Id</label>
                <input 
                  type="text"
                  placeholder="Enter job id here..."
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink/30"
                />
              </div>

              {/* Tutor Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Tutor Preference</label>
                <div className="flex bg-background p-1 rounded-xl border border-ink/10">
                  {['All', 'Male', 'Female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => {
                        setGenderPref(g);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        genderPref === g ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select District */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Select District</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <select 
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Districts</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Select Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Select Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <select 
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Areas</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Select Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Select Categories</label>
                <div className="relative">
                  <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <select 
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES_DATA.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Select Class */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Select Class</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <select 
                    value={studentClass}
                    onChange={(e) => {
                      setStudentClass(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Classes</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Tuition Type */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-primary uppercase">Tuition Type</label>
                <div className="space-y-2">
                  {[
                    { id: 'All', label: 'All Tuition' },
                    { id: 'Home Tuition', label: 'Home Tuition' },
                    { id: 'Online Tuition', label: 'Online Tuition' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setTuitionType(type.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "flex items-center gap-2.5 w-full p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                        tuitionType === type.id ? "bg-primary text-white shadow-sm" : "bg-background border border-ink/5 text-ink-muted hover:text-ink"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center transition-colors",
                        tuitionType === type.id ? "bg-white text-primary" : "bg-white border border-ink/20"
                      )}>
                        {tuitionType === type.id && <CheckSquare size={12} />}
                      </div>
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Job Listings - Clean 2-Column Grid Layout */}
          <main className="flex-grow w-full space-y-6">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-ink/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden group flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="px-6 py-4 flex justify-between items-center border-b border-ink/5 bg-primary/5">
                        <div className="flex items-center gap-2 text-ink font-bold text-xs truncate">
                          <MapPin size={16} className="text-primary shrink-0" />
                          <span className="truncate">{typeof job.area === "string" ? job.area : ""}{job.area && job.location ? ", " : ""}{typeof job.location === "string" ? job.location : (typeof job.location === "object" ? `${(job.location as any)?.area || ""}, ${(job.location as any)?.district || ""}` : "")}</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-white border border-primary/20 text-primary font-bold text-[11px] whitespace-nowrap shadow-sm">
                          ID: {job.id}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        <h3 className="text-lg font-display font-bold text-ink leading-tight group-hover:text-primary transition-colors line-clamp-1">
                          Tutor Needed For {job.medium}
                        </h3>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold">
                            <Home size={12} />
                            {job.tuitionType}
                          </div>
                          <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1 rounded-lg text-xs font-bold">
                            <Clock size={12} />
                            Active Job
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-ink-muted">Medium</span>
                            <p className="font-bold text-ink truncate">{job.medium}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-ink-muted">Class</span>
                            <p className="font-bold text-ink truncate">{job.studentClass}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-ink-muted">Preferred Tutor</span>
                            <p className="font-bold text-ink truncate">{job.genderPreference || 'Any'}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-ink-muted">Salary</span>
                            <p className="font-bold text-primary text-sm">
                              {job.salary.toLocaleString()} ৳<span className="text-[10px] text-ink-muted">/mo</span>
                            </p>
                          </div>
                        </div>

                        {/* Subjects */}
                        <div className="space-y-1.5 pt-2 border-t border-ink/5">
                          <span className="text-[10px] font-bold uppercase text-ink-muted">Subjects</span>
                          <div className="flex flex-wrap gap-1">
                            {job.subjects?.map(sub => (
                              <span key={sub} className="bg-secondary text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-background border-t border-ink/5 flex items-center justify-between gap-4 mt-auto">
                      <p className="text-[11px] text-ink-muted font-medium">
                        {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <Link 
                        to={`/job/${job.id}`}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {isLoading ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-ink/5 shadow-sm">
                <p className="text-ink-muted font-medium">Loading jobs...</p>
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-ink/5 shadow-sm space-y-4">
                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-ink">No jobs found</h3>
                <p className="text-ink-muted max-w-xs mx-auto text-xs">Try changing your filters to see more tuition opportunities.</p>
              </div>
            ) : (
              /* Pagination */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-ink/5">
                <p className="text-sm text-ink-muted font-medium order-2 sm:order-1">
                  Page <span className="text-ink font-bold">{currentPage}</span> · {activeJobs.length} loaded results
                </p>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center text-ink-muted hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={handleLoadMore}
                    disabled={!hasMore}
                    className="px-4 py-2 rounded-xl border border-primary/20 bg-primary/5 text-sm font-bold text-primary disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Load More
                  </button>

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasMore}
                    className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center text-ink-muted hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

function CustomHomeIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
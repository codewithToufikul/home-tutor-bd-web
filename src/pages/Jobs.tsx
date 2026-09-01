import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, MapPin, BookOpen, GraduationCap, 
  Clock, Search, Filter, Layout, CheckSquare, ChevronDown,
  ChevronLeft, ChevronRight, Home, X, RotateCcw, Sparkles,
  SlidersHorizontal, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import type { TuitionJob } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { DISTRICTS, DISTRICT_WISE_AREAS, CLASSES, CATEGORIES_DATA, MEDIUMS } from '@/src/constants';
import { useGetTuitionJobsQuery } from '@/src/services/tuitionApi';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [searchId, setSearchId] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tuitionType, setTuitionType] = useState('All');
  const [genderPref, setGenderPref] = useState('All');
  const [district, setDistrict] = useState('All');
  const [area, setArea] = useState('All');
  const [category, setCategory] = useState(initialCategory);
  const [studentClass, setStudentClass] = useState('All');
  const [salaryRange, setSalaryRange] = useState('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce search query
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchId), 300);
    return () => window.clearTimeout(timeout);
  }, [searchId]);

  // Reset area when district changes
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setArea('All');
    setCurrentPage(1);
  };

  // Get available areas based on selected district
  const availableAreas = useMemo(() => {
    if (district !== 'All' && DISTRICT_WISE_AREAS[district]) {
      return DISTRICT_WISE_AREAS[district];
    }
    // If 'All' district is selected, aggregate top areas
    return DISTRICT_WISE_AREAS['Dhaka'] || [];
  }, [district]);

  // Parse salary range filter for backend query
  const salaryBounds = useMemo(() => {
    if (salaryRange === '< 3000') return { maxSalary: 3000 };
    if (salaryRange === '3000-5000') return { minSalary: 3000, maxSalary: 5000 };
    if (salaryRange === '5000-8000') return { minSalary: 5000, maxSalary: 8000 };
    if (salaryRange === '8000-12000') return { minSalary: 8000, maxSalary: 12000 };
    if (salaryRange === '12000+') return { minSalary: 12000 };
    return {};
  }, [salaryRange]);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tuitionType, genderPref, district, area, category, studentClass, salaryRange, itemsPerPage]);

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

  // Check if any filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.trim() !== '' ||
      tuitionType !== 'All' ||
      genderPref !== 'All' ||
      district !== 'All' ||
      area !== 'All' ||
      category !== 'All' ||
      studentClass !== 'All' ||
      salaryRange !== 'All'
    );
  }, [debouncedSearch, tuitionType, genderPref, district, area, category, studentClass, salaryRange]);

  const resetAllFilters = () => {
    setSearchId('');
    setDebouncedSearch('');
    setTuitionType('All');
    setGenderPref('All');
    setDistrict('All');
    setArea('All');
    setCategory('All');
    setStudentClass('All');
    setSalaryRange('All');
    setCurrentPage(1);
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

  // ── RTK Query Backend Search & Filter ──────────────
  const queryParams = useMemo(() => ({
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(district !== 'All' ? { district } : {}),
    ...(area !== 'All' ? { area } : {}),
    ...(category !== 'All' ? { subject: category } : {}),
    ...(studentClass !== 'All' ? { studentClass } : {}),
    ...(tuitionType !== 'All' ? { tuitionType } : {}),
    ...(genderPref !== 'All' ? { genderPreference: genderPref } : {}),
    ...salaryBounds,
    page: currentPage,
    limit: itemsPerPage,
  }), [debouncedSearch, district, area, category, studentClass, tuitionType, genderPref, salaryBounds, currentPage, itemsPerPage]);

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
        _id: String(j._id || j.id || ''),
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
  const activeJobs = jobs;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Header & Mobile Filter Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-ink">
              Available Tuition Jobs
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-medium mt-1">
              Showing <span className="text-ink font-bold">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-primary font-bold">{totalItems}</span> matching tuitions
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-ink/10 rounded-xl text-xs font-bold text-ink shadow-sm cursor-pointer"
            >
              <SlidersHorizontal size={14} className="text-primary" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-ink-muted">Per Page:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-ink/10 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-ink/5 shadow-sm">
            <span className="text-xs font-bold text-ink-muted flex items-center gap-1.5 mr-1">
              <Filter size={14} className="text-primary" /> Active Filters:
            </span>

            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                "{debouncedSearch}"
                <button onClick={() => setSearchId('')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {genderPref !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Tutor: {genderPref}
                <button onClick={() => setGenderPref('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {district !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                District: {district}
                <button onClick={() => handleDistrictChange('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {area !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Area: {area}
                <button onClick={() => setArea('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {category !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Category: {category}
                <button onClick={() => handleCategoryChange('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {studentClass !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Class: {studentClass}
                <button onClick={() => setStudentClass('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {salaryRange !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Salary: {salaryRange} ৳
                <button onClick={() => setSalaryRange('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {tuitionType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Type: {tuitionType}
                <button onClick={() => setTuitionType('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-black text-rose-500 hover:text-rose-700 transition-colors cursor-pointer px-2 py-1"
            >
              <RotateCcw size={12} /> Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Sidebar Filter */}
          <aside className={cn(
            "lg:w-80 w-full space-y-6 lg:sticky lg:top-28",
            isMobileFilterOpen ? "block" : "hidden lg:block"
          )}>
            <div className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                <h2 className="text-base font-display font-bold text-ink flex items-center gap-2">
                  <Filter size={18} className="text-primary" /> Advance Filter
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}
              </div>
              
              {/* Search By Keyword / Job ID */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase flex items-center justify-between">
                  <span>Search Job</span>
                  {searchId && <button onClick={() => setSearchId('')} className="text-[10px] text-ink-muted hover:text-rose-500 font-bold cursor-pointer">Clear</button>}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={14} />
                  <input 
                    type="text"
                    placeholder="Search by ID, Subject, Area..."
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink/30"
                  />
                  {searchId && (
                    <button
                      onClick={() => setSearchId('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
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
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Districts ({DISTRICTS.length})</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Select Area (District-Aware) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">
                  Select Area {district !== 'All' ? `(${district})` : ''}
                </label>
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
                    {availableAreas.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Select Categories / Subjects */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Category / Subject</label>
                <div className="relative">
                  <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <select 
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES_DATA.map((c) => (
                      <option key={c.title} value={c.title}>{c.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Select Class */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Student Class</label>
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
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={14} />
                </div>
              </div>

              {/* Salary Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Salary Budget</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'All', label: 'All Budgets' },
                    { id: '< 3000', label: '< 3,000 ৳' },
                    { id: '3000-5000', label: '3k - 5k ৳' },
                    { id: '5000-8000', label: '5k - 8k ৳' },
                    { id: '8000-12000', label: '8k - 12k ৳' },
                    { id: '12000+', label: '12,000+ ৳' },
                  ].map((sal) => (
                    <button
                      key={sal.id}
                      onClick={() => {
                        setSalaryRange(sal.id);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center",
                        salaryRange === sal.id
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-background border-ink/10 text-ink-muted hover:border-primary/40 hover:text-ink"
                      )}
                    >
                      {sal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tuition Type */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-primary uppercase">Tuition Type</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'All', label: 'All Tuition Types' },
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

          {/* Job Listings - 2-Column Grid Layout */}
          <main className="flex-grow w-full space-y-6">
            
            {/* Loading State with Skeleton Cards */}
            {(isLoading || isFetching) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-3xl border border-ink/10 p-6 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center pb-3 border-b border-ink/5">
                      <div className="h-4 bg-ink/10 rounded w-1/3" />
                      <div className="h-4 bg-ink/10 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-ink/10 rounded w-3/4" />
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="h-10 bg-ink/5 rounded-xl" />
                      <div className="h-10 bg-ink/5 rounded-xl" />
                      <div className="h-10 bg-ink/5 rounded-xl" />
                      <div className="h-10 bg-ink/5 rounded-xl" />
                    </div>
                    <div className="h-10 bg-primary/10 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-ink/5 shadow-sm space-y-4 p-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-xl font-display font-black text-ink">No Tuition Jobs Found</h3>
                <p className="text-ink-muted max-w-sm mx-auto text-xs font-medium">
                  We couldn't find any tuition jobs matching your current filter criteria. Try resetting or adjusting the filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeJobs.map((job) => {
                  const locStr = [job.area, job.location].filter(Boolean).join(', ') || 'Location N/A';
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-ink/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden group flex flex-col justify-between"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="px-6 py-3.5 flex justify-between items-center border-b border-ink/5 bg-primary/5">
                          <div className="flex items-center gap-2 text-ink font-bold text-xs truncate max-w-[65%]">
                            <MapPin size={15} className="text-primary shrink-0" />
                            <span className="truncate">{locStr}</span>
                          </div>
                          <div className="px-2.5 py-1 rounded-lg bg-white border border-primary/20 text-primary font-bold text-[11px] whitespace-nowrap shadow-sm">
                            ID: {job.customId || `#${job.id.slice(-6)}`}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6 space-y-4">
                          <h3 className="text-lg font-display font-black text-ink leading-tight group-hover:text-primary transition-colors line-clamp-1">
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
                              <p className="font-black text-primary text-sm">
                                {job.salary.toLocaleString()} ৳<span className="text-[10px] text-ink-muted font-normal">/mo</span>
                              </p>
                            </div>
                          </div>

                          {/* Subjects */}
                          <div className="space-y-1.5 pt-2 border-t border-ink/5">
                            <span className="text-[10px] font-bold uppercase text-ink-muted">Subjects</span>
                            <div className="flex flex-wrap gap-1">
                              {job.subjects?.map((sub) => (
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
                          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 text-center flex items-center gap-1.5"
                        >
                          View Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && activeJobs.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-ink/5">
                <p className="text-xs font-bold text-ink-muted order-2 sm:order-1">
                  Page <span className="text-ink font-black">{currentPage}</span> of <span className="text-ink font-black">{totalPages}</span> ({totalItems} total tuitions)
                </p>
                
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center text-ink hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-white shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={cn(
                            "w-10 h-10 rounded-xl font-bold text-xs transition-all cursor-pointer",
                            currentPage === pageNum
                              ? "bg-primary text-white shadow-md shadow-primary/20"
                              : "bg-white border border-ink/10 text-ink hover:bg-ink/5"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="w-10 h-10 rounded-xl border border-ink/10 flex items-center justify-center text-ink hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-white shadow-sm"
                  >
                    <ChevronRight size={18} />
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
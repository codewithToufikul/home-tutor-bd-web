import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Briefcase, MapPin, BookOpen, GraduationCap,
  Clock, Search, Filter, Layout, CheckSquare, ChevronDown,
  ChevronLeft, ChevronRight, Home, X, RotateCcw, Sparkles,
  SlidersHorizontal, Check, AlertCircle, ArrowRight,
  Wifi, Users, DollarSign, Calendar, BadgeCheck, Monitor, LayoutGrid
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

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchId), 300);
    return () => window.clearTimeout(timeout);
  }, [searchId]);

  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    setArea('All');
    setCurrentPage(1);
  };

  const availableAreas = useMemo(() => {
    if (district !== 'All' && DISTRICT_WISE_AREAS[district]) {
      return DISTRICT_WISE_AREAS[district];
    }
    return DISTRICT_WISE_AREAS['Dhaka'] || [];
  }, [district]);

  const salaryBounds = useMemo(() => {
    if (salaryRange === '< 3000') return { maxSalary: 3000 };
    if (salaryRange === '3000-5000') return { minSalary: 3000, maxSalary: 5000 };
    if (salaryRange === '5000-8000') return { minSalary: 5000, maxSalary: 8000 };
    if (salaryRange === '8000-12000') return { minSalary: 8000, maxSalary: 12000 };
    if (salaryRange === '12000+') return { minSalary: 12000 };
    return {};
  }, [salaryRange]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, tuitionType, genderPref, district, area, category, studentClass, salaryRange, itemsPerPage]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
    else setCategory('All');
    setCurrentPage(1);
  }, [searchParams]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setCurrentPage(1);
    if (val === 'All') searchParams.delete('category');
    else searchParams.set('category', val);
    setSearchParams(searchParams);
  };

  const hasActiveFilters = useMemo(() => (
    debouncedSearch.trim() !== '' ||
    tuitionType !== 'All' ||
    genderPref !== 'All' ||
    district !== 'All' ||
    area !== 'All' ||
    category !== 'All' ||
    studentClass !== 'All' ||
    salaryRange !== 'All'
  ), [debouncedSearch, tuitionType, genderPref, district, area, category, studentClass, salaryRange]);

  const resetAllFilters = () => {
    setSearchId(''); setDebouncedSearch(''); setTuitionType('All');
    setGenderPref('All'); setDistrict('All'); setArea('All');
    setCategory('All'); setStudentClass('All'); setSalaryRange('All');
    setCurrentPage(1);
    searchParams.delete('category');
    setSearchParams(searchParams);
  };

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
      const locDetailed = typeof j.location === 'object' ? String(j.location?.detailedAddress || '') : String(j.detailedAddress || '');
      const locUpazila = typeof j.location === 'object' ? String(j.location?.upazila || '') : '';

      // Build readable, full location without duplicate segments
      const locParts = [locDetailed, locArea, locUpazila, locDistrict]
        .map(s => s.trim())
        .filter(Boolean);
      const uniqueLocParts = locParts.filter((item, pos) => locParts.indexOf(item) === pos);
      const fullLocation = uniqueLocParts.join(', ') || locArea || locDistrict || 'Location N/A';

      // Tutoring Days format
      const tutoringDays = Array.isArray(j.tutoringDays) && j.tutoringDays.length > 0
        ? (j.tutoringDays.length <= 4 ? j.tutoringDays.join(', ') : `${j.tutoringDays.length} Days / Week`)
        : (typeof j.tutoringDays === 'string' && j.tutoringDays.trim() ? j.tutoringDays : '3-4 Days / Week');

      // Duration & Timing format
      const duration = j.duration && String(j.duration).trim() ? String(j.duration) : 'Long Term (Regular)';
      const startTime = j.startTime && String(j.startTime).trim() ? String(j.startTime) : '';

      return {
        ...j,
        id: String(j._id || j.id || ''),
        _id: String(j._id || j.id || ''),
        location: locDistrict,
        area: locArea,
        detailedAddress: locDetailed,
        upazila: locUpazila,
        fullLocation,
        studentClass: j.studentClass || 'N/A',
        subjects: Array.isArray(j.subjects) && j.subjects.length > 0 ? j.subjects : [j.subject || 'General'],
        salary: Number(j.salary || 0),
        medium: j.medium || 'Bangla Medium',
        tuitionType: j.tuitionType || 'Home Tuition',
        genderPreference: j.genderPreference || 'Any',
        tutoringDays,
        duration,
        startTime,
        numStudents: j.numStudents || 1,
        studentGender: j.studentGender || 'Any',
        createdAt: j.createdAt || new Date().toISOString(),
      };
    }) as TuitionJob[];
  }, [jobsData]);

  const totalItems: number = (jobsData as any)?.meta?.total ?? jobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const activeJobs = jobs;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smart pagination: show ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const subjectColors = [
    'bg-teal-50 text-teal-700 border-teal-200',
    'bg-violet-50 text-violet-700 border-violet-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-rose-50 text-rose-700 border-rose-200',
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-emerald-50 text-emerald-700 border-emerald-200',
  ];

  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Page Header ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
          <div>

            <p className="text-xs sm:text-sm text-ink-muted font-medium mt-1">
              Showing{' '}
              <span className="text-ink font-black">
                {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                {' – '}
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="text-primary font-black">{totalItems}</span> matching tuitions
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-ink/10 rounded-xl text-xs font-bold text-ink shadow-sm cursor-pointer relative"
            >
              <SlidersHorizontal size={14} className="text-primary" />
              Filters
              {hasActiveFilters && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] flex items-center justify-center font-black">
                  !
                </span>
              )}
            </button>

            {/* Per Page selector */}
            <div className="flex items-center gap-2 bg-white border border-ink/10 rounded-xl px-3 py-2 shadow-sm">
              <span className="text-[11px] font-bold text-ink-muted whitespace-nowrap">Per Page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="text-xs font-black text-ink outline-none bg-transparent cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown size={12} className="text-ink-muted" />
            </div>
          </div>
        </div>

        {/* ── Active Filter Badges ──────────────────────── */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white rounded-2xl border border-ink/5 shadow-sm overflow-hidden"
            >
              <span className="text-[11px] font-black text-ink-muted flex items-center gap-1 mr-1">
                <Filter size={12} className="text-primary" /> Active Filters:
              </span>
              {debouncedSearch && (
                <FilterBadge label={`"${debouncedSearch}"`} onRemove={() => setSearchId('')} />
              )}
              {genderPref !== 'All' && <FilterBadge label={`Tutor: ${genderPref}`} onRemove={() => setGenderPref('All')} />}
              {district !== 'All' && <FilterBadge label={district} onRemove={() => handleDistrictChange('All')} />}
              {area !== 'All' && <FilterBadge label={area} onRemove={() => setArea('All')} />}
              {category !== 'All' && <FilterBadge label={category} onRemove={() => handleCategoryChange('All')} />}
              {studentClass !== 'All' && <FilterBadge label={`Class: ${studentClass}`} onRemove={() => setStudentClass('All')} />}
              {salaryRange !== 'All' && <FilterBadge label={`৳ ${salaryRange}`} onRemove={() => setSalaryRange('All')} />}
              {tuitionType !== 'All' && <FilterBadge label={tuitionType} onRemove={() => setTuitionType('All')} />}
              <button
                onClick={resetAllFilters}
                className="ml-auto inline-flex items-center gap-1 text-[11px] font-black text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <RotateCcw size={11} /> Clear All
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Sidebar Filter ──────────────────────────── */}
          <aside className={cn(
            "lg:w-72 w-full shrink-0 lg:sticky lg:top-28",
            isMobileFilterOpen ? "block" : "hidden lg:block"
          )}>
            <div className="bg-white rounded-2xl border border-ink/5 shadow-sm overflow-hidden">
              {/* Sidebar Header */}
              <div className="px-5 py-4 border-b border-ink/5 flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                <h2 className="text-sm font-display font-black text-ink flex items-center gap-2">
                  <Filter size={16} className="text-primary" /> Advance Filter
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

              <div className="p-5 space-y-5">
                {/* Search */}
                <FilterSection label="Search Job">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={13} />
                    <input
                      type="text"
                      placeholder="Search by ID, Subject, Area..."
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#F8FAFC] border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink/30"
                    />
                    {searchId && (
                      <button onClick={() => setSearchId('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </FilterSection>

                {/* Tutor Preference */}
                <FilterSection label="Tutor Preference">
                  <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-ink/10 gap-1">
                    {['All', 'Male', 'Female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => { setGenderPref(g); setCurrentPage(1); }}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          genderPref === g ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* District */}
                <FilterSection label="Select District">
                  <SelectField
                    icon={<MapPin size={14} className="text-primary" />}
                    value={district}
                    onChange={(v) => handleDistrictChange(v)}
                  >
                    <option value="All">All Districts ({DISTRICTS.length})</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </SelectField>
                </FilterSection>

                {/* Area */}
                <FilterSection label={`Select Area${district !== 'All' ? ` (${district})` : ''}`}>
                  <SelectField
                    icon={<MapPin size={14} className="text-primary" />}
                    value={area}
                    onChange={(v) => { setArea(v); setCurrentPage(1); }}
                  >
                    <option value="All">All Areas</option>
                    {availableAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                  </SelectField>
                </FilterSection>

                {/* Category */}
                <FilterSection label="Category / Subject">
                  <SelectField
                    icon={<Layout size={14} className="text-primary" />}
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES_DATA.map((c) => <option key={c.title} value={c.title}>{c.title}</option>)}
                  </SelectField>
                </FilterSection>

                {/* Class */}
                <FilterSection label="Student Class">
                  <SelectField
                    icon={<GraduationCap size={14} className="text-primary" />}
                    value={studentClass}
                    onChange={(v) => { setStudentClass(v); setCurrentPage(1); }}
                  >
                    <option value="All">All Classes</option>
                    {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </SelectField>
                </FilterSection>

                {/* Salary */}
                <FilterSection label="Salary Budget">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'All', label: 'All Budgets' },
                      { id: '< 3000', label: '< 3,000 ৳' },
                      { id: '3000-5000', label: '3k – 5k ৳' },
                      { id: '5000-8000', label: '5k – 8k ৳' },
                      { id: '8000-12000', label: '8k – 12k ৳' },
                      { id: '12000+', label: '12k+ ৳' },
                    ].map((sal) => (
                      <button
                        key={sal.id}
                        onClick={() => { setSalaryRange(sal.id); setCurrentPage(1); }}
                        className={cn(
                          "py-2 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center",
                          salaryRange === sal.id
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-[#F8FAFC] border-ink/10 text-ink-muted hover:border-primary/40 hover:text-ink"
                        )}
                      >
                        {sal.label}
                      </button>
                    ))}
                  </div>
                </FilterSection>

                {/* Tuition Type */}
                <FilterSection label="Tuition Type">
                  <div className="space-y-1.5">
                    {[
                      { id: 'All', label: 'All Tuition Types', icon: LayoutGrid },
                      { id: 'Home Tuition', label: 'Home Tuition', icon: Home },
                      { id: 'Online Tuition', label: 'Online Tuition', icon: Monitor },
                    ].map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          onClick={() => { setTuitionType(type.id); setCurrentPage(1); }}
                          className={cn(
                            "flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-left border",
                            tuitionType === type.id
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-[#F8FAFC] border-ink/5 text-ink-muted hover:text-ink hover:border-ink/20"
                          )}
                        >
                          <Icon size={14} className={tuitionType === type.id ? 'text-primary' : 'text-ink-muted'} />
                          <span className="flex-1">{type.label}</span>
                          {tuitionType === type.id && (
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>
              </div>
            </div>
          </aside>

          {/* ── Job Listings ─────────────────────────────── */}
          <main className="flex-1 w-full min-w-0 space-y-5">

            {/* Loading Skeletons */}
            {(isLoading || isFetching) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-ink/5 p-5 space-y-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="h-3.5 bg-ink/10 rounded-full w-2/5" />
                      <div className="h-6 bg-ink/10 rounded-xl w-1/4" />
                    </div>
                    <div className="h-5 bg-ink/10 rounded-full w-3/4" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-primary/10 rounded-lg w-24" />
                      <div className="h-6 bg-emerald-100 rounded-lg w-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-1">
                          <div className="h-2.5 bg-ink/10 rounded w-16" />
                          <div className="h-4 bg-ink/10 rounded w-24" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-2 border-t border-ink/5">
                      {[1, 2, 3].map(i => <div key={i} className="h-5 bg-ink/10 rounded-lg w-16" />)}
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <div className="h-3 bg-ink/10 rounded w-20" />
                      <div className="h-8 bg-primary/20 rounded-xl w-28" />
                    </div>
                  </div>
                ))}
              </div>

            ) : activeJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-ink/5 shadow-sm space-y-4 p-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-xl font-display font-black text-ink">No Tuition Jobs Found</h3>
                <p className="text-ink-muted max-w-sm mx-auto text-xs font-medium">
                  We couldn't find jobs matching your filters. Try adjusting or resetting.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {activeJobs.map((job, idx) => {
                  const isOnline = job.tuitionType?.toLowerCase().includes('online');
                  return (
                    <motion.div
                      key={job.id}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col group relative"
                    >
                      {/* Top Highlighted Location & ID Banner */}
                      <div className="p-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-blue-50/60 border-b border-teal-100/90 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-lg bg-teal-600 text-white shadow-xs flex items-center justify-center">
                              <MapPin size={13} className="shrink-0 animate-bounce" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                              Location Details
                            </span>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-white/95 text-primary font-black text-[10px] border border-primary/20 shadow-xs whitespace-nowrap font-mono">
                            ID: {job.customId || `#${String(job.id).slice(-6).toUpperCase()}`}
                          </span>
                        </div>

                        {/* Full Location with clear, non-truncated highlight */}
                        <div className="bg-white/90 backdrop-blur-xs rounded-xl p-2.5 border border-teal-200/70 shadow-2xs">
                          <p className="text-xs font-black text-slate-800 leading-snug break-words">
                            {job.fullLocation}
                          </p>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 space-y-4">
                        {/* Title & Badges */}
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-2xs",
                              isOnline ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-teal-50 text-teal-700 border border-teal-200"
                            )}>
                              {isOnline ? <Wifi size={11} /> : <Home size={11} />}
                              {job.tuitionType}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                              <BadgeCheck size={11} /> Active Job
                            </span>
                            {job.genderPreference && job.genderPreference !== 'Any' && (
                              <span className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black shadow-2xs",
                                job.genderPreference === 'Female' ? "bg-pink-50 text-pink-700 border border-pink-200" : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              )}>
                                <Users size={11} />
                                {job.genderPreference} Tutor
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-display font-black text-ink leading-snug group-hover:text-primary transition-colors">
                            Tutor Needed For {job.studentClass} ({job.medium})
                          </h3>
                        </div>

                        {/* Highlighted Specs Grid (4 key feature cards) */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {/* 1. Monthly Salary Card */}
                          <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/80 flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                              <DollarSign size={12} className="text-emerald-600" />
                              Salary Budget
                            </span>
                            <p className="font-display font-black text-emerald-700 text-base sm:text-lg leading-tight mt-1">
                              ৳{job.salary.toLocaleString()}{' '}
                              <span className="text-[10px] font-bold text-emerald-600/80">/mo</span>
                            </p>
                          </div>

                          {/* 2. Weekly Schedule (Weekly koidin) Card */}
                          <div className="p-3 bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl border border-purple-200/80 flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase text-purple-900 tracking-wider flex items-center gap-1">
                              <Calendar size={12} className="text-purple-600" />
                              Weekly Schedule
                            </span>
                            <p className="font-black text-purple-950 text-xs mt-1 leading-snug">
                              {job.tutoringDays}
                            </p>
                          </div>

                          {/* 3. Tuition Duration (Kotodin colbe) Card */}
                          <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider flex items-center gap-1">
                              <Clock size={12} className="text-amber-600" />
                              Duration / Period
                            </span>
                            <p className="font-black text-amber-950 text-xs mt-1 leading-snug">
                              {job.duration}
                            </p>
                          </div>

                          {/* 4. Class & Medium Card */}
                          <div className="p-3 bg-gradient-to-br from-blue-50 to-sky-50/50 rounded-2xl border border-blue-200/80 flex flex-col justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
                              <GraduationCap size={12} className="text-blue-600" />
                              Class & Medium
                            </span>
                            <p className="font-black text-blue-950 text-xs mt-1 leading-snug">
                              {job.studentClass} • {job.medium}
                            </p>
                          </div>
                        </div>

                        {/* Subjects Section */}
                        <div className="pt-2.5 border-t border-ink/5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-ink-muted tracking-wider flex items-center gap-1">
                              <BookOpen size={11} className="text-primary" />
                              Subjects to Teach
                            </span>
                            {job.numStudents && job.numStudents > 1 && (
                              <span className="text-[10px] font-bold text-ink-muted">
                                👥 {job.numStudents} Students
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {job.subjects?.slice(0, 5).map((sub, i) => (
                              <span
                                key={sub}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border shadow-2xs",
                                  subjectColors[i % subjectColors.length]
                                )}
                              >
                                {sub}
                              </span>
                            ))}
                            {job.subjects?.length > 5 && (
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black text-ink-muted bg-ink/5 border border-ink/10">
                                +{job.subjects.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                          <Calendar size={12} className="text-slate-400" />
                          <span>{new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>

                        <Link
                          to={`/job/${job.id}`}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-teal-600 hover:from-primary-dark hover:to-teal-700 text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:gap-2.5 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
                        >
                          <span>View Details</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── Pagination ─────────────────────────────── */}
            {!isLoading && activeJobs.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-ink/5">
                <p className="text-xs font-medium text-ink-muted order-2 sm:order-1">
                  Page <span className="font-black text-ink">{currentPage}</span> of{' '}
                  <span className="font-black text-ink">{totalPages}</span>
                  <span className="text-ink-muted"> · {totalItems} total</span>
                </p>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 rounded-xl border border-ink/10 flex items-center justify-center text-ink-muted hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-white shadow-sm"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers */}
                  {getPageNumbers().map((pg, i) =>
                    pg === '...' ? (
                      <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-ink-muted font-bold">
                        ···
                      </span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg as number)}
                        className={cn(
                          "w-9 h-9 rounded-xl font-black text-xs transition-all cursor-pointer shadow-sm",
                          currentPage === pg
                            ? "bg-primary text-white shadow-md shadow-primary/25 scale-105"
                            : "bg-white border border-ink/10 text-ink hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        )}
                      >
                        {pg}
                      </button>
                    )
                  )}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="w-9 h-9 rounded-xl border border-ink/10 flex items-center justify-center text-ink-muted hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-white shadow-sm"
                  >
                    <ChevronRight size={16} />
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

// ── Helper sub-components ────────────────────────────────────
function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[11px] font-bold">
      {label}
      <button onClick={onRemove} className="hover:text-primary-dark cursor-pointer ml-0.5">
        <X size={11} />
      </button>
    </span>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-ink uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  icon, value, onChange, children
}: {
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{icon}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-[#F8FAFC] border border-ink/10 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={13} />
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] font-black uppercase text-ink-muted tracking-wide">{label}</span>
      <p className="font-bold text-ink text-xs truncate">{value}</p>
    </div>
  );
}
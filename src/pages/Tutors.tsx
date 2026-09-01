import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, MapPin, BookOpen, GraduationCap,
  X, SlidersHorizontal, ChevronDown, Layout, CheckSquare, Square,
  ChevronLeft, ChevronRight, PlayCircle, Star, ShieldCheck,
  RotateCcw, Sparkles
} from 'lucide-react';
import { DISTRICTS, DISTRICT_WISE_AREAS, SUBJECTS, CLASSES, MEDIUMS, CATEGORIES_DATA } from '@/src/constants';
import TutorCard from '@/src/components/TutorCard.tsx';
import type { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useGetTutorsQuery } from '@/src/services/tutorApi';

export default function Tutors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tutorType, setTutorType] = useState('All');
  const [genderPref, setGenderPref] = useState('All');
  const [district, setDistrict] = useState('All');
  const [area, setArea] = useState('All');
  const [category, setCategory] = useState('All');
  const [studentClass, setStudentClass] = useState('All');
  const [selectedMedium, setSelectedMedium] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Debounce query
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, tutorType, genderPref, district, area, category, studentClass, selectedMedium, itemsPerPage]);

  const queryParams = useMemo(() => ({
    ...(debouncedQuery ? { search: debouncedQuery } : {}),
    ...(district !== 'All' ? { district } : {}),
    ...(area !== 'All' ? { area } : {}),
    ...(category !== 'All' ? { subject: category } : {}),
    ...(selectedMedium ? { medium: selectedMedium } : {}),
    ...(studentClass !== 'All' ? { studentClass } : {}),
    ...(genderPref !== 'All' ? { gender: genderPref } : {}),
    ...(tutorType === 'Verified' ? { isVerified: true } : {}),
    ...(tutorType === 'Premium' ? { isPremium: true } : {}),
    page: currentPage,
    limit: itemsPerPage,
  }), [debouncedQuery, district, area, category, selectedMedium, studentClass, genderPref, tutorType, currentPage, itemsPerPage]);

  const { data: tutorsData, isLoading, isFetching } = useGetTutorsQuery(queryParams);

  const activeTutors: TutorProfile[] = useMemo(() => {
    const raw = (tutorsData as any)?.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.tutors)) return raw.tutors;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }, [tutorsData]);

  const totalItems: number = (tutorsData as any)?.meta?.total ?? (tutorsData as any)?.data?.total ?? activeTutors.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const hasMore = currentPage < totalPages;

  const hasActiveFilters = useMemo(() => {
    return (
      debouncedQuery.trim() !== '' ||
      tutorType !== 'All' ||
      genderPref !== 'All' ||
      district !== 'All' ||
      area !== 'All' ||
      category !== 'All' ||
      studentClass !== 'All' ||
      selectedMedium !== ''
    );
  }, [debouncedQuery, tutorType, genderPref, district, area, category, studentClass, selectedMedium]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setTutorType('All');
    setGenderPref('All');
    setDistrict('All');
    setArea('All');
    setCategory('All');
    setStudentClass('All');
    setSelectedMedium('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-28">
      {/* Video Tutorial Popup */}
      <AnimatePresence>
        {showVideoPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setShowVideoPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowVideoPopup(false)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
              <iframe
                src="https://www.youtube.com/embed/JNPPF3nne3c?autoplay=1"
                title="Tutorial Video"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-ink">
              Verified Tutors in Bangladesh
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted font-medium mt-1">
              Showing <span className="text-ink font-bold">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)}</span> of <span className="text-primary font-bold">{totalItems}</span> matching verified tutors
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setShowFilters(true)}
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

            {debouncedQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                "{debouncedQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {tutorType !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Type: {tutorType}
                <button onClick={() => setTutorType('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {genderPref !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Gender: {genderPref}
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
                <button onClick={() => setCategory('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {studentClass !== 'All' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Class: {studentClass}
                <button onClick={() => setStudentClass('All')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            {selectedMedium && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-xl text-xs font-bold">
                Medium: {selectedMedium}
                <button onClick={() => setSelectedMedium('')} className="hover:text-primary-dark cursor-pointer"><X size={12} /></button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="ml-auto inline-flex items-center gap-1 text-xs font-black text-rose-500 hover:text-rose-700 transition-colors cursor-pointer px-2 py-1"
            >
              <RotateCcw size={12} /> Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filter */}
          <aside className="lg:w-80 w-full space-y-6 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pb-4 custom-scrollbar">
            {/* View Tutorial Card */}
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => setShowVideoPopup(true)}
              className="relative w-full group cursor-pointer overflow-hidden rounded-[2rem] shadow-xl shadow-primary/10 border border-ink/5 bg-white aspect-video"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img
                src="https://img.youtube.com/vi/JNPPF3nne3c/hqdefault.jpg"
                alt="Tutorial Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle size={32} fill="currentColor" className="text-white" />
                </div>
                <div className="text-center px-4">
                  <p className="text-white font-display font-bold text-base leading-tight mb-1">How to find a tutor?</p>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Watch Video Tutorial</p>
                </div>
              </div>
            </motion.div>

            <div className="bg-white p-6 hidden lg:block rounded-3xl border border-ink/5 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-ink/5 pb-3">
                <h2 className="text-base font-display font-bold text-ink flex items-center gap-2">
                  <Filter size={18} className="text-primary" /> Advance Filter
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}
              </div>

              {/* Search By Name/University */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase flex items-center justify-between">
                  <span>Search Tutor</span>
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="text-[10px] text-ink-muted hover:text-rose-500 font-bold cursor-pointer">Clear</button>}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
                  <input
                    type="text"
                    placeholder="Name, university, subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink/30"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tutor Type Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Tutor Type</label>
                <div className="flex bg-background p-1 rounded-xl border border-ink/10">
                  {['All', 'Premium', 'Verified'].map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setTutorType(t);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        tutorType === t ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tutor Gender Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Tutor Gender</label>
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

              {/* Select Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Category / Subject</label>
                <div className="relative">
                  <Layout className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary" size={16} />
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-background border border-ink/10 text-xs focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-bold cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES_DATA.map((c) => (
                      <option key={c.id} value={c.title}>{c.title}</option>
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

              {/* Medium Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary uppercase">Medium</label>
                <div className="flex flex-wrap gap-1.5">
                  {MEDIUMS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setSelectedMedium(selectedMedium === m ? '' : m);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                        selectedMedium === m ? "bg-primary text-white border-primary shadow-sm" : "bg-background border-ink/10 text-ink-muted hover:border-primary/30"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow w-full space-y-6">

            {/* Loading Skeleton */}
            {(isLoading || isFetching) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white rounded-3xl border border-ink/10 p-6 space-y-4 animate-pulse">
                    <div className="w-20 h-20 bg-ink/10 rounded-full mx-auto" />
                    <div className="h-5 bg-ink/10 rounded w-1/2 mx-auto" />
                    <div className="h-4 bg-ink/10 rounded w-3/4 mx-auto" />
                    <div className="space-y-2 pt-2">
                      <div className="h-8 bg-ink/5 rounded-xl" />
                      <div className="h-8 bg-ink/5 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTutors.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-ink/5 shadow-sm space-y-4 p-8">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-display font-black text-ink">No Tutors Found</h3>
                <p className="text-ink-muted max-w-sm mx-auto text-xs font-medium">
                  We couldn't find any tutors matching your current filter criteria. Try adjusting your search query or resetting the filters.
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer"
                  >
                    <RotateCcw size={14} /> Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              /* Tutor Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTutors.map((tutor) => (
                  <motion.div
                    key={tutor.id || (tutor as any)._id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <TutorCard tutor={tutor} highlightQuery={debouncedQuery} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && activeTutors.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-ink/5">
                <p className="text-xs font-bold text-ink-muted order-2 sm:order-1">
                  Page <span className="text-ink font-black">{currentPage}</span> of <span className="text-ink font-black">{totalPages}</span> ({totalItems} total tutors)
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
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-white z-[70] shadow-2xl p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <h2 className="text-lg font-display font-bold text-ink">Advanced Filters</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-ink/5 rounded-full cursor-pointer">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary uppercase">Search Tutor</label>
                    <input
                      type="text"
                      placeholder="Name, university..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink/10 bg-background text-xs outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary uppercase">Tutor Type</label>
                    <div className="flex bg-background p-1 rounded-xl border border-ink/10">
                      {['All', 'Premium', 'Verified'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTutorType(t)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                            tutorType === t ? "bg-primary text-white shadow-sm" : "text-ink-muted"
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary uppercase">District</label>
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink/10 bg-background text-xs outline-none cursor-pointer"
                    >
                      <option value="All">All Districts</option>
                      {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary uppercase">Area</label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-ink/10 bg-background text-xs outline-none cursor-pointer"
                    >
                      <option value="All">All Areas</option>
                      {availableAreas.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-primary uppercase">Medium</label>
                    <div className="flex flex-wrap gap-1.5">
                      {MEDIUMS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setSelectedMedium(selectedMedium === m ? '' : m)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer",
                            selectedMedium === m ? "bg-primary text-white border-primary" : "bg-background border-ink/10 text-ink-muted"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-primary/20 cursor-pointer"
                >
                  Apply Filters
                </button>
                <button
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  className="w-full text-ink-muted hover:text-rose-500 font-bold text-xs py-2 cursor-pointer transition-colors"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
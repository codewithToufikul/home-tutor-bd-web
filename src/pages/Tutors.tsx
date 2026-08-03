import { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, MapPin, BookOpen, GraduationCap, 
  X, SlidersHorizontal, ChevronDown, Layout, CheckSquare, Square,
  ChevronLeft, ChevronRight, PlayCircle, Star, ShieldCheck
} from 'lucide-react';
import { AREAS, SUBJECTS, CLASSES, MEDIUMS, CATEGORIES_DATA } from '@/src/constants';
import { TutorProfileRepository } from '@/src/repositories/tutorProfileRepository.ts';
import TutorCard from '@/src/components/TutorCard.tsx';
import { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const DISTRICTS = ['Dhaka', 'Sylhet', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];

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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        // Fetch tutors from Firestore
        const loadedTutors = await TutorProfileRepository.getAll();
        setTutors(loadedTutors || []);
      } catch (error) {
        console.error('Failed to load tutors:', error);
        setTutors([]);
      }
    };

    fetchTutors();
  }, []);

  const filteredTutors = useMemo(() => {
    return tutors.filter(tutor => {
      const matchesSearch = !searchQuery || 
                           tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTutorType = tutorType === 'All' || (tutorType === 'Premium' && tutor.isPremium);
      const matchesGender = genderPref === 'All' || tutor.gender === genderPref;
      const matchesDistrict = district === 'All' || tutor.preferredAreas.some(a => a.includes(district));
      const matchesArea = area === 'All' || tutor.preferredAreas.includes(area);
      const matchesMedium = !selectedMedium || tutor.mediums.includes(selectedMedium as any);
      
      return matchesSearch && matchesTutorType && matchesGender && matchesDistrict && matchesArea && matchesMedium;
    });
  }, [searchQuery, tutorType, genderPref, district, area, selectedMedium]);

  const totalPages = Math.ceil(filteredTutors.length / itemsPerPage);
  const paginatedTutors = filteredTutors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchQuery('');
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-4">
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
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X size={24} />
              </button>
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Tutorial Video"
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <p className="text-sm text-ink-muted font-medium">
            Showing <span className="text-ink font-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredTutors.length)}</span> of <span className="text-ink font-bold">{filteredTutors.length}</span> tutors
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">Show:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-ink/10 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filter */}
          <aside className="lg:w-80 w-full space-y-6 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto pb-4 custom-scrollbar">
            {/* View Tutorial Card */}
            <motion.div 
              whileHover={{ y: -4 }}
              onClick={() => setShowVideoPopup(true)}
              className="relative w-full group cursor-pointer overflow-hidden rounded-[2rem] shadow-xl shadow-primary/10 border border-ink/5 bg-white aspect-video"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
                alt="Tutorial Thumbnail"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300">
                  <PlayCircle size={36} fill="currentColor" className="text-white" />
                </div>
                <div className="text-center px-4">
                  <p className="text-white font-display font-bold text-lg leading-tight mb-1">How to find a tutor?</p>
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Watch Video Tutorial</p>
                </div>
              </div>
            </motion.div>

            <div className="bg-white p-6 rounded-2xl border border-ink/5 shadow-sm space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-ink/5 pb-4">
                  <h2 className="text-xl font-display font-bold text-ink">Advance Filter</h2>
                  <button 
                    onClick={clearFilters}
                    className="text-xs font-bold text-primary uppercase tracking-wider hover:opacity-70"
                  >
                    Reset
                  </button>
                </div>
                
                {/* Search By Name/University */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Search Tutor</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <input 
                      type="text"
                      placeholder="Name, university, subject..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-ink/10 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-ink/30"
                    />
                  </div>
                </div>

                {/* Tutor Type Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Tutor Type</label>
                  <div className="flex bg-background p-1 rounded-xl border border-ink/10">
                    {['All', 'Premium'].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTutorType(t);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                          tutorType === t ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tutor Gender Preference */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Tutor Gender</label>
                  <div className="flex bg-background p-1 rounded-xl border border-ink/10">
                    {['All', 'Male', 'Female'].map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setGenderPref(g);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold transition-all",
                          genderPref === g ? "bg-primary text-white shadow-sm" : "text-ink-muted hover:text-ink"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select District */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Select District</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <select 
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-ink/10 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium cursor-pointer"
                    >
                      <option value="All">All Districts</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Select Area */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Select Area</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <select 
                      value={area}
                      onChange={(e) => {
                        setArea(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-ink/10 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium cursor-pointer"
                    >
                      <option value="All">All Areas</option>
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Select Categories */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Select Categories</label>
                  <div className="relative">
                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <select 
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-ink/10 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES_DATA.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Select Class */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Select Class</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
                    <select 
                      value={studentClass}
                      onChange={(e) => {
                        setStudentClass(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-ink/10 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none font-medium cursor-pointer"
                    >
                      <option value="All">All Classes</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
                  </div>
                </div>

                {/* Medium Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary uppercase tracking-wider">Medium</label>
                  <div className="flex flex-wrap gap-2">
                    {MEDIUMS.map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          setSelectedMedium(selectedMedium === m ? '' : m);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                          selectedMedium === m ? "bg-primary text-white border-primary shadow-sm" : "bg-background border-ink/10 text-ink-muted hover:border-primary/30"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-grow space-y-8">
            {/* Mobile Filter Trigger */}
            <button 
              onClick={() => setShowFilters(true)}
              className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-ink/5 py-4 rounded-2xl font-bold text-ink shadow-sm cursor-pointer"
            >
              <Filter size={20} />
              Advanced Filters
            </button>

            {/* Tutor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {paginatedTutors.map((tutor) => (
                  <motion.div
                    key={tutor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-sm mx-auto md:max-w-none md:mx-0"
                  >
                    <TutorCard tutor={tutor} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredTutors.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-ink/5 shadow-sm space-y-4">
                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-ink">No tutors found</h3>
                <p className="text-ink-muted max-w-xs mx-auto">Try adjusting your filters or search query to find more results.</p>
                <button 
                  onClick={clearFilters}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              /* Pagination */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-ink/5">
                <p className="text-sm text-ink-muted font-medium order-2 sm:order-1">
                  Showing <span className="text-ink font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-ink font-bold">{Math.min(currentPage * itemsPerPage, filteredTutors.length)}</span> of <span className="text-ink font-bold">{filteredTutors.length}</span> results
                </p>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-ink/10 text-ink-muted hover:bg-white hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "w-10 h-10 rounded-lg text-sm font-bold transition-all cursor-pointer",
                              currentPage === page
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-ink-muted hover:bg-white hover:text-primary border border-transparent hover:border-ink/10"
                            )}
                          >
                            {page}
                          </button>
                        );
                      }
                      if (
                        (page === 2 && currentPage > 3) ||
                        (page === totalPages - 1 && currentPage < totalPages - 2)
                      ) {
                        return <span key={page} className="px-1 text-ink-muted">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-ink/10 text-ink-muted hover:bg-white hover:text-primary disabled:opacity-50 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    <ChevronRight size={20} />
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-surface z-[70] shadow-2xl p-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-bold text-ink">Advanced Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-ink/5 rounded-full cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">Search Tutor</label>
                  <input 
                    type="text"
                    placeholder="Name, university..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ink/5 bg-background text-sm outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">Tutor Type</label>
                  <div className="flex bg-background p-1 rounded-xl border border-ink/10">
                    {['All', 'Premium'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTutorType(t)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                          tutorType === t ? "bg-primary text-white shadow-sm" : "text-ink-muted"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ink/5 bg-background text-sm outline-none cursor-pointer"
                  >
                    <option value="All">All Districts</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">Area</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ink/5 bg-background text-sm outline-none cursor-pointer"
                  >
                    <option value="All">All Areas</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-primary uppercase tracking-wider">Medium</label>
                  <div className="flex flex-wrap gap-2">
                    {MEDIUMS.map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMedium(selectedMedium === m ? '' : m)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer",
                          selectedMedium === m ? "bg-primary text-white border-primary" : "bg-background border-ink/5 text-ink-muted"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 mt-8 cursor-pointer"
                >
                  Apply Filters
                </button>
                <button 
                  onClick={() => { clearFilters(); setShowFilters(false); }}
                  className="w-full text-ink-muted font-bold py-2 cursor-pointer"
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
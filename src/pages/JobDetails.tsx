import { useParams, Link } from 'react-router-dom';
import { 
  Briefcase, MapPin, BookOpen, GraduationCap, 
  Calendar, Clock, ChevronLeft, Search, Filter, 
  PlayCircle, User, Layout, CheckSquare, Square, ChevronDown,
  ArrowLeft, Share2, Heart, AlertCircle, Phone, MessageSquare,
  CheckCircle2, Info, ShieldCheck, ArrowRight, Home,
  Eye, Send, Navigation, MousePointer2, Banknote, List,
  MessageCircle, Facebook, Twitter, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { TuitionJob } from '@/src/types';
import { getJobById, getJobs } from '@/src/lib/jobs';
import { useMemo, useState } from 'react';
import JobApplyModal from './JobApplyModal';

const JOB_DETAILS_FALLBACK: TuitionJob = {
  id: '48893',
  parentId: 'p1',
  studentClass: 'Class 7',
  subjects: ['ENGLISH', 'GENERAL MATHS'],
  location: 'Sylhet',
  area: 'Daria Para',
  salary: 4000,
  medium: 'Bangla Medium',
  genderPreference: 'Male',
  status: 'Open',
  createdAt: '2026-04-08T10:00:00Z',
  tutoringDays: '3 Days/Week',
  tuitionType: 'Home + Group Tutoring',
  studentGender: 'Male',
  numStudents: 1,
  duration: '1.5 Hours',
  startTime: 'Afternoon',
  schoolName: 'Sylhet Government High School',
  requirements: [
    'Tutor must be from a reputable university',
    'Experience in teaching Class 7 students is preferred',
    'Must be punctual and regular',
    'Good communication skills in English'
  ],
  description: 'Looking for a dedicated tutor for my son who is in Class 7. He needs help primarily with English and Mathematics. The tutor should be able to explain complex concepts in a simple way and help with homework and exam preparation.'
};

export default function JobDetails() {
  const { id } = useParams();
  const [showApplyModal, setShowApplyModal] = useState(false); 
  const [hasApplied, setHasApplied] = useState(false);

  const jobData = useMemo(() => {
    const found = getJobById(id || '');
    if (found) return found;
    return {
      ...JOB_DETAILS_FALLBACK,
      id: id || '48893'
    };
  }, [id]);

  const job = useMemo(() => ({
    ...jobData,
    views: 1,
    applications: 0,
    postedDate: new Date(jobData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }), [jobData]);

  // Suggested jobs fix: যদি স্পেসিফিক ম্যাচ না করে তবে অন্তত কিছু হলেও দেখাবে যাতে সেকশনটি ফাঁকা না থাকে
  const suggestedJobs = useMemo(() => {
    const allJobs = getJobs();
    const filtered = allJobs.filter(j => j.id !== id);
    if (filtered.length > 0) {
      return filtered.slice(0, 3);
    }
    return [JOB_DETAILS_FALLBACK];
  }, [id]);

  const detailItemClasses = "flex items-center gap-4 p-4 bg-[#F8FAFC] rounded-xl transition-all group border border-ink/5";
  const iconBoxClasses = "w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:bg-primary group-hover:text-white transition-all";

  const openMap = () => {
    const query = encodeURIComponent(`${job.area}, ${job.location}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-24 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl shadow-ink/5 overflow-hidden border border-ink/5">
              {/* Header Section */}
              <div className="p-6 md:p-8 text-center space-y-6 border-b border-ink/5">
                <h1 className="text-2xl md:text-4xl font-display font-black text-[#001F3F]">
                  Tutor Need For {job.medium}
                </h1>
                
                <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-bold text-ink-muted">
                  <span>Job ID: <span className="text-ink">{job.id}</span></span>
                  <span className="w-1 h-1 rounded-full bg-ink/20" />
                  <span>Posted: <span className="text-ink">{job.postedDate}</span></span>
                </div>

                <div className="flex justify-center items-center gap-6 text-xs font-bold text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <Eye size={14} className="text-ink/40" />
                    <span>{job.views} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Send size={14} className="text-ink/40" />
                    <span>{job.applications + (hasApplied ? 1 : 0)} Applications</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <MapPin size={24} className="text-rose-500" />
                  <p className="text-lg md:text-xl font-bold text-ink">{job.location}, {job.area}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Layout size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Medium</p>
                      <p className="text-sm font-black text-ink">{job.medium}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><BookOpen size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Class</p>
                      <p className="text-sm font-black text-ink">{job.studentClass}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><GraduationCap size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Student Gender</p>
                      <p className="text-sm font-black text-ink">{job.studentGender}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><User size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Tutor Gender</p>
                      <p className="text-sm font-bold text-primary">{job.genderPreference}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Calendar size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Tutoring Days</p>
                      <p className="text-sm font-black text-ink">{job.tutoringDays}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Clock size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Time</p>
                      <p className="text-sm font-black text-ink">{job.startTime || 'Negotiable'}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><Clock size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Duration</p>
                      <p className="text-sm font-black text-ink">{job.duration || '-'}</p>
                    </div>
                  </div>
                  <div className={detailItemClasses}>
                    <div className={iconBoxClasses}><GraduationCap size={20} className="text-purple-700" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase">Students</p>
                      <p className="text-sm font-black text-ink">{job.numStudents}</p>
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-sm font-black text-[#001F3F]">Subjects:</span>
                  <div className="flex flex-wrap gap-2">
                    {job.subjects.map(sub => (
                      <span key={sub} className="px-3 py-1 bg-emerald-600 text-white rounded text-[10px] font-black uppercase shadow-sm">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Salary Box */}
                <div className="bg-emerald-50/50 rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row items-center gap-6 border border-emerald-100 text-center sm:text-left">
                  <div className="w-16 h-16 bg-[#001F3F] rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                    <Banknote size={32} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink-muted uppercase mb-1">Salary</p>
                    <p className="text-2xl md:text-3xl font-black text-primary">
                      {job.salary.toLocaleString()} Tk
                    </p>
                    <p className="text-xs font-bold text-ink-muted mt-1">Per Month</p>
                  </div>
                </div>

                {/* Other Requirements */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 text-ink">
                    <List size={20} className="text-ink" />
                    <h2 className="text-lg font-black">Other Requirements</h2>
                  </div>
                  <div className="space-y-2">
                    {job.requirements && job.requirements.length > 0 ? (
                      <ul className="space-y-2">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-ink-muted font-medium">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-ink-muted font-medium leading-relaxed">
                        {job.description || 'Highly experienced tutors are requested to apply.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Back Button */}
                <div className="pt-8">
                  <Link 
                    to="/jobs"
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-ink/10 rounded-lg font-bold text-ink hover:bg-ink/5 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                    Back to All Jobs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-ink/5 border border-ink/5 space-y-4">
              <button 
                onClick={() => setShowApplyModal(true)}
                disabled={hasApplied}
                className={cn(
                  "w-full py-3.5 rounded-xl font-black text-sm uppercase shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer",
                  hasApplied 
                    ? "bg-gray-100 text-gray-500 shadow-none cursor-default" 
                    : "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700"
                )}
              >
                {hasApplied ? (
                  <>
                    <Check size={18} />
                    Applied
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Apply Now
                  </>
                )}
              </button>

              <button 
                onClick={openMap}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm uppercase shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Navigation size={18} />
                Directions
              </button>

              {/* Colorful & Attractive Share Section */}
              <div className="pt-6 space-y-3 border-t border-ink/5">
                <p className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <Share2 size={16} className="text-primary" />
                  Share This Job
                </p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Messenger */}
                  <a 
                    href={`https://www.facebook.com/dialog/send?link=${encodeURIComponent(window.location.href)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 hover:scale-105 transition-transform cursor-pointer"
                    title="Share on Messenger"
                  >
                    <MessageSquare size={18} />
                  </a>
                  {/* WhatsApp */}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Tutor Needed For ${job.medium} in ${job.location} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-green-400 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform cursor-pointer"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>
                  {/* Facebook Feed */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 hover:scale-105 transition-transform cursor-pointer"
                    title="Share on Facebook"
                  >
                    <Facebook size={18} />
                  </a>
                  {/* Twitter / X */}
                  <a 
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Tutor Needed For ${job.medium} in ${job.location}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gradient-to-tr from-sky-400 to-blue-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-sky-400/20 hover:scale-105 transition-transform cursor-pointer"
                    title="Share on Twitter"
                  >
                    <Twitter size={18} />
                  </a>
                  {/* Copy Link */}
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Job link copied to clipboard!');
                    }}
                    className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20 hover:scale-105 transition-transform cursor-pointer"
                    title="Copy Link"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px]">
              <div className="w-6 h-0.5 bg-primary" />
              Recommended for you
            </div>
            <h2 className="text-2xl md:text-4xl font-display font-black text-ink">
              Suggested Tuition Jobs
            </h2>
            <p className="text-xs md:text-sm text-ink-muted font-medium max-w-xl">
              Based on the current job's category and location, here are some other opportunities you might be interested in.
            </p>
          </div>
          <Link 
            to="/jobs" 
            className="inline-flex items-center gap-2 text-primary font-black text-sm uppercase hover:gap-3 transition-all cursor-pointer"
          >
            Explore All Jobs
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedJobs.map((suggestedJob) => (
            <motion.div
              key={suggestedJob.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[32px] border border-ink/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden group flex flex-col h-full"
            >
              <div className="p-6 flex-grow space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="px-3 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase border border-primary/10">
                    Job ID: {suggestedJob.id}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {suggestedJob.status}
                  </div>
                </div>

                <h3 className="text-lg font-display font-black text-ink leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  Tutor Needed For {suggestedJob.medium}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-ink-muted">
                    <MapPin size={16} className="text-primary shrink-0" />
                    <span className="text-xs font-bold truncate">{suggestedJob.area}, {suggestedJob.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-ink-muted">
                    <GraduationCap size={16} className="text-primary shrink-0" />
                    <span className="text-xs font-bold">{suggestedJob.studentClass}</span>
                  </div>
                  <div className="flex items-center gap-3 text-ink-muted">
                    <BookOpen size={16} className="text-primary shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {suggestedJob.subjects?.slice(0, 2).map(sub => (
                        <span key={sub} className="text-[10px] font-black text-primary uppercase">{sub}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 bg-primary/5 border-t border-ink/5 flex items-center justify-between mt-auto">
                <div className="text-lg font-black text-primary">
                  {suggestedJob.salary?.toLocaleString()} ৳
                </div>
                <Link 
                  to={`/job/${suggestedJob.id}`}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all cursor-pointer"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Media Fee & Policy Alert Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <JobApplyModal 
            jobId={job.id}
            jobTitle={`Tutor Need For ${job.medium}`}
            salary={`${job.salary} Tk`}
            location={`${job.area}, ${job.location}`}
            onClose={() => setShowApplyModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
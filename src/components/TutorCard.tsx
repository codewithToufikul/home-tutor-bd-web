import { Star, CheckCircle, MapPin, GraduationCap, Briefcase, BookOpen, Banknote } from 'lucide-react';
import { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { SearchService } from '@/src/services/searchService';
import { getAvatarUrl } from '@/src/constants';

interface TutorCardProps {
  tutor: TutorProfile;
  className?: string;
  highlightQuery?: string;
}

export default function TutorCard({ tutor, className, highlightQuery }: TutorCardProps) {
  const tutorId = tutor.id || (tutor as any)._id || (tutor as any).uid || '';
  const displayName = (tutor as any).userId?.name || tutor.name || (tutor as any).fullName || 'Verified Tutor';
  const safePhotoUrl = getAvatarUrl(displayName || tutorId, tutor.photoUrl, tutor.gender);
  
  const safeSubject = tutor.subjects?.find((subject) => Boolean(subject?.trim())) || 'All Subjects';
  const safeDepartment = tutor.department?.trim() || safeSubject;
  const safeUniversity = tutor.university?.trim() || 'Top University';

  // Handle location as object ({ district, area }) or string
  const locObj = tutor.location as any;
  let fullLocation = '';
  if (typeof tutor.location === 'string' && tutor.location.trim()) {
    fullLocation = tutor.location.trim();
  } else if (locObj && (locObj.area || locObj.district)) {
    fullLocation = [locObj.area, locObj.district].filter(Boolean).join(', ');
  } else if (tutor.preferredAreas?.length) {
    fullLocation = tutor.preferredAreas[0];
  } else {
    fullLocation = 'Dhaka, Bangladesh';
  }

  // Real completed tuitions from backend — no more dummy fallback
  const completedCount = (tutor as any).totalTuitionsCompleted ?? 0;

  // Salary format
  const salaryText = tutor.salary && tutor.salary > 0 
    ? `৳${tutor.salary.toLocaleString()}/mo` 
    : '৳5,000 - 8,000/mo';

  const subjectsList = tutor.subjects?.filter(Boolean).slice(0, 3) || [];

  return (
    <Link to={`/tutor/${tutorId}`} className="block h-full group">
      <motion.div
        whileHover={{ y: -6 }}
        className={cn(
          "bg-white rounded-2xl border border-ink/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full flex flex-col relative",
          className
        )}
      >
        {/* Top Header Row with Badges */}
        <div className="p-4 pb-0 flex items-center justify-between gap-2">
          {/* Status Badge */}
          {tutor.isPremium ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-900 bg-gradient-to-r from-amber-200 to-yellow-400 shadow-sm border border-amber-300">
              ★ Premium Tutor
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200">
              <CheckCircle size={11} className="text-emerald-600" /> Verified
            </span>
          )}

          {/* Rating Badge — Real data only, no fallbacks */}
          {tutor.rating > 0 || tutor.reviewCount > 0 ? (
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
              <Star size={11} className="text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-black text-amber-900">{tutor.rating.toFixed(1)}</span>
              <span className="text-[10px] font-medium text-amber-700/80">({tutor.reviewCount})</span>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200">
              New
            </span>
          )}
        </div>

        {/* Compact Avatar & Basic Info Section */}
        <div className="p-4 flex flex-col items-center text-center">
          {/* Avatar with Professional Border */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary/30 via-primary/10 to-teal-400/40 shadow-md">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 border border-white">
                <img
                  src={safePhotoUrl}
                  alt={displayName}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {/* Active / Verified Mini Dot */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" title="Active Tutor" />
          </div>

          {/* Tutor Name */}
          <h3 className="text-base font-display font-bold text-ink group-hover:text-primary transition-colors leading-tight mb-1">
            {SearchService.highlightText(displayName, highlightQuery || '').map((segment, index) => (
              <span key={`${segment.text}-${index}`} className={segment.isMatch ? 'text-primary' : ''}>{segment.text}</span>
            ))}
          </h3>

          {/* University & Department */}
          <p className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 mb-0.5 line-clamp-1">
            <GraduationCap size={13} className="text-primary shrink-0" />
            <span>{safeUniversity}</span>
          </p>
          <p className="text-[11px] text-ink-muted font-medium line-clamp-1 mb-3">
            {safeDepartment}
          </p>

          {/* Meta Information Cards (Compact Grid) */}
          <div className="w-full grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-ink/5 text-left mb-3">
            {/* Completed Tuitions — Real from backend only */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
                <Briefcase size={12} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">Completed</p>
                {completedCount > 0 ? (
                  <p className="text-[11px] font-bold text-emerald-800 truncate leading-tight mt-0.5">{completedCount}+ Tuitions</p>
                ) : (
                  <p className="text-[11px] font-semibold text-slate-400 truncate leading-tight mt-0.5">New Tutor</p>
                )}
              </div>
            </div>

            {/* Salary Range */}
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
                <Banknote size={12} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-none">Salary</p>
                <p className="text-[11px] font-bold text-blue-900 truncate leading-tight mt-0.5">{salaryText}</p>
              </div>
            </div>
          </div>

          {/* Full Location Badge */}
          <div className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100/60 rounded-lg text-slate-700 text-xs font-medium border border-ink/5 mb-2">
            <MapPin size={12} className="text-rose-500 shrink-0" />
            <span className="truncate">{fullLocation}</span>
          </div>

          {/* Subjects Pills */}
          {subjectsList.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 w-full pt-1">
              {subjectsList.map((subject, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-emerald-50/70 text-emerald-800 text-[10px] font-semibold border border-emerald-100"
                >
                  {subject}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto p-3 pt-0">
          <div className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-xs text-center group-hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-1.5">
            <span>View Details</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
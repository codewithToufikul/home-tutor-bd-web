import { Star, CheckCircle, MapPin, GraduationCap, Briefcase, Banknote, BookOpen, ArrowRight } from 'lucide-react';
import { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { SearchService } from '@/src/services/searchService';
import { getAvatarUrl, DEFAULT_PROFILE_IMAGE } from '@/src/constants';

interface TutorCardProps {
  tutor: TutorProfile;
  className?: string;
  highlightQuery?: string;
}

export default function TutorCard({ tutor, className, highlightQuery }: TutorCardProps) {
  const tutorId = tutor.id || (tutor as any)._id || (tutor as any).uid || '';
  const displayName = (tutor as any).userId?.name || tutor.name || (tutor as any).fullName || 'Verified Tutor';
  const safePhotoUrl = getAvatarUrl(displayName || tutorId, tutor.photoUrl, tutor.gender);

  const safeSubject = tutor.subjects?.find((s) => Boolean(s?.trim())) || 'All Subjects';
  const safeDepartment = tutor.department?.trim() || safeSubject;
  const safeUniversity = tutor.university?.trim() || 'Top University';

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

  const completedCount = (tutor as any).totalTuitionsCompleted ?? 0;
  const salaryText = tutor.salary && tutor.salary > 0
    ? `৳${tutor.salary.toLocaleString()}/mo`
    : '৳5,000+/mo';

  const subjectsList = tutor.subjects?.filter(Boolean).slice(0, 3) || [];

  return (
    <Link to={`/tutor/${tutorId}`} className="block h-full group">
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 20px 40px -8px rgba(0,0,0,0.12)' }}
        transition={{ duration: 0.2 }}
        className={cn(
          "bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col relative transition-all duration-300 hover:border-slate-300",
          className
        )}
      >
        {/* ── TOP STATUS BAR ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-0">
          {tutor.isPremium ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200">
              ★ Premium
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle size={10} className="text-emerald-500" /> Verified
            </span>
          )}

          {tutor.rating > 0 || tutor.reviewCount > 0 ? (
            <div className="flex items-center gap-1">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-black text-slate-800">{tutor.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium">({tutor.reviewCount})</span>
            </div>
          ) : (
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">New</span>
          )}
        </div>

        {/* ── AVATAR + NAME SECTION ── */}
        <div className="px-4 pt-4 pb-3 flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-[60px] h-[60px] rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-100">
              <img
                src={safePhotoUrl}
                alt={displayName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.src !== DEFAULT_PROFILE_IMAGE) t.src = DEFAULT_PROFILE_IMAGE;
                }}
              />
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
          </div>

          {/* Name + University */}
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-sm font-black text-slate-900 leading-tight group-hover:text-teal-700 transition-colors truncate mb-1">
              {SearchService.highlightText(displayName, highlightQuery || '').map((seg, i) => (
                <span key={i} className={seg.isMatch ? 'text-teal-600' : ''}>{seg.text}</span>
              ))}
            </h3>
            <div className="flex items-center gap-1 mb-0.5">
              <GraduationCap size={11} className="text-slate-400 shrink-0" />
              <p className="text-[11px] font-semibold text-slate-600 truncate">{safeUniversity}</p>
            </div>
            <p className="text-[10px] text-slate-400 truncate">{safeDepartment}</p>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="mx-4 border-t border-slate-100" />

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 mx-4 mt-3 rounded-xl overflow-hidden border border-slate-100">
          <div className="bg-white px-3 py-2.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Briefcase size={9} /> Experience
            </p>
            {completedCount > 0 ? (
              <p className="text-xs font-black text-slate-800">{completedCount}+ done</p>
            ) : (
              <p className="text-xs font-bold text-slate-400">New Tutor</p>
            )}
          </div>
          <div className="bg-white px-3 py-2.5">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
              <Banknote size={9} /> Salary
            </p>
            <p className="text-xs font-black text-slate-800">{salaryText}</p>
          </div>
        </div>

        {/* ── LOCATION ── */}
        <div className="mx-4 mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <MapPin size={11} className="text-rose-400 shrink-0" />
          <span className="truncate">{fullLocation}</span>
        </div>

        {/* ── SUBJECTS ── */}
        {subjectsList.length > 0 && (
          <div className="mx-4 mt-2.5 flex flex-wrap gap-1">
            <BookOpen size={10} className="text-slate-300 mt-1 shrink-0" />
            {subjectsList.map((sub, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-semibold border border-slate-200"
              >
                {sub}
              </span>
            ))}
          </div>
        )}

        {/* ── CTA BUTTON ── */}
        <div className="mt-auto p-4 pt-3">
          <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-teal-700 text-white font-bold text-xs transition-colors duration-200">
            <span>View Profile</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

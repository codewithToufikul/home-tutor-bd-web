import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MapPin, Trash2, Star,
  ShieldCheck, BookOpen, RefreshCw, Search, ArrowRight
} from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { SavedTutorsService } from '@/src/services/savedTutorsService.ts';
import { TutorProfileRepository } from '@/src/repositories/tutorProfileRepository.ts';
import { SavedTutorsRepository } from '@/src/repositories/savedTutorsRepository.ts';
import { DEFAULT_PROFILE_IMAGE, getAvatarUrl } from '@/src/constants';

export default function StudentSavedTutors() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadSaved = async () => {
    if (!user?.uid) {
      setTutors([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const saved = await SavedTutorsService.listForStudent(user.uid);
      const profiles = await Promise.all(
        (saved || []).map(async (s: any) => {
          try {
            const profile = await TutorProfileRepository.getById(String(s.tutorId));
            if (!profile) return null;
            return { ...profile, _savedRecordId: s.id || s._id, _savedAt: s.createdAt };
          } catch {
            return null;
          }
        })
      );
      setTutors(profiles.filter(Boolean));
    } catch (err) {
      console.error('Failed to load saved tutors:', err);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSaved();
  }, [user]);

  const handleRemove = async (tutor: any) => {
    const recordId = tutor._savedRecordId || tutor.id || tutor._id;
    setRemovingId(recordId);
    try {
      await SavedTutorsRepository.remove(recordId);
      setTutors(prev => prev.filter(t => (t._savedRecordId || t.id || t._id) !== recordId));
    } catch (err) {
      console.error('Failed to remove saved tutor:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = tutors.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (t.userId?.name || t.name || '').toLowerCase();
    const uni = (t.university || '').toLowerCase();
    const dept = (t.department || '').toLowerCase();
    const subjects = (t.subjects || []).join(' ').toLowerCase();
    return name.includes(q) || uni.includes(q) || dept.includes(q) || subjects.includes(q);
  });

  return (
    <StudentLayout>
      <div className="space-y-6 pb-12 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#001F3F] flex items-center gap-2">
              <Heart size={22} className="text-rose-500 fill-rose-500" />
              Saved Tutors
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              টিউটরদের প্রোফাইল থেকে সেভ করা টিউটরদের তালিকা।
              {tutors.length > 0 && ` ${tutors.length} জন সেভ করা আছেন।`}
            </p>
          </div>
          <Link
            to="/tutors"
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 w-fit"
          >
            <Search size={14} /> Browse Tutors
          </Link>
        </div>

        {/* Search Bar */}
        {tutors.length > 0 && (
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, subject, university..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-ink/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            />
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-ink/10 p-6 space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded w-full" />
                <div className="h-8 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Tutor Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map((tutor: any) => {
                const tutorId = tutor.id || tutor._id;
                const recordId = tutor._savedRecordId || tutorId;
                const displayName = tutor.userId?.name || tutor.name || tutor.fullName || 'Verified Tutor';
                const university = tutor.gradInstitute || tutor.university || '';
                const department = tutor.gradDept || tutor.department || '';
                const avatarUrl = getAvatarUrl(displayName, tutor.photoUrl || tutor.avatar || tutor.userId?.avatar);
                const location = typeof tutor.location === 'object'
                  ? [tutor.location?.area, tutor.location?.district].filter(Boolean).join(', ')
                  : (tutor.location || tutor.preferredArea || '');
                const rating = tutor.rating || 5.0;
                const subjects: string[] = Array.isArray(tutor.subjects) ? tutor.subjects : [];
                const isRemoving = removingId === recordId;

                return (
                  <motion.div
                    key={recordId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="bg-white rounded-3xl border border-ink/10 shadow-sm hover:shadow-md transition-all p-6 relative space-y-4"
                  >
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemove(tutor)}
                      disabled={isRemoving}
                      className="absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer border border-rose-200 disabled:opacity-50"
                      title="Remove from saved"
                    >
                      {isRemoving
                        ? <RefreshCw size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4 pr-10">
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl || DEFAULT_PROFILE_IMAGE}
                          alt={displayName}
                          className="w-16 h-16 rounded-2xl object-cover border border-ink/5 bg-slate-100"
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE; }}
                        />
                        {tutor.isVerified && (
                          <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                            <ShieldCheck size={10} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-[#001F3F] truncate">{displayName}</h3>
                        {university && <p className="text-[11px] font-bold text-primary truncate">{university}</p>}
                        {department && <p className="text-[10px] font-medium text-ink-muted truncate">{department}</p>}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-ink-muted">
                      <Star size={13} className="text-amber-400 fill-amber-400" />
                      <span className="text-amber-600 font-black">{Number(rating).toFixed(1)}</span>
                      {tutor.reviewCount ? <span className="text-ink-muted">({tutor.reviewCount} reviews)</span> : null}
                    </div>

                    {/* Location */}
                    {location && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                        <MapPin size={13} className="text-secondary shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}

                    {/* Subjects */}
                    {subjects.length > 0 && (
                      <div className="flex items-start gap-1.5">
                        <BookOpen size={13} className="text-primary mt-0.5 shrink-0" />
                        <p className="text-[10px] text-ink-muted line-clamp-2">{subjects.slice(0, 6).join(', ')}</p>
                      </div>
                    )}

                    {/* Salary */}
                    {tutor.salary && (
                      <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-200">
                        ৳{Number(tutor.salary).toLocaleString()} / month
                      </div>
                    )}

                    {/* View Profile Button */}
                    <div className="pt-1 border-t border-ink/5">
                      <Link
                        to={`/tutor/${tutorId}`}
                        className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                      >
                        View Profile <ArrowRight size={12} />
                      </Link>
                    </div>

                    {tutor._savedAt && (
                      <p className="text-[10px] text-ink-muted/60 text-right">
                        Saved {new Date(tutor._savedAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* No search results */}
        {!loading && tutors.length > 0 && filtered.length === 0 && (
          <div className="bg-white p-10 rounded-3xl border border-ink/10 text-center space-y-3">
            <Search size={32} className="mx-auto text-ink-muted/40" />
            <p className="font-black text-ink">কোনো টিউটর পাওয়া যায়নি</p>
            <p className="text-xs text-ink-muted">"{search}" — এই সার্চের সাথে মিলছে না।</p>
            <button onClick={() => setSearch('')} className="text-xs text-primary font-bold underline underline-offset-2 cursor-pointer">
              Clear Search
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && tutors.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-ink/10 shadow-sm text-center space-y-5">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <Heart size={36} className="text-rose-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-ink">কোনো সেভ করা টিউটর নেই</h3>
              <p className="text-sm text-ink-muted">টিউটরদের প্রোফাইল পেজে Heart আইকনে ক্লিক করে সেভ করুন।</p>
            </div>
            <Link
              to="/tutors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Search size={14} /> Browse All Tutors
            </Link>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

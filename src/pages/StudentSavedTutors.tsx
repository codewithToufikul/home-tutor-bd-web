import { Heart, MapPin, GraduationCap, Trash2 } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { SavedTutorsService } from '@/src/services/savedTutorsService.ts';
import { TutorProfileRepository } from '@/src/repositories/tutorProfileRepository.ts';
import { DEFAULT_PROFILE_IMAGE } from '@/src/constants';

export default function StudentSavedTutors() {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setTutors([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const saved = await SavedTutorsService.listForStudent(user.uid);
        const tutorIds = (saved || []).map((s: any) => s.tutorId).filter(Boolean);
        const tutorsData = await Promise.all(tutorIds.map((id: string) => TutorProfileRepository.getById(id)));
        setTutors((tutorsData || []).filter(Boolean));
      } catch (err) {
        console.error('Failed to load saved tutors:', err);
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <StudentLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">Saved Tutors</h1>
          <p className="text-xs text-ink-muted">Quick access to the tutors you bookmarked for future reference.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div key={tutor?.id} className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm relative group space-y-4">
              <button className="absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-4">
                <img src={(tutor?.photoUrl ?? tutor?.avatar ?? '').toString().trim() || DEFAULT_PROFILE_IMAGE} alt={tutor?.name || 'Tutor'} className="w-16 h-16 rounded-2xl object-cover border border-ink/5" />
                <div>
                  <h3 className="text-base font-black text-[#001F3F]">{tutor?.name || tutor?.fullName}</h3>
                  <p className="text-xs font-bold text-secondary">{tutor?.gradInstitute || tutor?.university}</p>
                  <p className="text-[11px] font-medium text-ink-muted">{tutor?.gradDept || tutor?.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium pt-2 border-t border-ink/5">
                <MapPin size={14} className="text-secondary" /> {tutor?.preferredArea || tutor?.area || 'Unknown'}
              </div>
              <Link 
                to={`/tutor/${tutor?.id}`} 
                className="block w-full py-3 text-center bg-secondary text-white font-bold text-xs uppercase rounded-xl hover:emerald-600 transition-all shadow-md shadow-secondary/20"
              >
                View Profile
              </Link>
            </div>
          ))}

          {!loading && tutors.length === 0 && (
            <div className="col-span-3 bg-white p-12 rounded-3xl border border-ink/10 shadow-sm text-center">
              <h3 className="text-xl font-black">No saved tutors</h3>
              <p className="text-ink-muted">Save tutors from tutor profiles to access them quickly.</p>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
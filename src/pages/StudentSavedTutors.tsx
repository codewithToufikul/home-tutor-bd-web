import { Heart, MapPin, GraduationCap, Trash2 } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { Link } from 'react-router-dom';

const SAVED_TUTORS = [
  { id: 'TUTOR-002', name: 'Saiful Arafat', university: 'BUET', department: 'EEE', area: 'Mirpur, Dhaka', photo: 'https://picsum.photos/seed/tutor1/200/200' },
  { id: 'TUTOR-005', name: 'Sultana Begum', university: 'Dhaka University', department: 'English', area: 'Uttara, Dhaka', photo: 'https://picsum.photos/seed/tutor2/200/200' },
];

export default function StudentSavedTutors() {
  return (
    <StudentLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">Saved Tutors</h1>
          <p className="text-xs text-ink-muted">Quick access to the tutors you bookmarked for future reference.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAVED_TUTORS.map((tutor) => (
            <div key={tutor.id} className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm relative group space-y-4">
              <button className="absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors">
                <Trash2 size={16} />
              </button>
              <div className="flex items-center gap-4">
                <img src={tutor.photo} alt={tutor.name} className="w-16 h-16 rounded-2xl object-cover border border-ink/5" />
                <div>
                  <h3 className="text-base font-black text-[#001F3F]">{tutor.name}</h3>
                  <p className="text-xs font-bold text-secondary">{tutor.university}</p>
                  <p className="text-[11px] font-medium text-ink-muted">{tutor.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium pt-2 border-t border-ink/5">
                <MapPin size={14} className="text-secondary" /> {tutor.area}
              </div>
              <Link 
                to={`/tutor/${tutor.id}`} 
                className="block w-full py-3 text-center bg-secondary text-white font-bold text-xs uppercase rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-secondary/20"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
}
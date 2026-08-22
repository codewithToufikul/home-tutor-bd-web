import { useState, useEffect } from 'react';
import { Users, UserCheck, Search, ShieldCheck, Mail, Phone, MapPin, GraduationCap } from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { apiGet } from '@/src/repositories/baseRepository';
import { CoachingService } from '@/src/services/coachingService.ts';

export default function CoachingMembers() {
  const [activeTab, setActiveTab] = useState<'tutors' | 'students'>('tutors');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedTutors, setAssignedTutors] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      setLoading(true);
      try {
        const profile = await CoachingService.getProfile();
        if (profile && Array.isArray(profile.assignedTutorIds)) {
          setAssignedTutors(profile.assignedTutorIds);
        } else {
          setAssignedTutors([]);
        }

        // Fetch approved enrolled students for this coaching
        const enrollments = await apiGet<any[]>('/enrollments/my-enrollments');
        if (Array.isArray(enrollments)) {
          const approved = enrollments.filter((e: any) => e.status === 'approved');
          setEnrolledStudents(approved);
        } else {
          setEnrolledStudents([]);
        }
      } catch (err) {
        console.error('Failed to load members:', err);
      } finally {
        setLoading(false);
      }
    };
    loadMembers();
  }, []);

  const filteredTutors = assignedTutors.filter((t) =>
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = enrolledStudents.filter((st) => {
    const name = st.studentUserId?.name || st.studentName || '';
    const batch = st.batchName || '';
    const cls = st.studentClass || '';
    const inst = st.institution || '';
    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      batch.toLowerCase().includes(q) ||
      cls.toLowerCase().includes(q) ||
      inst.toLowerCase().includes(q)
    );
  });

  return (
    <CoachingLayout title="Tutors & Students">
      <div className="space-y-8">
        {/* Header Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ink/5 shadow-sm">
          <div>
            <h3 className="text-xl font-display font-black text-ink">Institute Faculty & Enrolled Members</h3>
            <p className="text-xs text-ink-muted mt-1">Manage assigned tutors, faculty instructors, and enrolled students.</p>
          </div>

          <div className="flex gap-2 bg-background p-1.5 rounded-2xl border border-ink/5">
            <button
              onClick={() => setActiveTab('tutors')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'tutors' ? 'bg-primary text-white shadow-md' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Assigned Tutors ({assignedTutors.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                activeTab === 'students' ? 'bg-primary text-white shadow-md' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Enrolled Students ({enrolledStudents.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input 
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-ink/5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        {/* Content List */}
        {activeTab === 'tutors' ? (
          filteredTutors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTutors.map((tutor) => (
                <div key={tutor.id || tutor._id} className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xl shrink-0">
                    {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-base font-black text-ink truncate">{tutor.name}</h4>
                    <p className="text-xs text-primary font-bold">{tutor.subject || 'Faculty Member'}</p>
                    <p className="text-[11px] text-ink-muted flex items-center gap-1.5"><Phone size={12} /> {tutor.phone || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-ink/5 text-center space-y-3 shadow-sm">
              <Users size={36} className="text-ink-muted mx-auto" />
              <h4 className="text-base font-black text-ink">No assigned tutors yet</h4>
              <p className="text-xs text-ink-muted">When instructors or tutors are assigned to your coaching institute, they will be listed here.</p>
            </div>
          )
        ) : (
          filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((st) => {
                const name = st.studentUserId?.name || st.studentName || 'Student';
                const email = st.studentUserId?.email || st.studentEmail || '';
                const phone = st.studentPhone || 'N/A';
                const avatar = st.studentUserId?.avatar || '';

                return (
                  <div key={st._id || st.id} className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-200 text-emerald-700 flex items-center justify-center font-black text-lg shrink-0 overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-ink truncate">{name}</h4>
                        <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-full border border-emerald-200 mt-0.5">
                          {st.studentClass || 'Enrolled Student'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-ink-muted border-t border-ink/5 pt-3">
                      <p className="flex items-center justify-between">
                        <span className="text-gray-500">Batch Name:</span>
                        <span className="font-bold text-primary">{st.batchName}</span>
                      </p>
                      {st.institution && (
                        <p className="flex items-center justify-between">
                          <span className="text-gray-500">School/College:</span>
                          <span className="font-semibold text-indigo-600 truncate max-w-[160px]">{st.institution}</span>
                        </p>
                      )}
                      <p className="flex items-center justify-between">
                        <span className="text-gray-500">Mobile Phone:</span>
                        <span className="font-bold text-ink">{phone}</span>
                      </p>
                      {email && (
                        <p className="flex items-center justify-between">
                          <span className="text-gray-500">Email:</span>
                          <span className="font-medium text-gray-700 truncate max-w-[160px]">{email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-ink/5 text-center space-y-3 shadow-sm">
              <GraduationCap size={36} className="text-ink-muted mx-auto" />
              <h4 className="text-base font-black text-ink">No enrolled students yet</h4>
              <p className="text-xs text-ink-muted font-medium">When students register or get enrolled in your batches, they will appear here live.</p>
            </div>
          )
        )}
      </div>
    </CoachingLayout>
  );
}

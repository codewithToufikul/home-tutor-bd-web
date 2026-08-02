import { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  Building2, 
  TrendingUp, 
  Plus
} from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function CoachingDashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    totalBatches: 4,
    activeStudents: 48,
    assignedTutors: 6,
    pendingRequests: 2
  });

  return (
    <CoachingLayout title="Coaching Dashboard">
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-primary/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
              Verified Coaching Center
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black">
              Welcome, {user?.name || 'Institute Admin'}!
            </h2>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              Manage your academic batches, track student progress, and connect with verified tutors through Home Tutor Provider BD.
            </p>
          </div>
          <button className="bg-white text-primary px-6 py-3 rounded-2xl font-bold text-xs shadow-lg hover:bg-background transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
            <Plus size={16} />
            Create New Batch
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Total Batches</p>
              <h3 className="text-2xl font-black text-ink mt-1">{stats.totalBatches}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Active Students</p>
              <h3 className="text-2xl font-black text-ink mt-1">{stats.activeStudents}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Assigned Tutors</p>
              <h3 className="text-2xl font-black text-ink mt-1">{stats.assignedTutors}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase">Pending Requests</p>
              <h3 className="text-2xl font-black text-ink mt-1">{stats.pendingRequests}</h3>
            </div>
          </div>
        </div>

        {/* Recent Batches / Activity Section */}
        <div className="bg-white rounded-3xl border border-ink/5 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-ink/5 pb-4">
            <div>
              <h3 className="text-lg font-display font-bold text-ink">Active Batches & Programs</h3>
              <p className="text-xs text-ink-muted">List of ongoing coaching batches and schedules.</p>
            </div>
            <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View All</span>
          </div>

          <div className="space-y-4">
            {[
              { id: 'B-101', name: 'HSC Physics & Math Special Batch', class: 'HSC 2nd Year', students: 18, tutor: 'Dr. Rahman', status: 'Running' },
              { id: 'B-102', name: 'SSC English & ICT Foundation', class: 'SSC Candidates', students: 15, tutor: 'Tanvir Ahmed', status: 'Running' },
              { id: 'B-103', name: 'Class 9 General Science Circle', class: 'Class 9', students: 15, tutor: 'Sumaiya Akter', status: 'Upcoming' }
            ].map((batch) => (
              <div key={batch.id} className="bg-background border border-ink/5 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                      {batch.id}
                    </span>
                    <span className="text-xs font-bold text-ink-muted">{batch.class}</span>
                  </div>
                  <h4 className="font-bold text-ink text-sm sm:text-base">{batch.name}</h4>
                  <p className="text-xs text-ink-muted">Assigned Mentor: <span className="text-ink font-bold">{batch.tutor}</span></p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-xs font-bold text-ink">{batch.students} Students</p>
                    <span className={cn(
                      "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase mt-1",
                      batch.status === 'Running' ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                    )}>
                      {batch.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CoachingLayout>
  );
}
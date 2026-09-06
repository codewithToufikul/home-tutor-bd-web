import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Building2, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Clock, 
  GraduationCap, 
  X, 
  Check,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import { CoachingService } from '@/src/services/coachingService.ts';
import { CoachingProfileRecord } from '@/src/repositories/coachingRepository';

const CLASS_OPTIONS = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
  'SSC Examinee', 'HSC 1st Year (Class 11)', 'HSC 2nd Year (Class 12)', 
  'HSC Examinee', 'University Admission', 'Skill & Spoken English'
];

const SUBJECT_OPTIONS = [
  'General Math', 'Higher Math', 'Physics', 'Chemistry', 
  'Biology', 'ICT', 'English', 'Bangla', 'Accounting', 
  'Finance', 'Economics', 'General Science', 'Religious Studies'
];

const MEDIUM_OPTIONS = [
  'Bangla Medium', 'English Version', 'English Medium', 'Madrasah Medium'
];

export default function CoachingDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachingProfileRecord | null>(null);
  const [stats, setStats] = useState({
    totalBatches: 0,
    activeBatches: 0,
    activeStudents: 0,
    assignedTutors: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showBatchModal, setShowBatchModal] = useState(false);
  
  // Multi-select & Form State
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Higher Math', 'Physics']);
  const [customSubjectInput, setCustomSubjectInput] = useState('');
  const [batchForm, setBatchForm] = useState({
    batchName: '',
    className: 'Class 10',
    medium: 'Bangla Medium',
    schedule: '3 Days/Week (5:00 PM)',
    fee: '3000',
    maxStudents: '30',
    instructorName: '',
  });
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profData, statsData] = await Promise.all([
        CoachingService.getProfile().catch(() => null),
        CoachingService.getStats().catch(() => null),
      ]);
      if (profData) setProfile(profData);
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Failed to load coaching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleSubject = (subj: string) => {
    if (selectedSubjects.includes(subj)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subj));
    } else {
      setSelectedSubjects([...selectedSubjects, subj]);
    }
  };

  const handleAddCustomSubject = () => {
    if (customSubjectInput.trim() && !selectedSubjects.includes(customSubjectInput.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubjectInput.trim()]);
      setCustomSubjectInput('');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchForm.batchName) {
      alert('দয়া করে ব্যাচের নাম প্রদান করুন!');
      return;
    }
    if (selectedSubjects.length === 0) {
      alert('দয়া করে অন্তত একটি বিষয় (Subject) সিলেক্ট করুন!');
      return;
    }
    setCreating(true);
    try {
      const subjectString = selectedSubjects.join(', ');
      await CoachingService.createBatch({
        batchName: batchForm.batchName,
        className: `${batchForm.className} (${batchForm.medium})`,
        subject: subjectString,
        schedule: batchForm.schedule,
        fee: Number(batchForm.fee) || 0,
        maxStudents: Number(batchForm.maxStudents) || 30,
        enrolledCount: 0,
        status: 'Active',
        instructorName: batchForm.instructorName || user?.name || 'Faculty Tutor',
      });
      setShowBatchModal(false);
      setBatchForm({
        batchName: '',
        className: 'Class 10',
        medium: 'Bangla Medium',
        schedule: '3 Days/Week (5:00 PM)',
        fee: '3000',
        maxStudents: '30',
        instructorName: '',
      });
      setSelectedSubjects(['Higher Math', 'Physics']);
      loadData();
    } catch (err: any) {
      alert(err.message || 'ব্যাচ তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই ব্যাচটি মুছে ফেলতে চান?')) return;
    try {
      await CoachingService.deleteBatch(batchId);
      loadData();
    } catch (err) {
      console.error('Delete batch error:', err);
    }
  };

  const batches = profile?.batches || [];

  return (
    <CoachingLayout title="Coaching Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner — Premium */}
        <div className="relative overflow-hidden bg-gradient-to-135deg rounded-2xl text-white shadow-2xl shadow-primary/25"
          style={{ background: 'linear-gradient(135deg, #0d9488 0%, #7c3aed 55%, #db2777 100%)' }}>
          {/* Decorative orbs */}
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute top-4 right-32 w-6 h-6 rounded-full bg-white/20" />
          <div className="absolute bottom-6 right-16 w-3 h-3 rounded-full bg-white/30" />

          <div className="relative p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles size={11} /> Verified Coaching Center
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black leading-snug">
                Welcome, {profile?.instituteName || user?.name || 'Institute Admin'}!
              </h2>
              <p className="text-white/75 text-[11px] sm:text-xs max-w-lg leading-relaxed">
                ম্যানেজ করুন আপনার একাডেমিক ব্যাচ, লাইভ টিউটর অ্যাসাইনমেন্ট এবং ইনস্ট্যান্ট স্টুডেন্টদের তালিকা।
              </p>
            </div>
            <button 
              onClick={() => setShowBatchModal(true)}
              className="bg-white text-primary px-5 py-3 rounded-xl font-black text-xs shadow-xl hover:shadow-2xl hover:scale-[1.03] transition-all active:scale-95 flex items-center gap-2 cursor-pointer shrink-0 border border-white/50"
            >
              <Plus size={16} />
              Create New Batch
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Batches', value: stats.totalBatches, icon: BookOpen, color: 'from-primary/20 to-primary/5', textColor: 'text-primary', border: 'border-l-primary' },
            { label: 'Active Students', value: stats.activeStudents, icon: Users, color: 'from-blue-500/20 to-blue-500/5', textColor: 'text-blue-600', border: 'border-l-blue-500' },
            { label: 'Assigned Tutors', value: stats.assignedTutors, icon: Building2, color: 'from-emerald-500/20 to-emerald-500/5', textColor: 'text-emerald-600', border: 'border-l-emerald-500' },
            { label: 'Active Batches', value: stats.activeBatches, icon: TrendingUp, color: 'from-purple-500/20 to-purple-500/5', textColor: 'text-purple-600', border: 'border-l-purple-500' },
          ].map(({ label, value, icon: Icon, color, textColor, border }) => (
            <div key={label} className={`bg-white p-5 rounded-2xl border border-ink/5 border-l-4 ${border} shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} ${textColor} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-[10px] font-black text-ink-muted uppercase tracking-wider">{label}</p>
              <h3 className="text-3xl font-black text-ink mt-0.5 leading-none">{value}</h3>
            </div>
          ))}
        </div>

        {/* Academic Batches Section */}
        <div className="bg-white rounded-3xl border border-ink/5 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-black text-ink">Academic Batches & Schedules</h3>
              <p className="text-xs text-ink-muted">List of active coaching batches, subjects, and assigned instructors.</p>
            </div>
            <button 
              onClick={() => setShowBatchModal(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={14} /> Add Batch
            </button>
          </div>

          {batches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {batches.map((batch: any) => (
                <div 
                  key={String(batch._id || batch.id || Math.random())}
                  className="p-5 rounded-2xl border border-ink/10 bg-background hover:bg-white hover:shadow-md transition-all space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase">
                        {batch.className}
                      </span>
                      <h4 className="text-base font-black text-ink">{batch.batchName}</h4>
                    </div>
                    <button 
                      onClick={() => handleDeleteBatch(String(batch._id || batch.id))}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete Batch"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-ink-muted">
                    <div className="col-span-2">Subject(s): <span className="font-bold text-ink">{batch.subject}</span></div>
                    <div>Fee: <span className="font-black text-primary">৳{batch.fee}</span></div>
                    <div>Schedule: <span className="font-bold text-ink">{batch.schedule}</span></div>
                    <div className="col-span-2">Instructor: <span className="font-bold text-purple-600">{batch.instructorName || 'Faculty Tutor'}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3 bg-background rounded-2xl border border-dashed border-ink/10">
              <BookOpen size={36} className="text-ink-muted mx-auto" />
              <p className="text-xs font-bold text-ink-muted">No academic batches added yet.</p>
              <button 
                onClick={() => setShowBatchModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-primary-dark transition-all cursor-pointer"
              >
                Create First Batch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Create Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-ink/10 my-8 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowBatchModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                <h3 className="text-xl font-display font-black text-ink">Create New Batch</h3>
              </div>
              <p className="text-xs text-ink-muted">Set up an academic coaching batch with multiple subjects & class selection.</p>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-5 text-xs font-bold">
              {/* Batch Name */}
              <div>
                <label className="block mb-1 text-ink-muted uppercase">Batch Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. HSC Special Science Batch 2026"
                  value={batchForm.batchName}
                  onChange={(e) => setBatchForm({ ...batchForm, batchName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background"
                />
              </div>

              {/* Class Dropdown & Medium Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-ink-muted uppercase">Select Class *</label>
                  <div className="relative">
                    <select
                      value={batchForm.className}
                      onChange={(e) => setBatchForm({ ...batchForm, className: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background appearance-none pr-10 cursor-pointer"
                    >
                      {CLASS_OPTIONS.map((cls) => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-ink-muted uppercase">Select Medium *</label>
                  <div className="relative">
                    <select
                      value={batchForm.medium}
                      onChange={(e) => setBatchForm({ ...batchForm, medium: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background appearance-none pr-10 cursor-pointer"
                    >
                      {MEDIUM_OPTIONS.map((med) => (
                        <option key={med} value={med}>{med}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Multi-Select Subjects */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-ink-muted uppercase">Select Subjects (Multiple Selectable) *</label>
                  <span className="text-[10px] text-primary font-black uppercase">{selectedSubjects.length} Selected</span>
                </div>

                {/* Selected Subject Badges */}
                {selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-primary/5 rounded-2xl border border-primary/20">
                    {selectedSubjects.map((subj) => (
                      <span 
                        key={subj}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-white text-[11px] font-bold rounded-xl shadow-sm"
                      >
                        {subj}
                        <button
                          type="button"
                          onClick={() => toggleSubject(subj)}
                          className="hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Available Subject Chips */}
                <div className="flex flex-wrap gap-2 p-3 bg-background rounded-2xl border border-ink/5 max-h-36 overflow-y-auto custom-scrollbar">
                  {SUBJECT_OPTIONS.map((subj) => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => toggleSubject(subj)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
                          isSelected
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "bg-white text-ink border border-ink/10 hover:bg-gray-100"
                        )}
                      >
                        {isSelected && <Check size={14} />}
                        {subj}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Subject Input */}
                <div className="flex gap-2 pt-1">
                  <input 
                    type="text" 
                    placeholder="Add custom subject (if not listed)..."
                    value={customSubjectInput}
                    onChange={(e) => setCustomSubjectInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSubject(); } }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-ink/10 text-xs font-medium outline-none focus:border-primary bg-background"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSubject}
                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Monthly Fee & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-ink-muted uppercase">Monthly Fee (৳) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="3000"
                    value={batchForm.fee}
                    onChange={(e) => setBatchForm({ ...batchForm, fee: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-ink-muted uppercase">Schedule & Timing</label>
                  <select
                    value={batchForm.schedule}
                    onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background"
                  >
                    <option value="">-- Select Schedule --</option>
                    <optgroup label="Days Per Week">
                      <option value="1 Day/Week (Friday)">1 Day/Week (Friday)</option>
                      <option value="1 Day/Week (Saturday)">1 Day/Week (Saturday)</option>
                      <option value="2 Days/Week (Fri & Sat)">2 Days/Week (Fri & Sat)</option>
                      <option value="3 Days/Week (Sat, Mon, Wed)">3 Days/Week (Sat, Mon, Wed)</option>
                      <option value="3 Days/Week (Sun, Tue, Thu)">3 Days/Week (Sun, Tue, Thu)</option>
                      <option value="4 Days/Week">4 Days/Week</option>
                      <option value="5 Days/Week (Sun–Thu)">5 Days/Week (Sun–Thu)</option>
                      <option value="6 Days/Week (Sat–Thu)">6 Days/Week (Sat–Thu)</option>
                      <option value="Daily (7 Days/Week)">Daily (7 Days/Week)</option>
                    </optgroup>
                    <optgroup label="Morning Batches">
                      <option value="3 Days/Week (7:00 AM)">3 Days/Week (7:00 AM)</option>
                      <option value="3 Days/Week (8:00 AM)">3 Days/Week (8:00 AM)</option>
                      <option value="3 Days/Week (9:00 AM)">3 Days/Week (9:00 AM)</option>
                      <option value="5 Days/Week (8:00 AM)">5 Days/Week (8:00 AM)</option>
                    </optgroup>
                    <optgroup label="Afternoon Batches">
                      <option value="3 Days/Week (12:00 PM)">3 Days/Week (12:00 PM)</option>
                      <option value="3 Days/Week (2:00 PM)">3 Days/Week (2:00 PM)</option>
                      <option value="3 Days/Week (3:00 PM)">3 Days/Week (3:00 PM)</option>
                      <option value="3 Days/Week (4:00 PM)">3 Days/Week (4:00 PM)</option>
                    </optgroup>
                    <optgroup label="Evening Batches">
                      <option value="3 Days/Week (5:00 PM)">3 Days/Week (5:00 PM)</option>
                      <option value="3 Days/Week (6:00 PM)">3 Days/Week (6:00 PM)</option>
                      <option value="3 Days/Week (7:00 PM)">3 Days/Week (7:00 PM)</option>
                      <option value="3 Days/Week (8:00 PM)">3 Days/Week (8:00 PM)</option>
                      <option value="5 Days/Week (6:00 PM)">5 Days/Week (6:00 PM)</option>
                    </optgroup>
                    <optgroup label="Special">
                      <option value="Weekend Batch (Fri & Sat)">Weekend Batch (Fri & Sat)</option>
                      <option value="Weekday Batch (Sun–Thu)">Weekday Batch (Sun–Thu)</option>
                      <option value="Crash Course (Daily)">Crash Course (Daily)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Instructor Name */}
              <div>
                <label className="block mb-1 text-ink-muted uppercase">Instructor / Tutor Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Engr. Tanvir Ahmed"
                  value={batchForm.instructorName}
                  onChange={(e) => setBatchForm({ ...batchForm, instructorName: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background"
                />
              </div>

              <button 
                type="submit"
                disabled={creating}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {creating ? 'Creating Batch...' : 'Create Batch Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </CoachingLayout>
  );
}

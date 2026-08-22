import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Check, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { CoachingService } from '@/src/services/coachingService.ts';
import { CoachingProfileRecord } from '@/src/repositories/coachingRepository';
import { cn } from '@/src/lib/utils';

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

export default function CoachingBatches() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachingProfileRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
    try {
      const profData = await CoachingService.getProfile();
      if (profData) setProfile(profData);
    } catch (err) {
      console.error('Failed to load batches:', err);
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

  const allBatches = profile?.batches || [];
  const filteredBatches = allBatches.filter((b: any) =>
    (b.batchName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.className || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CoachingLayout title="Manage Batches">
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-ink/5 shadow-sm">
          <div>
            <h3 className="text-xl font-display font-black text-ink">Academic Batches</h3>
            <p className="text-xs text-ink-muted mt-1">Total {allBatches.length} active and scheduled coaching batches.</p>
          </div>
          <button 
            onClick={() => setShowBatchModal(true)}
            className="px-6 py-3.5 bg-primary text-white font-bold text-xs rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Batch
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input 
            type="text"
            placeholder="Search batches by name, subject, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white rounded-2xl border border-ink/5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
        </div>

        {/* Batches Grid */}
        {filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch: any) => (
              <div 
                key={String(batch._id || batch.id || Math.random())}
                className="bg-white p-6 rounded-3xl border border-ink/5 shadow-sm space-y-4 hover:shadow-xl transition-all relative group"
              >
                <div className="flex items-start justify-between">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                    {batch.className}
                  </span>
                  <button 
                    onClick={() => handleDeleteBatch(String(batch._id || batch.id))}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Delete Batch"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h4 className="text-lg font-black text-ink">{batch.batchName}</h4>

                <div className="space-y-2 text-xs font-medium text-ink-muted pt-2 border-t border-ink/5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="shrink-0">Subject(s):</span>
                    <span className="font-bold text-ink text-right">{batch.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Fee:</span>
                    <span className="font-black text-primary">৳{batch.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Schedule:</span>
                    <span className="font-bold text-ink">{batch.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instructor:</span>
                    <span className="font-bold text-purple-600">{batch.instructorName || 'Faculty Tutor'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-ink/5 text-center space-y-4 shadow-sm">
            <BookOpen size={40} className="text-ink-muted mx-auto" />
            <div className="space-y-1">
              <h4 className="text-lg font-black text-ink">No batches found</h4>
              <p className="text-xs text-ink-muted">Create a new batch or try adjusting your search terms.</p>
            </div>
            <button 
              onClick={() => setShowBatchModal(true)}
              className="px-6 py-3 bg-primary text-white font-bold text-xs rounded-2xl shadow-md hover:bg-primary-dark transition-all cursor-pointer"
            >
              Create New Batch
            </button>
          </div>
        )}
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
                  <input 
                    type="text" 
                    placeholder="e.g. Sat, Mon, Wed (5:00 PM)"
                    value={batchForm.schedule}
                    onChange={(e) => setBatchForm({ ...batchForm, schedule: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium bg-background"
                  />
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

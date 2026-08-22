import StudentLayout from '@/src/components/StudentLayout.tsx';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Building2, 
  BookOpen, 
  MapPin, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  X,
  Phone,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/src/components/Navbar.tsx';
import Footer from '@/src/components/Footer.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { CoachingPublicRepository } from '@/src/repositories/coachingRepository';
import { CoachingProfileRecord } from '@/src/repositories/coachingRepository';
import { apiPost } from '@/src/repositories/baseRepository';
import { useNavigate } from 'react-router-dom';

export default function PublicCoachingExplorer({ isDashboard }: { isDashboard?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inDashboard = isDashboard || location.pathname.includes('/student/');
  const [coachingCenters, setCoachingCenters] = useState<CoachingProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Enrollment Modal State
  const [selectedBatch, setSelectedBatch] = useState<{ coaching: CoachingProfileRecord; batch: any } | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantInstitution, setApplicantInstitution] = useState('');
  const [applicantClass, setApplicantClass] = useState('');
  const [applicantNote, setApplicantNote] = useState('');

  useEffect(() => {
    const loadCenters = async () => {
      setLoading(true);
      try {
        const list = await CoachingPublicRepository.getAll();
        if (Array.isArray(list)) setCoachingCenters(list);
      } catch (err) {
        console.error('Failed to load coaching centers:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCenters();
  }, []);

  const handleEnrollClick = (coaching: CoachingProfileRecord, batch: any) => {
    if (!user) {
      alert('ভর্তি হতে দয়া করে প্রথমে আপনার অ্যাকাউন্টে লগইন বা সাইন আপ করুন!');
      navigate('/login');
      return;
    }
    setSelectedBatch({ coaching, batch });
    setEnrollSuccess(false);
    setApplicantPhone((user as any)?.phone || '');
    setApplicantInstitution('');
    setApplicantClass(batch.className || '');
    setApplicantNote('');
  };

  const handleConfirmEnroll = async () => {
    if (!selectedBatch) return;
    setEnrolling(true);
    try {
      const coachingId = String((selectedBatch.coaching as any)._id || '');
      const batchId = String(selectedBatch.batch._id || '');
      await apiPost(`/enrollments/${coachingId}/batches/${batchId}/enroll`, {
        phone: applicantPhone,
        institution: applicantInstitution,
        studentClass: applicantClass,
        note: applicantNote,
      });
      setEnrollSuccess(true);
      setTimeout(() => {
        setEnrollSuccess(false);
        setSelectedBatch(null);
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'ভর্তির জন্য আবেদন করতে সমস্যা হয়েছে।');
    } finally {
      setEnrolling(false);
    }
  };

  const filteredCenters = coachingCenters.filter((c) =>
    (c.instituteName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.district || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.batches || []).some((b: any) => (b.subject || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const content = (
    <div className={`w-full space-y-8 ${inDashboard ? '' : 'pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'}`}>
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-xl shadow-primary/20 space-y-3 text-center sm:text-left">
          <span className="px-3.5 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
            <Sparkles size={14} /> Verified Academic Coaching Centers
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-black">
            খুঁজে নিন আপনার এলাকার সেরা কোচিং সেন্টার ও একাডেমীক ব্যাচ
          </h1>
          <p className="text-white/80 text-sm max-w-2xl">
            অভিজ্ঞ শিক্ষক, নিয়মিত পরীক্ষা ও সেরা সিডিউলে সরাসরি ব্যাচে ভর্তি হোন আপনার পছন্দ অনুযায়ী।
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input 
            type="text"
            placeholder="Search coaching centers by name, district, location, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-ink/10 text-sm font-bold shadow-md outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Coaching Centers List */}
        {filteredCenters.length > 0 ? (
          <div className="space-y-8">
            {filteredCenters.map((coaching) => (
              <div 
                key={String((coaching as any)._id || Math.random())}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-ink/5 shadow-sm space-y-6 hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl shrink-0">
                      <Building2 size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-display font-black text-ink">{coaching.instituteName}</h2>
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      </div>
                      <p className="text-xs text-ink-muted flex items-center gap-1 mt-1 font-medium">
                        <MapPin size={14} className="text-primary" /> {coaching.location || coaching.district || 'Dhaka'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Batches Section */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-ink-muted">Available Batches ({coaching.batches?.length || 0})</h4>
                  
                  {coaching.batches && coaching.batches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {coaching.batches.map((batch: any) => (
                        <div 
                          key={String(batch._id || Math.random())}
                          className="bg-background p-5 rounded-2xl border border-ink/5 space-y-4 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full">
                              {batch.className}
                            </span>
                            <h3 className="text-base font-black text-ink leading-tight">{batch.batchName}</h3>
                            <p className="text-xs font-bold text-ink-muted">Subject: <span className="text-ink">{batch.subject}</span></p>
                            <p className="text-xs font-bold text-ink-muted">Schedule: <span className="text-ink">{batch.schedule}</span></p>
                          </div>

                          <div className="pt-3 border-t border-ink/5 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] text-ink-muted uppercase font-bold">Monthly Fee</p>
                              <p className="text-lg font-black text-primary">৳{batch.fee}</p>
                            </div>
                            <button
                              onClick={() => handleEnrollClick(coaching, batch)}
                              className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-primary-dark transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              Enroll Now <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-ink-muted py-4">No active batches listed yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-ink/5 text-center space-y-4 shadow-sm">
            <Building2 size={40} className="text-ink-muted mx-auto" />
            <h3 className="text-lg font-black text-ink">No coaching centers found</h3>
            <p className="text-xs text-ink-muted">Try adjusting your search criteria.</p>
          </div>
        )}

      {/* Enrollment Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-ink/10">
            <button 
              onClick={() => setSelectedBatch(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-rose-50 text-gray-500 hover:text-rose-600 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            {enrollSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-black text-ink">ভর্তির আবেদন সফল হয়েছে! 🎉</h3>
                <p className="text-xs font-medium text-ink-muted">
                  কোচিং সেন্টারটি আপনার আবেদনটি পেয়েছে এবং শীঘ্রই আপনার ফোনে যোগাযোগ করবে।
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-ink">Confirm Enrollment</h3>
                  <p className="text-xs text-ink-muted">Apply for batch enrollment at {selectedBatch.coaching.instituteName}.</p>
                </div>

                <div className="bg-background p-4 rounded-2xl border border-ink/5 space-y-2 text-xs">
                  <p className="font-bold text-ink">Batch: <span className="text-primary">{selectedBatch.batch.batchName}</span></p>
                  <p className="font-bold text-ink">Subject(s): <span>{selectedBatch.batch.subject}</span></p>
                  <p className="font-bold text-ink">Class: <span>{selectedBatch.batch.className}</span></p>
                  <p className="font-bold text-ink">Monthly Fee: <span className="text-primary font-black">৳{selectedBatch.batch.fee}</span></p>
                </div>

                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100/80 space-y-3">
                  <p className="font-bold text-xs text-blue-900 flex items-center justify-between">
                    <span>📋 Applicant & Student Information:</span>
                    <span className="text-[10px] text-blue-600 font-normal">Fill in details for coaching</span>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Applicant Name</label>
                      <input
                        type="text"
                        disabled
                        value={user?.name || ''}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Email</label>
                      <input
                        type="text"
                        disabled
                        value={user?.email || ''}
                        className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Mobile Number *</label>
                      <input
                        type="text"
                        placeholder="e.g. 01712345678"
                        value={applicantPhone}
                        onChange={(e) => setApplicantPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">School / College Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Dhaka Residential Model"
                        value={applicantInstitution}
                        onChange={(e) => setApplicantInstitution(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Current Class / Standard</label>
                    <input
                      type="text"
                      placeholder="e.g. Class 12 (Science)"
                      value={applicantClass}
                      onChange={(e) => setApplicantClass(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  <div className="text-xs">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Additional Details / Message (Optional)</label>
                    <textarea
                      placeholder="Specify shift preference, target subjects, GPA, or questions for the coaching..."
                      value={applicantNote}
                      onChange={(e) => setApplicantNote(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleConfirmEnroll}
                  disabled={enrolling}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer disabled:opacity-50"
                >
                  {enrolling ? 'Submitting Application...' : 'Confirm & Apply for Enrollment'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (inDashboard) {
    return <StudentLayout>{content}</StudentLayout>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">{content}</main>
      <Footer />
    </div>
  );
}

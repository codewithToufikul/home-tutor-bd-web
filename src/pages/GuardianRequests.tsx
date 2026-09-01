import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, Clock, CheckCircle2, MapPin, BookOpen, PlusCircle,
  Sparkles, Users, ArrowRight, Eye, Check, X, ShieldCheck
} from 'lucide-react';
import GuardianLayout from './GuardianLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository';
import { ApplicationRepository } from '@/src/repositories/applicationRepository';

export default function GuardianRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'matches' | 'applications' | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [shortlisted, setShortlisted] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRequests = async () => {
    if (!user) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const all: any = await TuitionService.list();
      const currentUserId = String(user.uid || (user as any)._id || (user as any).id || '');
      
      const mine = (all || []).filter((j: any) => {
        const postedById = typeof j.postedBy === 'object' ? String(j.postedBy?._id || j.postedBy?.id) : String(j.postedBy || j.parentId);
        return postedById === currentUserId;
      });

      // Sort latest posts first (top)
      mine.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return String(b._id || b.id || '').localeCompare(String(a._id || a.id || ''));
      });

      setRequests(mine);
    } catch (err) {
      console.error('Failed to load guardian requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const openApplicationsModal = async (job: any) => {
    setSelectedJob(job);
    setModalType('applications');
    setModalLoading(true);
    try {
      const jobId = String(job._id || job.id);
      const apps = await TuitionRepository.getApplications(jobId);
      setApplications(apps || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setModalLoading(false);
    }
  };

  const openMatchesModal = async (job: any) => {
    setSelectedJob(job);
    setModalType('matches');
    setModalLoading(true);
    try {
      const jobId = String(job._id || job.id);
      const res = await TuitionRepository.getShortlisted(jobId);
      setShortlisted(res?.shortlistedTutors || job.shortlistedTutors || []);
    } catch (err) {
      console.error('Failed to load shortlisted tutors:', err);
      setShortlisted(job.shortlistedTutors || []);
    } finally {
      setModalLoading(false);
    }
  };

  const handleAcceptApp = async (appId: string) => {
    if (!confirm('আপনি কি এই টিউটরকে নির্বাচন (Accept) করতে নিশ্চিত?')) return;
    setActionLoading(true);
    try {
      await ApplicationRepository.accept(appId);
      alert('আবেদনটি সফলভাবে গ্রহণ করা হয়েছে!');
      if (selectedJob) {
        await openApplicationsModal(selectedJob);
      }
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectApp = async (appId: string) => {
    if (!confirm('আপনি কি এই আবেদনটি প্রত্যাখ্যান (Reject) করতে চান?')) return;
    setActionLoading(true);
    try {
      await ApplicationRepository.reject(appId);
      alert('আবেদনটি প্রত্যাখ্যান করা হয়েছে।');
      if (selectedJob) {
        await openApplicationsModal(selectedJob);
      }
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'সমস্যা হয়েছে।');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <GuardianLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-xl shadow-ink/5">
          <div>
            <h1 className="text-3xl font-display font-black text-ink">My Tuition Requests</h1>
            <p className="text-xs font-medium text-ink-muted mt-1">আপনার পোস্ট করা টিউশন, আবেদনসমূহ ও অটো-ম্যাচ করা শর্টলিস্ট পরিচালনা করুন।</p>
          </div>
          <Link to="/request-tutor" className="bg-secondary text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase shadow-lg shadow-secondary/20 hover:bg-secondary-dark transition-all flex items-center gap-2 justify-center cursor-pointer">
            <PlusCircle size={16} /> Post New Job
          </Link>
        </div>

        <div className="space-y-4">
          {requests.map((job) => {
            const jobId = String(job._id || job.id);
            const subjectsStr = Array.isArray(job.subjects) ? job.subjects.join(', ') : job.category || 'Tuition';
            const locStr = typeof job.location === 'object' ? `${job.location?.area || ''}, ${job.location?.district || ''}` : `${job.area || ''}, ${job.location || ''}`;
            const shortlistCount = job.shortlistedTutors?.length || 0;

            return (
              <motion.div 
                key={jobId}
                whileHover={{ y: -2 }}
                className="bg-white/70 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 space-y-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2.5 py-1 rounded-lg">
                        Job #{jobId.slice(-6)}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        job.status === 'Matched' 
                          ? 'bg-purple-100 text-purple-700' 
                          : job.status === 'Open' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        Status: {job.status || 'Open'}
                      </span>
                      <span className="text-xs font-bold text-ink-muted">
                        • {new Date(job.createdAt || Date.now()).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-ink">{subjectsStr} ({job.studentClass})</h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-ink-muted">
                      <span className="flex items-center gap-1"><BookOpen size={14} className="text-secondary" /> {job.medium} Medium</span>
                      <span className="flex items-center gap-1"><MapPin size={14} className="text-secondary" /> {locStr}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md font-black">
                        ৳ {job.salary ? job.salary.toLocaleString() : 'Negotiable'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-ink/5">
                    <button
                      onClick={() => openMatchesModal(job)}
                      className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer border border-purple-200"
                    >
                      <Sparkles size={14} className="text-purple-600" />
                      Auto-Matched ({shortlistCount > 0 ? shortlistCount : 'Top 5'})
                    </button>

                    {/* Applications Page Link */}
                    <Link
                      to={`/guardian/requests/${jobId}/applications`}
                      className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Users size={14} />
                      Applications
                    </Link>

                    <Link
                      to={`/job/${jobId}`}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-ink rounded-xl transition-all"
                      title="View Job Details"
                    >
                      <Eye size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {!loading && requests.length === 0 && (
            <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 text-center space-y-4">
              <div className="w-20 h-20 bg-ink/5 rounded-full flex items-center justify-center text-ink-muted mx-auto">
                <History size={40} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink">No requests found</h3>
                <p className="text-ink-muted font-medium">You haven't posted any tuition requests yet.</p>
              </div>
              <Link to="/request-tutor" className="text-primary font-black text-sm hover:underline">Post your first job</Link>
            </div>
          )}
        </div>

        {/* Modal: Applications or Auto-Matches */}
        <AnimatePresence>
          {modalType && selectedJob && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white w-full max-w-3xl rounded-[32px] p-6 sm:p-8 shadow-2xl border border-ink/10 space-y-6 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                      {modalType === 'matches' ? <Sparkles size={14} /> : <Users size={14} />}
                      {modalType === 'matches' ? 'AI Auto-Matched Tutors' : 'Received Applications'}
                    </div>
                    <h2 className="text-xl font-black text-[#001F3F]">
                      Job: {selectedJob.subjects?.join(', ') || 'Tuition'} ({selectedJob.studentClass})
                    </h2>
                  </div>
                  <button
                    onClick={() => { setModalType(null); setSelectedJob(null); }}
                    className="p-2 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {modalLoading ? (
                  <div className="py-16 text-center text-xs font-bold text-ink-muted animate-pulse">
                    Loading details...
                  </div>
                ) : modalType === 'applications' ? (
                  /* Applications View */
                  <div className="space-y-4">
                    {applications.length === 0 ? (
                      <div className="py-12 text-center text-ink-muted space-y-2">
                        <Users size={36} className="mx-auto text-ink-muted/30" />
                        <p className="text-sm font-bold text-ink">এখনও কোনো আবেদন জমা পড়েনি।</p>
                        <p className="text-xs">টিউটররা আবেদন করলে এখানে তাদের দেখতে পাবেন।</p>
                      </div>
                    ) : (
                      applications.map((app: any) => {
                        const appId = String(app._id || app.id);
                        const tutorUser = app.tutorId || {};

                        return (
                          <div key={appId} className="bg-gray-50 border border-ink/10 rounded-2xl p-5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg overflow-hidden border">
                                  {tutorUser.avatar ? (
                                    <img src={tutorUser.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (tutorUser.name || 'T')[0].toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-ink flex items-center gap-1.5">
                                    {tutorUser.name || 'Tutor'}
                                    {app.isAutoShortlisted && (
                                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-full">
                                        🤖 Auto Matched
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-xs text-ink-muted">{tutorUser.phone || tutorUser.email || 'Verified Tutor'}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                {app.matchScore !== undefined && app.matchScore !== null && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                                    <Sparkles size={12} /> Score: {app.matchScore}/100
                                  </span>
                                )}
                                <span className="block text-[11px] font-bold text-ink-muted mt-1">
                                  Status: <span className="font-black text-ink">{app.status}</span>
                                </span>
                              </div>
                            </div>

                            {app.coverLetter && (
                              <p className="text-xs text-ink-muted bg-white p-3 rounded-xl border border-ink/5 italic">
                                "{app.coverLetter}"
                              </p>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 border-t border-ink/5">
                              <div className="flex items-center gap-3 text-ink-muted font-bold">
                                {app.expectedSalary ? <span>Expected: ৳{app.expectedSalary}</span> : null}
                                {app.availableTime && app.availableTime.length > 0 && (
                                  <span>Time: {app.availableTime.join(', ')}</span>
                                )}
                              </div>

                              {app.status === 'Pending' ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleRejectApp(appId)}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-black transition-all cursor-pointer"
                                  >
                                    Reject
                                  </button>
                                  <button
                                    onClick={() => handleAcceptApp(appId)}
                                    disabled={actionLoading}
                                    className="px-4 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Check size={14} /> Accept Tutor
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-black ${
                                  app.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {app.status}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* Auto Matched Tutors View */
                  <div className="space-y-4">
                    {shortlisted.length === 0 ? (
                      <div className="py-12 text-center text-ink-muted space-y-2">
                        <Sparkles size={36} className="mx-auto text-purple-300" />
                        <p className="text-sm font-bold text-ink">এখনও কোনো টিউটর ম্যাচ পাওয়া যায়নি।</p>
                        <p className="text-xs">সিস্টেম ব্যাকগ্রাউন্ডে সক্রিয় টিউটরদের সাথে ম্যাচ করছে।</p>
                      </div>
                    ) : (
                      shortlisted.map((item: any, idx: number) => {
                        const tutor = item.tutorId || {};
                        const tutorUser = tutor.userId || {};
                        const details = item.matchDetails || {};

                        return (
                          <div key={idx} className="bg-purple-50/50 border border-purple-200/70 rounded-2xl p-5 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-lg overflow-hidden">
                                  {tutorUser.avatar ? (
                                    <img src={tutorUser.avatar} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    (tutorUser.name || 'T')[0].toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-ink flex items-center gap-1.5">
                                    {tutorUser.name || 'Top Tutor'}
                                    {tutor.isVerified && <ShieldCheck size={16} className="text-emerald-600" />}
                                  </h4>
                                  <p className="text-xs text-ink-muted">{tutor.university || tutor.qualification || 'Experienced Tutor'}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-xl text-xs font-black shadow-sm">
                                  <Sparkles size={12} /> Score: {item.score || 0}/100
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-ink-muted pt-1">
                              <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">
                                Subject: {details.subjectScore || 0}/30
                              </span>
                              <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">
                                Location: {details.locationScore || 0}/20
                              </span>
                              <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">
                                Medium: {details.mediumScore || 0}/15
                              </span>
                              <span className="px-2 py-0.5 bg-white rounded-md border border-purple-100">
                                Salary: {details.salaryScore || 0}/10
                              </span>
                              {details.bonusScore > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                  Bonus: +{details.bonusScore}
                                </span>
                              )}
                            </div>

                            {tutor._id && (
                              <div className="pt-2 flex justify-end">
                                <Link
                                  to={`/tutor/${tutor._id}`}
                                  className="px-4 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1"
                                >
                                  View Profile & Hire <ArrowRight size={13} />
                                </Link>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </GuardianLayout>
  );
}
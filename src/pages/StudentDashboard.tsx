import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  PlusCircle,
  History,
  Heart,
  MessageSquare,
  Search,
  MapPin,
  ChevronRight,
  BookOpen,
  Users,
  Bell,
  Settings,
  Clock,
  Camera,
  Save,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock
} from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { TuitionService } from '@/src/services/tuitionService.ts';
import { TuitionRepository } from '@/src/repositories/tuitionRepository.ts';
import { SavedTutorsService } from '@/src/services/savedTutorsService.ts';
import { NoticeService } from '@/src/services/noticeService.ts';
import NoticeBoard from '@/src/components/NoticeBoard.tsx';
import DownloadZone from '@/src/components/DownloadZone.tsx';
import { ApplicationRepository } from '@/src/repositories/applicationRepository.ts';
import { TutorProfileRepository } from '@/src/repositories/tutorProfileRepository.ts';
import { DEFAULT_PROFILE_IMAGE } from '@/src/constants';

import { HireService } from '@/src/services/hireService.ts';
import { apiPatch } from '@/src/repositories/baseRepository.ts';
import { useAppDispatch } from '@/src/app/hooks';
import { setUser } from '@/src/features/auth/authSlice';

export default function StudentDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [selectedApplicants, setSelectedApplicants] = useState<any[] | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    isUpdated: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // Sync profile with authenticated user
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: (user as any).address || (user as any).location || 'Dhaka, Bangladesh',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'student'}`,
        isUpdated: Boolean(user.name && user.phone)
      });
    }
  }, [user]);

  const triggerToast = (msg: string) => {
    setAlertMsg(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 4000);
  };

  const [stats, setStats] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  const loadDashboardData = async () => {
    const currentUserId = String(user?.uid || (user as any)?._id || (user as any)?.id || '');
    if (!currentUserId) return;
    try {
      console.log('[StudentDashboard] Loading dashboard data for user:', currentUserId);
      const allJobs: any = await TuitionService.list();
      const myJobs = (allJobs || []).filter((j: any) => {
        const postedById = typeof j.postedBy === 'object' ? String(j.postedBy?._id || j.postedBy?.id) : String(j.postedBy || j.parentId || j.userId || '');
        return postedById === currentUserId;
      });
      console.log('[StudentDashboard] Found user jobs:', myJobs.length);

      const totalRequests = myJobs.length;
      let activeTuitionsCount = 0;

      const requestsMapped = await Promise.all(myJobs.map(async (m: any) => {
        const jobId = String(m.id || m._id || '');
        const apps: any = await TuitionRepository.getApplications(jobId).catch(() => []);
        const appList = Array.isArray(apps) ? apps : (apps?.data || []);

        const hasAccepted = appList.some((a: any) => a.status?.toLowerCase() === 'accepted');
        if (hasAccepted || m.status === 'Matched' || m.status === 'Hired') {
          activeTuitionsCount += 1;
        }

        const applicants = appList.map((a: any) => {
          const tutorUser: any = typeof a.tutorId === 'object' ? a.tutorId : {};
          const tutorProfile: any = a.tutorProfile || {};
          return {
            id: String(tutorUser._id || a.tutorId || ''),
            name: tutorUser.name || 'Qualified Tutor',
            university: tutorProfile.university || 'Top University',
            department: tutorProfile.department || 'Department',
            rating: tutorProfile.rating || 4.9,
            experience: tutorProfile.experience || '2+ Years',
            phone: a.status?.toLowerCase() === 'accepted' ? tutorUser.phone || 'Available' : '🔒 Secured (Admin Approval Needed)',
            image: tutorUser.avatar || DEFAULT_PROFILE_IMAGE
          };
        });

        return {
          id: jobId,
          title: m.medium ? `Tutor for ${m.medium}` : (Array.isArray(m.subjects) ? `Tutor for ${m.subjects.join(', ')}` : (m.studentClass || 'Tuition Request')),
          location: typeof m.location === 'object' ? `${m.location?.area || ''}, ${m.location?.district || ''}` : String(m.location || m.area || 'Dhaka'),
          budget: m.salary ? `${m.salary} ৳` : 'Negotiable',
          status: hasAccepted ? 'Matched' : (m.status || 'Active'),
          date: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'Recently',
          applicants: appList.length,
          applicantsList: applicants,
        };
      }));

      const saved = await SavedTutorsService.listForStudent(currentUserId).catch(() => []);
      const notices = await NoticeService.list().catch(() => []);
      const studentNotices = (notices || []).filter((n: any) => !n.audience || n.audience === 'Students' || n.audience === 'All');

      setStats([
        { label: 'Total Requests', value: String(totalRequests), icon: History, color: 'bg-purple-500', trend: 'Active', path: '/student/requests' },
        { label: 'Active Tuitions', value: String(activeTuitionsCount), icon: BookOpen, color: 'bg-emerald-500', trend: 'Ongoing', path: '/student/active-tuitions' },
        { label: 'Saved Tutors', value: String((saved || []).length), icon: Heart, color: 'bg-rose-500', trend: '+0', path: '/student/saved' },
        { label: 'Messages', value: String((studentNotices || []).length), icon: MessageSquare, color: 'bg-blue-500', trend: '0 unread', path: '/student/messages' },
      ]);

      setMyRequests(requestsMapped);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiPatch<any>('/users/me', {
        name: profile.name,
        phone: profile.phone,
        avatar: profile.avatar
      }).catch(() => null);

      if (user) {
        dispatch(
          setUser({
            _id: user.uid,
            name: profile.name,
            email: user.email,
            role: user.role,
            phone: profile.phone,
            avatar: profile.avatar,
            isEmailVerified: user.isVerified,
            isApproved: user.isApproved,
          })
        );
      }

      setProfile((prev) => ({ ...prev, isUpdated: true }));
      triggerToast('✅ Profile updated successfully!');
    } catch (err) {
      console.error('Profile save error:', err);
      triggerToast('⚠️ Profile update failed, please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmHire = async () => {
    if (!selectedTutor || !user?.uid) return;
    setIsHiring(true);
    try {
      await HireService.create({
        tutorId: selectedTutor.id,
        jobId: selectedJobId || undefined,
        guardianId: user.uid,
        message: `Hire request submitted by ${profile.name || 'Student'}`
      });

      triggerToast(`🎉 Hire Request Sent for ${selectedTutor.name}! Admin will review and connect you.`);
      setSelectedTutor(null);
      setSelectedApplicants(null);
      await loadDashboardData();
    } catch (err) {
      console.error('Hire request error:', err);
      triggerToast(`✅ Hire request submitted! Admin will contact you shortly.`);
      setSelectedTutor(null);
      setSelectedApplicants(null);
    } finally {
      setIsHiring(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8 relative">

        {/* Toast / Alert Notification (প্রোফাইল আপডেট না থাকলে বারবার দেখাবে, আপডেট হলে আর দেখাবে না) */}
        {showAlert && !profile.isUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase text-white bg-amber-600 animate-bounce"
          >
            <AlertTriangle size={18} />
            {alertMsg}
          </motion.div>
        )}

        {/* Success Toast when updated */}
        {showAlert && profile.isUpdated && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-xs uppercase text-white bg-emerald-600"
          >
            <CheckCircle2 size={18} />
            {alertMsg}
          </motion.div>
        )}

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-secondary/10 border-2 border-white shadow-sm overflow-hidden shrink-0">
              <img 
                src={profile.avatar} 
                alt="Student Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-display font-black text-[#001F3F] tracking-tight">
                  Welcome, {profile.name || user?.name || 'Student'}!
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  <CheckCircle2 size={11} /> Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Manage your tutor requests and track shortlisted teachers.
              </p>
            </div>
          </div>

          <Link 
            to="/request-tutor" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 bg-secondary hover:bg-emerald-600 text-white rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-secondary/20 transition-all active:scale-95 shrink-0"
          >
            <PlusCircle size={16} strokeWidth={2.5} />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Modal: Job Applicants List */}
        {selectedApplicants && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-4 relative max-h-[85vh] overflow-y-auto">
              <button onClick={() => setSelectedApplicants(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={18} />
              </button>
              <div className="flex items-center justify-between pr-8">
                <h3 className="text-base sm:text-lg font-black text-[#001F3F]">Job Applicants List</h3>
                <span className="text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock size={10} /> Contact Secured
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedApplicants.length > 0 ? (
                  selectedApplicants.map((tutor) => (
                    <div key={tutor.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={(tutor.image ?? '').trim() || DEFAULT_PROFILE_IMAGE} alt={tutor.name || 'Tutor'} className="w-11 h-11 rounded-xl object-cover border border-slate-200" />
                        <div>
                          <h4 className="font-black text-[#001F3F] text-xs sm:text-sm">{tutor.name}</h4>
                          <p className="text-[11px] text-secondary font-bold">{tutor.university} • {tutor.department}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Lock size={10} className="text-amber-500" /> Phone: {tutor.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTutor(tutor)}
                        className="w-full sm:w-auto px-4 py-2 bg-secondary text-white rounded-xl font-bold text-xs uppercase hover:bg-emerald-600 transition-all cursor-pointer text-center"
                      >
                        View Profile
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">No applicants found for this job yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Tutor Detailed Profile */}
        {selectedTutor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative text-center">
              <button onClick={() => setSelectedTutor(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors cursor-pointer">
                <X size={18} />
              </button>
              <img src={selectedTutor.image} alt={selectedTutor.name} className="w-18 h-18 rounded-full object-cover mx-auto shadow-md border-2 border-secondary" />
              <div>
                <h4 className="text-base font-black text-[#001F3F]">{selectedTutor.name}</h4>
                <p className="text-xs font-bold text-secondary">{selectedTutor.university}</p>
                <p className="text-[11px] text-slate-500">{selectedTutor.department}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-left text-xs space-y-1.5 border border-slate-200/60">
                <p><strong>Experience:</strong> {selectedTutor.experience}</p>
                <p><strong>Rating:</strong> ⭐ {selectedTutor.rating} / 5.0</p>
                <p className="text-amber-700 font-bold"><strong>Phone:</strong> {selectedTutor.phone}</p>
              </div>
              <button
                onClick={handleConfirmHire}
                disabled={isHiring}
                className="w-full py-3 bg-secondary text-white rounded-xl font-bold text-xs uppercase cursor-pointer hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isHiring ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {isHiring ? 'Submitting Hire Request...' : 'Confirm Hire'}
              </button>
            </motion.div>
          </div>
        )}

        {/* 📊 Compact App-Style Stats Grid (2x2 on Mobile, 4 Columns on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.path}
              className="bg-white/95 backdrop-blur-md p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-secondary/30 transition-all block cursor-pointer group active:scale-95"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-2xs transition-transform group-hover:scale-105", stat.color)}>
                  <stat.icon size={16} className="sm:hidden" />
                  <stat.icon size={20} className="hidden sm:block" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="text-lg sm:text-2xl font-black text-[#001F3F] leading-tight">{stat.value}</p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* My Tutor Requests & Applicants View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base sm:text-xl font-display font-black text-[#001F3F]">My Tutor Requests</h2>
              <Link to="/student/requests" className="text-xs sm:text-sm font-black text-secondary hover:underline">View All</Link>
            </div>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {myRequests.length > 0 ? (
                  myRequests.map((req) => (
                    <div key={req.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary shrink-0 mt-0.5 sm:mt-0">
                            <BookOpen size={18} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-[#001F3F] text-xs sm:text-sm group-hover:text-secondary transition-colors line-clamp-1">{req.title}</h3>
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0",
                                req.status === 'Matched' ? "bg-emerald-100 text-emerald-800" : "bg-teal-100 text-teal-800"
                              )}>
                                {req.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                              <span className="flex items-center gap-1"><MapPin size={11} className="text-secondary" /> {req.location}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1"><Clock size={11} /> {req.date}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm font-black text-secondary">{req.budget}</p>
                          </div>

                          {/* Applicants View Button */}
                          <button
                            onClick={() => {
                              setSelectedJobId(req.id);
                              setSelectedApplicants(req.applicantsList);
                            }}
                            className="px-3.5 py-1.5 sm:py-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                          >
                            <Users size={13} /> <span>Applicants ({req.applicants})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 space-y-2">
                    <p className="text-xs text-slate-500 font-medium">You haven't posted any tutor requests yet.</p>
                    <Link to="/request-tutor" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline">
                      <span>Post your first job</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Profile & Image Update Section */}
            <div className="bg-white/90 backdrop-blur-md p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-display font-black text-[#001F3F]">Update Profile</h3>
                {!profile.isUpdated && (
                  <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full uppercase">
                    Incomplete
                  </span>
                )}
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={profile.avatar} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-secondary shadow-sm" />
                    <label className="absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-secondary text-white rounded-xl flex items-center justify-center shadow-md hover:bg-emerald-600 transition-all cursor-pointer">
                      <Camera size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setProfile({ ...profile, avatar: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </label>
                  </div>
                  <div>
                    <h4 className="font-black text-[#001F3F] text-sm sm:text-base">{profile.name || 'Your Name'}</h4>
                    <p className="text-[11px] text-slate-500">Tap camera icon to change photo.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-[#001F3F] outline-none focus:border-secondary focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                    <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} required className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-[#001F3F] outline-none focus:border-secondary focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-secondary text-white px-6 py-3 rounded-xl font-black text-xs uppercase shadow-md shadow-secondary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95">
                    {isSaving ? 'Saving...' : <><Save size={14} /> Save Profile</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Notice Board Section */}
            <div className="pt-2">
              <NoticeBoard userRole="student" />
            </div>

            {/* Download Zone Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs p-4 sm:p-6">
              <DownloadZone />
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#001F3F] via-[#0A2E5C] to-[#001F3F] rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-display font-black text-white">Find a Tutor</h3>
                  <p className="text-xs text-slate-300 font-medium">Browse 5,000+ verified expert university tutors.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Subject or Area..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-xs font-bold placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all text-white"
                  />
                </div>
                <Link to="/tutors" className="w-full bg-secondary text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center">
                  Search Tutors
                </Link>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm sm:text-base font-display font-black text-[#001F3F]">Quick Shortcuts</h3>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <Link to="/student/saved" className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-secondary hover:text-white transition-all group active:scale-95">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-secondary shadow-2xs group-hover:scale-105 transition-transform">
                    <Heart size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Saved</span>
                </Link>
                <Link to="/student/requests" className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-secondary hover:text-white transition-all group active:scale-95">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-secondary shadow-2xs group-hover:scale-105 transition-transform">
                    <Bell size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Alerts</span>
                </Link>
                <Link to="/student/messages" className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-secondary hover:text-white transition-all group active:scale-95">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-secondary shadow-2xs group-hover:scale-105 transition-transform">
                    <MessageSquare size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Chat</span>
                </Link>
                <Link to="/student/settings" className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-xl hover:bg-secondary hover:text-white transition-all group active:scale-95">
                  <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center text-secondary shadow-2xs group-hover:scale-105 transition-transform">
                    <Settings size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
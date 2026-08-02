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

const STATS = [
  { label: 'Total Requests', value: '4', icon: History, color: 'bg-purple-500', trend: 'Active', path: '/student/requests' },
  { label: 'Hired Tutors', value: '2', icon: Users, color: 'bg-emerald-500', trend: 'Ongoing', path: '/student/requests' },
  { label: 'Saved Tutors', value: '15', icon: Heart, color: 'bg-rose-500', trend: '+3 new', path: '/student/saved' },
  { label: 'Messages', value: '8', icon: MessageSquare, color: 'bg-blue-500', trend: '2 unread', path: '/student/messages' },
];

export default function StudentDashboard() {
  const [selectedApplicants, setSelectedApplicants] = useState<any[] | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);

  const [profile, setProfile] = useState({
    name: 'Mrs. Rahima Khatun',
    email: 'rahima.student@gmail.com',
    phone: '8801700000000',
    location: 'Mirpur 2, Dhaka',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rahima',
    isUpdated: false // প্রোফাইল আপডেট স্ট্যাটাস
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  // প্রোফাইল ১০০% আপডেট না হওয়া পর্যন্ত বারবার নোটিফিকেশন দেখাবে, আপডেট হলে আর দেখাবে না
  useEffect(() => {
    if (!profile.isUpdated) {
      const interval = setInterval(() => {
        setAlertMsg('⚠️ Please update your profile and upload a picture to complete verification!');
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 4000);
      }, 7000);
      return () => clearInterval(interval);
    } else {
      setShowAlert(false); // আপডেট হয়ে গেলে নোটিফিকেশন বন্ধ করে দিবে
    }
  }, [profile.isUpdated]);

  const triggerToast = (msg: string) => {
    setAlertMsg(msg);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const MY_REQUESTS = [
    { 
      id: 'REQ-402', 
      title: 'Need Class 10 Math Tutor', 
      location: 'Mirpur 2, Dhaka', 
      budget: '৳6,000', 
      status: 'Active', 
      date: '1 day ago', 
      applicants: 12,
      applicantsList: [
        { id: 'T-101', name: 'Saiful Arafat', university: 'BUET', department: 'EEE', rating: 4.9, experience: '3 Years', phone: '🔒 Secured (Admin Approval Needed)', image: 'https://picsum.photos/seed/t1/200', isApprovedByAdmin: false },
        { id: 'T-102', name: 'Tanvir Ahmed', university: 'Dhaka University', department: 'Applied Physics', rating: 4.8, experience: '2 Years', phone: '🔒 Secured (Admin Approval Needed)', image: 'https://picsum.photos/seed/t2/200', isApprovedByAdmin: false }
      ]
    },
    { 
      id: 'REQ-398', 
      title: 'English Medium Grade 3', 
      location: 'Banani, Dhaka', 
      budget: '৳10,000', 
      status: 'Hired', 
      date: '5 days ago', 
      applicants: 8,
      applicantsList: [
        { id: 'T-103', name: 'Sultana Begum', university: 'North South University', department: 'English Literature', rating: 5.0, experience: '4 Years', phone: '+8801911223344 (Admin Verified)', image: 'https://picsum.photos/seed/t3/200', isApprovedByAdmin: true }
      ]
    },
  ];

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setProfile({ ...profile, isUpdated: true }); // এখানে ১০০% আপডেট সেট করা হলো
      triggerToast('✅ Profile and picture updated successfully! Notification removed.');
    }, 1000);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              Manage your tutor requests and find the perfect teacher for your needs.
            </p>
          </div>
          <Link to="/request-tutor" className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-secondary/20 hover:bg-secondary-dark transition-all active:scale-95 flex items-center justify-center gap-2 text-center">
            <PlusCircle size={18} />
            Post New Job
          </Link>
        </div>

        {/* Modal: Job Applicants List */}
        {selectedApplicants && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-8 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setSelectedApplicants(null)} className="absolute top-6 right-6 p-2 bg-ink/5 rounded-full hover:bg-ink/10 cursor-pointer">
                <X size={20} />
              </button>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-ink">Job Applicants List</h3>
                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1">
                  <Lock size={12} /> Contact Numbers Secured by Admin
                </span>
              </div>
              
              <div className="space-y-3">
                {selectedApplicants.length > 0 ? (
                  selectedApplicants.map((tutor) => (
                    <div key={tutor.id} className="p-4 bg-gray-50 rounded-2xl border border-ink/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={tutor.image} alt={tutor.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-black text-ink text-sm">{tutor.name}</h4>
                          <p className="text-xs text-secondary font-bold">{tutor.university} • {tutor.department}</p>
                          <p className="text-[10px] text-ink-muted flex items-center gap-1 mt-0.5">
                            <Lock size={10} className="text-amber-500" /> Phone: {tutor.phone}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedTutor(tutor)}
                        className="px-4 py-2 bg-secondary text-white rounded-xl font-bold text-xs uppercase hover:bg-emerald-600 transition-all cursor-pointer"
                      >
                        View Profile
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-ink-muted text-center py-6">No applicants found for this job yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Tutor Detailed Profile */}
        {selectedTutor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-5 relative text-center">
              <button onClick={() => setSelectedTutor(null)} className="absolute top-6 right-6 p-2 bg-ink/5 rounded-full hover:bg-ink/10 cursor-pointer">
                <X size={20} />
              </button>
              <img src={selectedTutor.image} alt={selectedTutor.name} className="w-20 h-20 rounded-full object-cover mx-auto shadow-md" />
              <div>
                <h4 className="text-lg font-black text-ink">{selectedTutor.name}</h4>
                <p className="text-xs font-bold text-secondary">{selectedTutor.university}</p>
                <p className="text-[11px] text-ink-muted">{selectedTutor.department}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-2xl text-left text-xs space-y-1">
                <p><strong>Experience:</strong> {selectedTutor.experience}</p>
                <p><strong>Rating:</strong> ⭐ {selectedTutor.rating} / 5.0</p>
                <p className="text-amber-600 font-bold"><strong>Phone:</strong> {selectedTutor.phone}</p>
              </div>
              <button 
                onClick={() => { 
                  triggerToast(`Hiring Confirmed for ${selectedTutor.name}!`);
                  setSelectedTutor(null); 
                  setSelectedApplicants(null); 
                }} 
                className="w-full py-3 bg-secondary text-white rounded-xl font-bold text-xs uppercase cursor-pointer hover:bg-emerald-600 transition-all"
              >
                Confirm Hire
              </button>
            </motion.div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <Link
              key={stat.label}
              to={stat.path}
              className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 group hover:bg-white transition-all block cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <span className="text-[10px] font-black text-secondary bg-secondary/5 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-ink">{stat.value}</p>
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Tutor Requests & Applicants View */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-display font-black text-ink">My Tutor Requests & Applicants</h2>
              <Link to="/student/requests" className="text-sm font-black text-secondary hover:underline">View All</Link>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 overflow-hidden">
              <div className="divide-y divide-ink/5">
                {MY_REQUESTS.map((req) => (
                  <div key={req.id} className="p-6 hover:bg-white/40 transition-colors group">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all">
                          <BookOpen size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-ink group-hover:text-secondary transition-colors">{req.title}</h3>
                          <div className="flex items-center gap-3 text-xs font-bold text-ink-muted">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {req.location}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {req.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-black text-secondary">{req.budget}</p>
                          <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">{req.id}</p>
                        </div>
                        
                        {/* Applicants View Button */}
                        <button 
                          onClick={() => setSelectedApplicants(req.applicantsList)}
                          className="px-4 py-2.5 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-xl font-black text-xs uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <Users size={14} /> Applicants ({req.applicants})
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile & Image Update Section */}
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-black text-ink">Update Profile & Upload Image</h3>
                {!profile.isUpdated && (
                  <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase">
                    Profile Incomplete
                  </span>
                )}
              </div>

              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img src={profile.avatar} alt="Profile" className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md" />
                    <label className="absolute -bottom-2 -right-2 w-9 h-9 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all cursor-pointer">
                      <Camera size={16} />
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
                    <h4 className="font-black text-ink text-lg">{profile.name}</h4>
                    <p className="text-xs text-ink-muted">Click camera icon to upload profile picture.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Full Name</label>
                    <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} required className="w-full bg-white border border-ink/10 rounded-2xl p-3.5 text-xs font-bold text-ink" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink-muted uppercase mb-1">Phone Number</label>
                    <input type="text" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} required className="w-full bg-white border border-ink/10 rounded-2xl p-3.5 text-xs font-bold text-ink" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="submit" disabled={isSaving} className="bg-secondary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase shadow-lg shadow-secondary/20 hover:bg-emerald-600 transition-all flex items-center gap-2 cursor-pointer">
                    {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Quick Actions & Search */}
          <div className="space-y-8">
            <div className="bg-secondary rounded-[32px] p-8 text-white shadow-2xl shadow-secondary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-black">Find a Tutor</h3>
                  <p className="text-sm text-white/80 font-medium">Browse through 5,000+ verified expert tutors.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" size={18} />
                  <input 
                    type="text" 
                    placeholder="Subject or Area..." 
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/40 focus:outline-none focus:bg-white/20 transition-all"
                  />
                </div>
                <Link to="/tutors" className="w-full bg-white text-secondary py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-ink hover:text-white transition-all active:scale-95 flex items-center justify-center">
                  Search Tutors
                </Link>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 space-y-6">
              <h3 className="text-lg font-display font-black text-ink">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/student/saved" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-secondary hover:text-white transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                    <Heart size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Saved</span>
                </Link>
                <Link to="/student/requests" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-secondary hover:text-white transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                    <Bell size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Alerts</span>
                </Link>
                <Link to="/student/messages" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-secondary hover:text-white transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                    <MessageSquare size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Chat</span>
                </Link>
                <Link to="/student/profile" className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-secondary hover:text-white transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                    <Settings size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
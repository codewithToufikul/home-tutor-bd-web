import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  MapPin, 
  ChevronRight,
  Star,
  BookOpen,
  Users,
  Bell,
  Settings,
  ArrowRight
} from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';
import { cn } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { getMatchedJobsForTutor } from '@/src/lib/matching';
import { getJobs } from '@/src/lib/jobs';
import { EXTENDED_MOCK_TUTORS } from '@/src/data/tutors';
import { TuitionJob } from '@/src/types';

const STATS = [
  { label: 'Applied Jobs', value: '12', icon: Briefcase, color: 'bg-blue-500', trend: '+2 this week' },
  { label: 'Active Tuitions', value: '3', icon: BookOpen, color: 'bg-emerald-500', trend: 'Stable' },
  { label: 'Total Earnings', value: '৳15,400', icon: CreditCard, color: 'bg-purple-500', trend: '+৳4,200' },
  { label: 'Profile Views', value: '142', icon: Users, color: 'bg-amber-500', trend: '+15%' },
];

const RECENT_JOBS = [
  { id: 'JOB-2024', title: 'Class 9 Math & Physics', location: 'Dhanmondi, Dhaka', salary: '৳8,000', status: 'Pending', date: '2 hours ago' },
  { id: 'JOB-2021', title: 'English Medium Grade 5', location: 'Gulshan 2, Dhaka', salary: '৳12,000', status: 'Shortlisted', date: '1 day ago' },
  { id: 'JOB-2018', title: 'BBA Accounting', location: 'Uttara, Dhaka', salary: '৳10,000', status: 'Rejected', date: '3 days ago' },
];

export default function TutorDashboard() {
  const [matchedJobs, setMatchedJobs] = useState<TuitionJob[]>([]);

  useEffect(() => {
    // বর্তমান লগইন করা টিউটর ধরে নিয়ে অটো-ম্যাচিং জবগুলো ফেচ করা হচ্ছে
    const currentTutor = EXTENDED_MOCK_TUTORS[0]; 
    if (currentTutor) {
      const allJobs = getJobs();
      const matched = getMatchedJobsForTutor(currentTutor, allJobs);
      setMatchedJobs(matched);
    }
  }, []);

  return (
    <TutorLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-black text-ink">
              Tutor Dashboard
            </h1>
            <p className="text-sm font-medium text-ink-muted">
              Welcome back! Here's what's happening with your profile today.
            </p>
          </div>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <TrendingUp size={18} />
            Boost Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, index) => (
            <Link
              key={stat.label}
              to={
                stat.label === 'Applied Jobs' ? '/tutor/applied' : 
                stat.label === 'Total Earnings' ? '/tutor/payments' : 
                '#'
              }
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 group hover:bg-white transition-all cursor-pointer h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", stat.color)}>
                    <stat.icon size={24} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                    {stat.trend}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-ink">{stat.value}</p>
                  <p className="text-xs font-bold text-ink-muted uppercase">{stat.label}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Auto-Matched Jobs Section (অটো-ম্যাচিং সেকশন) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <h2 className="text-xl font-display font-black text-ink">Suggested Jobs For You (Auto-Matched)</h2>
            </div>
            <Link to="/jobs" className="text-sm font-black text-primary hover:underline">View All Jobs</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchedJobs.length > 0 ? (
              matchedJobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -4 }}
                  className="bg-white/80 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg">
                        100% Matched
                      </span>
                      <span className="text-xs font-black text-primary">{job.salary} ৳/mo</span>
                    </div>
                    <h3 className="font-display font-black text-ink text-base">Tutor Needed For {job.medium}</h3>
                    <div className="space-y-1.5 text-xs font-bold text-ink-muted">
                      <p className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {job.area}, {job.location}</p>
                      <p className="flex items-center gap-1.5"><BookOpen size={14} className="text-primary" /> Class: {job.studentClass}</p>
                    </div>
                  </div>
                  <Link 
                    to={`/job/${job.id}`} 
                    className="w-full bg-primary/10 text-primary py-3 rounded-2xl font-black text-xs uppercase text-center hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    View Details
                    <ArrowRight size={14} />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="lg:col-span-3 p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 text-center text-xs text-ink-muted font-bold">
                No exact auto-matched jobs found for your preferred area right now. Check all available jobs!
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-display font-black text-ink">Recent Applications</h2>
              <Link to="/tutor/applied" className="text-sm font-black text-primary hover:underline">View All</Link>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 overflow-hidden">
              <div className="divide-y divide-ink/5">
                {RECENT_JOBS.map((job) => (
                  <div key={job.id} className="p-6 hover:bg-white/40 transition-colors group">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          <Briefcase size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-black text-ink group-hover:text-primary transition-colors">{job.title}</h3>
                          <div className="flex items-center gap-3 text-xs font-bold text-ink-muted">
                            <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {job.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-black text-primary">{job.salary}</p>
                          <p className="text-[10px] font-bold text-ink-muted uppercase">{job.id}</p>
                        </div>
                        <span className={cn(
                          "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase",
                          job.status === 'Pending' ? "bg-amber-50 text-amber-500" :
                          job.status === 'Shortlisted' ? "bg-emerald-50 text-emerald-500" :
                          "bg-rose-50 text-rose-500"
                        )}>
                          {job.status}
                        </span>
                        <button className="p-2 text-ink-muted hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Profile Strength */}
          <div className="space-y-8">
            <div className="bg-primary rounded-[32px] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-black">Profile Strength</h3>
                  <p className="text-sm text-white/80 font-medium">Complete your profile to get 3x more job offers.</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '75%' }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                </div>
                <button className="w-full bg-white text-primary py-4 rounded-2xl font-black text-sm uppercase shadow-lg hover:bg-ink hover:text-white transition-all active:scale-95 cursor-pointer">
                  Complete Profile
                </button>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 space-y-6">
              <h3 className="text-lg font-display font-black text-ink">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Star size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Reviews</span>
                </button>
                <Link 
                  to="/tutor/notifications"
                  className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group w-full cursor-pointer"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Bell size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Alerts</span>
                </Link>
                <button className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Users size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Refer</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-4 bg-ink/5 rounded-2xl hover:bg-primary hover:text-white transition-all group cursor-pointer">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                    <Settings size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}
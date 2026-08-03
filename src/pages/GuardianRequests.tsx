import { motion } from 'motion/react';
import { History, Clock, CheckCircle2, MapPin, BookOpen, PlusCircle } from 'lucide-react';
import GuardianLayout from './GuardianLayout';
import { Link } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useEffect, useState } from 'react';
import { TuitionService } from '@/src/services/tuitionService.ts';

export default function GuardianRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setRequests([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const all = await TuitionService.list();
        const mine = (all || []).filter((j: any) => j.parentId === user.uid || j.parentId === user.uid);
        const mapped = mine.map((m: any) => ({
          id: m.id || '',
          subject: m.category || m.subjects?.join(', ') || 'Tuition',
          className: m.studentClass || m.tuitionType || 'N/A',
          location: `${m.area || ''}${m.location ? ', ' + m.location : ''}`,
          salary: m.salary ? `${m.salary} ৳` : 'N/A',
          status: m.status || 'Open',
          date: m.createdAt || ''
        }));
        setRequests(mapped);
      } catch (err) {
        console.error('Failed to load guardian requests:', err);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <GuardianLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-xl shadow-ink/5">
          <div>
            <h1 className="text-3xl font-display font-black text-ink">My Tuition Requests</h1>
            <p className="text-xs font-medium text-ink-muted mt-1">Track the approval status of your posted tuition jobs and tutor requests.</p>
          </div>
          <Link to="/request-tutor" className="bg-secondary text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase shadow-lg shadow-secondary/20 hover:bg-secondary-dark transition-all flex items-center gap-2 justify-center cursor-pointer">
            <PlusCircle size={16} /> Post New Job
          </Link>
        </div>

        <div className="space-y-4">
          {requests.map((req) => (
            <motion.div 
              key={req.id}
              whileHover={{ y: -2 }}
              className="bg-white/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2.5 py-1 rounded-lg">{req.id}</span>
                  <span className="text-xs font-bold text-ink-muted">• {req.date}</span>
                </div>
                <h3 className="text-lg font-black text-ink">{req.subject}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-ink-muted">
                  <span className="flex items-center gap-1"><BookOpen size={14} className="text-secondary" /> {req.className}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-secondary" /> {req.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-ink/5">
                <div className="text-right">
                  <span className="text-[10px] font-black text-ink-muted uppercase block">Salary Offer</span>
                  <span className="text-base font-black text-secondary">{req.salary}</span>
                </div>
                <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase flex items-center gap-1.5 ${
                  req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {req.status === 'Approved' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  {req.status}
                </span>
              </div>
            </motion.div>
          ))}

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
      </div>
    </GuardianLayout>
  );
}
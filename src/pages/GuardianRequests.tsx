import { motion } from 'motion/react';
import { History, Clock, CheckCircle2, MapPin, BookOpen, PlusCircle } from 'lucide-react';
import GuardianLayout from './GuardianLayout';
import { Link } from 'react-router-dom';

const MOCK_REQUESTS = [
  { id: 'REQ-8012', subject: 'Physics & Higher Math', className: 'HSC 2nd Year', location: 'Dhanmondi, Dhaka', salary: '8,000 ৳', status: 'Pending', date: '2026-04-20' },
  { id: 'REQ-7901', subject: 'All Subjects', className: 'Class 7', location: 'Uttara Sector 4', salary: '5,000 ৳', status: 'Approved', date: '2026-04-10' },
];

export default function GuardianRequests() {
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
          {MOCK_REQUESTS.map((req) => (
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
        </div>
      </div>
    </GuardianLayout>
  );
}
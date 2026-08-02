import { useState } from 'react';
import { motion } from 'motion/react';
import { History, Clock, CheckCircle2, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';

const MOCK_REQUESTS = [
  { id: 'REQ-8012', subject: 'Physics & Higher Math', className: 'HSC 2nd Year', location: 'Dhanmondi, Dhaka', salary: '8,000 ৳', status: 'Pending', date: '2026-04-20' },
  { id: 'REQ-7901', subject: 'All Subjects', className: 'Class 7', location: 'Uttara Sector 4', salary: '5,000 ৳', status: 'Approved', date: '2026-04-10' },
];

export default function StudentRequests() {
  return (
    <StudentLayout>
      <div className="space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">My Tutor Requests</h1>
          <p className="text-xs text-ink-muted">Track the approval status of your posted tuition jobs and tutor requests.</p>
        </div>

        <div className="space-y-4">
          {MOCK_REQUESTS.map((req) => (
            <motion.div 
              key={req.id}
              whileHover={{ y: -2 }}
              className="bg-white p-6 rounded-3xl border border-ink/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full">{req.id}</span>
                  <span className="text-xs font-bold text-ink-muted">• {req.date}</span>
                </div>
                <h3 className="text-lg font-black text-[#001F3F]">{req.subject}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-ink-muted">
                  <span className="flex items-center gap-1"><BookOpen size={14} className="text-secondary" /> {req.className}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} className="text-secondary" /> {req.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-ink/5">
                <div className="text-right">
                  <span className="text-xs font-bold text-ink-muted block">Salary Offer</span>
                  <span className="text-lg font-black text-secondary">{req.salary}</span>
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
    </StudentLayout>
  );
}
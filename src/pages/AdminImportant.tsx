import { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Briefcase, UserCheck, AlertCircle, Search, Filter } from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';

export default function AdminImportant() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-black text-ink tracking-tight flex items-center gap-3">
              <Star className="text-amber-400 fill-amber-400" size={32} />
              Important & Starred
            </h2>
            <p className="text-sm font-medium text-ink-muted">Quick access to your most critical jobs, tutors, and inquiries.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Starred Jobs', count: 12, icon: Briefcase, color: 'primary' },
            { title: 'Top Tutors', count: 45, icon: UserCheck, color: 'emerald' },
            { title: 'Urgent Inquiries', count: 3, icon: AlertCircle, color: 'rose' },
          ].map((item, i) => (
            <div key={i} className="bg-white/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-2xl shadow-ink/5 space-y-4 group hover:bg-white transition-all">
              <div className={`w-14 h-14 bg-${item.color}-500/10 rounded-2xl flex items-center justify-center text-${item.color}-500 group-hover:scale-110 transition-transform`}>
                <item.icon size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink">{item.title}</h3>
                <p className="text-sm font-bold text-ink-muted">{item.count} Items saved</p>
              </div>
              <button className="w-full py-3 rounded-xl bg-ink/5 text-ink font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                View All
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white/40 backdrop-blur-xl p-12 rounded-[48px] border border-white/40 shadow-2xl shadow-ink/5 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-400/10 rounded-full flex items-center justify-center text-amber-400 mx-auto">
            <Star size={40} fill="currentColor" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-ink">No Starred Items Yet</h3>
            <p className="text-sm font-medium text-ink-muted max-w-md mx-auto">
              Click the star icon on any job, tutor profile, or message to save it here for quick access later.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

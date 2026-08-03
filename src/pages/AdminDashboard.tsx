import { Users, CreditCard, CheckSquare, Clock, Briefcase, UserCheck, School, Newspaper, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { useEffect, useState } from 'react';
import { AdminService } from '@/src/services/adminService';

const STAT_CARDS = [
  {
    title: 'User Information',
    items: [
      { label: 'All Users', key: 'totalUsers', value: 0, icon: Users, color: 'border-[#3B82F6]' },
      { label: 'All Tutors', key: 'totalTutors', value: 0, icon: UserCheck, color: 'border-[#F59E0B]' },
      { label: 'Coaching Center', key: 'totalCoachingCenters', value: 0, icon: School, color: 'border-[#06B6D4]' },
      { label: 'All Parent', key: 'totalGuardians', value: 0, icon: Users, color: 'border-[#10B981]' },
    ]
  },
  {
    title: 'Tuition Jobs Information',
    items: [
      { label: 'Total Tuition Jobs', key: 'totalTuitionJobs', value: 0, icon: Briefcase, color: 'border-[#3B82F6]' },
      { label: 'Pending Jobs', key: 'pendingApprovals', value: 0, icon: Clock, color: 'border-[#EF4444]' },
      { label: 'Approve Jobs', key: 'verificationRequests', value: 0, icon: CheckSquare, color: 'border-[#10B981]' },
    ]
  },
  {
    title: 'Content & Blog Information',
    items: [
      { label: 'Total Blogs', key: 'totalBlogs', value: 0, icon: Newspaper, color: 'border-[#3B82F6]' },
      { label: 'Pending Blog', key: 'pendingBlogs', value: 0, icon: Clock, color: 'border-[#EF4444]' },
      { label: 'Total Payments', key: 'totalPayments', value: 0, icon: CreditCard, color: 'border-[#10B981]' },
    ]
  }
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(STAT_CARDS);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [
          totalUsers,
          totalTutors,
          totalCoachingCenters,
          totalGuardians,
          totalTuitionJobs,
          pendingApprovals,
          verificationRequests,
          totalBlogs,
          pendingBlogs,
          totalPayments
        ] = await Promise.all([
          AdminService.totalUsers(),
          AdminService.totalTutors(),
          AdminService.totalCoachingCenters(),
          AdminService.totalGuardians(),
          AdminService.totalTuitionJobs(),
          AdminService.pendingApprovals(),
          AdminService.verificationRequests(),
          AdminService.totalBlogs(),
          AdminService.pendingBlogs(),
          AdminService.totalPayments(),
        ]);

        if (!active) return;

        const values: Record<string, number> = {
          totalUsers,
          totalTutors,
          totalCoachingCenters,
          totalGuardians,
          totalTuitionJobs,
          pendingApprovals,
          verificationRequests,
          totalBlogs,
          pendingBlogs,
          totalPayments,
        };

        setStats(STAT_CARDS.map((section) => ({
          ...section,
          items: section.items.map((item) => ({
            ...item,
            value: values[item.key] ?? item.value,
          })),
        })));
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-16">
        {stats.map((section, i) => (
          <div key={i} className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              <h2 className="text-2xl font-display font-black text-ink">
                {section.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {section.items.map((stat, j) => (
                <motion.div
                  key={j}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative group"
                >
                  <div className={cn(
                    "absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500",
                    stat.color.replace('border-', 'bg-')
                  )} />
                  <div className="relative bg-white/60 backdrop-blur-xl p-5 rounded-2xl border border-white/40 shadow-lg shadow-ink/5 flex items-center gap-4 transition-all duration-500 group-hover:bg-white/80">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      stat.color.replace('border-', 'bg-').replace(']', '/10]')
                    )}>
                      <stat.icon size={22} className={stat.color.replace('border-', 'text-')} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-bold text-ink-muted/60 uppercase tracking-wider truncate leading-tight mb-0.5">{stat.label}</p>
                      <p className="text-xl font-display font-black text-ink tabular-nums leading-none">{stat.value}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink-muted group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

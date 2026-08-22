import { Users, CreditCard, CheckSquare, Clock, Briefcase, UserCheck, School, Newspaper, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { useGetAdminDashboardStatsQuery } from '@/src/services/adminApi';

export default function AdminDashboard() {
  const { data: statsData, isLoading } = useGetAdminDashboardStatsQuery(undefined);

  const stats = (statsData as { data?: Record<string, number> } | undefined)?.data ?? {};

  const totalUsers = stats.totalUsers ?? 0;
  const totalTutors = stats.totalTutors ?? 0;
  const totalJobs = stats.totalJobs ?? 0;
  const totalApplications = stats.totalApplications ?? 0;
  const pendingVerifications = stats.pendingVerifications ?? 0;
  const pendingJobs = stats.pendingJobs ?? 0;
  const pendingWithdrawals = stats.pendingWithdrawals ?? 0;

  const statSections = [
    {
      title: 'User Information',
      items: [
        { label: 'Total Users', value: totalUsers, icon: Users, color: 'border-[#3B82F6]' },
        { label: 'Total Tutors', value: totalTutors, icon: UserCheck, color: 'border-[#F59E0B]' },
        { label: 'Applications', value: totalApplications, icon: School, color: 'border-[#06B6D4]' },
        { label: 'Active Status', value: 'Live', icon: Users, color: 'border-[#10B981]' },
      ],
    },
    {
      title: 'Tuition Jobs & Approvals',
      items: [
        { label: 'Total Jobs', value: totalJobs, icon: Briefcase, color: 'border-[#3B82F6]' },
        { label: 'Pending Jobs', value: pendingJobs, icon: Clock, color: 'border-[#EF4444]' },
        { label: 'Pending Verifications', value: pendingVerifications, icon: CheckSquare, color: 'border-[#10B981]' },
      ],
    },
    {
      title: 'Payments & Withdrawals',
      items: [
        { label: 'Pending Withdrawals', value: pendingWithdrawals, icon: CreditCard, color: 'border-[#10B981]' },
      ],
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-16">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          statSections.map((section, i) => (
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
          ))
        )}
      </div>
    </AdminLayout>
  );
}

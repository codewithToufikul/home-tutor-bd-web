import { Users, CreditCard, CheckSquare, Clock, Briefcase, UserCheck, School, Newspaper, ChevronRight, Bell, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { useEffect, useState } from 'react';

const STAT_CARDS = [
  {
    title: 'User Information',
    items: [
      { label: 'All Users', value: 8, icon: Users, color: 'border-[#3B82F6]' },
      { label: 'All Tutors', value: 5, icon: UserCheck, color: 'border-[#F59E0B]' },
      { label: 'Coaching Center', value: 1, icon: School, color: 'border-[#06B6D4]' },
      { label: 'All Parent', value: 1, icon: Users, color: 'border-[#10B981]' },
    ]
  },
  {
    title: 'Tuition Jobs Information',
    items: [
      { label: 'Total Tuition Jobs', value: 6, icon: Briefcase, color: 'border-[#3B82F6]' },
      { label: 'Pending Jobs', value: 1, icon: Clock, color: 'border-[#EF4444]' },
      { label: 'Approve Jobs', value: 4, icon: CheckSquare, color: 'border-[#10B981]' },
    ]
  },
  {
    title: 'Tutor Request Information',
    items: [
      { label: 'Total Tutor', value: 5, icon: UserCheck, color: 'border-[#3B82F6]' },
      { label: 'Pending Tutor', value: 2, icon: Clock, color: 'border-[#EF4444]' },
      { label: 'Approve Tutor', value: 3, icon: CheckSquare, color: 'border-[#10B981]' },
    ]
  },
  {
    title: 'All Blog Information',
    items: [
      { label: 'Total Blogs', value: 2, icon: Newspaper, color: 'border-[#3B82F6]' },
      { label: 'Pending Blog', value: 1, icon: Clock, color: 'border-[#EF4444]' },
      { label: 'Approve Blog', value: 1, icon: CheckSquare, color: 'border-[#10B981]' },
    ]
  },
  {
    title: 'Payment Information',
    items: [
      { label: 'Total Payment', value: '00', icon: CreditCard, color: 'border-[#EF4444]' },
    ]
  }
];

export default function AdminDashboard() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState(STAT_CARDS);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    setNotifications(saved);

    // Update stats dynamically
    const updatedStats = [...STAT_CARDS];
    updatedStats[2].items[0].value = 5 + saved.length; // Total Tutor (Mock + New)
    updatedStats[2].items[1].value = 2 + saved.length; // Pending Tutor (Mock + New)
    setStats(updatedStats);
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

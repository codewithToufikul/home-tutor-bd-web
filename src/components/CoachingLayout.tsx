import { apiGet } from '@/src/repositories/baseRepository';
import { ReactNode, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  LogOut,
  Bell,
  Settings,
  ChevronRight,
  Home,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import logoImage from '@/src/lib/Home.png';
import NotificationBell from '@/src/components/NotificationBell.tsx';

interface CoachingLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function CoachingLayout({ children, title }: CoachingLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      const storedToken = localStorage.getItem('accessToken') || '';
      if (!storedToken) return;
      try {
        const list = await apiGet<any[]>('/enrollments/my-enrollments');
        const pending = (list || []).filter((e: any) => e.status === 'pending').length;
        setPendingCount(pending);
      } catch { /* ignore */ }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/coaching/dashboard', icon: LayoutDashboard },
    { label: 'Manage Batches', path: '/coaching/batches', icon: BookOpen },
    { label: 'Tutors & Students', path: '/coaching/members', icon: Users },
    { label: 'Enrollment', path: '/coaching/enrollments', icon: ClipboardList, badge: pendingCount },
    { label: 'Institute Profile', path: '/coaching/profile', icon: Building2 },
    { label: 'Settings', path: '/coaching/settings', icon: Settings },
    { label: 'Home', path: '/', icon: Home },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-ink/5 hidden lg:flex flex-col fixed inset-y-0 z-50">
        {/* Brand Header */}
        <div className="p-6 border-b border-ink/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/25 flex items-center justify-center bg-white shrink-0">
            <img
              src={logoImage}
              alt="Home Tutor Provider BD"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-ink text-sm leading-tight">Coaching Portal</h1>
            <p className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">Home Tutor Provider BD</p>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-ink-muted hover:bg-primary/5 hover:text-primary"
                )}
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {(item as any).badge > 0 && !isActive && (
                  <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {(item as any).badge}
                  </span>
                )}
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </div>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-ink/5">
          <div className="bg-background p-4 rounded-2xl border border-ink/5 mb-3">
            <p className="text-xs font-bold text-ink truncate">{user?.name || 'Coaching Institute'}</p>
            <p className="text-[10px] text-ink-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-xs font-bold cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-ink/5 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-ink">{title || 'Dashboard'}</h2>
            <p className="text-xs text-ink-muted">Welcome back, manage your coaching activities.</p>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell role="coaching" />
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
import { apiGet } from '@/src/repositories/baseRepository';
import { ReactNode, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
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
  ClipboardList,
  Megaphone,
  FileDown,
  Briefcase,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { label: 'Tuition Posts', path: '/coaching/tuition-posts', icon: Briefcase },
    { label: 'Tutors & Students', path: '/coaching/members', icon: Users },
    { label: 'Enrollment', path: '/coaching/enrollments', icon: ClipboardList, badge: pendingCount },
    { label: 'Notice Board', path: '/coaching/notices', icon: Megaphone },
    { label: 'Download & PDF Zone', path: '/coaching/downloads', icon: FileDown },
    { label: 'Institute Profile', path: '/coaching/profile', icon: Building2 },
    { label: 'Settings', path: '/coaching/settings', icon: Settings },
    { label: 'Home', path: '/', icon: Home },
  ];

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
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
              onClick={onLinkClick}
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
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <aside className="w-72 bg-white border-r border-ink/5 hidden lg:flex flex-col fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-white border-r border-ink/5 flex flex-col z-50 lg:hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-ink/5 hover:bg-ink/10 transition-colors z-10"
              >
                <X size={18} className="text-ink-muted" />
              </button>
              <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Premium Topbar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-ink/5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40"
          style={{ boxShadow: '0 1px 20px rgba(0,0,0,0.06)' }}>
          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-ink/5 hover:bg-primary/10 hover:text-primary transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-ink" />
            </button>
            <div className="w-1 h-8 rounded-full bg-gradient-to-b from-primary to-purple-500 shrink-0" />
            <div>
              <h2 className="text-base font-display font-black text-ink leading-tight">{title || 'Dashboard'}</h2>
              <p className="text-[10px] text-ink-muted font-medium">Coaching Portal · Home Tutor Provider BD</p>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <NotificationBell role="coaching" />
            {/* Avatar with gradient ring */}
            <div className="p-0.5 rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-md shadow-primary/20">
              <div className="w-9 h-9 rounded-[14px] bg-white flex items-center justify-center font-black text-sm text-primary">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
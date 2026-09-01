import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, CreditCard, CheckSquare, Clock, PlusCircle, 
  Bell, Briefcase, UserCheck, School, Newspaper, Download, Mail, 
  FileText, Home as HomeIcon, Search, Menu, X, ChevronLeft, 
  Settings, LogOut, Star, User, AlertCircle, Trash2, Megaphone, ShieldCheck, Code
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import NotificationBell from '@/src/components/NotificationBell.tsx';
import MessageBell from '@/src/components/MessageBell.tsx';
import logoImage from '@/src/lib/Home.png';

// roles: which roles can see this item. 'all' means everyone (super_admin, admin, moderator)
const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Admin Home', href: '/admin', roles: ['all'] },
  { icon: Bell, label: 'Notifications', href: '/admin/notifications', roles: ['all'] },
  { icon: Users, label: 'Users', href: '/admin/users', roles: ['super_admin', 'admin'] },
  { icon: ShieldCheck, label: 'Staff & Roles', href: '/admin/staff', roles: ['super_admin'] },
  { icon: CreditCard, label: 'All Payments', href: '/admin/payments', roles: ['super_admin', 'admin'] },
  { icon: Briefcase, label: 'Manage Tuition Jobs', href: '/admin/jobs-approve', roles: ['all'] },
  { icon: Clock, label: 'Hire Tutor Request-Pending', href: '/admin/hire-pending', roles: ['all'] },
  { icon: PlusCircle, label: 'Create Tuition Job', href: '/admin/create-job', roles: ['super_admin', 'admin'] },
  { icon: Megaphone, label: 'Create Notice', href: '/admin/create-notice', roles: ['all'] },
  { icon: UserCheck, label: 'All Tutor', href: '/admin/all-tutors', roles: ['all'] },
  { icon: School, label: 'Coaching Center', href: '/admin/coaching', roles: ['super_admin', 'admin'] },
  { icon: Newspaper, label: 'All Blog', href: '/admin/blogs', roles: ['all'] },
  { icon: Code, label: 'Manage IT Services', href: '/admin/services', roles: ['all'] },
  { icon: Download, label: 'Download & PDF Zone', href: '/admin/downloads', roles: ['super_admin', 'admin'] },
  { icon: Mail, label: 'Inbox', href: '/admin/inbox', roles: ['all'] },
  { icon: FileText, label: 'Terms And Condition', href: '/admin/terms', roles: ['super_admin', 'admin'] },
  { icon: HomeIcon, label: 'Home', href: '/', roles: ['all'] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const userRole = (user?.role || 'admin') as string;

  // Filter sidebar items based on role
  const visibleItems = SIDEBAR_ITEMS.filter(item => 
    item.roles.includes('all') || item.roles.includes(userRole)
  );

  useEffect(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsReadAndNavigate = (notif: any) => {
    const updated = notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n);
    setNotifications(updated);
    setIsNotifOpen(false);

    // নোটিফিকেশনের ধরন অনুযায়ী সঠিক সেকশনে রিডাইরেক্ট করা
    if (notif.type === 'user_registration') {
      navigate('/admin/users');
    } else if (notif.type === 'tutor_request' || notif.type === 'job_request') {
      navigate('/admin/jobs-approve');
    } else {
      navigate('/admin/notifications');
    }
  };

  const deleteNotif = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 hidden lg:flex flex-col bg-white/40 backdrop-blur-xl border-r border-white/20 transition-all duration-500 z-40",
        isSidebarOpen ? "w-72" : "w-24"
      )}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20 shrink-0 flex items-center justify-center bg-white">
            <img 
              src={logoImage} 
              alt="Admin Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-display font-black text-xl text-ink tracking-tight truncate"
            >
              Admin<span className="text-primary">.</span>
            </motion.span>
          )}
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-24 w-8 h-8 bg-white border border-ink/5 rounded-xl flex items-center justify-center text-ink-muted hover:text-primary transition-all z-50 shadow-xl shadow-ink/5 hover:scale-110"
        >
          <ChevronLeft size={16} className={cn("transition-transform duration-500", !isSidebarOpen && "rotate-180")} />
        </button>

        <nav className="flex-grow py-6 px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {visibleItems.map((item, i) => {
            const isActive = location.pathname === item.href;
            return (
              <Link 
                key={i} 
                to={item.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden",
                  isActive ? "text-white shadow-lg shadow-primary/20" : "text-ink-muted hover:text-primary hover:bg-white/50"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={22} className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "group-hover:text-primary")} />
                {isSidebarOpen && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-bold tracking-tight truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/20">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink/10 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-2xl z-50 lg:hidden flex flex-col shadow-2xl border-r border-white/20"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center bg-white">
                    <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-display font-black text-xl text-ink">Admin<span className="text-primary">.</span></span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center text-ink-muted">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-grow py-6 px-4 space-y-2 overflow-y-auto">
                {visibleItems.map((item, i) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link 
                      key={i} 
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden",
                        isActive ? "text-white shadow-lg shadow-primary/20" : "text-ink-muted hover:text-primary hover:bg-white/50"
                      )}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-primary -z-10" />
                      )}
                      <item.icon size={22} className={cn("shrink-0", isActive ? "text-white" : "group-hover:text-primary")} />
                      <span className="text-sm font-bold tracking-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "flex-grow flex flex-col min-w-0 relative z-10 transition-all duration-500 h-screen",
        isSidebarOpen ? "lg:ml-72" : "lg:ml-24"
      )}>
        {/* Top Bar */}
        <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-white/50 rounded-xl md:rounded-2xl text-ink-muted transition-all"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            {/* Live Message Bell */}
            <MessageBell />
            {/* Notification Bell */}
            <NotificationBell role="admin" />
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <span className="text-sm font-black text-ink leading-none">{user?.name || 'Admin'}</span>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-black mt-1 ${
                  userRole === 'super_admin' ? 'text-amber-600' :
                  userRole === 'moderator' ? 'text-purple-600' : 'text-primary'
                }`}>
                  {userRole === 'super_admin' ? '👑 Super Admin' : userRole === 'moderator' ? '⚖️ Moderator' : '🛡️ Admin'}
                </span>
              </div>
              <div className="relative group">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-white p-0.5 shadow-lg shadow-ink/5 cursor-pointer overflow-hidden group-hover:scale-105 transition-transform">
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || user?.email || 'admin')}`}
                    alt={user?.name || 'Admin'} 
                    className="w-full h-full object-cover rounded-[14px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute top-full right-0 mt-4 w-56 bg-white/85 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-4 group-hover:translate-y-0 z-50">
                  <div className="px-4 py-2 mb-2 border-b border-ink/5 lg:hidden">
                    <p className="text-sm font-black text-ink">{user?.name || 'Admin'}</p>
                    <p className={`text-[10px] font-black uppercase ${
                      userRole === 'super_admin' ? 'text-amber-600' :
                      userRole === 'moderator' ? 'text-purple-600' : 'text-primary'
                    }`}>
                      {userRole === 'super_admin' ? '👑 Super Admin' : userRole === 'moderator' ? '⚖️ Moderator' : '🛡️ Admin'}
                    </p>
                  </div>
                  <Link to="/admin/profile" className="w-full px-4 py-3 text-left text-sm font-bold text-ink-muted hover:bg-primary/5 hover:text-primary flex items-center gap-3 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={16} /></div> Profile
                  </Link>
                  <Link to="/admin/profile" className="w-full px-4 py-3 text-left text-sm font-bold text-ink-muted hover:bg-primary/5 hover:text-primary flex items-center gap-3 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Settings size={16} /></div> Settings
                  </Link>
                  <div className="my-2 border-t border-ink/5" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-all"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500"><LogOut size={16} /></div> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 lg:p-12 space-y-16 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}
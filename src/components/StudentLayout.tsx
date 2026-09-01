import NotificationBell from '@/src/components/NotificationBell.tsx';
import MessageBell from '@/src/components/MessageBell.tsx';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  User, 
  Search, 
  History, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ChevronDown,
  GraduationCap,
  PlusCircle,
  MessageSquare,
  Heart,
  Building2,
  Home,
  BookOpen
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import logoImage from '@/src/lib/Home.png';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
  { icon: BookOpen, label: 'Active Tuitions', href: '/student/active-tuitions' },
  { icon: Building2, label: 'Coaching Centers', href: '/student/coaching-centers' },
  { icon: PlusCircle, label: 'Post a Job', href: '/request-tutor' },
  { icon: History, label: 'My Requests', href: '/student/requests' },
  { icon: Heart, label: 'Saved Tutors', href: '/student/saved' },
  { icon: MessageSquare, label: 'Messages', href: '/student/messages' },
  { icon: Bell, label: 'Notifications', href: '/student/notifications' },
  { icon: Settings, label: 'Settings', href: '/student/settings' },
  { icon: Home, label: 'Home', href: '/' },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex relative overflow-hidden">
      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 100 }}
        className="hidden lg:flex flex-col bg-white border-r border-ink/5 relative z-50 transition-all duration-300"
      >
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/25 flex items-center justify-center bg-white shrink-0">
            <img 
              src={logoImage} 
              alt="Home Tutor Provider BD" 
              className="w-full h-full object-cover"
            />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-display font-black text-ink tracking-tight whitespace-nowrap"
            >
              Student<span className="text-secondary">Panel</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-grow px-4 space-y-2 overflow-y-auto scrollbar-hide">
          {SIDEBAR_ITEMS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative",
                location.pathname === item.href 
                  ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                  : "text-ink-muted hover:bg-secondary/5 hover:text-secondary"
              )}
            >
              <item.icon size={22} className={cn("shrink-0", location.pathname === item.href ? "text-white" : "group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-ink text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-ink/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
          >
            <LogOut size={22} />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-10 w-8 h-8 bg-white border border-ink/5 rounded-full flex items-center justify-center text-ink-muted hover:text-secondary shadow-sm z-50 transition-colors"
        >
          {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-ink/5 px-6 lg:px-12 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-ink-muted hover:text-secondary transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-ink/5 rounded-xl text-ink-muted focus-within:bg-white focus-within:ring-2 focus-within:ring-secondary/20 transition-all w-64 lg:w-96">
              <Search size={18} />
              <input type="text" placeholder="Search tutors, subjects..." className="bg-transparent border-none outline-none text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <MessageBell />
            <NotificationBell role="student" />
            
            <div className="h-10 w-[1px] bg-ink/5 hidden sm:block" />

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-ink leading-none">{user?.name || 'Student'}</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-1">Active Student</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 border-2 border-white shadow-lg overflow-hidden group-hover:border-secondary/20 transition-all">
                <img 
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.name || user?.email || 'student')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown size={16} className="text-ink-muted group-hover:text-secondary transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-grow overflow-y-auto p-6 lg:p-12 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-ink/20 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] lg:hidden flex flex-col shadow-2xl"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/25 flex items-center justify-center bg-white shrink-0">
                    <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-lg font-display font-black text-ink">StudentPanel</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-ink-muted"><X size={24} /></button>
              </div>

              <nav className="flex-grow px-4 space-y-1">
                {SIDEBAR_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all font-bold text-sm",
                      location.pathname === item.href 
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                        : "text-ink-muted hover:bg-secondary/5"
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-ink/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all font-bold text-sm"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
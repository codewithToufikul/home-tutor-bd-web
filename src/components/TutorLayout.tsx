import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  CreditCard, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  Search,
  ChevronDown,
  GraduationCap,
  CheckCircle2,
  Camera,
  Home,
  BookOpen,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import NotificationBell from '@/src/components/NotificationBell.tsx';
import MessageBell from '@/src/components/MessageBell.tsx';
import logoImage from '@/src/lib/Home.png';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/tutor/dashboard' },
  { icon: BookOpen, label: 'Active Tuitions', href: '/tutor/active-tuitions' },
  { icon: MessageSquare, label: 'Messages & Support', href: '/tutor/messages' },
  { icon: Briefcase, label: 'Job Board', href: '/jobs' },
  { icon: Bell, label: 'Notification', href: '/tutor/notifications' },
  { icon: User, label: 'Update Profile', href: '/tutor/profile' },
  { icon: ShieldCheck, label: 'Profile Verification', href: '/tutor/profile?tab=verification' },
  { icon: CreditCard, label: 'Payment Section', href: '/tutor/payments' },
  { icon: CreditCard, label: 'My Balance', href: '/tutor/balance' },
  { icon: CheckCircle2, label: 'My Apply Status', href: '/tutor/applied' },
  { icon: Settings, label: 'Settings', href: '/tutor/settings' },
  { icon: Settings, label: 'Security', href: '/tutor/security' },
  { icon: Home, label: 'Home', href: '/' },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
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
        animate={{ width: isSidebarOpen ? 300 : 100 }}
        className="hidden lg:flex flex-col bg-white border-r border-ink/10 relative z-50 transition-all duration-300"
      >
        {/* Profile Section */}
        <div className="p-8 flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-2 border-[#6B21A8] p-1">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <img 
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.name || user?.email || 'tutor')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#6B21A8] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Camera size={14} />
            </button>
          </div>
          {isSidebarOpen && (
            <div className="space-y-1">
              <h2 className="text-base font-black text-[#001F3F]">{user?.name || 'Tutor'}</h2>
              <p className="text-xs font-bold text-ink-muted">{user?.uid ? `(TS-${user.uid.slice(-6).toUpperCase()})` : ''}</p>
            </div>
          )}
        </div>

        <nav className="flex-grow px-0 space-y-0.5 overflow-y-auto scrollbar-hide border-t border-ink/5">
          {SIDEBAR_ITEMS.map((item) => {
            const currentFull = location.pathname + location.search;
            const isActive = item.href.includes('?')
              ? currentFull === item.href
              : location.pathname === item.href && !location.search;

            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 transition-all group relative border-b border-ink/5",
                  isActive 
                    ? "bg-[#9D174D] text-white" 
                    : "text-ink-muted hover:bg-gray-50 hover:text-ink"
                )}
              >
                <item.icon size={18} className={cn("shrink-0", isActive ? "text-white" : "text-ink-muted")} />
                {isSidebarOpen && <span className="font-bold text-xs whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-ink/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-rose-500 hover:bg-rose-50 transition-all font-bold text-xs"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-10 w-8 h-8 bg-white border border-ink/5 rounded-full flex items-center justify-center text-ink-muted hover:text-primary shadow-sm z-50 transition-colors"
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
              className="lg:hidden p-2 text-ink-muted hover:text-primary transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-ink/5 rounded-xl text-ink-muted focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 transition-all w-64 lg:w-96">
              <Search size={18} />
              <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <MessageBell />
            <NotificationBell role="tutor" />
            
            <div className="h-10 w-[1px] bg-ink/5 hidden sm:block" />

            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-ink leading-none">{user?.name || 'Tutor'}</p>
                <p className="text-[10px] font-bold text-primary uppercase mt-1">Premium Tutor</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-white shadow-lg overflow-hidden group-hover:border-primary/20 transition-all">
                <img 
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user?.name || user?.email || 'tutor')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`} 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown size={16} className="text-ink-muted group-hover:text-primary transition-colors" />
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
                  <span className="text-lg font-display font-black text-ink">TutorPanel</span>
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
                        ? "bg-primary text-white shadow-lg shadow-primary/20" 
                        : "text-ink-muted hover:bg-primary/5"
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
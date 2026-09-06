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
  BookOpen,
  FileDown
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { useGetMeQuery } from '@/src/services/authApi';
import SafeAvatar from '@/src/components/SafeAvatar.tsx';
import logoImage from '@/src/lib/Home.png';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
  { icon: BookOpen, label: 'Active Tuitions', href: '/student/active-tuitions' },
  { icon: FileDown, label: 'Download & PDF Zone', href: '/student/downloads' },
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
  const { data: meData } = useGetMeQuery(undefined);

  const currentUser = (meData?.data as any)?.user || meData?.data || user;

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

            <div 
              onClick={() => navigate('/student/settings')}
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer active:scale-95 transition-transform"
              title="Profile & Settings"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-ink leading-none">{currentUser?.name || 'Student'}</p>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-1">Active Student</p>
              </div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-secondary/10 border-2 border-white shadow-md overflow-hidden group-hover:border-secondary/30 transition-all flex items-center justify-center shrink-0">
                <SafeAvatar 
                  src={currentUser?.avatar} 
                  name={currentUser?.name || 'Student'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <ChevronDown size={15} className="text-ink-muted group-hover:text-secondary transition-colors" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        {(() => {
          const isMessagesPage = location.pathname.includes('/messages') || location.pathname.includes('/chat');
          return (
            <div className={cn(
              "flex-grow min-h-0",
              isMessagesPage 
                ? "overflow-hidden p-2 lg:p-4 h-[calc(100vh-5rem)] flex flex-col pb-20 lg:pb-4" 
                : "overflow-y-auto p-4 sm:p-6 lg:p-10 scrollbar-hide pb-24 lg:pb-10"
            )}>
              <div className={cn("mx-auto", isMessagesPage ? "w-full h-full" : "max-w-7xl")}>
                {children}
              </div>
            </div>
          );
        })()}

        {/* 📱 Mobile Native App Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
          {/* 1. Dashboard */}
          <Link
            to="/student/dashboard"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-90",
              location.pathname === '/student/dashboard'
                ? "text-secondary font-black"
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            <LayoutDashboard size={19} strokeWidth={location.pathname === '/student/dashboard' ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 leading-none">Home</span>
          </Link>

          {/* 2. My Requests */}
          <Link
            to="/student/requests"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-90",
              location.pathname === '/student/requests'
                ? "text-secondary font-black"
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            <History size={19} strokeWidth={location.pathname === '/student/requests' ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 leading-none">Requests</span>
          </Link>

          {/* 3. Center Elevated Post Job Button */}
          <Link
            to="/request-tutor"
            className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-90"
          >
            <div className="w-12 h-12 rounded-full bg-secondary hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-secondary/30 border-4 border-white">
              <PlusCircle size={24} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-secondary mt-0.5 leading-none">Post Job</span>
          </Link>

          {/* 4. Active Tuitions */}
          <Link
            to="/student/active-tuitions"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-90",
              location.pathname === '/student/active-tuitions'
                ? "text-secondary font-black"
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            <BookOpen size={19} strokeWidth={location.pathname === '/student/active-tuitions' ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 leading-none">Tuitions</span>
          </Link>

          {/* 5. Messages / Chat */}
          <Link
            to="/student/messages"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-90 relative",
              location.pathname.includes('/messages')
                ? "text-secondary font-black"
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            <MessageSquare size={19} strokeWidth={location.pathname.includes('/messages') ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 leading-none">Chat</span>
          </Link>
        </nav>
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
              className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-[70] lg:hidden flex flex-col shadow-2xl h-full"
            >
              {/* Mobile Drawer Header */}
              <div className="p-5 border-b border-ink/5 flex items-center justify-between shrink-0">
                <div 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/student/settings');
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-secondary shadow-md shadow-secondary/20 flex items-center justify-center bg-white shrink-0">
                    <SafeAvatar 
                      src={currentUser?.avatar} 
                      name={currentUser?.name || 'Student'} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-sm font-display font-black text-ink block leading-tight">{currentUser?.name || 'Student'}</span>
                    <span className="text-[10px] font-bold text-secondary">Student Settings</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-2 text-ink-muted hover:text-ink rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Drawer Scrollable Navigation */}
              <nav className="flex-grow px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar pb-20">
                {SIDEBAR_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all font-bold text-xs",
                      location.pathname === item.href 
                        ? "bg-secondary text-white shadow-md shadow-secondary/20" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                    )}
                  >
                    <item.icon size={18} className={location.pathname === item.href ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Drawer Sticky Logout Footer */}
              <div className="p-4 border-t border-ink/5 bg-slate-50/80 shrink-0">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white transition-all font-bold text-xs shadow-xs cursor-pointer active:scale-95"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
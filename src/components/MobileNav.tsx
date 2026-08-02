import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, User, GraduationCap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function MobileNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    { label: 'Jobs', icon: Briefcase, path: '/jobs' },
    { label: 'Tutors', icon: Search, path: '/tutors' },
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Profile', icon: User, path: '/login' },
  ];

  // Find the current active index, defaulting to Home (index 2) if no match
  const activeIndex = navItems.findIndex(item => 
    pathname === item.path || (item.path === '/' && (pathname === '' || pathname === '/'))
  );
  const finalActiveIndex = activeIndex === -1 ? 2 : activeIndex;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#001F3F] border-t border-white/5 px-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto relative">
        {navItems.map((item, index) => {
          const isActive = index === finalActiveIndex;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 relative h-full group"
            >
              {/* Active State: Elevated Circle */}
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-indicator"
                  className="absolute w-14 h-14 bg-primary rounded-full border-[6px] border-[#001F3F] shadow-2xl flex items-center justify-center z-20 -top-6"
                  transition={{ 
                    type: "spring", 
                    stiffness: 380, 
                    damping: 30,
                    mass: 1
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <item.icon size={24} className="text-white" />
                  </motion.div>
                </motion.div>
              )}

              {/* Inactive State: Icon and Label */}
              <div className={cn(
                "flex flex-col items-center transition-all duration-500 ease-out",
                isActive ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}>
                <div className="p-2 rounded-xl group-hover:bg-white/5 transition-colors">
                  <item.icon 
                    size={20} 
                    className="text-white/60" 
                  />
                </div>
                <span className="text-[9px] font-bold mt-0.5 text-white/40 uppercase tracking-tighter">
                  {item.label}
                </span>
              </div>

              {/* Active Label */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-active-label"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-1 text-[9px] font-black text-primary uppercase tracking-tighter z-10"
                  transition={{ 
                    type: "spring", 
                    stiffness: 380, 
                    damping: 30 
                  }}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

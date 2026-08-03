import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Briefcase, User, Mail, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/context/AuthContext.tsx';
import logoImage from '@/src/lib/Home.png';
import { getDashboardPath } from '@/src/shared/authorization.ts';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Tuition Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Find Tutors', href: '/tutors', icon: Search },
    { name: 'Categories', href: '/categories', icon: Search },
    { name: 'Contact Us', href: '/contact', icon: Mail },
  ];

  const dashboardHref = getDashboardPath(user?.role);

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-ink/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/25 group-hover:scale-105 transition-transform flex items-center justify-center bg-white">
                <img 
                  src={logoImage} 
                  alt="Home Tutor Provider BD" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-display font-bold text-ink">
                Home Tutor Provider <span className="text-primary">BD</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href ? "text-primary" : "text-ink-muted"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-6 w-px bg-ink/10 mx-2" />
            {user ? (
              <Link
                to={dashboardHref}
                className="flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-primary hover:text-white transition-all active:scale-95"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-ink-muted hover:text-primary transition-colors"
                >
                  Login
                </Link>
              </>
            )}
            <Link
              to="/request-tutor"
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
            >
              Request a Tutor
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-ink-muted hover:text-ink p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-ink/5 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-ink-muted hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 mt-4 border-t border-ink/5 space-y-3">
                {user ? (
                  <Link
                    to={dashboardHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-bold text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-ink-muted hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      <User size={20} />
                      Login
                    </Link>
                  </>
                )}
                <Link
                  to="/request-tutor"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-primary text-white px-5 py-3 rounded-xl text-base font-semibold shadow-lg shadow-primary/20"
                >
                  Request a Tutor
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
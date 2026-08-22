import { AnimatePresence } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';

import FloatingActions from '@/src/components/FloatingActions.tsx';
import Footer from '@/src/components/Footer.tsx';
import MobileNav from '@/src/components/MobileNav.tsx';
import Navbar from '@/src/components/Navbar.tsx';
import ScrollToTop from '@/src/components/ScrollToTop.tsx';

export default function AppLayout() {
  const location = useLocation();

  // Hide main Navbar/Footer/FloatingActions/MobileNav on all dashboard routes
  const isDashboardRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/tutor') ||
    location.pathname.startsWith('/guardian') ||
    location.pathname.startsWith('/student') ||
    location.pathname.startsWith('/coaching');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <ScrollToTop />
      {!isDashboardRoute && <Navbar />}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      {!isDashboardRoute && <Footer />}
      {!isDashboardRoute && <FloatingActions />}
      {!isDashboardRoute && <MobileNav />}
    </div>
  );
}

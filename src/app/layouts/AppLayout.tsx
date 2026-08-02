import { AnimatePresence } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';

import FloatingActions from '@/src/components/FloatingActions.tsx';
import Footer from '@/src/components/Footer.tsx';
import MobileNav from '@/src/components/MobileNav.tsx';
import Navbar from '@/src/components/Navbar.tsx';
import ScrollToTop from '@/src/components/ScrollToTop.tsx';

export default function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>

      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <FloatingActions />}
      {!isAdminRoute && <MobileNav />}
    </div>
  );
}

import { AnimatePresence } from 'motion/react';
import { Outlet, useLocation } from 'react-router-dom';

import FloatingActions from '@/src/components/FloatingActions.tsx';
import Footer from '@/src/components/Footer.tsx';
import MobileNav from '@/src/components/MobileNav.tsx';
import Navbar from '@/src/components/Navbar.tsx';
import ScrollToTop from '@/src/components/ScrollToTop.tsx';

export default function AppLayout() {
  const location = useLocation();

  // Dashboard paths have their own dedicated sidebar/layout
  const tutorDashboardPaths = [
    '/tutor/dashboard',
    '/tutor/active-tuitions',
    '/tutor/messages',
    '/tutor/profile',
    '/tutor/applied',
    '/tutor/payments',
    '/tutor/notifications',
    '/tutor/balance',
    '/tutor/verification',
    '/tutor/security',
    '/tutor/settings',
  ];

  const isDashboardRoute =
    location.pathname.startsWith('/admin') ||
    tutorDashboardPaths.some((p) => location.pathname.startsWith(p)) ||
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

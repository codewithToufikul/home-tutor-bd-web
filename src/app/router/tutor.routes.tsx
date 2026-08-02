import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import TutorAppliedJobs from '@/src/pages/TutorAppliedJobs.tsx';
import TutorBalance from '@/src/pages/TutorBalance.tsx';
import TutorDashboard from '@/src/pages/TutorDashboard.tsx';
import TutorNotifications from '@/src/pages/TutorNotifications.tsx';
import TutorPayments from '@/src/pages/TutorPayments.tsx';
import TutorProfileDashboard from '@/src/pages/TutorProfileDashboard.tsx';
import TutorSecurity from '@/src/pages/TutorSecurity.tsx';
import TutorVerification from '@/src/pages/TutorVerification.tsx';

export const tutorRoutes: RouteObject[] = [
  { path: 'tutor/dashboard', element: <AuthGuard allowedRoles={['tutor']}><TutorDashboard /></AuthGuard> },
  { path: 'tutor/profile', element: <AuthGuard allowedRoles={['tutor']}><TutorProfileDashboard /></AuthGuard> },
  { path: 'tutor/applied', element: <AuthGuard allowedRoles={['tutor']}><TutorAppliedJobs /></AuthGuard> },
  { path: 'tutor/payments', element: <AuthGuard allowedRoles={['tutor']}><TutorPayments /></AuthGuard> },
  { path: 'tutor/notifications', element: <AuthGuard allowedRoles={['tutor']}><TutorNotifications /></AuthGuard> },
  { path: 'tutor/balance', element: <AuthGuard allowedRoles={['tutor']}><TutorBalance /></AuthGuard> },
  { path: 'tutor/verification', element: <AuthGuard allowedRoles={['tutor']}><TutorVerification /></AuthGuard> },
  { path: 'tutor/security', element: <AuthGuard allowedRoles={['tutor']}><TutorSecurity /></AuthGuard> },
  { path: 'tutor/settings', element: <AuthGuard allowedRoles={['tutor']}><TutorSecurity /></AuthGuard> },
];

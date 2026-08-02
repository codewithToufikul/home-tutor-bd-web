import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import CoachingDashboard from '@/src/pages/CoachingDashboard.tsx';
import CoachingLogin from '@/src/pages/CoachingLogin.tsx';
import CoachingProfile from '@/src/pages/CoachingProfile.tsx';

export const coachingRoutes: RouteObject[] = [
  { path: 'coaching/login', element: <CoachingLogin /> },
  { path: 'coaching/dashboard', element: <AuthGuard allowedRoles={['coaching']}><CoachingDashboard /></AuthGuard> },
  { path: 'coaching/profile', element: <AuthGuard allowedRoles={['coaching']}><CoachingProfile /></AuthGuard> },
];

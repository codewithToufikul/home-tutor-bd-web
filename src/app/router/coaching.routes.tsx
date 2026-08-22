import PublicCoachingExplorer from '@/src/pages/PublicCoachingExplorer.tsx';
import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import CoachingDashboard from '@/src/pages/CoachingDashboard.tsx';
import CoachingLogin from '@/src/pages/CoachingLogin.tsx';
import CoachingProfile from '@/src/pages/CoachingProfile.tsx';
import CoachingBatches from '@/src/pages/CoachingBatches.tsx';
import CoachingMembers from '@/src/pages/CoachingMembers.tsx';
import CoachingSettings from '@/src/pages/CoachingSettings.tsx';
import CoachingEnrollments from '@/src/pages/CoachingEnrollments.tsx';

export const coachingRoutes: RouteObject[] = [
  { path: 'coaching-centers', element: <PublicCoachingExplorer /> },
  { path: 'coaching/login', element: <CoachingLogin /> },
  { path: 'coaching/dashboard', element: <AuthGuard allowedRoles={['coaching']}><CoachingDashboard /></AuthGuard> },
  { path: 'coaching/batches', element: <AuthGuard allowedRoles={['coaching']}><CoachingBatches /></AuthGuard> },
  { path: 'coaching/members', element: <AuthGuard allowedRoles={['coaching']}><CoachingMembers /></AuthGuard> },
  { path: 'coaching/profile', element: <AuthGuard allowedRoles={['coaching']}><CoachingProfile /></AuthGuard> },
  { path: 'coaching/settings', element: <AuthGuard allowedRoles={['coaching']}><CoachingSettings /></AuthGuard> },
  { path: 'coaching/enrollments', element: <AuthGuard allowedRoles={['coaching']}><CoachingEnrollments /></AuthGuard> },
];

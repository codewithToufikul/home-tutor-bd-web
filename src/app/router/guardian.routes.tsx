import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import GuardianDashboard from '@/src/pages/GuardianDashboard.tsx';
import GuardianMessages from '@/src/pages/GuardianMessages.tsx';
import GuardianProfile from '@/src/pages/GuardianProfile.tsx';
import GuardianRequests from '@/src/pages/GuardianRequests.tsx';
import GuardianSavedTutors from '@/src/pages/GuardianSavedTutors.tsx';

export const guardianRoutes: RouteObject[] = [
  { path: 'guardian/dashboard', element: <AuthGuard allowedRoles={['guardian']}><GuardianDashboard /></AuthGuard> },
  { path: 'guardian/requests', element: <AuthGuard allowedRoles={['guardian']}><GuardianRequests /></AuthGuard> },
  { path: 'guardian/saved', element: <AuthGuard allowedRoles={['guardian']}><GuardianSavedTutors /></AuthGuard> },
  { path: 'guardian/messages', element: <AuthGuard allowedRoles={['guardian']}><GuardianMessages /></AuthGuard> },
  { path: 'guardian/profile', element: <AuthGuard allowedRoles={['guardian']}><GuardianProfile /></AuthGuard> },
];

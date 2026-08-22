import StudentNotifications from '@/src/pages/StudentNotifications.tsx';
import PublicCoachingExplorer from '@/src/pages/PublicCoachingExplorer.tsx';
import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import StudentDashboard from '@/src/pages/StudentDashboard.tsx';
import StudentMessages from '@/src/pages/StudentMessages.tsx';
import StudentProfileDashboard from '@/src/pages/StudentProfileDashboard.tsx';
import StudentRequests from '@/src/pages/StudentRequests.tsx';
import StudentSavedTutors from '@/src/pages/StudentSavedTutors.tsx';
import StudentSettings from '@/src/pages/StudentSettings.tsx';

export const studentRoutes: RouteObject[] = [
  { path: 'student/dashboard', element: <AuthGuard allowedRoles={['student']}><StudentDashboard /></AuthGuard> },
  { path: 'student/profile', element: <AuthGuard allowedRoles={['student']}><StudentProfileDashboard /></AuthGuard> },
  { path: 'student/requests', element: <AuthGuard allowedRoles={['student']}><StudentRequests /></AuthGuard> },
  { path: 'student/saved', element: <AuthGuard allowedRoles={['student']}><StudentSavedTutors /></AuthGuard> },
  { path: 'student/messages', element: <AuthGuard allowedRoles={['student']}><StudentMessages /></AuthGuard> },
  { path: 'student/settings', element: <AuthGuard allowedRoles={['student']}><StudentSettings /></AuthGuard> },
  { path: 'student/notifications', element: <AuthGuard allowedRoles={['student', 'guardian']}><StudentNotifications /></AuthGuard> },
  { path: 'student/coaching-centers', element: <AuthGuard allowedRoles={['student', 'guardian']}><PublicCoachingExplorer isDashboard={true} /></AuthGuard> },
];

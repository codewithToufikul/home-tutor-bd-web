import type { RouteObject } from 'react-router-dom';

import AuthGuard from '@/src/components/AuthGuard.tsx';
import AdminAllJobs from '@/src/pages/AdminAllJobs.tsx';
import AdminAllTutors from '@/src/pages/AdminAllTutors.tsx';
import AdminBlogs from '@/src/pages/AdminBlogs.tsx';
import AdminCalendar from '@/src/pages/AdminCalendar.tsx';
import AdminCoachingCenter from '@/src/pages/AdminCoachingCenter.tsx';
import AdminCreateJob from '@/src/pages/AdminCreateJob.tsx';
import AdminCreateNotice from '@/src/pages/AdminCreateNotice.tsx';
import AdminDashboard from '@/src/pages/AdminDashboard.tsx';
import AdminDownloads from '@/src/pages/AdminDownloads.tsx';
import AdminHirePending from '@/src/pages/AdminHirePending.tsx';
import AdminImportant from '@/src/pages/AdminImportant.tsx';
import AdminInbox from '@/src/pages/AdminInbox.tsx';
import AdminJobsApprove from '@/src/pages/AdminJobsApprove.tsx';
import AdminLogin from '@/src/pages/AdminLogin.tsx';
import AdminNotifications from '@/src/pages/AdminNotifications.tsx';
import AdminPayments from '@/src/pages/AdminPayments.tsx';
import AdminProfile from '@/src/pages/AdminProfile.tsx';
import AdminTerms from '@/src/pages/AdminTerms.tsx';
import AdminUsers from '@/src/pages/AdminUsers.tsx';
import AdminVerify from '@/src/pages/AdminVerify.tsx';

export const adminRoutes: RouteObject[] = [
  { path: 'admin/login', element: <AdminLogin /> },
  { path: 'admin/verify', element: <AdminVerify /> },
  { path: 'admin', element: <AuthGuard allowedRoles={['admin']}><AdminDashboard /></AuthGuard> },
  { path: 'admin/users', element: <AuthGuard allowedRoles={['admin']}><AdminUsers /></AuthGuard> },
  { path: 'admin/payments', element: <AuthGuard allowedRoles={['admin']}><AdminPayments /></AuthGuard> },
  { path: 'admin/jobs-approve', element: <AuthGuard allowedRoles={['admin']}><AdminJobsApprove /></AuthGuard> },
  { path: 'admin/hire-pending', element: <AuthGuard allowedRoles={['admin']}><AdminHirePending /></AuthGuard> },
  { path: 'admin/create-job', element: <AuthGuard allowedRoles={['admin']}><AdminCreateJob /></AuthGuard> },
  { path: 'admin/create-notice', element: <AuthGuard allowedRoles={['admin']}><AdminCreateNotice /></AuthGuard> },
  { path: 'admin/all-jobs', element: <AuthGuard allowedRoles={['admin']}><AdminAllJobs /></AuthGuard> },
  { path: 'admin/all-tutors', element: <AuthGuard allowedRoles={['admin']}><AdminAllTutors /></AuthGuard> },
  { path: 'admin/coaching', element: <AuthGuard allowedRoles={['admin']}><AdminCoachingCenter /></AuthGuard> },
  { path: 'admin/blogs', element: <AuthGuard allowedRoles={['admin']}><AdminBlogs /></AuthGuard> },
  { path: 'admin/downloads', element: <AuthGuard allowedRoles={['admin']}><AdminDownloads /></AuthGuard> },
  { path: 'admin/inbox', element: <AuthGuard allowedRoles={['admin']}><AdminInbox /></AuthGuard> },
  { path: 'admin/terms', element: <AuthGuard allowedRoles={['admin']}><AdminTerms /></AuthGuard> },
  { path: 'admin/profile', element: <AuthGuard allowedRoles={['admin']}><AdminProfile /></AuthGuard> },
  { path: 'admin/calendar', element: <AuthGuard allowedRoles={['admin']}><AdminCalendar /></AuthGuard> },
  { path: 'admin/notifications', element: <AuthGuard allowedRoles={['admin']}><AdminNotifications /></AuthGuard> },
  { path: 'admin/important', element: <AuthGuard allowedRoles={['admin']}><AdminImportant /></AuthGuard> },
];

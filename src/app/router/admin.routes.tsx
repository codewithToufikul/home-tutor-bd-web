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

import AdminStaffManagement from '@/src/pages/AdminStaffManagement.tsx';
import AdminManageServices from '@/src/pages/AdminManageServices.tsx';

export const adminRoutes: RouteObject[] = [
  { path: 'admin/login', element: <AdminLogin /> },
  { path: 'admin/verify', element: <AdminVerify /> },
  { path: 'admin', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminDashboard /></AuthGuard> },
  { path: 'admin/users', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminUsers /></AuthGuard> },
  { path: 'admin/staff', element: <AuthGuard allowedRoles={['super_admin']}><AdminStaffManagement /></AuthGuard> },
  { path: 'admin/payments', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminPayments /></AuthGuard> },
  { path: 'admin/jobs-approve', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminJobsApprove /></AuthGuard> },
  { path: 'admin/hire-pending', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminHirePending /></AuthGuard> },
  { path: 'admin/create-job', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminCreateJob /></AuthGuard> },
  { path: 'admin/create-notice', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminCreateNotice /></AuthGuard> },
  { path: 'admin/all-jobs', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminAllJobs /></AuthGuard> },
  { path: 'admin/all-tutors', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminAllTutors /></AuthGuard> },
  { path: 'admin/coaching', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminCoachingCenter /></AuthGuard> },
  { path: 'admin/blogs', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminBlogs /></AuthGuard> },
  { path: 'admin/services', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminManageServices /></AuthGuard> },
  { path: 'admin/downloads', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminDownloads /></AuthGuard> },
  { path: 'admin/inbox', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminInbox /></AuthGuard> },
  { path: 'admin/terms', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminTerms /></AuthGuard> },
  { path: 'admin/profile', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminProfile /></AuthGuard> },
  { path: 'admin/calendar', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminCalendar /></AuthGuard> },
  { path: 'admin/notifications', element: <AuthGuard allowedRoles={['super_admin', 'admin', 'moderator']}><AdminNotifications /></AuthGuard> },
  { path: 'admin/important', element: <AuthGuard allowedRoles={['super_admin', 'admin']}><AdminImportant /></AuthGuard> },
];

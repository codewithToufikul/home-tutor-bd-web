import { Navigate, RouteObject, createBrowserRouter } from 'react-router-dom';

import AppLayout from '@/src/app/layouts/AppLayout.tsx';
import { adminRoutes } from '@/src/app/router/admin.routes.tsx';
import { coachingRoutes } from '@/src/app/router/coaching.routes.tsx';
import { guardianRoutes } from '@/src/app/router/guardian.routes.tsx';
import { publicRoutes } from '@/src/app/router/public.routes.tsx';
import { studentRoutes } from '@/src/app/router/student.routes.tsx';
import { tutorRoutes } from '@/src/app/router/tutor.routes.tsx';

const routeTree: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      ...adminRoutes,
      ...tutorRoutes,
      ...studentRoutes,
      ...guardianRoutes,
      ...coachingRoutes,
      ...publicRoutes,
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const appRouter = createBrowserRouter(routeTree);

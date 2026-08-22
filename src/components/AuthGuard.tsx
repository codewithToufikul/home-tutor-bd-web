import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { can } from '@/src/shared/authorization.ts';

export type AppRole = 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  ownerId?: string;
  guestOnly?: boolean;
}

const roleHomeMap: Record<AppRole, string> = {
  admin: '/admin/dashboard',
  tutor: '/tutor/dashboard',
  student: '/student/dashboard',
  guardian: '/guardian/dashboard',
  coaching: '/coaching/dashboard',
};

const LoadingState = () => (
  <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState />;
  if (!user) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export function RequireRole({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: AppRole[];
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState />;

  const decision = can({ user, allowedRoles });
  if (!decision.ok) {
    if (decision.code === 'UNAUTHORIZED') {
      const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
      return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    return <Navigate to="/" replace />;
  }

  // Pending Approval Check: Tutors, Guardians, Coaching must be approved by Admin
  // Only tutor & coaching require admin approval. Student & Guardian are auto-approved.
  if (user && !user.isApproved && (user.role === 'tutor' || user.role === 'coaching')) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState />;
  if (user) {
    const fallbackPath = roleHomeMap[user.role] ?? '/';
    const redirectPath = location.state?.from?.pathname || fallbackPath;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export function RequireOwnership({
  children,
  ownerId,
}: {
  children: React.ReactNode;
  ownerId: string;
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState />;

  const decision = can({ user, ownerId });
  if (!decision.ok) {
    if (decision.code === 'UNAUTHORIZED') {
      const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
      return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function AuthGuard({
  children,
  allowedRoles,
  ownerId,
  guestOnly = false,
}: AuthGuardProps) {
  if (guestOnly) {
    return <GuestOnly>{children}</GuestOnly>;
  }

  if (ownerId) {
    return <RequireOwnership ownerId={ownerId}>{children}</RequireOwnership>;
  }

  if (allowedRoles?.length) {
    return <RequireRole allowedRoles={allowedRoles}>{children}</RequireRole>;
  }

  return <RequireAuth>{children}</RequireAuth>;
}
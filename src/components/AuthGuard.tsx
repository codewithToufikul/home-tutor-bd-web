import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext.tsx';

export default function AuthGuard({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode, 
  allowedRoles?: ('admin' | 'tutor' | 'student' | 'guardian' | 'coaching')[] 
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // যদি লোডিং হয়, তবুও সেফটির জন্য টাইমআউট বা সরাসরি চেক রাখা হলো যাতে লুপ না ধরে
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const loginPath = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // রোল ম্যাচ না করলে হোম পেজে পাঠিয়ে দিবে
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
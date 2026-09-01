import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout as logoutAction, setCredentials, setUser } from '../features/auth/authSlice';
import {
  useGetMeQuery,
  useLoginMutation,
  useLogoutUserMutation,
  useRegisterMutation,
} from '../services/authApi';

export type AuthRole = 'super_admin' | 'admin' | 'moderator' | 'tutor' | 'student' | 'guardian' | 'coaching';

export interface AppUser {
  _id: string;
  id: string;
  uid: string;
  email: string;
  username?: string;
  role: AuthRole;
  isVerified: boolean;
  isApproved: boolean;
  name: string;
  phone?: string;
  avatar?: string;
  address?: string;
  location?: string;
  studentClass?: string;
  institution?: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string, role?: AuthRole) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: Exclude<AuthRole, 'admin' | 'super_admin' | 'moderator'>,
    extra?: { phone?: string; location?: string; gender?: string; [key: string]: any },
  ) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const reduxAuth = useAppSelector((state) => state.auth);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [logoutMutation] = useLogoutUserMutation();

  // Restore user session on page refresh if accessToken exists in localStorage
  const { data: meData, isLoading: isMeLoading, isError: meError } = useGetMeQuery(undefined, {
    skip: !reduxAuth.accessToken,
  });

  useEffect(() => {
    if (meData?.data) {
      const u = (meData.data as any).user || meData.data;
      dispatch(
        setCredentials({
          user: {
            _id: String(u._id || u.id),
            name: u.name,
            username: u.username,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            phone: u.phone,
            location: u.location,
            address: u.address,
            isEmailVerified: Boolean(u.isEmailVerified),
            isApproved: Boolean(u.isApproved),
          },
          accessToken: reduxAuth.accessToken || localStorage.getItem('accessToken') || '',
        }),
      );
    }
  }, [meData, dispatch, reduxAuth.accessToken]);

  // Normalize backend user shape to legacy AppUser shape
  const appUser: AppUser | null = reduxAuth.user
    ? {
        _id: String(reduxAuth.user._id || (reduxAuth.user as any).id || ''),
        id: String(reduxAuth.user._id || (reduxAuth.user as any).id || ''),
        uid: String(reduxAuth.user._id || (reduxAuth.user as any).id || ''),
        email: reduxAuth.user.email,
        username: (reduxAuth.user as any).username,
        name: reduxAuth.user.name,
        phone: reduxAuth.user.phone,
        role: reduxAuth.user.role as AuthRole,
        isVerified: reduxAuth.user.isEmailVerified,
        isApproved: reduxAuth.user.isApproved,
        avatar: reduxAuth.user.avatar,
        address: reduxAuth.user.address,
        location: reduxAuth.user.location,
      }
    : null;

  const login = async (email: string, password: string, _role?: AuthRole) => {
    try {
      const response = await loginMutation({ email, password }).unwrap();
      const { accessToken, user } = response.data;
      dispatch(
        setCredentials({
          accessToken,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            username: (user as any).username,
            avatar: user.avatar,
            phone: (user as any).phone,
            location: (user as any).location,
            address: (user as any).address,
            isEmailVerified: user.isEmailVerified,
            isApproved: user.isApproved,
          },
        }),
      );
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message || 'Login failed'
          : 'Login failed';
      throw new Error(errorMsg);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: Exclude<AuthRole, 'admin' | 'super_admin' | 'moderator'>,
    extra?: { phone?: string; location?: string; gender?: string; [key: string]: any },
  ) => {
    try {
      await registerMutation({
        name,
        email,
        password,
        role,
        phone: extra?.phone || '',
        location: extra?.location || '',
        gender: extra?.gender || '',
      }).unwrap();
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === 'object' && 'data' in err
          ? (err.data as { message?: string })?.message || 'Registration failed'
          : 'Registration failed';
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      await logoutMutation(undefined).unwrap();
    } catch (err) {
      console.warn('Logout API failed, forcing local logout:', err);
    } finally {
      dispatch(logoutAction());
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const verifyEmail = async (_code: string) => {
    // Handled via POST /auth/verify-email OTP endpoint
  };

  const resetPassword = async (_email: string) => {
    // Handled via POST /auth/forgot-password endpoint
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        login,
        register,
        logout,
        verifyEmail,
        resetPassword,
        isLoading: Boolean(reduxAuth.accessToken) && !reduxAuth.user && isMeLoading,
        authError: null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

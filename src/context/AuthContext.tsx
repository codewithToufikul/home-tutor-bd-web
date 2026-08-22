import React, { createContext, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout as logoutAction, setCredentials, setUser } from '../features/auth/authSlice';
import {
  useGetMeQuery,
  useLoginMutation,
  useLogoutUserMutation,
  useRegisterMutation,
} from '../services/authApi';

export type AuthRole = 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching';

export interface AppUser {
  uid: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  isApproved: boolean;
  name: string;
  avatar?: string;
}

interface AuthContextType {
  user: AppUser | null;
  login: (email: string, password: string, role?: AuthRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: Exclude<AuthRole, 'admin'>) => Promise<void>;
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
    if (meData?.data?.user) {
      const u = meData.data.user;
      dispatch(
        setUser({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          isEmailVerified: u.isEmailVerified,
          isApproved: u.isApproved,
        }),
      );
    } else if (meError) {
      // If server responds with auth error (token expired), clear state
      console.warn('Authentication token expired or invalid, logging out.');
      dispatch(logoutAction());
    }
  }, [meData, meError, dispatch]);

  // Normalize backend user shape to legacy AppUser shape
  const appUser: AppUser | null = reduxAuth.user
    ? {
        uid: reduxAuth.user._id,
        email: reduxAuth.user.email,
        name: reduxAuth.user.name,
        role: reduxAuth.user.role as AuthRole,
        isVerified: reduxAuth.user.isEmailVerified,
        isApproved: reduxAuth.user.isApproved,
        avatar: reduxAuth.user.avatar,
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
            avatar: user.avatar,
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
    role: Exclude<AuthRole, 'admin'>,
  ) => {
    try {
      await registerMutation({ name, email, password, role }).unwrap();
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

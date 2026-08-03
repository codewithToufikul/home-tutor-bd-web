import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  getUserProfile,
  registerWithFirebase,
  resetPassword,
  sendUserVerificationEmail,
  signInWithFirebase,
  signOutUser,
  subscribeToAuthState,
  type AppUser,
  type AuthRole,
} from '@/src/services/authService.ts';

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
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (authUser) => {
      setIsLoading(true);

      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(authUser.uid);
        setUser(profile ?? authUser);
      } catch {
        setUser(authUser);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: AuthRole = 'student') => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const authenticatedUser = await signInWithFirebase(email, password);

      if (role && authenticatedUser.role !== role && role !== 'student') {
        await signOutUser();
        setUser(null);
        throw new Error('Unauthorized role for this login portal.');
      }

      setUser(authenticatedUser);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthError(message);
      setUser(null);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, role: Exclude<AuthRole, 'admin'>) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const profile = await registerWithFirebase(name, email, password, role);
      setUser({
        uid: profile.uid,
        email: profile.email,
        role: profile.role,
        isVerified: profile.isVerified,
        isApproved: profile.isApproved,
        name: profile.name,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (_code: string) => {
    setIsLoading(true);
    try {
      await sendUserVerificationEmail();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordHandler = async (email: string) => {
    setIsLoading(true);
    try {
      await resetPassword(email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      setAuthError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      verifyEmail,
      resetPassword: resetPasswordHandler,
      isLoading,
      authError,
    }}>
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
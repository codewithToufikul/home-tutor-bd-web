// ─── LEGACY COMPAT SHIM ─────────────────────────────────────────────────────
// Firebase auth has been removed. All auth now goes through:
//   POST /api/v1/auth/login
//   POST /api/v1/auth/register
//   POST /api/v1/auth/logout
//   GET  /api/v1/auth/me
//
// Use AuthContext (useAuth()) or the RTK Query authApi hooks instead of
// calling these functions directly. These stubs exist only to prevent import
// errors in pages that still reference them during migration.
// TODO: Remove this file once all pages are updated to use useAuth() / RTK Query.

export type AuthRole = 'super_admin' | 'admin' | 'moderator' | 'tutor' | 'student' | 'guardian' | 'coaching';

export interface AppUser {
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
  createdAt?: string;
  updatedAt?: string;
}

// Stub — replaced by AuthContext.login()
export const signInWithFirebase = async (_email: string, _password: string, _opts?: unknown): Promise<AppUser> => {
  throw new Error('[DEPRECATED] Use useAuth().login() instead of signInWithFirebase()');
};

// Stub — replaced by AuthContext.register()
export const registerWithFirebase = async (_name: string, _email: string, _password: string, _role: AuthRole): Promise<AppUser> => {
  throw new Error('[DEPRECATED] Use useAuth().register() instead of registerWithFirebase()');
};

// Stub — replaced by AuthContext.logout()
export const signOutUser = async (): Promise<void> => {
  throw new Error('[DEPRECATED] Use useAuth().logout() instead of signOutUser()');
};

// Stub — replaced by useGetMeQuery in RTK Query
export const getUserProfile = async (_uid: string): Promise<AppUser | null> => {
  throw new Error('[DEPRECATED] Use useGetMeQuery() from authApi instead.');
};

// Stub — no longer used (OTP email is sent from backend)
export const sendUserVerificationEmail = async (): Promise<void> => {
  throw new Error('[DEPRECATED] OTP verification is now handled by the backend.');
};

// Stub — no longer used (password reset is handled via POST /auth/forgot-password)
export const resetPassword = async (_email: string): Promise<void> => {
  throw new Error('[DEPRECATED] Use POST /auth/forgot-password instead.');
};

// Stub — no longer needed; Firebase auth state subscription removed
export const subscribeToAuthState = (_callback: (_user: AppUser | null) => void): (() => void) => {
  // No-op. Auth state is now managed by Redux authSlice + useGetMeQuery.
  return () => {};
};

// UserProfilePayload - used by authProfileUtils
export interface UserProfilePayload {
  uid: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  isApproved: boolean;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

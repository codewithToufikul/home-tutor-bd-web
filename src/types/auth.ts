export type AuthRole = 'admin' | 'tutor' | 'student' | 'guardian' | 'coaching';

export interface AppUser {
  uid: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  isApproved: boolean;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

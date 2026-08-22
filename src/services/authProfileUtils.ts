import type { AuthRole, UserProfilePayload } from '@/src/services/authService.ts';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const buildUserProfilePayload = ({
  uid,
  email,
  role,
  isVerified,
  isApproved,
  name,
  createdAt,
  updatedAt,
}: {
  uid: string;
  email: string;
  role: AuthRole;
  isVerified: boolean;
  isApproved: boolean;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}): UserProfilePayload => {
  const now = new Date().toISOString();
  const normalizedName = name?.trim() || 'User';

  return {
    uid,
    email: normalizeEmail(email),
    role,
    isVerified: Boolean(isVerified),
    isApproved: Boolean(isApproved),
    name: normalizedName,
    createdAt: createdAt ?? now,
    updatedAt: updatedAt ?? now,
  };
};

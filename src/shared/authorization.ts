import type { AppUser } from '@/src/services/authService.ts';
import {
  APP_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  type AppPermission,
  type AppRole,
} from '@/src/shared/constants/permissions.ts';

export type AuthorizationDecision =
  | { ok: true; code: 'OK'; message?: string }
  | { ok: false; code: 'UNAUTHORIZED' | 'FORBIDDEN'; message: string };

export class AuthorizationError extends Error {
  readonly code: 'UNAUTHORIZED' | 'FORBIDDEN';

  constructor(code: 'UNAUTHORIZED' | 'FORBIDDEN', message: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
  }
}

export const hasRole = (user: AppUser | null | undefined, role: AppRole | AppRole[]) => {
  if (!user) return false;
  const requestedRoles = Array.isArray(role) ? role : [role];
  return requestedRoles.includes(user.role);
};

export const hasPermission = (user: AppUser | null | undefined, permission: AppPermission) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
};

export const ownsResource = (user: AppUser | null | undefined, ownerId?: string | null) => {
  if (!user) return false;
  if (!ownerId) return true;
  return user.uid === ownerId;
};

export const can = ({
  user,
  permission,
  allowedRoles,
  ownerId,
  resourceOwnerId,
}: {
  user: AppUser | null | undefined;
  permission?: AppPermission;
  allowedRoles?: AppRole[];
  ownerId?: string | null;
  resourceOwnerId?: string | null;
}): AuthorizationDecision => {
  if (!user) {
    return {
      ok: false,
      code: 'UNAUTHORIZED',
      message: 'Please sign in to continue.',
    };
  }

  if (allowedRoles?.length && !hasRole(user, allowedRoles)) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'You do not have access to this action.',
    };
  }

  if (permission && !hasPermission(user, permission)) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'You do not have permission for this action.',
    };
  }

  if (ownerId && !ownsResource(user, ownerId)) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'This resource is owned by another account.',
    };
  }

  if (resourceOwnerId && !ownsResource(user, resourceOwnerId)) {
    return {
      ok: false,
      code: 'FORBIDDEN',
      message: 'You cannot modify a resource that is not yours.',
    };
  }

  return { ok: true, code: 'OK' };
};

export const requirePermission = (args: Parameters<typeof can>[0]) => {
  const decision = can(args);

  if (!decision.ok) {
    throw new AuthorizationError(decision.code as 'UNAUTHORIZED' | 'FORBIDDEN', decision.message!);
  }

  return true;
};

export const getDashboardPath = (role?: AppRole | null) => {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'tutor':
      return '/tutor/dashboard';
    case 'guardian':
      return '/guardian/dashboard';
    case 'coaching':
      return '/coaching/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
};

export const getRoleLabel = (role?: AppRole | null) => {
  if (!role || !APP_ROLES.includes(role)) return 'User';
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const DEFAULT_UNAUTHORIZED_MESSAGE = 'Please sign in to continue.';
export const DEFAULT_FORBIDDEN_MESSAGE = 'You do not have permission to perform this action.';

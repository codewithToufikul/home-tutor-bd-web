import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '@/src/firebase.js';

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

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const mapProfile = (firebaseUser: FirebaseUser, profile?: Partial<UserProfilePayload> | null): AppUser | null => {
  if (!firebaseUser.email) return null;

  const userProfile = profile ?? {};

  return {
    uid: firebaseUser.uid,
    email: normalizeEmail(firebaseUser.email),
    role: (userProfile.role as AuthRole) ?? 'student',
    isVerified: firebaseUser.emailVerified || Boolean(userProfile.isVerified),
    isApproved: Boolean(userProfile.isApproved),
    name: userProfile.name ?? firebaseUser.displayName ?? 'User',
    createdAt: userProfile.createdAt ?? undefined,
    updatedAt: userProfile.updatedAt ?? undefined,
  };
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const snapshot = await getDoc(doc(db, 'users', uid));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<UserProfilePayload>;
  return {
    uid,
    email: normalizeEmail(data.email ?? ''),
    role: (data.role as AuthRole) ?? 'student',
    isVerified: Boolean(data.isVerified),
    isApproved: Boolean(data.isApproved),
    name: data.name ?? 'User',
    createdAt: data.createdAt ?? undefined,
    updatedAt: data.updatedAt ?? undefined,
  };
};

export const createUserProfile = async (uid: string, profile: UserProfilePayload) => {
  await setDoc(doc(db, 'users', uid), {
    ...profile,
    email: normalizeEmail(profile.email),
    createdAt: profile.createdAt ?? new Date().toISOString(),
    updatedAt: profile.updatedAt ?? new Date().toISOString(),
    isVerified: Boolean(profile.isVerified),
    isApproved: Boolean(profile.isApproved),
    role: profile.role,
    name: profile.name.trim(),
  });
};

export const signInWithFirebase = async (email: string, password: string) => {
  const credential = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  const snapshot = await getDoc(doc(db, 'users', credential.user.uid));

  if (!snapshot.exists()) {
    await signOut(auth);
    throw new Error('No user profile found. Please register again.');
  }

  const profile = snapshot.data() as Partial<UserProfilePayload>;

  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new Error('Please verify your email before signing in.');
  }

  if (!profile.isApproved) {
    await signOut(auth);
    throw new Error('Your account is pending admin approval.');
  }

  return mapProfile(credential.user, profile) as AppUser;
};

export const registerWithFirebase = async (name: string, email: string, password: string, role: AuthRole) => {
  const normalizedEmail = normalizeEmail(email);
  const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  const now = new Date().toISOString();
  const profile: UserProfilePayload = {
    uid: credential.user.uid,
    email: normalizedEmail,
    role,
    isVerified: false,
    isApproved: role === 'admin',
    name: name.trim() || 'User',
    createdAt: now,
    updatedAt: now,
  };

  await createUserProfile(credential.user.uid, profile);
  await sendEmailVerification(credential.user);
  await signOut(auth);

  return profile;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, normalizeEmail(email));
};

export const sendUserVerificationEmail = async () => {
  if (!auth.currentUser) {
    throw new Error('No active user session found.');
  }

  if (auth.currentUser.emailVerified) {
    return;
  }

  await sendEmailVerification(auth.currentUser);
};

export const subscribeToAuthState = (callback: (user: AppUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }

    const profile = await getUserProfile(firebaseUser.uid);
    callback(profile ? mapProfile(firebaseUser, profile) : null);
  });
};

export const getCurrentFirebaseUser = () => auth.currentUser;

export const getAuthRole = (role?: string): AuthRole => {
  const safeRole = role as AuthRole;
  return safeRole ?? 'student';
};

export const updateUserVerificationState = async (uid: string, isVerified: boolean, isApproved: boolean) => {
  await setDoc(
    doc(db, 'users', uid),
    {
      isVerified,
      isApproved,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};

export const getAuthState = () => auth;

export const getServerTimestamp = () => serverTimestamp();

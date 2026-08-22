// Firestore removed. Use RTK Query useGetTutorsQuery() instead.
// These helpers are kept as migration stubs.

import type { TutorProfile } from '@/src/types';

export const loadTutors = async (): Promise<TutorProfile[]> => {
  console.warn('[DEPRECATED] loadTutors() - Use useGetTutorsQuery() from tutorApi instead.');
  return [];
};

export const getTutors = (): TutorProfile[] => [];

import { collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/src/firebase.js';
import { TutorProfile } from '@/src/types';
import { TutorRepository } from '@/src/repositories/tutorRepository';

export const loadTutors = async (): Promise<TutorProfile[]> => {
  const docs = await getDocs(query(collection(db, 'tutors'), where('isDeleted', '!=', true)));

  return docs.docs.map((docSnapshot) => ({
    ...(docSnapshot.data() as TutorProfile),
    id: String(docSnapshot.id),
    userId: (docSnapshot.data() as any).uid ?? (docSnapshot.data() as any).userId ?? '',
    university: (docSnapshot.data() as any).university ?? 'N/A',
    department: (docSnapshot.data() as any).department ?? 'N/A',
    qualification: (docSnapshot.data() as any).qualification ?? 'N/A',
    location: (docSnapshot.data() as any).location ?? 'N/A',
    preferredAreas: (docSnapshot.data() as any).preferredAreas ?? [],
    mediums: (docSnapshot.data() as any).mediums ?? [],
    subjects: (docSnapshot.data() as any).subjects ?? [],
    rating: Number((docSnapshot.data() as any).rating ?? 0),
    reviewCount: Number((docSnapshot.data() as any).reviewCount ?? 0),
    verified: Boolean((docSnapshot.data() as any).verified),
  }));
};

export const getTutors = (): TutorProfile[] => {
  return [];
};

export const getTutorById = async (id: string): Promise<TutorProfile | undefined> => {
  const tutors = await loadTutors();
  return tutors.find((tutor) => tutor.id === id);
};

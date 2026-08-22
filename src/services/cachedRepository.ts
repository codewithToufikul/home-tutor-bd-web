// Firestore caching layer removed.
// Backend handles caching via Redis. No client-side Firestore caching needed.
// This file is a stub for backward compat during migration.

export const getCachedDocument = async <T>(_collectionName: string, _id: string): Promise<T | null> => null;
export const getCachedList = async <T>(_collectionName: string): Promise<T[]> => [];

// Firestore removed. Use RTK Query useGetTuitionJobsQuery() instead.
// These helpers are kept as migration stubs.

import type { TuitionJob } from '../types';

export const loadJobs = async (): Promise<TuitionJob[]> => {
  console.warn('[DEPRECATED] loadJobs() - Use useGetTuitionJobsQuery() from tuitionApi instead.');
  return [];
};

export const getJobs = (): TuitionJob[] => [];

export const addJob = async (_job: TuitionJob): Promise<TuitionJob> => {
  throw new Error('[DEPRECATED] addJob() - Use useCreateTuitionJobMutation() from tuitionApi instead.');
};

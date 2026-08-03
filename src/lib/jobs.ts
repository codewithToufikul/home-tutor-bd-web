import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { db } from '@/src/firebase.js';
import { TuitionJob } from '../types';
import { TuitionRepository } from '@/src/repositories/tuitionRepository';

export const loadJobs = async (): Promise<TuitionJob[]> => {
  const docs = await getDocs(query(collection(db, 'tuition_jobs'), where('isDeleted', '!=', true)));

  return docs.docs.map((docSnapshot) => ({
    ...(docSnapshot.data() as TuitionJob),
    id: String(docSnapshot.id),
  }));
};

export const getJobs = (): TuitionJob[] => {
  return [];
};

export const addJob = async (job: TuitionJob) => {
  const payload = {
    ...job,
    id: String(job.id),
    status: job.status || 'Open',
    createdAt: job.createdAt || new Date().toISOString(),
  };

  await TuitionRepository.create(payload);
  return payload;
};

export const getJobById = async (id: string): Promise<TuitionJob | undefined> => {
  const jobs = await loadJobs();
  return jobs.find((job) => job.id === id);
};

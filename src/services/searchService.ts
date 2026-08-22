// Tutor & Job search is now handled by the backend via:
//   GET /api/v1/tutors?district=Dhaka&subject=English&page=1&limit=20
//   GET /api/v1/tuition-jobs?district=Dhaka&medium=Bangla
// Use RTK Query hooks: useGetTutorsQuery() and useGetTuitionJobsQuery() from their respective api files.

export const searchTutors = async (_filters: Record<string, unknown>) => {
  console.warn('[DEPRECATED] searchTutors() — use useGetTutorsQuery() from tutorApi.ts instead.');
  return [];
};

export const searchJobs = async (_filters: Record<string, unknown>) => {
  console.warn('[DEPRECATED] searchJobs() — use useGetTuitionJobsQuery() from tuitionApi.ts instead.');
  return [];
};

export const highlightText = (text: string, _query: string): Array<{ text: string; highlight: boolean; isMatch: boolean }> => {
  return [{ text, highlight: false, isMatch: false }];
};

export const paginate = <T>(items: T[] = [], page: number = 1, limit: number = 10): { items: T[]; totalPages: number; totalItems: number } => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const start = (page - 1) * limit;
  const paginatedItems = items.slice(start, start + limit);
  return { items: paginatedItems, totalPages, totalItems };
};

export const SearchService = {
  searchTutors,
  searchJobs,
  highlightText,
  paginate,
};

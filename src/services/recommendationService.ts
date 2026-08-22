import type { TuitionJob, TutorProfile } from '@/src/types';
import { getCachedValue, getOrSetCachedValueSync, invalidateCache } from '@/src/services/cacheService';

export interface RecommendationScore<T> {
  item: T;
  score: number;
  reasons: string[];
}

const WEIGHTS = {
  subjectMatch: 28,
  curriculumMatch: 12,
  classMatch: 10,
  districtMatch: 10,
  areaMatch: 10,
  teachingMode: 8,
  genderPreference: 8,
  experience: 6,
  expectedSalary: 4,
  availability: 4,
  verifiedTutor: 5,
  premiumTutor: 3,
} as const;

function normalize(value?: string | null) {
  return String(value || '').trim().toLowerCase();
}

function parseExperienceYears(value?: string | null) {
  const raw = normalize(value);
  const match = raw.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function sharedTokens(left?: string[], right?: string[]) {
  const leftSet = (left || []).map(normalize).filter(Boolean);
  const rightSet = (right || []).map(normalize).filter(Boolean);
  return leftSet.filter((token) => rightSet.includes(token));
}

function scoreTutorToJob(tutor: TutorProfile, job: TuitionJob): RecommendationScore<TuitionJob> {
  const reasons: string[] = [];
  let score = 0;

  const sharedSubjects = sharedTokens(tutor.subjects, job.subjects);
  if (sharedSubjects.length > 0) {
    score += WEIGHTS.subjectMatch;
    reasons.push(`Shared subjects: ${sharedSubjects.join(', ')}`);
  }

  const curriculumMatch = [tutor.qualification, tutor.department, tutor.university]
    .some((value) => normalize(value).includes(normalize(job.medium)) || normalize(job.medium).includes(normalize(value)));
  if (curriculumMatch) {
    score += WEIGHTS.curriculumMatch;
    reasons.push('Curriculum/medium fit');
  }

  const classMatch = tutor.preferredClass ? normalize(tutor.preferredClass).includes(normalize(job.studentClass)) || normalize(job.studentClass).includes(normalize(tutor.preferredClass)) : false;
  if (classMatch) {
    score += WEIGHTS.classMatch;
    reasons.push('Class level fit');
  }

  const districtMatch = normalize(tutor.location).includes(normalize(job.location)) || normalize(job.location).includes(normalize(tutor.location));
  if (districtMatch) {
    score += WEIGHTS.districtMatch;
    reasons.push('District/location fit');
  }

  const areaMatch = (tutor.preferredAreas || []).some((area) => normalize(area).includes(normalize(job.area)) || normalize(job.area).includes(normalize(area)));
  if (areaMatch) {
    score += WEIGHTS.areaMatch;
    reasons.push('Area coverage fit');
  }

  const teachingModeMatch = normalize(tutor.mediums?.join(' ')).includes(normalize(job.medium)) || normalize(job.medium).includes(normalize(tutor.mediums?.join(' ') || ''));
  if (teachingModeMatch) {
    score += WEIGHTS.teachingMode;
    reasons.push('Teaching mode fit');
  }

  const genderPreferenceMatch = !job.genderPreference || job.genderPreference === 'Any' || job.genderPreference === tutor.gender;
  if (genderPreferenceMatch) {
    score += WEIGHTS.genderPreference;
    reasons.push('Gender preference fit');
  }

  const experienceYears = parseExperienceYears(tutor.experience);
  if (experienceYears >= 4) {
    score += WEIGHTS.experience;
    reasons.push('Strong experience');
  }

  if (tutor.salary && job.salary) {
    const salaryGap = Math.abs(Number(tutor.salary) - Number(job.salary));
    if (salaryGap <= 1500) {
      score += WEIGHTS.expectedSalary;
      reasons.push('Salary expectation aligned');
    }
  }

  if (tutor.daysPerWeek || tutor.timingShift) {
    score += WEIGHTS.availability;
    reasons.push('Availability details present');
  }

  if (tutor.verified) {
    score += WEIGHTS.verifiedTutor;
    reasons.push('Verified tutor');
  }

  if (tutor.isPremium) {
    score += WEIGHTS.premiumTutor;
    reasons.push('Premium profile');
  }

  return {
    item: job,
    score: clampScore(score),
    reasons,
  };
}

function scoreJobToTutor(job: TuitionJob, tutor: TutorProfile): RecommendationScore<TutorProfile> {
  const reasons: string[] = [];
  let score = 0;

  const sharedSubjects = sharedTokens(job.subjects, tutor.subjects);
  if (sharedSubjects.length > 0) {
    score += WEIGHTS.subjectMatch;
    reasons.push(`Shared subjects: ${sharedSubjects.join(', ')}`);
  }

  const curriculumMatch = normalize(tutor.qualification).includes(normalize(job.medium)) || normalize(job.medium).includes(normalize(tutor.qualification));
  if (curriculumMatch) {
    score += WEIGHTS.curriculumMatch;
    reasons.push('Curriculum/medium fit');
  }

  const classMatch = tutor.preferredClass ? normalize(tutor.preferredClass).includes(normalize(job.studentClass)) || normalize(job.studentClass).includes(normalize(tutor.preferredClass)) : false;
  if (classMatch) {
    score += WEIGHTS.classMatch;
    reasons.push('Class level fit');
  }

  const districtMatch = normalize(tutor.location).includes(normalize(job.location)) || normalize(job.location).includes(normalize(tutor.location));
  if (districtMatch) {
    score += WEIGHTS.districtMatch;
    reasons.push('District/location fit');
  }

  const areaMatch = (tutor.preferredAreas || []).some((area) => normalize(area).includes(normalize(job.area)) || normalize(job.area).includes(normalize(area)));
  if (areaMatch) {
    score += WEIGHTS.areaMatch;
    reasons.push('Area coverage fit');
  }

  const teachingModeMatch = normalize(tutor.mediums?.join(' ')).includes(normalize(job.medium)) || normalize(job.medium).includes(normalize(tutor.mediums?.join(' ') || ''));
  if (teachingModeMatch) {
    score += WEIGHTS.teachingMode;
    reasons.push('Teaching mode fit');
  }

  const genderPreferenceMatch = !job.genderPreference || job.genderPreference === 'Any' || job.genderPreference === tutor.gender;
  if (genderPreferenceMatch) {
    score += WEIGHTS.genderPreference;
    reasons.push('Gender preference fit');
  }

  const experienceYears = parseExperienceYears(tutor.experience);
  if (experienceYears >= 4) {
    score += WEIGHTS.experience;
    reasons.push('Strong experience');
  }

  if (tutor.salary && job.salary) {
    const salaryGap = Math.abs(Number(tutor.salary) - Number(job.salary));
    if (salaryGap <= 1500) {
      score += WEIGHTS.expectedSalary;
      reasons.push('Salary expectation aligned');
    }
  }

  if (tutor.daysPerWeek || tutor.timingShift) {
    score += WEIGHTS.availability;
    reasons.push('Availability details present');
  }

  if (tutor.verified) {
    score += WEIGHTS.verifiedTutor;
    reasons.push('Verified tutor');
  }

  if (tutor.isPremium) {
    score += WEIGHTS.premiumTutor;
    reasons.push('Premium profile');
  }

  return {
    item: tutor,
    score: clampScore(score),
    reasons,
  };
}

function scoreSimilarity(left: TutorProfile, right: TutorProfile): RecommendationScore<TutorProfile> {
  const reasons: string[] = [];
  let score = 0;

  const sharedSubjects = sharedTokens(left.subjects, right.subjects);
  if (sharedSubjects.length > 0) {
    score += 24;
    reasons.push(`Shared subjects: ${sharedSubjects.join(', ')}`);
  }

  if (normalize(left.location) === normalize(right.location)) {
    score += 18;
    reasons.push('Same location');
  }

  if (normalize(left.university) === normalize(right.university)) {
    score += 16;
    reasons.push('Same university');
  }

  if (normalize(left.department) === normalize(right.department)) {
    score += 12;
    reasons.push('Same department');
  }

  if ((left.preferredAreas || []).some((area) => (right.preferredAreas || []).includes(area))) {
    score += 10;
    reasons.push('Shared area coverage');
  }

  if (normalize(left.qualification) === normalize(right.qualification)) {
    score += 8;
    reasons.push('Same qualification');
  }

  if (left.verified && right.verified) {
    score += 6;
    reasons.push('Both verified');
  }

  if (Math.abs(Number(left.salary || 0) - Number(right.salary || 0)) <= 1000) {
    score += 6;
    reasons.push('Similar salary expectation');
  }

  return {
    item: right,
    score: clampScore(score),
    reasons,
  };
}

function scoreJobSimilarity(left: TuitionJob, right: TuitionJob): RecommendationScore<TuitionJob> {
  const reasons: string[] = [];
  let score = 0;

  const sharedSubjects = sharedTokens(left.subjects, right.subjects);
  if (sharedSubjects.length > 0) {
    score += 24;
    reasons.push(`Shared subjects: ${sharedSubjects.join(', ')}`);
  }

  if (normalize(left.location) === normalize(right.location)) {
    score += 18;
    reasons.push('Same location');
  }

  if (normalize(left.area) === normalize(right.area)) {
    score += 14;
    reasons.push('Same area');
  }

  if (normalize(left.studentClass) === normalize(right.studentClass)) {
    score += 12;
    reasons.push('Same class level');
  }

  if (normalize(left.medium) === normalize(right.medium)) {
    score += 10;
    reasons.push('Same medium');
  }

  if (normalize(left.category) === normalize(right.category)) {
    score += 8;
    reasons.push('Same category');
  }

  if (normalize(left.tuitionType) === normalize(right.tuitionType)) {
    score += 6;
    reasons.push('Same tuition type');
  }

  if (Math.abs(Number(left.salary || 0) - Number(right.salary || 0)) <= 1000) {
    score += 8;
    reasons.push('Similar salary range');
  }

  return {
    item: right,
    score: clampScore(score),
    reasons,
  };
}

export const RecommendationService = {
  getTutorJobRecommendations(tutor: TutorProfile, jobs: TuitionJob[]) {
    const cacheKey = `tutor-job-recommendations:${tutor.id}:${jobs.map((job) => job.id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return jobs
        .filter((job) => job.id !== tutor.id)
        .map((job) => scoreTutorToJob(tutor, job))
        .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
    }, 60_000);
  },

  getJobTutorRecommendations(job: TuitionJob, tutors: TutorProfile[]) {
    const cacheKey = `job-tutor-recommendations:${job.id}:${tutors.map((tutor) => tutor.id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return tutors
        .filter((tutor) => tutor.id !== job.id)
        .map((tutor) => scoreJobToTutor(job, tutor))
        .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
    }, 60_000);
  },

  getSimilarTutors(tutor: TutorProfile, tutors: TutorProfile[]) {
    const cacheKey = `similar-tutors:${tutor.id}:${tutors.map((entry) => entry.id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return tutors
        .filter((entry) => entry.id !== tutor.id)
        .map((entry) => scoreSimilarity(tutor, entry))
        .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
    }, 60_000);
  },

  getSimilarJobs(job: TuitionJob, jobs: TuitionJob[]) {
    const cacheKey = `similar-jobs:${job.id}:${jobs.map((entry) => entry.id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return jobs
        .filter((entry) => entry.id !== job.id)
        .map((entry) => scoreJobSimilarity(job, entry))
        .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id));
    }, 60_000);
  },

  invalidateRecommendationCache() {
    invalidateCache();
  },
};

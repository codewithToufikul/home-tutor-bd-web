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

function normalize(value?: any) {
  if (!value) return '';
  if (typeof value === 'object') {
    return `${value.district || ''} ${value.area || ''}`.trim().toLowerCase();
  }
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

function extractDistrict(loc: any): string {
  if (!loc) return '';
  if (typeof loc === 'object') return normalize(loc.district || '');
  return normalize(loc);
}

function extractArea(loc: any): string {
  if (!loc) return '';
  if (typeof loc === 'object') return normalize(loc.area || '');
  return normalize(loc);
}

function parseSalaryRange(val: any): { min: number; max: number } | null {
  if (!val) return null;
  if (typeof val === 'number') return { min: val, max: val };
  const str = String(val).trim();
  if (!str || str === 'Select One') return null;

  if (str.includes('-')) {
    const [minStr, maxStr] = str.split('-');
    const min = parseInt(minStr, 10) || 0;
    const max = parseInt(maxStr, 10) || min;
    return { min, max };
  }
  if (str.includes('+')) {
    const min = parseInt(str.replace('+', ''), 10) || 0;
    return { min, max: Infinity };
  }
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0) return { min: num, max: num };
  return null;
}

function scoreTutorToJob(tutor: any, job: any): RecommendationScore<TuitionJob> {
  const reasons: string[] = [];
  let score = 0;

  // ─────────────────────────────────────────────────────────────
  // 1ST PRIORITY: LOCATION (DISTRICT & AREA)
  // ─────────────────────────────────────────────────────────────
  const tutorDistrict = extractDistrict(tutor.location) || normalize(tutor.tuitionDistrict || tutor.currentCity || '');
  const jobDistrict = extractDistrict(job.location);

  const tutorAreas: string[] = [
    ...(tutor.preferredAreas || []),
    tutor.preferredArea,
    extractArea(tutor.location),
    tutor.currentArea,
  ].map(normalize).filter(Boolean);
  const jobArea = extractArea(job.location) || normalize(job.area || '');

  const isOnlineJob = normalize(job.tuitionType || job.medium || '').includes('online');

  // If tutor specified a district, but job is in a different district (and not online), disqualify it!
  if (tutorDistrict && jobDistrict && !isOnlineJob) {
    const isDistrictMatched = tutorDistrict.includes(jobDistrict) || jobDistrict.includes(tutorDistrict);
    if (!isDistrictMatched) {
      return {
        item: job as TuitionJob,
        score: 0,
        reasons: ['Different district location'],
      };
    }
  }

  // Check Area match (Highest location precision)
  let areaMatched = false;
  if (jobArea && tutorAreas.length > 0) {
    areaMatched = tutorAreas.some(a => a && (a.includes(jobArea) || jobArea.includes(a)));
    if (areaMatched) {
      score += 40; // 🌟 Top Area match bonus
      reasons.push(`Exact Area match (${jobArea})`);
    }
  }

  // Check District match
  if (tutorDistrict && jobDistrict && (tutorDistrict.includes(jobDistrict) || jobDistrict.includes(tutorDistrict))) {
    score += 20; // 🌟 District match bonus
    if (!areaMatched) {
      reasons.push(`District match (${jobDistrict})`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2ND PRIORITY: SUBJECT & CLASS LEVEL
  // ─────────────────────────────────────────────────────────────
  const tutorSubjects: string[] = (tutor.subjects || tutor.preferredSubjects || []).map(normalize).filter(Boolean);
  const jobSubjects: string[] = (job.subjects || []).map(normalize).filter(Boolean);
  const sharedSubjects = tutorSubjects.filter(s => jobSubjects.some(j => j.includes(s) || s.includes(j)));
  if (sharedSubjects.length > 0) {
    score += 25; // 🌟 Strong subject match weight
    reasons.push(`Subjects: ${sharedSubjects.join(', ')}`);
  }

  const jobClass = normalize(job.studentClass || '');
  const tutorClasses: string[] = tutor.preferredClasses?.length
    ? tutor.preferredClasses.map(normalize)
    : tutor.preferredClass ? [normalize(tutor.preferredClass)] : [];
  const classMatch = jobClass && tutorClasses.some(c => c.includes(jobClass) || jobClass.includes(c));
  if (classMatch) {
    score += 15; // 🌟 Class level match
    reasons.push(`Class match (${job.studentClass})`);
  }

  const jobMedium = normalize(job.medium || '');
  const tutorMediums = (tutor.mediums || []).map(normalize);
  const curriculumMatch = [tutor.qualification, tutor.department, tutor.university, ...tutorMediums]
    .some(v => {
      const n = normalize(v);
      return n && (n.includes(jobMedium) || jobMedium.includes(n));
    });
  if (curriculumMatch) {
    score += 10;
    reasons.push('Medium/Curriculum match');
  }

  // ─────────────────────────────────────────────────────────────
  // 3RD PRIORITY: SALARY ALIGNMENT
  // ─────────────────────────────────────────────────────────────
  const tutorSalaryRange = parseSalaryRange(tutor.expectedSalary || tutor.salary);
  const jobSalary = Number(job.salary || 0);

  if (tutorSalaryRange && jobSalary > 0) {
    if (jobSalary >= tutorSalaryRange.min && jobSalary <= tutorSalaryRange.max) {
      // 🌟 Exact match in tutor's preferred budget range (e.g. 5000 or 3000 in 3000-5000)
      score += 30;
      reasons.push(`Salary in range (${jobSalary} ৳)`);
    } else if (jobSalary > tutorSalaryRange.max) {
      // 🌟 Job pays higher than expected maximum!
      score += 25;
      reasons.push(`Higher salary offer (${jobSalary} ৳)`);
    } else {
      // ⚠️ Salary is below tutor's minimum expected range (e.g. 500 Tk when min is 3000 Tk)
      const ratio = jobSalary / tutorSalaryRange.min;
      if (ratio < 0.6) {
        // Severely under budget (e.g., 500 Tk vs 3000 Tk min): large penalty
        score -= 25;
        reasons.push(`Salary far below expected min (${jobSalary} ৳)`);
      } else {
        // Slightly below
        score -= 5;
      }
    }
  } else if (jobSalary > 0) {
    score += Math.min(10, Math.floor(jobSalary / 1000));
  }

  const genderPref = job.genderPreference;
  const genderMatch = !genderPref || genderPref === 'Any' || normalize(genderPref) === normalize(tutor.gender || '');
  if (genderMatch) {
    score += 5;
  }

  if (tutor.daysPerWeek || tutor.timingShift) {
    score += 5;
  }

  return {
    item: job as TuitionJob,
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
    const tutorId = tutor?.id || (tutor as any)?._id || (tutor as any)?.userId || 'tutor';
    const cacheKey = `tutor-job-rec:${tutorId}:${jobs.map((j) => j?.id || (j as any)?._id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return (jobs || [])
        .filter((job) => {
          const jId = job?.id || (job as any)?._id;
          return jId && jId !== tutorId;
        })
        .map((job) => scoreTutorToJob(tutor, job))
        .sort((a, b) => {
          const idA = String(a.item?.id || (a.item as any)?._id || '');
          const idB = String(b.item?.id || (b.item as any)?._id || '');
          return b.score - a.score || ((b.item?.salary || 0) - (a.item?.salary || 0)) || idA.localeCompare(idB);
        });
    }, 60_000);
  },

  getJobTutorRecommendations(job: TuitionJob, tutors: TutorProfile[]) {
    const jobId = job?.id || (job as any)?._id || 'job';
    const cacheKey = `job-tutor-rec:${jobId}:${tutors.map((t) => t?.id || (t as any)?._id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return (tutors || [])
        .filter((tutor) => {
          const tId = tutor?.id || (tutor as any)?._id;
          return tId && tId !== jobId;
        })
        .map((tutor) => scoreJobToTutor(job, tutor))
        .sort((a, b) => {
          const idA = String(a.item?.id || (a.item as any)?._id || '');
          const idB = String(b.item?.id || (b.item as any)?._id || '');
          return b.score - a.score || idA.localeCompare(idB);
        });
    }, 60_000);
  },

  getSimilarTutors(tutor: TutorProfile, tutors: TutorProfile[]) {
    const tutorId = tutor?.id || (tutor as any)?._id || 'tutor';
    const cacheKey = `sim-tutors:${tutorId}:${tutors.map((t) => t?.id || (t as any)?._id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return (tutors || [])
        .filter((entry) => {
          const eId = entry?.id || (entry as any)?._id;
          return eId && eId !== tutorId;
        })
        .map((entry) => scoreSimilarity(tutor, entry))
        .sort((a, b) => {
          const idA = String(a.item?.id || (a.item as any)?._id || '');
          const idB = String(b.item?.id || (b.item as any)?._id || '');
          return b.score - a.score || idA.localeCompare(idB);
        });
    }, 60_000);
  },

  getSimilarJobs(job: TuitionJob, jobs: TuitionJob[]) {
    const jobId = job?.id || (job as any)?._id || 'job';
    const cacheKey = `sim-jobs:${jobId}:${jobs.map((j) => j?.id || (j as any)?._id).join(',')}`;
    return getOrSetCachedValueSync(cacheKey, () => {
      return (jobs || [])
        .filter((entry) => {
          const eId = entry?.id || (entry as any)?._id;
          return eId && eId !== jobId;
        })
        .map((entry) => scoreJobSimilarity(job, entry))
        .sort((a, b) => {
          const idA = String(a.item?.id || (a.item as any)?._id || '');
          const idB = String(b.item?.id || (b.item as any)?._id || '');
          return b.score - a.score || idA.localeCompare(idB);
        });
    }, 60_000);
  },

  invalidateRecommendationCache() {
    invalidateCache();
  },
};

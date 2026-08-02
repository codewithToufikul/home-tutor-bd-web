import { TuitionJob } from '../types';

const MOCK_JOBS: TuitionJob[] = [
  {
    id: '48893',
    parentId: 'p1',
    studentClass: 'Class 7',
    subjects: ['ENGLISH', 'GENERAL MATHS'],
    location: 'Sylhet',
    area: 'Daria Para',
    salary: 4000,
    medium: 'Bangla Medium',
    genderPreference: 'Male',
    status: 'Open',
    createdAt: '2026-04-08T10:00:00Z',
    tutoringDays: '3 Days/Week',
    tuitionType: 'Home + Group Tutoring',
    studentGender: 'Male',
    numStudents: 1,
    duration: '1.5 Hours',
    startTime: 'Afternoon',
    schoolName: 'Sylhet Government High School',
    category: 'Bangla Medium',
    requirements: [
      'Tutor must be from a reputable university',
      'Experience in teaching Class 7 students is preferred',
      'Must be punctual and regular',
      'Good communication skills in English'
    ],
    description: 'Looking for a dedicated tutor for my son who is in Class 7. He needs help primarily with English and Mathematics. The tutor should be able to explain complex concepts in a simple way and help with homework and exam preparation.'
  },
  {
    id: '48891',
    parentId: 'p2',
    studentClass: 'Class 9',
    subjects: ['PHYSICS', 'CHEMISTRY'],
    location: 'Chattogram',
    area: 'Halishashar, Block B',
    salary: 6000,
    medium: 'Bangla Medium',
    genderPreference: 'Male',
    status: 'Open',
    createdAt: '2026-04-08T09:30:00Z',
    tutoringDays: '4 Days/Week',
    tuitionType: 'Home Tuition',
    studentGender: 'Male',
    numStudents: 1,
    duration: '2 Hours',
    startTime: 'Evening',
    schoolName: 'Chattogram Collegiate School',
    category: 'Bangla Medium',
    requirements: ['Science background preferred'],
    description: 'Need a tutor for Physics and Chemistry for Class 9.'
  },
  {
    id: '48889',
    parentId: 'p3',
    studentClass: 'Standard 5',
    subjects: ['ALL SUBJECTS'],
    location: 'Dhaka',
    area: 'Gulshan 2',
    salary: 8000,
    medium: 'English Medium',
    genderPreference: 'Female',
    status: 'Open',
    createdAt: '2026-04-08T08:00:00Z',
    tutoringDays: '5 Days/Week',
    tuitionType: 'Online Tuition',
    studentGender: 'Female',
    numStudents: 1,
    duration: '1 Hour',
    startTime: 'Morning',
    schoolName: 'International School Dhaka',
    category: 'English Medium',
    requirements: ['English medium background mandatory'],
    description: 'Looking for an online tutor for Standard 5 student.'
  },
  {
    id: '48885',
    parentId: 'p4',
    studentClass: 'HSC 2nd Year',
    subjects: ['ICT', 'MATHEMATICS'],
    location: 'Dhaka',
    area: 'Uttara Sector 4',
    salary: 7000,
    medium: 'English Version',
    genderPreference: 'Any',
    status: 'Matched',
    createdAt: '2026-04-07T12:00:00Z',
    tutoringDays: '3 Days/Week',
    tuitionType: 'Home Tuition',
    studentGender: 'Male',
    numStudents: 1,
    duration: '2 Hours',
    startTime: 'Afternoon',
    schoolName: 'Rajuk Uttara Model College',
    category: 'English Version',
    requirements: ['Expert in ICT and Higher Math'],
    description: 'HSC 2nd year student needs help with ICT and Math.'
  }
];

// Generate more mock jobs to demonstrate pagination
const EXTENDED_MOCK_JOBS = [
  ...MOCK_JOBS,
  ...Array.from({ length: 46 }).map((_, i) => {
    const job = MOCK_JOBS[i % MOCK_JOBS.length];
    const category = [
      'Bangla Medium', 'English Medium', 'Admission Help', 
      'Arts & Crafts', 'Special Skills Mastery', 'Professional Skills Mastery'
    ][i % 6];
    
    return {
      ...job,
      id: (48800 - i).toString(),
      category: category
    };
  })
];

export const getJobs = (): TuitionJob[] => {
  const stored = localStorage.getItem('tuition_jobs');
  if (stored) {
    return JSON.parse(stored);
  }
  // If no jobs in localStorage, initialize with extended mock jobs
  localStorage.setItem('tuition_jobs', JSON.stringify(EXTENDED_MOCK_JOBS));
  return EXTENDED_MOCK_JOBS;
};

export const addJob = (job: TuitionJob) => {
  const jobs = getJobs();
  const updated = [job, ...jobs];
  localStorage.setItem('tuition_jobs', JSON.stringify(updated));
};

export const getJobById = (id: string): TuitionJob | undefined => {
  const jobs = getJobs();
  return jobs.find(j => j.id === id);
};

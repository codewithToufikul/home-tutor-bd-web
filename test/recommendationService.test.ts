import test from 'node:test';
import assert from 'node:assert/strict';
import { RecommendationService } from '@/src/services/recommendationService';

test('recommends the most compatible tuition jobs for a tutor', () => {
  const tutor = {
    id: 't1',
    userId: 'u1',
    name: 'Sarah Rahman',
    university: 'DU',
    department: 'CSE',
    qualification: 'BSc',
    experience: '5 years',
    subjects: ['Math', 'Physics'],
    preferredAreas: ['Banani'],
    mediums: ['English Medium'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
    salary: 3000,
    rating: 4.8,
    reviewCount: 10,
    verified: true,
    isPremium: true,
    bio: '',
    gender: 'Female' as 'Male' | 'Female',
    location: 'Dhaka',
    preferredClass: 'Class 10',
    daysPerWeek: '5 days',
    timingShift: 'Evening',
  } as any;

  const jobs = [
    {
      id: 'job-1',
      parentId: 'p1',
      studentClass: 'Class 10',
      subjects: ['Math'],
      location: 'Dhaka',
      area: 'Banani',
      salary: 3500,
      medium: 'English Medium',
      genderPreference: 'Female' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-02T00:00:00.000Z',
      tuitionType: 'Home Tuition',
      category: 'Science',
    },
    {
      id: 'job-2',
      parentId: 'p2',
      studentClass: 'Class 8',
      subjects: ['English'],
      location: 'Chittagong',
      area: 'GEC',
      salary: 2000,
      medium: 'Bangla',
      genderPreference: 'Any' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-01T00:00:00.000Z',
      tuitionType: 'Online',
      category: 'Language',
    },
  ] as any[];

  const result = RecommendationService.getTutorJobRecommendations(tutor, jobs);

  assert.equal(result.length, 2);
  assert.ok(result[0].score >= result[1].score);
  assert.equal(result[0].item.id, 'job-1');
});

test('scores similar tutors using shared attributes', () => {
  const anchorTutor = {
    id: 'anchor',
    name: 'Nadia Islam',
    university: 'BUET',
    department: 'EEE',
    qualification: 'BSc',
    experience: '6 years',
    subjects: ['Math', 'Chemistry'],
    preferredAreas: ['Dhanmondi'],
    mediums: ['Bangla'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
    salary: 2500,
    rating: 4.7,
    reviewCount: 12,
    verified: true,
    isPremium: false,
    bio: '',
    gender: 'Female' as 'Male' | 'Female',
    location: 'Dhaka',
  } as any;

  const others = [
    {
      id: 'similar',
      name: 'Rafiq Mia',
      university: 'BUET',
      department: 'EEE',
      qualification: 'BSc',
      experience: '6 years',
      subjects: ['Math', 'Chemistry'],
      preferredAreas: ['Dhanmondi'],
      mediums: ['Bangla'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
      salary: 2600,
      rating: 4.7,
      reviewCount: 14,
      verified: true,
      isPremium: false,
      bio: '',
      gender: 'Female' as 'Male' | 'Female',
      location: 'Dhaka',
    },
    {
      id: 'different',
      name: 'Mina Akter',
      university: 'DU',
      department: 'English',
      qualification: 'MA',
      experience: '2 years',
      subjects: ['English', 'Bangla'],
      preferredAreas: ['Uttara'],
      mediums: ['English Medium'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
      salary: 1800,
      rating: 4.5,
      reviewCount: 5,
      verified: false,
      isPremium: false,
      bio: '',
      gender: 'Female' as 'Male' | 'Female',
      location: 'Dhaka',
    },
  ] as any[];

  const result = RecommendationService.getSimilarTutors(anchorTutor, others);

  assert.equal(result[0].item.id, 'similar');
  assert.ok(result[0].score > result[1].score);
});

test('caches repeated recommendation requests for the same inputs', () => {
  const tutor = {
    id: 't1',
    name: 'Sarah Rahman',
    university: 'DU',
    department: 'CSE',
    qualification: 'BSc',
    experience: '5 years',
    subjects: ['Math', 'Physics'],
    preferredAreas: ['Banani'],
    mediums: ['English Medium'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
    salary: 3000,
    rating: 4.8,
    reviewCount: 10,
    verified: true,
    isPremium: true,
    bio: '',
    gender: 'Female' as 'Male' | 'Female',
    location: 'Dhaka',
    preferredClass: 'Class 10',
    daysPerWeek: '5 days',
    timingShift: 'Evening',
  } as any;

  const jobs = [
    {
      id: 'job-1',
      studentClass: 'Class 10',
      subjects: ['Math'],
      location: 'Dhaka',
      area: 'Banani',
      salary: 3500,
      medium: 'English Medium',
      genderPreference: 'Female' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-02T00:00:00.000Z',
      tuitionType: 'Home Tuition',
      category: 'Science',
    },
  ] as any[];

  const first = RecommendationService.getTutorJobRecommendations(tutor, jobs);
  const second = RecommendationService.getTutorJobRecommendations(tutor, jobs);

  assert.equal(first, second);
});

test('scores similar tuition jobs using shared subject and location signals', () => {
  const anchorJob = {
    id: 'job-a',
    studentClass: 'Class 10',
    subjects: ['Math', 'Physics'],
    location: 'Dhaka',
    area: 'Banani',
    salary: 4000,
    medium: 'English Medium',
    genderPreference: 'Any' as 'Male' | 'Female' | 'Any',
    status: 'Open' as 'Open' | 'Matched' | 'Closed',
    createdAt: '2024-01-02T00:00:00.000Z',
    category: 'Science',
    tuitionType: 'Home Tuition',
  } as any;

  const others = [
    {
      id: 'job-b',
      studentClass: 'Class 10',
      subjects: ['Math', 'Physics'],
      location: 'Dhaka',
      area: 'Banani',
      salary: 3800,
      medium: 'English Medium',
      genderPreference: 'Any' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-03T00:00:00.000Z',
      category: 'Science',
      tuitionType: 'Home Tuition',
    },
    {
      id: 'job-c',
      studentClass: 'Class 8',
      subjects: ['English'],
      location: 'Sylhet',
      area: 'Amberkhana',
      salary: 2500,
      medium: 'Bangla',
      genderPreference: 'Female' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-04T00:00:00.000Z',
      category: 'Language',
      tuitionType: 'Online',
    },
  ] as any[];

  const result = RecommendationService.getSimilarJobs(anchorJob, others);

  assert.equal(result[0].item.id, 'job-b');
  assert.ok(result[0].score > result[1].score);
});

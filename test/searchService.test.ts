import test from 'node:test';
import assert from 'node:assert/strict';
import { SearchService } from '@/src/services/searchService';

test('searchTutors matches by subject and ranks premium tutors higher', () => {
  const tutors = [
    {
      id: '1',
      userId: 'u1',
      name: 'Sarah Rahman',
      university: 'DU',
      department: 'CSE',
      qualification: 'BSc',
      experience: '3 years',
      subjects: ['Math', 'Physics'],
      preferredAreas: ['Dhanmondi'],
      mediums: ['English Medium'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
      salary: 2000,
      rating: 4.8,
      reviewCount: 10,
      verified: true,
      isPremium: false,
      bio: '',
      gender: 'Female' as 'Male' | 'Female',
      location: 'Dhaka',
    },
    {
      id: '2',
      userId: 'u2',
      name: 'Aminul Islam',
      university: 'BUET',
      department: 'EEE',
      qualification: 'MSc',
      experience: '8 years',
      subjects: ['English', 'Math'],
      preferredAreas: ['Banani'],
      mediums: ['Bangla'] as Array<'Bangla' | 'English Version' | 'English Medium' | 'Madrasah'>,
      salary: 4000,
      rating: 4.9,
      reviewCount: 30,
      verified: true,
      isPremium: true,
      bio: '',
      gender: 'Male' as 'Male' | 'Female',
      location: 'Dhaka',
    },
  ] as any[];

  const result = SearchService.searchTutors(tutors, {
    query: 'math',
    gender: 'All',
    district: 'All',
    area: 'All',
    medium: '',
    tutorType: 'All',
  });

  assert.equal(result.length, 2);
  assert.equal(result[0].id, '2');
});

test('searchJobs filters by category and location', () => {
  const jobs = [
    {
      id: 'job-1',
      parentId: 'p1',
      studentClass: 'Class 8',
      subjects: ['Math'],
      location: 'Dhaka',
      area: 'Banani',
      salary: 3000,
      medium: 'English Medium',
      genderPreference: 'Any' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-02T00:00:00.000Z',
      category: 'Science',
    },
    {
      id: 'job-2',
      parentId: 'p2',
      studentClass: 'Class 10',
      subjects: ['English'],
      location: 'Sylhet',
      area: 'Amberkhana',
      salary: 2500,
      medium: 'Bangla',
      genderPreference: 'Female' as 'Male' | 'Female' | 'Any',
      status: 'Open' as 'Open' | 'Matched' | 'Closed',
      createdAt: '2024-01-01T00:00:00.000Z',
      category: 'Language',
    },
  ] as any[];

  const result = SearchService.searchJobs(jobs, {
    query: '',
    tuitionType: 'All',
    gender: 'Any',
    district: 'Dhaka',
    area: 'All',
    category: 'Science',
    studentClass: 'All',
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'job-1');
});

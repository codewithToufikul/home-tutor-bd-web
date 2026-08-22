export interface User {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'tutor' | 'admin';
  photoUrl?: string;
}

export interface TutorProfile {
  id: string;
  userId: string;
  name: string;
  university: string;
  department: string;
  qualification: string;
  experience: string;
  subjects: string[];
  preferredAreas: string[];
  mediums: ('Bangla' | 'English Version' | 'English Medium' | 'Madrasah')[];
  salary: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  isPremium?: boolean;
  bio: string;
  photoUrl?: string;
  gender: 'Male' | 'Female';
  idNumber?: string;
  memberSince?: string;
  totalViews?: number;
  location?: string;
  preferredClass?: string;
  daysPerWeek?: string;
  timingShift?: string;
}

export interface TuitionJob {
  id: string;
  parentId: string;
  studentClass: string;
  subjects: string[];
  location: string;
  area: string;
  salary: number;
  medium: string;
  genderPreference?: 'Male' | 'Female' | 'Any';
  status: 'Open' | 'Matched' | 'Closed';
  createdAt: string;
  tutoringDays?: string;
  tuitionType?: string;
  studentGender?: string;
  numStudents?: number;
  duration?: string;
  startTime?: string;
  schoolName?: string;
  requirements?: string[];
  description?: string;
  category?: string;
}

export interface Review {
  id: string;
  tutorId: string;
  parentId: string;
  parentName: string;
  rating: number;
  comment: string;
  date: string;
}

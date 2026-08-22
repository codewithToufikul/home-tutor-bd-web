import { TuitionJob, TutorProfile } from '@/src/types';

/**
 * টিউটরের প্রোফাইলের সাথে মিলে এমন টিউশন জবগুলো অটো-ম্যাচ করে বের করার ফাংশন
 */
export function getMatchedJobsForTutor(tutor: TutorProfile, allJobs: TuitionJob[]): TuitionJob[] {
  return allJobs.filter(job => {
    // ১. লোকেশন বা এরিয়া ম্যাচিং
    const matchesArea = tutor.preferredAreas?.some(area => 
      job.area.toLowerCase().includes(area.toLowerCase()) || 
      job.location.toLowerCase().includes(area.toLowerCase())
    );

    // ২. মিডিয়াম ম্যাচিং (বাংলা মিডিয়াম, ইংলিশ ভার্সন ইত্যাদি)
    const matchesMedium = tutor.mediums?.includes(job.medium as any);

    // ৩. জেন্ডার প্রিফারেন্স ম্যাচিং
    const matchesGender = !job.genderPreference || job.genderPreference === 'All' || job.genderPreference === tutor.gender;

    return matchesArea && matchesMedium && matchesGender;
  });
}

/**
 * গার্ডিয়ানের চাহিদার সাথে মিলে এমন টিউটরদের অটো-ম্যাচ করে বের করার ফাংশন
 */
export function getMatchedTutorsForJob(job: TuitionJob, allTutors: TutorProfile[]): TutorProfile[] {
  return allTutors.filter(tutor => {
    // ১. এরিয়া ম্যাচিং
    const matchesArea = tutor.preferredAreas?.some(area => 
      area.toLowerCase().includes(job.area.toLowerCase()) || 
      area.toLowerCase().includes(job.location.toLowerCase())
    );

    // ২. সাবজেক্ট বা কোয়ালিফিকেশন ম্যাচিং
    const matchesSubject = tutor.subjects?.some(sub => 
      job.subjects?.includes(sub.toUpperCase())
    );

    // ৩. জেন্ডার প্রিফারেন্স
    const matchesGender = job.genderPreference === 'All' || tutor.gender === job.genderPreference;

    return matchesArea && (matchesSubject || matchesGender);
  });
}
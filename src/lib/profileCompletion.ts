export interface MissingProfileItem {
  category: string;
  label: string;
  tab: 'educational' | 'tuition' | 'personal' | 'documents' | 'verification';
}

export interface ProfileCompletionResult {
  percentage: number;
  isComplete: boolean;
  missingItems: MissingProfileItem[];
}

/**
 * Calculates profile completion based on the backend Tutor model fields:
 *   university, department, qualification, experience,
 *   subjects[], mediums[], location.district, location.area,
 *   salary, gender, bio, nid / certificates
 *
 * Also reads frontend form fields (sscInstitute, preferredSubject, etc.)
 * if the backend fields aren't populated yet (draft state).
 */
export function calculateTutorProfileCompletion(profile: any): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      isComplete: false,
      missingItems: [
        { category: 'Personal', label: 'ব্যক্তিগত তথ্য পূরণ করুন', tab: 'personal' },
        { category: 'Educational', label: 'শিক্ষাগত তথ্য যুক্ত করুন', tab: 'educational' },
        { category: 'Tuition', label: 'টিউশন পছন্দ সিলেক্ট করুন', tab: 'tuition' },
      ],
    };
  }

  // Helper: value is considered filled if non-empty, non-default, non-zero
  const filled = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'number') return val > 0;
    if (typeof val === 'string') {
      const t = val.trim().toLowerCase();
      return t !== '' && t !== 'select one' && t !== 'select...' && t !== '0';
    }
    if (Array.isArray(val)) return val.length > 0 && val.some((v) => filled(v));
    return false;
  };

  let totalScore = 0;
  const missingItems: MissingProfileItem[] = [];

  // ── 1. Photo (10%) ──────────────────────────────────────────────────────────
  const hasPhoto =
    filled(profile.photoUrl) ||
    filled(profile.avatar) ||
    (profile.userId && filled((profile.userId as any)?.avatar));

  if (hasPhoto) {
    totalScore += 10;
  } else {
    missingItems.push({ category: 'Photo', label: 'প্রোফাইল ছবি আপলোড করুন', tab: 'personal' });
  }

  // ── 2. Personal Info (20%) ──────────────────────────────────────────────────
  // Name
  const hasName =
    filled(profile.fullName) ||
    filled(profile.name) ||
    filled((profile.userId as any)?.name);
  // Phone
  const hasPhone =
    filled(profile.phone) ||
    filled((profile.userId as any)?.phone);
  // Gender
  const hasGender = filled(profile.gender);
  // Location
  const hasLocation =
    filled(profile.currentCity) ||
    filled(profile.currentArea) ||
    filled(profile.location?.district) ||
    filled(profile.location?.area) ||
    filled(profile.tuitionDistrict);
  // Bio / Permanent Address
  const hasBio = filled(profile.bio) || filled(profile.permanentAddress);

  if (hasName) totalScore += 4;
  if (hasPhone) totalScore += 4;
  if (hasGender) totalScore += 4;
  if (hasLocation) totalScore += 4;
  if (hasBio) {
    totalScore += 4;
  }

  if (!hasName || !hasPhone || !hasGender || !hasLocation) {
    missingItems.push({ category: 'Personal', label: 'ব্যক্তিগত তথ্য (নাম, ফোন, লিঙ্গ, এলাকা) পূরণ করুন', tab: 'personal' });
  }
  if (!hasBio) {
    missingItems.push({ category: 'Personal', label: 'বায়ো / পার্মানেন্ট ঠিকানা যুক্ত করুন', tab: 'personal' });
  }

  // ── 3. Educational Info (30%) ──────────────────────────────────────────────
  // SSC (10%) – check both form fields and potential flattened backend fields
  const hasSsc =
    (filled(profile.sscInstitute) && filled(profile.sscResult)) ||
    (filled(profile.education?.ssc?.institute) && filled(profile.education?.ssc?.result));

  // HSC (10%)
  const hasHsc =
    (filled(profile.hscInstitute) && filled(profile.hscResult)) ||
    (filled(profile.education?.hsc?.institute) && filled(profile.education?.hsc?.result));

  // Graduation (10%) – backend uses university + department + qualification
  const hasGrad =
    (filled(profile.gradInstitute) || filled(profile.university)) &&
    (filled(profile.gradDept) || filled(profile.department) || filled(profile.qualification));

  if (hasSsc) {
    totalScore += 10;
  } else {
    missingItems.push({ category: 'Educational', label: 'এসএসসি (SSC) শিক্ষাগত তথ্য পূরণ করুন', tab: 'educational' });
  }

  if (hasHsc) {
    totalScore += 10;
  } else {
    missingItems.push({ category: 'Educational', label: 'এইচএসসি (HSC) শিক্ষাগত তথ্য পূরণ করুন', tab: 'educational' });
  }

  if (hasGrad) {
    totalScore += 10;
  } else {
    missingItems.push({ category: 'Educational', label: 'বিশ্ববিদ্যালয় / গ্রাজুয়েশন তথ্য পূরণ করুন', tab: 'educational' });
  }

  // ── 4. Tuition Preferences (40%) ───────────────────────────────────────────
  // Subjects (15%) – backend: subjects[], form: preferredSubjects / preferredSubject
  const hasSubjects =
    filled(profile.subjects) ||
    filled(profile.preferredSubjects) ||
    filled(profile.preferredSubject);

  // Medium (5%) – backend: mediums[], form: preferredMedium
  const hasMedium =
    filled(profile.mediums) ||
    filled(profile.preferredMedium);

  // Location / District (10%) – backend: location.district, form: tuitionDistrict
  const hasTuitionLoc =
    filled(profile.location?.district) ||
    filled(profile.tuitionDistrict) ||
    filled(profile.preferredArea) ||
    filled(profile.preferredAreas);

  // Salary & Experience (10%) – backend: salary, experience; form: expectedSalary, experienceYears
  const hasSalary = filled(profile.salary) || filled(profile.expectedSalary);
  const hasExperience = filled(profile.experience) || filled(profile.experienceYears);

  if (hasSubjects) {
    totalScore += 15;
  } else {
    missingItems.push({ category: 'Tuition', label: 'পছন্দের বিষয় (Subjects) যুক্ত করুন', tab: 'tuition' });
  }

  if (hasMedium) {
    totalScore += 5;
  } else {
    missingItems.push({ category: 'Tuition', label: 'পছন্দের মাধ্যম (Medium) সিলেক্ট করুন', tab: 'tuition' });
  }

  if (hasTuitionLoc) {
    totalScore += 10;
  } else {
    missingItems.push({ category: 'Tuition', label: 'টিউশন এলাকা ও জেলা সিলেক্ট করুন', tab: 'tuition' });
  }

  if (hasSalary) {
    totalScore += 5;
  } else {
    missingItems.push({ category: 'Tuition', label: 'প্রত্যাশিত বেতন যুক্ত করুন', tab: 'tuition' });
  }

  if (hasExperience) {
    totalScore += 5;
  } else {
    missingItems.push({ category: 'Tuition', label: 'টিউশন অভিজ্ঞতা যুক্ত করুন', tab: 'tuition' });
  }

  const percentage = Math.min(100, Math.max(0, Math.round(totalScore)));

  return {
    percentage,
    isComplete: percentage === 100,
    missingItems,
  };
}

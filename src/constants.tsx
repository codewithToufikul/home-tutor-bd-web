import { Globe, Palette, Heart, BookOpen, GraduationCap, Award, Trophy, Code, Briefcase, UserCheck, Microscope } from 'lucide-react';

// Male cartoon/anime tutor avatar seeds (DiceBear Notionists - clearly illustrated male educator look)
const MALE_AVATAR_SEEDS = [
  'Tutor-Rahim', 'Tutor-Kamal', 'Tutor-Sabbir', 'Tutor-Imran',
  'Tutor-Tanvir', 'Tutor-Raihan', 'Tutor-Nahid', 'Tutor-Arif'
];

// Female cartoon/anime tutor avatar seeds (DiceBear Notionists - clearly illustrated female educator look)
const FEMALE_AVATAR_SEEDS = [
  'Tutor-Fatima', 'Tutor-Nusrat', 'Tutor-Sadia', 'Tutor-Tania',
  'Tutor-Riya', 'Tutor-Aisha', 'Tutor-Mitu', 'Tutor-Poly'
];

export const DEFAULT_PROFILE_IMAGE = `https://api.dicebear.com/9.x/notionists/svg?seed=Tutor-Rahim&backgroundColor=b6e3f4`;

export function getAvatarUrl(seed?: string, photoUrl?: string, gender?: string): string {
  // Only use real photoUrl if it's clearly a user-uploaded image (not a dicebear/placeholder)
  if (
    photoUrl &&
    photoUrl.trim() &&
    !photoUrl.includes('dicebear.com') &&
    !photoUrl.includes('avataaars') &&
    !photoUrl.includes('unsplash.com') &&
    !photoUrl.includes('placeholder')
  ) {
    return photoUrl.trim();
  }

  const cleanSeed = (seed || 'Tutor').trim();
  let hash = 0;
  for (let i = 0; i < cleanSeed.length; i++) {
    hash = (hash << 5) - hash + cleanSeed.charCodeAt(i);
    hash |= 0;
  }

  const isFemale =
    gender === 'Female' ||
    cleanSeed.toLowerCase().includes('fatima') ||
    cleanSeed.toLowerCase().includes('aisha') ||
    cleanSeed.toLowerCase().includes('nusrat') ||
    cleanSeed.toLowerCase().includes('tania') ||
    cleanSeed.toLowerCase().includes('sadia') ||
    cleanSeed.toLowerCase().includes('poly') ||
    cleanSeed.toLowerCase().includes('riya') ||
    cleanSeed.toLowerCase().includes('mitu') ||
    cleanSeed.toLowerCase().includes('lima') ||
    cleanSeed.toLowerCase().includes('puja');

  const pool = isFemale ? FEMALE_AVATAR_SEEDS : MALE_AVATAR_SEEDS;
  const index = Math.abs(hash) % pool.length;
  const avatarSeed = pool[index];

  // Use DiceBear Notionists style — clean anime/cartoon illustrated educator avatars
  const bgColors = isFemale
    ? ['fde68a', 'fbcfe8', 'e9d5ff', 'bfdbfe', 'a7f3d0']
    : ['b6e3f4', 'c0aede', 'd1fae5', 'fef3c7', 'dbeafe'];
  const bg = bgColors[Math.abs(hash) % bgColors.length];

  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=${bg}`;
}

// 📍 ডিফল্ট বা ফলব্যাক এরিয়া
export const AREAS = [
  'Uttara', 'Gulshan', 'Banani', 'Mirpur', 'Dhanmondi'
];

// 🗺️ জেলা অনুযায়ী নির্দিষ্ট এলাকার ম্যাপিং (যে ডিস্ট্রিক্ট সিলেক্ট করবেন, শুধু সেই ডিস্ট্রিক্টের এরিয়াই দেখাবে)
export const DISTRICT_WISE_AREAS: { [key: string]: string[] } = {
  'Dhaka': [
    'Uttara', 'Gulshan', 'Banani', 'Baridhara', 'Mirpur', 'Pallabi', 'Mohakhali', 
    'Badda', 'Rampura', 'Khilgaon', 'Khilkhet', 'Turag', 'Airport', 'Bashundhara R/A',
    'Dhanmondi', 'Moghbazar', 'Shantinagar', 'Malibagh', 'Kakrail', 'Paltan', 
    'Motijheel', 'Tejgaon', 'Farmgate', 'Kawran Bazar', 'Mohammadpur', 'Basila', 
    'Adabor', 'Shyamoli', 'Kallyanpur', 'Gabtoli', 'Lalmatia', 'Eskaton', 'Panthapath',
    'Old Dhaka', 'Wari', 'Jatrabari', 'Gandaria', 'Bangsal', 'Kotwali', 'Sutrapur', 'Savar', 'Keraniganj'
  ],
  'Sylhet': [
    'Zindabazar', 'Ambarkhana', 'Shibganj', 'Mehedibag', 'Subhanighat', 'Kumarpara', 
    'Lamabazar', 'Pathantula', 'Uposahar', 'Taltola', 'Mirabazar', 'Tilagor'
  ],
  'Chattogram': [
    'GEC Circle', 'Agrabad', 'Nasirabad', 'Khulshi', 'Chawkbazar', 'Panchlaish', 
    'Halishahar', 'Lalkhan Bazar', 'Jamal Khan', 'Muradpur', 'Oxygen', 'EPZ'
  ],
  'Rajshahi': [
    'Shaheb Bazar', 'New Market', 'Talaimari', 'Bhadra', 'Kazla', 'Upashahar', 
    'Luxmipur', 'Rajpara', 'Boyalia'
  ],
  'Khulna': [
    'Sonadanga', 'Shibbari', 'Khalishpur', 'Daulatpur', 'Boyra', 'Rupsa', 
    'Taltola', 'Goalpara'
  ],
  'Barishal': [
    'Sadar Road', 'Nathullabad', 'Rupatali', 'Bateshwar', 'Kawnia', 'Sagardi', 'Amtala'
  ],
  'Rangpur': [
    'Shapla Chattar', 'Jahaj Company More', 'Station Road', 'Modern More', 'Dhap', 'GL Church Road'
  ],
  'Mymensingh': [
    'Town Hall', 'Ganginar Par', 'Charpara', 'Katchari Road', 'Choto Bazar', 'Masakanda'
  ],
  'Gazipur': [
    'Tongi', 'Joydebpur', 'Board Bazar', 'Chourasta', 'Sreepur', 'Kaliganj'
  ],
  'Narayanganj': [
    'Chashara', 'Adamjee', 'Siddhirganj', 'Bandar', 'Rupganj', 'Fatullah'
  ],
  'Comilla': [
    'Kandirpar', 'Toll Road', 'Jhaupara', 'Racecourse', 'Chawkbazar', 'Paduar Bazar'
  ],
  'Cox\'s Bazar': [
    'Kolatoli', 'Sugandha Point', 'Main Town', 'Bectar Rasta', 'Lal Dighi'
  ]
};

// 🏫 টিউশনের ধরণ বা ক্যাটাগরি (Home, Online, Coaching, Group)
export const TUITION_TYPES = [
  'Home Tuition',
  'Online Tuition',
  'Coaching Center',
  'Group Tuition'
];

// 📚 সকল শিক্ষাব্যবস্থার বিষয়সমূহ (বাংলা মিডিয়াম, ইংরেজি মিডিয়াম, ক্যামব্রিজ ও এডেক্সেল কারিকুলামসহ)
export const SUBJECTS = [
  // সাধারণ ও বাংলা মিডিয়াম বিষয়
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Bangla', 
  'ICT', 'Accounting', 'Finance', 'Economics', 'General Science', 'Social Science',
  'Higher Mathematics', 'Bangladesh and Global Studies', 'Religion Islam',

  // 🇬🇧 ইংলিশ মিডিয়াম - ক্যামব্রিজ ও এডেক্সেল কারিকুলাম (O Level / A Level / IGCSE)
  'Mathematics (Syllabuses D / Additional Math)',
  'English Language (1123 / AS & A Level)',
  'English Literature',
  'Physics (IGCSE / O Level / A Level)',
  'Chemistry (IGCSE / O Level / A Level)',
  'Biology (IGCSE / O Level / A Level)',
  'Accounting (7707 / A Level)',
  'Economics (2281 / A Level)',
  'Business Studies (7115 / A Level)',
  'Computer Science (2210 / AS & A Level)',
  'Combined Science',
  'Environmental Management',
  'Global Perspectives',
  'Sociology',
  'Psychology',

  // মাদরাসা বিষয়
  'Arabic', 'Al-Quran', 'Al-Hadith', 'Aqida wa Fiqh', 'Sarf wa Nahw',

  // ভর্তি প্রস্তুতি ও প্রফেশনাল
  'University Admission Preparation', 'Medical Admission Preparation', 'Cadet College Preparation',
  'Spoken English', 'Phonetics', 'Quran Learning', 'Computer Programming', 'Digital Marketing'
];

// 👨‍🎓 শিক্ষাস্তর বা ক্লাসসমূহ
export const CLASSES = [
  'Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
  'SSC Examinee', 'HSC 1st Year', 'HSC 2nd Year', 
  'O-Level (IGCSE)', 'A-Level (AS & A2)', 'Admission Seeker', 'University', 'Graduate'
];

// 🏫 শিক্ষাব্যবস্থার মাধ্যম
export const MEDIUMS = [
  'Bangla Medium', 'English Version', 'English Medium (Cambridge / Edexcel)', 'Madrasah', 'Vocational'
];

// 🗺️ বাংলাদেশের সকল প্রধান জেলাসমূহ
export const DISTRICTS = [
  'Dhaka', 'Sylhet', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh',
  'Gazipur', 'Narayanganj', 'Comilla', 'Cox\'s Bazar', 'Tangail', 'Narsingdi', 'Manikganj', 
  'Munshiganj', 'Faridpur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Rajbari', 'Shariatpur',
  'Noakhali', 'Feni', 'Brahmanbaria', 'Chandpur', 'Lakshmipur', 'Khagrachhari', 'Rangamati', 'Bandarban',
  'Moulvibazar', 'Habiganj', 'Sunamganj', 'Bogra', 'Pabna', 'Sirajganj', 'Natore', 'Naogaon', 
  'Chapainawabganj', 'Joypurhat', 'Jessore', 'Satkhira', 'Kushtia', 'Jhenaidah', 'Magura', 
  'Narail', 'Bagerhat', 'Chuadanga', 'Meherpur', 'Patuakhali', 'Bhola', 'Pirojpur', 'Barguna', 
  'Jhalokati', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 
  'Thakurgaon', 'Jamalpur', 'Netrokona', 'Sherpur'
];

// 🗂️ ক্যাটাগরি ডেটা
export const CATEGORIES_DATA = [
  {
    id: 'english-medium',
    title: 'English Medium (Cambridge & Edexcel)',
    icon: Globe,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    items: [
      'Pre-Schooling', 'Play', 'Nursery', 'KG', 'Standard 1', 'Standard 2', 'Standard 3', 'Standard 4', 'Standard 5', 'Standard 6', 'Standard 7', 'Standard 8', 'Standard 9', 'IGCSE', 'O Level', 'A Level ( AS )', 'A Level ( A2 )'
    ]
  },
  {
    id: 'arts-crafts',
    title: 'Arts & Crafts',
    icon: Palette,
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=800',
    items: [
      'Crafting', 'Dance', 'Instrumental Music', 'Music', 'Drawing & Painting', 'Handwriting', 'Guitar', 'Make Up Tutoring', 'Acting & Modeling'
    ]
  },
  {
    id: 'religious-studies',
    title: 'Religious & Moral Studies',
    icon: Heart,
    color: 'bg-emerald-500',
    image: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
    items: [
      'Islamic Studies', 'Hinduism Studies', 'Buddhism Studies', 'Christianity Studies'
    ]
  },
  {
    id: 'bangla-medium',
    title: 'Bangla Medium',
    icon: BookOpen,
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800',
    items: [
      'Pre-Schooling', 'Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year'
    ]
  },
  {
    id: 'admission-help',
    title: 'Admission Help',
    icon: GraduationCap,
    color: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    items: [
      'Public University Admission Test', 'Private University Admission Test', 'Medical College Admission Test', 'Engineering University Admission Test', 'School Admission Test', 'IBA Admission Test', 'Cadet Admission Help'
    ]
  },
  {
    id: 'int-exam',
    title: 'Int. Exam Preparation',
    icon: Award,
    color: 'bg-indigo-500',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    items: [
      'IELTS', 'TOEFL', 'GMAT', 'GRE', 'SAT', 'GED'
    ]
  },
  {
    id: 'english-version',
    title: 'English Version',
    icon: Globe,
    color: 'bg-cyan-500',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
    items: [
      'Pre-Schooling', 'Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year'
    ]
  },
  {
    id: 'special-skills',
    title: 'Special Skills Mastery',
    icon: Trophy,
    color: 'bg-orange-500',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
    items: [
      'Cooking', 'Photography', 'Yoga', 'Driving', 'Kung Fu', 'Karate', 'Fitness Training', 'Swimming', 'Debating & Public Speaking'
    ]
  },
  {
    id: 'language-proficiency',
    title: 'Language Proficiency',
    icon: Globe,
    color: 'bg-teal-500',
    image: 'https://images.unsplash.com/photo-1451226428352-cf66bf8a0317?auto=format&fit=crop&q=80&w=800',
    items: [
      'English', 'German', 'Bangla', 'Korean', 'Chinese', 'Spanish', 'French', 'Hindi', 'Arabic'
    ]
  },
  {
    id: 'madrasah-medium',
    title: 'Madrasah Medium',
    icon: BookOpen,
    color: 'bg-green-600',
    image: 'https://images.unsplash.com/photo-1584281723358-461f7555806e?auto=format&fit=crop&q=80&w=800',
    items: [
      'Pre-Schooling', 'Play', 'Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Alim 1st Year', 'Alim 2nd Year'
    ]
  },
  {
    id: 'professional-skills',
    title: 'Professional Skills Mastery',
    icon: Code,
    color: 'bg-slate-700',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    items: [
      'Computer Programming', 'Digital Marketing', 'Microsoft Office', 'Web Development', 'Web Design', 'Adobe Photoshop', 'SEO', 'Video Editing'
    ]
  },
  {
    id: 'sports',
    title: 'Sports',
    icon: Trophy,
    color: 'bg-yellow-600',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800',
    items: [
      'Cricket', 'Football', 'Hockey', 'Chess', 'Table Tennis', 'Volleyball'
    ]
  },
  {
    id: 'job-prep',
    title: 'Job Preparation',
    icon: Briefcase,
    color: 'bg-zinc-800',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800',
    items: [
      'BCS', 'Bank', 'Primary Teacher', 'Sub: Inspector', 'Judiciary', 'Office Assistant'
    ]
  },
  {
    id: 'graduate-program',
    title: 'Graduate Program',
    icon: GraduationCap,
    color: 'bg-violet-600',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756edd811?auto=format&fit=crop&q=80&w=800',
    items: [
      'BA', 'BBA', 'BSC', 'Degree', 'Diploma Engineering', 'Engineering', 'Medical - MBBS', 'Medical - BDS', 'Law', 'Honours'
    ]
  }
];

export const tutoringTimeOptions = [
  "Any Time",
  "Any Time  Evening",
  "Morning (6:00 AM - 10:00 AM)",
  "Late Morning (10:00 AM - 12:00 PM)",
  "Afternoon (12:00 PM - 3:00 PM)",
  "Late Afternoon (3:00 PM - 4:00 PM)",
  "Evening (4:00 PM - 8:00 PM)",
  "Night (8:00 PM - 11:00 PM)",
  "Flexible"
];

export const tutorQualificationOptions = [
  "Any Qualification",

  // Academic Year
  "1st Year Student",
  "2nd Year Student",
  "3rd Year Student",
  "4th Year Student",
  "Graduate",
  "Postgraduate",

  // Subject Experts
  "Science Expert",
  "Math Expert",
  "Higher Math Expert",
  "English Expert",
  "Bangla Expert",
  "Physics Expert",
  "Chemistry Expert",
  "Biology Expert",
  "ICT Expert",
  "Computer Science Expert",
  "Accounting Expert",
  "Finance Expert",
  "Economics Expert",
  "Business Studies Expert",
  "Statistics Expert",
  "Social Science Expert",
  "History Expert",
  "Geography Expert",
  "Islamic Studies Expert",
  "Arabic Expert",

  // Academic Level Experts
  "Primary Level Expert",
  "Junior School Expert",
  "Secondary Level Expert",
  "SSC Expert",
  "HSC Expert",
  "University Level Expert",

  // Medium & Curriculum
  "Bangla Medium Expert",
  "English Version Expert",
  "English Medium Expert",
  "O Level Expert",
  "A Level Expert",
  "IGCSE Expert",
  "AS Level Expert",
  "A2 Level Expert",
  "Cambridge Curriculum Expert",
  "Edexcel Curriculum Expert",

  // Admission & Test Preparation
  "Admission Test Expert",
  "University Admission Expert",
  "Medical Admission Expert",
  "Engineering Admission Expert",
  "IELTS Expert",
  "TOEFL Expert",
  "SAT Expert",
  "GRE Expert",
  "GMAT Expert",

  // Special Skills
  "Drawing Expert",
  "Art & Craft Expert",
  "Spoken English Expert",
  "English Grammar Expert",
  "Creative Writing Expert",
  "Public Speaking Expert",
  "Programming Expert",
  "Coding Expert",
  "MS Office Expert",
  "Quran & Arabic Expert",

  // Experience
  "Experienced Home Tutor",
  "Experienced School Teacher",
  "Experienced College Teacher",
  "Subject-Related Expert",
  "Subject Specialist",
  "Curriculum Specialist",
  "Exam Preparation Expert",
  "Experienced English Medium Tutor",
  "Experienced English Version Tutor"
];

export const specialRequirementOptions = [
  "Experienced Tutor",
  "Good Communication Skills",
  "Patient & Friendly",
  "Child-Friendly",
  "Punctual & Regular",
  "Responsible & Dedicated",
  "Strong Academic Background",

  "Strong in Mathematics",
  "Strong in Higher Mathematics",
  "Strong in English",
  "Strong in Bangla",
  "Strong in Science",
  "Strong in Physics",
  "Strong in Chemistry",
  "Strong in Biology",
  "Strong in ICT",
  "Strong in Accounting",

  "English Medium Experience",
  "English Version Experience",
  "Bangla Medium Experience",
  "O Level Experience",
  "A Level Experience",
  "IGCSE Experience",
  "Cambridge Curriculum Experience",
  "Edexcel Curriculum Experience",

  "Exam Preparation Experience",
  "SSC Preparation Experience",
  "HSC Preparation Experience",
  "Admission Preparation Experience",
  "Medical Admission Preparation",
  "Engineering Admission Preparation",

  "IELTS Teaching Experience",
  "Spoken English Teaching Experience",
  "Grammar Teaching Experience",

  "Drawing / Art Experience",
  "Arabic Teaching Experience",
  "Quran Teaching Experience",

  "Primary Level Teaching Experience",
  "Secondary Level Teaching Experience",
  "Home Tutoring Experience",
  "Online Tutoring Experience",

  "Nearby Tutor Preferred",
  "Regular Homework Support",
  "Weekly Test & Assessment",
  "Extra Class When Needed",
  "Other"
];

export const classOrCourseOptions = [
  // GENERAL
  "Any Class / Course",

  // PRE-SCHOOL / PRE-PRIMARY
  "Pre-School",
  "Play Group",
  "Nursery",
  "KG",
  "KG 1",
  "KG 2",

  // PRIMARY
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",

  // SECONDARY
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "SSC",

  // HIGHER SECONDARY
  "Class 11",
  "Class 12",
  "HSC",

  // ENGLISH MEDIUM
  "O Level",
  "AS Level",
  "A Level",
  "IGCSE",

  // SCHOOL / COLLEGE ADMISSION
  "School Admission",
  "School Admission Test",
  "College Admission",
  "College Admission Test",
  "Admission",
  "Admission Candidate",
  "Admission Test Preparation",

  // UNIVERSITY / HIGHER EDUCATION
  "University",
  "Undergraduate",
  "Honours",
  "Honours 1st Year",
  "Honours 2nd Year",
  "Honours 3rd Year",
  "Honours 4th Year",
  "Degree",
  "Masters",
  "MPhil",
  "PhD",
  "BA",
  "BBA",
  "BSc",
  "BBS",
  "Law",
  "Diploma",
  "Diploma Engineering",
  "Engineering",

  // UNIVERSITY ADMISSION
  "University Admission",
  "Public University Admission",
  "Private University Admission",
  "University Admission Test",
  "Public University Admission Test",
  "Private University Admission Test",

  // DHAKA UNIVERSITY
  "DU Admission",
  "DU A Unit",
  "DU B Unit",
  "DU C Unit",
  "DU D Unit",
  "DU Fine Arts Unit",
  "DU IBA Admission",

  // JAHANGIRNAGAR UNIVERSITY
  "JU Admission",
  "JU A Unit",
  "JU B Unit",
  "JU C Unit",
  "JU D Unit",
  "JU E Unit",
  "JU IBA Admission",

  // UNIVERSITY OF RAJSHAHI
  "RU Admission",
  "RU A Unit",
  "RU B Unit",
  "RU C Unit",

  // UNIVERSITY OF CHITTAGONG
  "CU Admission",
  "CU A Unit",
  "CU B Unit",
  "CU C Unit",
  "CU D Unit",
  "CU B1 Sub-Unit",
  "CU D1 Sub-Unit",

  // OTHER PUBLIC UNIVERSITY ADMISSION
  "BUP Admission",
  "JNU Admission",
  "SUST Admission",
  "KU Admission",
  "BU Admission",
  "BRUR Admission",
  "JKKNIU Admission",
  "NSTU Admission",
  "Comilla University Admission",
  "Barishal University Admission",
  "Islamic University Admission",

  // MEDICAL
  "Medical",
  "Medical Admission",
  "Medical College Admission Test",
  "Public Medical Admission",
  "Private Medical Admission",
  "Medical Admission Test",
  "Medical - MBBS",

  // DENTAL
  "Dental",
  "Dental Admission",
  "Dental Admission Test",
  "Public Dental Admission",
  "Private Dental Admission",
  "Medical - BDS",

  // NURSING
  "Nursing",
  "Nursing Admission",
  "Nursing Admission Test",
  "BSc Nursing",
  "Diploma Nursing",

  // ENGINEERING
  "Engineering Admission",
  "Engineering University Admission Test",
  "Public Engineering Admission",
  "Private Engineering Admission",
  "BUET Admission",
  "RUET Admission",
  "KUET Admission",
  "CUET Admission",
  "MIST Admission",
  "Textile Engineering",
  "Textile Engineering Admission",

  // ARCHITECTURE
  "Architecture",
  "Architecture Admission",
  "Architecture Admission Test",
  "Public Architecture Admission",
  "Private Architecture Admission",

  // AGRICULTURE
  "Agriculture",
  "Agriculture University Admission",
  "Agriculture Admission Test",
  "Public Agriculture University Admission",

  // NATIONAL UNIVERSITY
  "National University",
  "National University Admission",
  "National University Honours",
  "National University Degree",
  "National University Masters",

  // INTERNATIONAL CURRICULUM
  "IB Primary",
  "IB Middle Years",
  "IB Diploma",

  // INTERNATIONAL EXAMS
  "IELTS",
  "TOEFL",
  "PTE",
  "SAT",
  "GRE",
  "GMAT",
  "ACT",

  // COMPETITIVE / JOB PREPARATION
  "BCS",
  "Bank Job Preparation",
  "Primary Teacher",
  "Primary Teacher Recruitment",
  "NTRCA",
  "School Teacher Recruitment",
  "College Teacher Recruitment",
  "Sub-Inspector",
  "Government Job Preparation",
  "Competitive Exam Preparation",
  "Cadet Admission",

  // MADRASA
  "Ebtedayee",
  "Dakhil",
  "Alim",
  "Fazil",
  "Kamil",

  // ISLAMIC / RELIGIOUS EDUCATION
  "Quran",
  "Quran Recitation",
  "Tajweed",
  "Arabic",
  "Arabic Language",
  "Islamic Studies",

  // ENGLISH / LANGUAGE
  "Spoken English",
  "English Grammar",
  "English Writing",
  "English Conversation",
  "Academic English",

  // COMPUTER / IT
  "Computer Course",
  "Basic Computer",
  "Microsoft Office",
  "Computer Programming",
  "Programming / Coding",
  "C",
  "C++",
  "Java",
  "JavaScript",
  "Python",
  "Web Design",
  "Web Development",
  "Graphic Design",
  "Data Science",
  "Artificial Intelligence",
  "Digital Marketing",

  // ART / CREATIVE
  "Drawing",
  "Drawing & Painting",
  "Painting",
  "Art & Craft",
  "Calligraphy",
  "Handwriting",

  // BUSINESS / PROFESSIONAL
  "Accounting",
  "Finance",
  "Business Studies",
  "Marketing",
  "Economics",
  "Management",

  // OTHER
  "Other Course"
];

export const curriculumMediumOptions = [
  // Main Curriculum / Medium
  "Bangla Medium",
  "English Medium",
  "English Version",
  "Madrasah Medium",

  // International Curriculum
  "Cambridge Curriculum",
  "Edexcel Curriculum",
  "IB Curriculum",

  // International Exams
  "IELTS",
  "TOEFL",
  "PTE",
  "SAT",
  "GRE",
  "GMAT",
  "ACT",
  "International Exam Preparation",

  // Admission
  "Admission Candidate",
  "Admission Help",
  "Medical Admission",
  "Engineering Admission",
  "University Admission",
  "College Admission",
  "School Admission",

  // Language
  "Language",
  "Spoken English",
  "English Grammar",
  "Arabic Language",

  // Religious Education
  "Religious and Moral Studies",
  "Islamic Studies",
  "Quran Studies",

  // Arts & Creative
  "Drawing",
  "Drawing & Painting",
  "Painting",
  "Arts and Crafts",
  "Calligraphy",
  "Handwriting",

  // Skills
  "Special Skills Mastery",
  "Skills Development",

  // Higher Education / Career
  "Graduate Program",
  "Job Preparation"
];
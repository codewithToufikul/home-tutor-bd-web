import { Globe, Palette, Heart, BookOpen, GraduationCap, Award, Trophy, Code, Briefcase, UserCheck, Microscope } from 'lucide-react';

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
  'Play / Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 
  'SSC Examinee', 'HSC 1st Year', 'HSC 2nd Year', 
  'O-Level (IGCSE)', 'A-Level (AS & A2)', 'Admission Seeker', 'University / Graduate'
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
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800',
    items: [
      'Public University Admission Test', 'Private University Admission Test', 'Medical College Admission Test', 'Engineering University Admission Test', 'School Admission Test', 'IBA Admission Test', 'Cadet Admission Help'
    ]
  },
  {
    id: 'int-exam',
    title: 'Int. Exam Preparation',
    icon: Award,
    color: 'bg-indigo-500',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18acc?auto=format&fit=crop&q=80&w=800',
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
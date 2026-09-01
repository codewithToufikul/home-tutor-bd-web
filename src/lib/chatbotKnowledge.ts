export interface ChatbotResponse {
  answer: string;
  chips?: string[];
  actionLink?: {
    label: string;
    url: string;
    isExternal?: boolean;
  };
}

export interface FAQItem {
  id: string;
  keywords: string[];
  questions: string[];
  response: ChatbotResponse;
}

export const CHATBOT_KNOWLEDGE_BASE: FAQItem[] = [
  // 1. About Home Tutor Provider BD
  {
    id: 'about',
    keywords: ['about', 'platform', 'what is', 'home tutor', 'কোম্পানি', 'সম্পর্কে', 'কি এই সাইট', 'ওয়েবসাইট', 'কেমন', 'কারা'],
    questions: ['Home Tutor Provider BD কী?', 'এই প্ল্যাটফর্ম কীভাবে কাজ করে?'],
    response: {
      answer: `**Home Tutor Provider BD** বাংলাদেশের অন্যতম বিশ্বস্ত ও আধুনিক অনলাইন হোম ও অনলাইন টিউটরিং প্ল্যাটফর্ম।\n\n🎯 **আমাদের সেবাসমূহ:**\n• **অভিভাবক ও শিক্ষার্থীদের জন্য:** দেশসেরা বিশ্ববিদ্যালয়গুলোর ভেরিফাইড শিক্ষক খোঁজা ও টিউশন পোস্ট করা।\n• **টিউটরদের জন্য:** বিশ্বস্ত টিউশন জব খুঁজে পাওয়া এবং সরাসরি টিউশন কনফার্ম করা।\n• **আইটি সার্ভিসেস:** আধুনিক ওয়েবসাইট ও অ্যাপ ডেভেলপমেন্ট সাপোর্ট।`,
      chips: ['কীভাবে টিউটর খুঁজব?', 'টিউটর হিসেবে রেজিস্ট্রেশন', 'আইটি সার্ভিসেস'],
      actionLink: {
        label: 'আমাদের সম্পর্কে বিস্তারিত →',
        url: '/about',
      },
    },
  },

  // 2. How to Request a Tutor (Student/Guardian)
  {
    id: 'request_tutor',
    keywords: ['request', 'hire', 'find tutor', 'tutor lagbe', 'শিক্ষক', 'টিউটর চাই', 'টিউটর লাগবে', 'খুঁজব', 'পড়াতে চাই', 'পড়ানো'],
    questions: ['কীভাবে টিউটর রিকোয়েস্ট করব?', 'টিউটর খুঁজে পাওয়ার নিয়ম কী?'],
    response: {
      answer: `খুব সহজেই ৩টি সহজ ধাপে আপনার কাঙ্ক্ষিত টিউটর খুঁজে নিন:\n\n1️⃣ **হোমপেজ বা Request a Tutor পেজে যান।**\n2️⃣ আপনার সন্তানের শ্রেণি, বিষয়, মিডিয়াম (বাংলা/ইংরেজি), এলাকা এবং বাজেট উল্লেখ করুন।\n3️⃣ আপনার ফোন নম্বর দিয়ে **Submit Request** বাটনে ক্লিক করুন।\n\n⚡ আপনার পোস্ট করার সাথে সাথে আমাদের স্বয়ংক্রিয় এআই সিস্টেম ও টিম নিকটস্থ সেরা ভেরিফাইড টিউটরদের সাথে ম্যাচ করিয়ে আপনাকে যোগাযোগ করিয়ে দেবে।`,
      chips: ['টিউটর রিকোয়েস্ট ফর্ম', 'ভেরিফাইড টিউটর তালিকা', 'টিউশন রেট / বাজেট'],
      actionLink: {
        label: 'টিউটর রিকোয়েস্ট করুন →',
        url: '/request-tutor',
      },
    },
  },

  // 3. For Tutors - How to register and apply
  {
    id: 'tutor_register',
    keywords: ['join tutor', 'apply tutor', 'registration', 'register', 'tutor hobo', 'টিউটর হতে চাই', 'রেজিস্ট্রেশন', 'একাউন্ট', 'সাইন আপ'],
    questions: ['টিউটর হিসেবে কীভাবে যুক্ত হব?', 'টিউটর রেজিস্ট্রেশন করার নিয়ম কী?'],
    response: {
      answer: `Home Tutor Provider BD-তে টিউটর হিসেবে জয়েন করার নিয়ম:\n\n1️⃣ **Register পেজে যান** এবং 'Tutor' সিলেক্ট করে একাউন্ট তৈরি করুন।\n2️⃣ আপনার শিক্ষাগত যোগ্যতা (University, Department, SSC/HSC GPA) এবং আইডি কার্ড/স্টুডেন্ট আইডি আপলোড করে **প্রোফাইল ভেরিফাই** করুন।\n3️⃣ 'Tuition Jobs' সেকশন থেকে আপনার এলাকার টিউশন জবে এক ক্লিকে **Apply** করুন।`,
      chips: ['টিউটর রেজিস্ট্রেশন', 'টিউশন জবসমূহ দেখুন', 'ভেরিফিকেশন কীভাবে করে?'],
      actionLink: {
        label: 'টিউটর রেজিস্ট্রেশন করুন →',
        url: '/register',
      },
    },
  },

  // 4. Tuition Jobs and IDs
  {
    id: 'tuition_jobs',
    keywords: ['tuition job', 'job', 'available jobs', 'dha-001', 'job id', 'টিউশন জব', 'টিউশন', 'জব পাব', 'চাকরি'],
    questions: ['চলমান টিউশন জব কীভাবে দেখব?', 'টিউশন আইডি (যেমন: DHA-001) কী?'],
    response: {
      answer: `আমাদের প্ল্যাটফর্মে ঢাকা, চট্টগ্রাম, সিলেট সহ সারা বাংলাদেশের চলমান সকল টিউশন জব প্রতিদিন আপডেট হয়।\n\n📌 প্রতিটি টিউশনের একটি নির্দিষ্ট ইউনিক কোড থাকে (যেমন: **DHA-001**, **CTG-001**)। আপনি সরাসরি জব আইডি বা এলাকা দিয়ে সার্চ করতে পারেন।`,
      chips: ['সব টিউশন জব দেখুন', 'জব আবেদনের নিয়ম'],
      actionLink: {
        label: 'টিউশন জব দেখুন →',
        url: '/jobs',
      },
    },
  },

  // 5. IT Services
  {
    id: 'it_services',
    keywords: ['it service', 'website', 'app', 'development', 'software', 'ওয়েবসাইট', 'অ্যাপ', 'সফটওয়্যার', 'আইটি সার্ভিস'],
    questions: ['আপনাদের কী কী আইটি সার্ভিস রয়েছে?', 'ওয়েবসাইট বা অ্যাপ ডেভেলপমেন্ট কীভাবে করাব?'],
    response: {
      answer: `আমাদের রয়েছে এক্সপার্ট সফটওয়্যার ইঞ্জিনিয়ারিং টিম। আমাদের জনপ্রিয় আইটি সার্ভিসেস:\n\n🌐 **Full-Stack Web Development** (React, Next.js, Node.js)\n📱 **Mobile App Development** (Android & iOS)\n🎨 **UI/UX Design & Branding**\n⚡ **Custom Software & ERP Solution**\n\nসরাসরি আমাদের আইটি প্রজেক্ট বিস্তারিত দেখতে পারেন এবং অ্যাডমিন টিমের সাথে চ্যাট করতে পারেন।`,
      chips: ['আইটি সার্ভিস পেজ', 'অফিসের সাথে যোগাযোগ'],
      actionLink: {
        label: 'আইটি সার্ভিসসমূহ দেখুন →',
        url: '/services',
      },
    },
  },

  // 6. Fees, Salary & Pricing
  {
    id: 'pricing_salary',
    keywords: ['salary', 'fee', 'charge', 'cost', 'price', 'বেতন', 'টাকা', 'চার্জ', 'খরচ', 'ফি'],
    questions: ['টিউটরদের বেতন কত হতে পারে?', 'অভিভাবকদের কি কোনো অতিরিক্ত চার্জ দিতে হয়?'],
    response: {
      answer: `💰 **বেতন ও বাজেটের বিবরণ:**\n• **অভিভাবকদের জন্য:** টিউটর রিকোয়েস্ট করা সম্পূর্ণ ফ্রি। শ্রেণি ও মিডিয়াম অনুযায়ী সাধারণ বেতন সাধারণত ৪,০০০ টাকা থেকে ১৫,০০০+ টাকা হয়ে থাকে।\n• **টিউটরদের জন্য:** টিউশন কনফার্ম হওয়ার পর প্ল্যাটফর্মের স্ট্যান্ডার্ড মিডিয়া ফি পলিসি প্রযোজ্য।`,
      chips: ['টিউটর রিকোয়েস্ট করুন', 'হেল্প সেন্টারে বিস্তারিত'],
      actionLink: {
        label: 'হেল্প সেন্টার ও পলিসি →',
        url: '/help-center',
      },
    },
  },

  // 7. Contact & Support
  {
    id: 'contact_support',
    keywords: ['contact', 'phone', 'number', 'hotline', 'whatsapp', 'call', 'যোগাযোগ', 'ফোন', 'নাম্বার', 'হোয়াটসঅ্যাপ', 'অফিস', 'সাপোর্ট'],
    questions: ['সরাসরি অফিসে যোগাযোগের নাম্বার কী?', 'হোয়াটসঅ্যাপে কীভাবে কথা বলব?'],
    response: {
      answer: `📞 **সরাসরি সাপোর্ট ও অফিস হেল্পলাইন:**\n\n• 📱 **মোবাইল / হটলাইন:** \`+880 1928-325460\`\n• 💬 **WhatsApp:** \`+880 1928-325460\`\n• ✉️ **Email:** \`support@hometutorbd.com\`\n• 🏢 **অফিস সময়:** প্রতিদিন সকাল ৯টা থেকে রাত ১০টা পর্যন্ত।\n\nআপনি চাইলে এখনই ১-ক্লিকে আমাদের অফিসিয়াল WhatsApp-এ চ্যাট শুরু করতে পারেন।`,
      chips: ['WhatsApp-এ চ্যাট করুন', 'যোগাযোগ পেজ'],
      actionLink: {
        label: 'WhatsApp-এ সরাসরি কথা বলুন 💬',
        url: 'https://wa.me/8801928325460?text=Hello%20Home%20Tutor%20Provider%20BD,%20I%20need%20support.',
        isExternal: true,
      },
    },
  },

  // 8. Tutor Verification & Safety
  {
    id: 'verification',
    keywords: ['verify', 'verification', 'nid', 'student id', 'safe', 'নিরাপত্তা', 'ভেরিফিকেশন', 'ভেরিফাইড', 'আইডি'],
    questions: ['টিউটররা কতটা বিশ্বস্ত ও ভেরিফাইড?', 'কীভাবে প্রোফাইল ভেরিফাই করব?'],
    response: {
      answer: `🛡️ **১০০% ভেরিফাইড নিরাপত্তা:**\nআমাদের প্ল্যাটফর্মের প্রতিটি টিউটরের জাতীয় পরিচয়পত্র (NID), বিশ্ববিদ্যালয়ের স্টুডেন্ট আইডি এবং একাডেমিক সার্টিফিকেট অ্যাডমিন টিম কর্তৃক ম্যানুয়ালি যাচাই করা হয়।\n\nঅভিভাবকগণ নিশ্চিন্তে বিশ্বস্ত টিউটর নির্বাচন করতে পারেন।`,
      chips: ['ভেরিফাইড টিউটর খুঁজুন', 'নিরাপত্তা টিপস'],
      actionLink: {
        label: 'নিরাপত্তা গাইডলাইন →',
        url: '/safety-tips',
      },
    },
  },
];

export const DEFAULT_QUICK_CHIPS = [
  'কীভাবে টিউটর খুঁজব?',
  'টিউটর হিসেবে জয়েন করতে চাই',
  'চলমান টিউশন জবসমূহ',
  'আইটি সার্ভিসেস',
  'অফিসের সাথে যোগাযোগ (WhatsApp)',
];

export const getBotResponse = (userQuery: string): ChatbotResponse => {
  const clean = userQuery.trim().toLowerCase();

  if (!clean) {
    return {
      answer: 'কীভাবে সাহায্য করতে পারি বলুন! টিউটর খোঁজা, টিউটর হওয়া, টিউশন জব বা আইটি সার্ভিস সম্পর্কে যেকোনো প্রশ্ন করতে পারেন।',
      chips: DEFAULT_QUICK_CHIPS,
    };
  }

  // Exact or keyword match
  let bestMatch: FAQItem | null = null;
  let maxScore = 0;

  for (const item of CHATBOT_KNOWLEDGE_BASE) {
    let score = 0;
    for (const kw of item.keywords) {
      if (clean.includes(kw.toLowerCase())) {
        score += 2;
      }
    }
    for (const q of item.questions) {
      if (clean.includes(q.toLowerCase()) || q.toLowerCase().includes(clean)) {
        score += 4;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    return bestMatch.response;
  }

  // Greeting checks
  if (['hi', 'hello', 'hey', 'সালাম', 'কেমন আছেন', 'help', 'শুরু'].some(g => clean.includes(g))) {
    return {
      answer: `স্বাগতম! আমি **Home Tutor Provider BD** এর স্মার্ট এআই অ্যাসিস্ট্যান্ট।\n\nআমি আপনাকে টিউটর খোঁজা, টিউশন পোস্ট করা, টিউটর রেজিস্ট্রেশন বা যেকোনো সার্ভিসের বিষয়ে সহায়তা করতে প্রস্তুত।\n\nনিচের কুইক অপশনগুলো থেকে বেছে নিতে পারেন অথবা আপনার প্রশ্নটি লিখুন:`,
      chips: DEFAULT_QUICK_CHIPS,
    };
  }

  // Fallback intelligent response with WhatsApp hotline
  return {
    answer: `আপনার প্রশ্নটির জন্য ধন্যবাদ! আপনি কি **টিউটর রিকোয়েস্ট**, **টিউটর রেজিস্ট্রেশন**, **টিউশন জব** নাকি **আইটি সার্ভিস** সম্পর্কে জানতে চান?\n\nঅথবা সরাসরি আমাদের কাস্টমার কেয়ার ম্যানেজারের সাথে WhatsApp-এ দ্রুত কথা বলতে পারেন।`,
    chips: DEFAULT_QUICK_CHIPS,
    actionLink: {
      label: 'WhatsApp-এ সরাসরি সাপোর্ট নিন 💬',
      url: 'https://wa.me/8801928325460?text=Hello%20Home%20Tutor%20Provider%20BD,%20I%20have%20a%20question.',
      isExternal: true,
    },
  };
};

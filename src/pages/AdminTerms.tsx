import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, ShieldCheck, AlertCircle, Info, 
  CheckCircle2, Scale, Gavel, ScrollText, Edit3
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';

const TERMS_CONTENT = [
  {
    title: "সার্ভিস চার্জ প্রদান:",
    content: "টিউশন কনফর্ম হওয়ার (৭-১০) দিনের মধ্যে, প্রথম মাসের বেতনের ৬০% টাকা Home Tutor Provider BD-কে সার্ভিস চার্জ হিসেবে প্রদান করতে হবে।"
  },
  {
    title: "টিউশন বাতিল হলে ফেরত:",
    content: "টিউশন কনফর্ম হওয়ার (৭-১০) দিনের মধ্যে, প্রথম মাসের বেতনের ৬০% টাকা Home Tutor Provider BD-কে সার্ভিস চার্জ হিসেবে প্রদান করতে যদি টিউশন ১ মাসের মধ্যে চলে যায়, তবে ৩০% টাকা ফেরত দেওয়া হবে। তবে, যদি টিউটরের দোষের কারণে (যেমন: অনিয়মিত যান, পড়াতে ভুল করেন, আন্তরিকতার সাথে পড়ান না) টিউশন চলে যায়, তাহলে কোন সার্ভিস চার্জ ফেরত দেওয়া হবে না।"
  },
  {
    title: "গার্ডিয়ানের সাথে যোগাযোগ:",
    content: "গার্ডিয়ানের নাম্বার পাওয়ার সাথে সাথে, ১ ঘন্টার মধ্যে গার্ডিয়ানের সাথে যোগাযোগ করতে হবে এবং Home Tutor Provider BD-কে আপডেট দিতে হবে।"
  },
  {
    title: "ডেমো ক্লাসের আপডেট:",
    content: "ডেমো ক্লাসের সময়সীমার আপডেট নিয়মিত জানাতে হবে। আপডেট না জানানোর কারণে যদি টিউশন বাতিল হয়ে যায়, তার পুরো দায়ভার টিউটরের। অর্থাৎ, টিউটরকে ৬০% সার্ভিস চার্জ দিতে হবে।"
  },
  {
    title: "ডেমো ক্লাস:",
    content: "টিউটরকে ২টি ডেমো ক্লাস করাতে হবে, যার জন্য কোন অর্থ দাবি করা যাবে না। টিউটরকে ২টি ডেমো ক্লাস করাতে হবে, যার জন্য কোন অর্থ দাবি করা যাবে না।"
  },
  {
    title: "দায়িত্বহীনতার পরিণতি:",
    content: "টিচারের দায়িত্বহীনতার কারণে যদি টিউশন চলে যায় বা বাতিল হয়, তাহলে ভবিষ্যতে আর কখনো টিউশন দেওয়া হবে না। এই বিষয়টি BTPA - Bangladesh Tuition Provider Association-এ রিপোর্ট করা হবে, যার ফলে BTPA সদস্যরা আপনাকে টিউশন দিবেনা।"
  },
  {
    title: "আবেদন নীতিমালা:",
    content: "টিউশনে আবেদন করার সময় (বিষয়, লোকেশন, স্যালারি, দিন) ইত্যাদি দেখে আবেদন করতে হবে। পরবর্তীতে (সময়, বেতন, দূরত্ব) জনিত কোন অজুহাত/অভিযোগ গ্রহণযোগ্য হবে না। গার্ডিয়ানের নাম্বার পাওয়ার পর এসব অজুহাত দিয়ে টিউশন বাতিল করা যাবে না।"
  },
  {
    title: "ডেমো ক্লাসের ফলাফল:",
    content: "গার্ডিয়ান এবং ছাত্র-ছাত্রীর পছন্দ অনুযায়ী ডেমো ক্লাস হলে টিউটরকে পড়ানোর জন্য নিশ্চিত করা হবে। অন্যথায়, ২টি ডেমো ক্লাস নেওয়ার পর টিউশন কনফর্ম না হলে, এর জন্য কোন টাকা দাবি করা যাবে না।"
  }
];

export default function AdminTerms() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        {/* Sticky Topbar Section */}
        <div className="sticky top-[-24px] lg:top-[-48px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md -mx-6 lg:-mx-12 px-6 lg:px-12 py-4 border-b border-ink/5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-lg font-display font-black text-ink">
                Terms and Conditions
              </h2>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={cn(
                "px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg",
                isEditing 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-primary text-white shadow-primary/20 hover:bg-primary-dark"
              )}
            >
              {isEditing ? <><CheckCircle2 size={14} /> Save Changes</> : <><Edit3 size={14} /> Edit Content</>}
            </button>
          </div>
        </div>

        {/* Header Info */}
        <div className="bg-primary/5 border border-primary/10 rounded-[32px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10 shrink-0">
            <ShieldCheck size={40} />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-display font-black text-ink">Platform Policies</h3>
            <p className="text-sm font-medium text-ink-muted leading-relaxed max-w-2xl">
              These terms and conditions govern the relationship between Home Tutor Provider BD and its registered tutors. Please ensure all content is accurate and legally compliant.
            </p>
          </div>
        </div>

        {/* Terms Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TERMS_CONTENT.map((term, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/60 backdrop-blur-xl p-8 rounded-[32px] border border-white/40 shadow-xl shadow-ink/5 space-y-4 group hover:bg-white transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <ScrollText size={20} />
                </div>
                <h4 className="text-base font-black text-ink leading-tight">{term.title}</h4>
              </div>
              
              {isEditing ? (
                <textarea 
                  defaultValue={term.content}
                  className="w-full bg-ink/[0.02] border border-ink/5 rounded-2xl p-4 text-sm font-medium text-ink-muted min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              ) : (
                <div className="p-5 bg-ink/[0.02] rounded-2xl border border-ink/5">
                  <p className="text-sm font-medium text-ink-muted leading-relaxed text-justify">
                    {term.content}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
            <AlertCircle size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-rose-600 uppercase tracking-wider">Important Legal Notice</h4>
            <p className="text-xs font-medium text-rose-500/80 leading-relaxed">
              Any changes made to these terms will be immediately visible to all registered tutors. Ensure that the language remains clear and professional to avoid disputes.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, X, AlertTriangle, Sparkles, Facebook } from 'lucide-react';

interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  salary: string;
  location: string;
  onClose: () => void;
}

export default function JobApplyModal({ jobId, jobTitle, salary, location, onClose }: JobApplyModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('দয়া করে উপরোক্ত সকল শর্তে সম্মতি প্রদান করুন!');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[36px] p-6 sm:p-10 shadow-2xl border border-ink/10 relative space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-ink-muted cursor-pointer transition-all"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            {/* Header Title */}
            <div className="space-y-2 pr-8">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
                <Sparkles size={14} /> Mandatory Policy & Verification
              </div>
              <h2 className="text-2xl font-display font-black text-[#001F3F]">
                মিডিয়া ফি ও নীতিমালা (শর্তাবলী)
              </h2>
              <p className="text-xs text-ink-muted font-medium">
                টিউশনে আবেদন করার পূর্বে অনুগ্রহ করে নিচের নিয়ম ও শর্তাবলি মনোযোগ সহকারে পড়ুন।
              </p>
            </div>

            {/* Job Short Info Card */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-4.5 rounded-2xl border border-primary/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Job ID</span>
                <span className="font-black text-ink">{jobId}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Salary</span>
                <span className="font-black text-primary">{salary}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-black text-ink-muted uppercase block">Location</span>
                <span className="font-black text-ink truncate block">{location}</span>
              </div>
            </div>

            {/* Policy & Terms Box */}
            <div className="p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-4 text-xs text-amber-950 leading-relaxed shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                  <span className="text-sm">আমাদের মিডিয়া ফি ও কড়া নীতিমালা:</span>
                </div>
                {/* Facebook Page Link Badge */}
                <a
                  href="https://www.facebook.com/hometutorporoviderbd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Facebook size={12} /> পেজ ভিজিট করুন
                </a>
              </div>
              
              <div className="space-y-3 text-[11.5px]">
                <div className="flex items-start gap-2.5">
                  <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-black text-[10px] shrink-0 mt-0.5">📋 মূল শর্ত</span>
                  <p>টিউটরিং শুরু করার পর <strong>৭-১৫ দিনের মধ্যে</strong> মিডিয়া চার্জ বাবদ প্রথম মাসের বেতনের <strong>৬০% টাকা</strong> পরিশোধ করতে হবে[cite: 12].</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black text-[10px] shrink-0 mt-0.5">❌ ফ্রি</span>
                  <p>টিউশন শুরু হওয়ার আগে বা কনফার্ম হওয়ার আগে আমাদের এজেন্সিকে কোনো প্রকার অগ্রিম (Advance) বা রেজিষ্ট্রেশন ফি দিতে হয় না[cite: 12].</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-black text-[10px] shrink-0 mt-0.5">✅ সময়সীমা</span>
                  <p>টিউশন কনফার্ম হওয়ার পর এবং নিয়মিত ২টি ডেমো (Demo) ক্লাস শেষ করে মূল ক্লাস শুরু করার পর, প্রথম মাসের ৭ থেকে ১৫ দিনের মধ্যে অফিশিয়াল বিকাশ নম্বরে ৬০% ফি পরিশোধ করতে হবে[cite: 12].</p>
                </div>

                {/* Blacklist Warning Box */}
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2 text-rose-950 mt-2">
                  <p className="font-black text-rose-700 flex items-center gap-1.5">
                    <X size={16} /> ফি জালিয়াতি বা যোগাযোগ বন্ধের শাস্তি (Blacklist Notice):[cite: 12]
                  </p>
                  <p className="text-[11px] font-medium">নির্ধারিত ১৫ দিনের মধ্যে ফি পরিশোধ না করলে, মিথ্যা তথ্য দিলে কিংবা এজেন্সির সাথে যোগাযোগ বন্ধ রাখলে[cite: 12]:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-bold text-rose-900">
                    <li>আপনাকে প্ল্যাটফর্ম থেকে আজীবনের জন্য ব্ল্যাকলিস্ট (Blacklist) করা হবে[cite: 12].</li>
                    <li>কেন্দ্রীয় ডাটাবেজে <span className="underline">"Fraud/Cheater Tutor"</span> হিসেবে রিপোর্ট সাবমিট করা হবে; যার ফলে ভবিষ্যতে কোনো মিডিয়া থেকে আর টিউশন পাবেন না[cite: 12]. ❌</li>
                    <li>আপনার অভিভাবক এবং শিক্ষা প্রতিষ্ঠানে প্রাতিষ্ঠানিকভাবে অভিযোগ জানানো হবে[cite: 12].</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox & Button */}
            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <label className="flex items-start gap-3.5 cursor-pointer bg-gray-50/80 p-4 rounded-2xl border border-ink/5 hover:bg-gray-100/80 transition-all">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-5 h-5 text-primary rounded-md border-ink/20 focus:ring-primary cursor-pointer shrink-0 accent-emerald-600"
                />
                <span className="text-xs font-black text-ink leading-relaxed">
                  আপনি কি উপরোক্ত সকল শর্ত মনোযোগ দিয়ে পড়েছেন এবং এই নিয়ম মেনে চলতে সম্পূর্ণ বাধ্য ও রাজি আছেন?[cite: 12]
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-emerald-600/25 hover:bg-emerald-700 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} /> Confirm & Apply Now
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-12 space-y-5">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-[#001F3F]">Application Successful!</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto">
                আপনার আবেদন সফলভাবে জমা হয়েছে। আমাদের টিম খুব শীঘ্রই আপনার প্রোফাইল যাচাই করে পরবর্তী পদক্ষেপ নেবে।
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#001F3F] text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-primary transition-all cursor-pointer shadow-lg"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
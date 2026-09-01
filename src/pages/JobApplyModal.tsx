import { useState } from 'react';
import { TuitionRepository } from '@/src/repositories/tuitionRepository';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, X, AlertTriangle, Sparkles, Facebook, Clock, DollarSign, MessageSquare, Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  salary: string;
  location: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JobApplyModal({ jobId, jobTitle, salary, location, onClose, onSuccess }: JobApplyModalProps) {
  const [expectedSalary, setExpectedSalary] = useState<string>(salary ? String(salary).replace(/[^0-9]/g, '') : '');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [availableTime, setAvailableTime] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleTime = (slot: string) => {
    setAvailableTime((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
    if (validationError) setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validate Expected Salary
    if (!expectedSalary || Number(expectedSalary) <= 0) {
      setValidationError('দয়া করে আপনার প্রত্যাশিত মাসিক বেতন (Expected Salary) উল্লেখ করুন।');
      return;
    }

    // 2. Validate Available Time Slots
    if (availableTime.length === 0) {
      setValidationError('দয়া করে পড়ানোর অন্তত একটি সুবিধাজনক সময় (সকাল/বিকাল/সন্ধ্যা/রাত) নির্বাচন করুন।');
      return;
    }

    // 3. Validate Cover Letter / Message
    if (!coverLetter.trim() || coverLetter.trim().length < 5) {
      setValidationError('দয়া করে অভিভাবক বা এজেন্সির উদ্দেশ্যে আপনার পূর্ব অভিজ্ঞতা বা সংক্ষিপ্ত বার্তা লিখুন (কমপক্ষে ৫ অক্ষর)।');
      return;
    }

    // 4. Validate Agreement Checkbox
    if (!agreed) {
      setValidationError('আবেদন সম্পন্ন করতে উপরোক্ত মিডিয়া ফি ও নীতিমালা মেনে সম্মতি বক্সে টিক দিন।');
      return;
    }

    setLoading(true);
    try {
      await TuitionRepository.apply(jobId, {
        expectedSalary: parseFloat(expectedSalary),
        coverLetter: coverLetter.trim(),
        availableTime,
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Job application error:', err);
      setValidationError(err.message || 'আপনি ইতিমধ্যে এই জবে আবেদন করেছেন অথবা কোনো সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const TIME_SLOTS = [
    { id: 'morning', label: 'সকাল (Morning)' },
    { id: 'afternoon', label: 'বিকাল (Afternoon)' },
    { id: 'evening', label: 'সন্ধ্যা (Evening)' },
    { id: 'night', label: 'রাত (Night)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[36px] p-6 sm:p-10 shadow-2xl border border-ink/10 relative space-y-6 max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-gray-100 hover:bg-rose-100 hover:text-rose-600 text-ink-muted cursor-pointer transition-all active:scale-95 z-10"
        >
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            {/* Header Title */}
            <div className="space-y-2 pr-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
                <Sparkles size={14} /> Mandatory Policy & Application
              </div>
              <h2 className="text-2xl font-display font-black text-[#001F3F]">
                মিডিয়া ফি ও নীতিমালা (শর্তাবলী)
              </h2>
              <p className="text-xs text-ink-muted font-medium">
                টিউশনে আবেদন করার পূর্বে অনুগ্রহ করে নিচের নিয়মাবলী মনোযোগ দিয়ে পড়ুন এবং সকল প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।
              </p>
            </div>

            {/* Job Short Info Card */}
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-4.5 rounded-2xl border border-primary/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Job ID</span>
                <span className="font-mono font-black text-ink">{jobId?.slice(-8) || jobId}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Budget/Salary</span>
                <span className="font-black text-emerald-600">৳{salary || 'Negotiable'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-black text-ink-muted uppercase block">Location</span>
                <span className="font-black text-ink truncate block">{location || 'Dhaka'}</span>
              </div>
            </div>

            {/* Policy & Terms Box (Clean text without citations) */}
            <div className="p-5 bg-amber-50/80 border border-amber-200/90 rounded-2xl space-y-4 text-xs text-amber-950 leading-relaxed shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                <div className="flex items-center gap-2 font-black text-amber-900">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                  <span className="text-sm">আমাদের মিডিয়া ফি ও গুরুত্বপূর্ণ নীতিমালা:</span>
                </div>
                {/* Facebook Page Link Badge */}
                <a
                  href="https://www.facebook.com/hometutorporoviderbd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Facebook size={13} /> অফিসিয়াল পেজ
                </a>
              </div>
              
              <div className="space-y-3 text-[11.5px]">
                <div className="flex items-start gap-2.5">
                  <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-black text-[10px] shrink-0 mt-0.5">📋 মূল শর্ত</span>
                  <p>টিউটরিং শুরু করার পর <strong>৭ থেকে ১৫ দিনের মধ্যে</strong> মিডিয়া চার্জ বাবদ প্রথম মাসের বেতনের <strong>৬০% টাকা</strong> অফিশিয়াল মাধ্যমে পরিশোধ করতে হবে।</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black text-[10px] shrink-0 mt-0.5">❌ ফ্রি</span>
                  <p>টিউশন শুরু বা কনফার্ম হওয়ার পূর্বে আমাদের এজেন্সিকে কোনো প্রকার অগ্রিম (Advance) বা রেজিস্ট্রেশন ফি দিতে হয় না।</p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black text-[10px] shrink-0 mt-0.5">✅ সময়সীমা</span>
                  <p>টিউশন কনফার্ম হওয়ার পর এবং নিয়মিত ২টি ডেমো (Demo) ক্লাস সম্পন্ন করার পর মূল ক্লাস শুরু হলে, প্রথম মাসের ৭-১৫ দিনের মধ্যে অফিশিয়াল বিকাশ নম্বরে মিডিয়া ফি পরিশোধ করতে হবে।</p>
                </div>

                {/* Blacklist Warning Box */}
                <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl space-y-2 text-rose-950 mt-2">
                  <p className="font-black text-rose-700 flex items-center gap-1.5">
                    <X size={16} /> ফি জালিয়াতি বা যোগাযোগ বন্ধের শাস্তি (Blacklist Notice):
                  </p>
                  <p className="text-[11px] font-medium">নির্ধারিত ১৫ দিনের মধ্যে ফি পরিশোধ না করলে, ভুল বা অসত্য তথ্য দিলে কিংবা এজেন্সির সাথে যোগাযোগ বন্ধ রাখলে:</p>
                  <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] font-bold text-rose-900">
                    <li>আপনাকে প্ল্যাটফর্ম থেকে আজীবনের জন্য ব্ল্যাকলিস্ট (Blacklist) করা হবে।</li>
                    <li>কেন্দ্রীয় ডাটাবেজে <span className="underline font-black">"Fraud/Cheater Tutor"</span> হিসেবে রিপোর্ট সাবমিট করা হবে, যার ফলে ভবিষ্যতে কোনো মিডিয়া থেকে আর টিউশন পাবেন না। ❌</li>
                    <li>আপনার অভিভাবক এবং শিক্ষা প্রতিষ্ঠানে প্রাতিষ্ঠানিকভাবে অভিযোগ জানানো হবে।</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Validation Error Alert */}
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center gap-2"
              >
                <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </motion.div>
            )}

            {/* Application Details Form (Mandatory validation enforced) */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Expected Salary (Required) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center gap-1">
                    <span>প্রত্যাশিত মাসিক বেতন (Expected Salary)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3.5 flex items-center text-xs font-bold text-ink-muted pointer-events-none">৳</span>
                    <input
                      type="number"
                      required
                      min={500}
                      value={expectedSalary}
                      onChange={(e) => {
                        setExpectedSalary(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="যেমন: 5000"
                      className="w-full pl-8 pr-3.5 py-3 bg-gray-50 border border-ink/10 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* 2. Available Time Slots (Required) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center gap-1">
                    <span>পড়ানোর সুবিধাজনক সময় (Time Slots)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {TIME_SLOTS.map((slot) => {
                      const selected = availableTime.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleTime(slot.id)}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs",
                            selected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-black'
                              : 'bg-gray-50 text-ink-muted border-ink/10 hover:border-ink/20 hover:text-ink'
                          )}
                        >
                          {selected && <Check size={13} className="stroke-[3]" />}
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Cover Letter / Note (Required) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center gap-1">
                  <span>অভিভাবকের জন্য বার্তা / অভিজ্ঞতা (Cover Letter)</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={coverLetter}
                  onChange={(e) => {
                    setCoverLetter(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="আপনার পূর্ব অভিজ্ঞতা, পড়াশোনার ব্যাকগ্রাউন্ড বা পড়ানোর পদ্ধতি সংক্ষেপে লিখুন..."
                  className="w-full px-4 py-3 bg-gray-50 border border-ink/10 rounded-2xl text-xs font-medium focus:outline-none focus:border-primary focus:bg-white transition-all shadow-xs resize-none"
                />
              </div>

              {/* 4. Mandatory Terms Agreement Checkbox (Required) */}
              <label className={cn(
                "flex items-start gap-3.5 cursor-pointer p-4 rounded-2xl border transition-all",
                agreed 
                  ? "bg-emerald-50/80 border-emerald-300 shadow-xs" 
                  : "bg-gray-50/80 border-ink/10 hover:bg-gray-100"
              )}>
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (validationError) setValidationError(null);
                  }}
                  className="mt-1 w-5 h-5 text-emerald-600 rounded-md border-ink/20 focus:ring-emerald-500 cursor-pointer shrink-0 accent-emerald-600"
                />
                <span className="text-xs font-bold text-ink leading-relaxed">
                  আমি উপরোক্ত সকল মিডিয়া ফি, নিয়মাবলী এবং শর্ত মনোযোগ সহকারে পড়েছি এবং টিউশন শুরুর পর নির্ধারিত সময়ে ৬০% মিডিয়া ফি পরিশোধ করতে সম্পূর্ণ বাধ্য ও সম্মত আছি। <span className="text-rose-500">*</span>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreed || availableTime.length === 0 || !coverLetter.trim() || !expectedSalary}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
                  loading || !agreed || availableTime.length === 0 || !coverLetter.trim() || !expectedSalary
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60 shadow-none"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25 active:scale-[0.98]"
                )}
              >
                <ShieldCheck size={18} /> {loading ? 'Submitting Application...' : 'Confirm & Apply Now'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-12 space-y-5">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-black text-[#001F3F]">Application Submitted Successfully!</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto leading-relaxed">
                আপনার আবেদনটি সফলভাবে জমা হয়েছে। অভিভাবক এবং আমাদের এডমিন টিম আপনার প্রোফাইল যাচাই করে অতি দ্রুত টিউশনটি কনফার্ম করার জন্য যোগাযোগ করবে।
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20"
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
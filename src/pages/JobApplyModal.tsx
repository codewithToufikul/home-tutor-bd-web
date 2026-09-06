import { useState, useRef, useEffect } from 'react';
import { TuitionRepository } from '@/src/repositories/tuitionRepository';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, CheckCircle2, X, AlertTriangle, Sparkles, 
  Clock, DollarSign, Check, RotateCcw, PenTool, 
  FileText, Shield, User, Landmark, Scale, ExternalLink, Printer
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/context/AuthContext';

interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  salary: string;
  location: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function JobApplyModal({ jobId, jobTitle, salary, location, onClose, onSuccess }: JobApplyModalProps) {
  const { user } = useAuth();
  const [expectedSalary, setExpectedSalary] = useState<string>(salary ? String(salary).replace(/[^0-9]/g, '') : '');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [availableTime, setAvailableTime] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdAppId, setCreatedAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Signature Canvas States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const numSalary = Number(expectedSalary) || Number(salary) || 0;
  const mediaFee = Math.round(numSalary * 0.60);

  // Initialize and resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI canvas resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#001F3F';
  }, [submitted]);

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    if (validationError) setValidationError(null);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

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

    // 4. Validate Digital Signature
    if (!hasSignature || !canvasRef.current) {
      setValidationError('আবেদনটি আইনিভাবে সম্পন্ন করতে নিচের স্বাক্ষর বক্সে আপনার আঙুল বা মাউস দিয়ে স্বাক্ষর প্রদান করুন।');
      return;
    }

    // 5. Validate Mandatory Agreement Checkbox
    if (!agreed) {
      setValidationError('আবেদন সম্পন্ন করতে উপরোক্ত ডিজিটাল আইনি অঙ্গীকারনামা ও পুলিশি শর্তাবলীতে সম্মতি বক্সে টিক দিন।');
      return;
    }

    const signatureBase64 = canvasRef.current.toDataURL('image/png');

    setLoading(true);
    try {
      const res: any = await TuitionRepository.apply(jobId, {
        expectedSalary: parseFloat(expectedSalary),
        coverLetter: coverLetter.trim(),
        availableTime,
        signatureImage: signatureBase64,
        agreedToTerms: true,
      });

      const newId = res?.data?._id || res?.data?.id || res?._id || res?.id || null;
      setCreatedAppId(newId);
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
    { id: 'flexible', label: 'যেকোনো সময় (Flexible)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="bg-white w-full max-w-3xl rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-2xl border border-ink/10 relative space-y-6 max-h-[94vh] overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-ink-muted cursor-pointer transition-all active:scale-95 z-20"
        >
          <X size={19} />
        </button>

        {!submitted ? (
          <>
            {/* Header Title */}
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-black uppercase tracking-wider">
                <Scale size={13} /> Digital Legal Contract & E-Signature
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-[#001F3F] leading-tight">
                ডিজিটাল আইনি চুক্তিপত্র ও অঙ্গীকারনামা
              </h2>
              <p className="text-xs text-ink-muted font-medium">
                হোম টিউটর প্রোভাইডার বিডি এর নীতিমালা ও আইনি চুক্তির শর্তাবলী মনোযোগ দিয়ে পড়ে স্বাক্ষর করুন।
              </p>
            </div>

            {/* Job Summary Banner */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-ink/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Tuition Job ID</span>
                <span className="font-mono font-black text-primary">{jobId?.slice(-8) || jobId}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Monthly Salary</span>
                <span className="font-black text-emerald-700">৳{salary || 'Negotiable'}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Media Fee (60%)</span>
                <span className="font-black text-rose-700">৳{mediaFee.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-black text-ink-muted uppercase block">Location</span>
                <span className="font-bold text-ink truncate block">{location || 'Dhaka'}</span>
              </div>
            </div>

            {/* Official Legal Contract Deed Box */}
            <div className="border border-slate-300 rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-slate-50 to-white space-y-4 text-xs text-slate-800 shadow-inner">
              
              <div className="border-b border-slate-200 pb-3 text-center space-y-1">
                <span className="px-3 py-0.5 bg-slate-200 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Official Legal Agreement
                </span>
                <h3 className="font-black text-sm text-[#001F3F]">
                  টিঊশন মিডিয়া চুক্তিপত্র ও ডিজিটাল অঙ্গীকারনামা
                </h3>
              </div>

              {/* Parties Snapshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px] bg-white p-3 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <p className="font-black text-[#001F3F] uppercase text-[10px]">প্রথম পক্ষ (মিডিয়া কর্তৃপক্ষ)</p>
                  <p><strong>নাম:</strong> Home Tutor Provider BD</p>
                  <p><strong>অফিসিয়াল হেল্পলাইন:</strong> +880 1832-302302</p>
                </div>
                <div className="space-y-1">
                  <p className="font-black text-[#001F3F] uppercase text-[10px]">দ্বিতীয় পক্ষ (আবেদনকারী শিক্ষক)</p>
                  <p><strong>শিক্ষকের নাম:</strong> {user?.name || 'Authorized Tutor'}</p>
                  <p><strong>যোগাযোগ:</strong> {user?.phone || user?.email || 'Profile Verified'}</p>
                </div>
              </div>

              {/* Legal Clauses */}
              <div className="space-y-2.5 text-[11px] leading-relaxed text-slate-700 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                <p className="font-bold text-slate-900">
                  আমি সজ্ঞানে, সুস্থ মস্তিষ্কে এবং কোনো প্রকার প্ররোচনা ছাড়াই অঙ্গীকার করিতেছি যে:
                </p>

                <div className="space-y-2 pl-1">
                  <p>
                    <strong className="text-slate-900">১. মিডিয়া ফি পরিশোধের নিয়ম:</strong> উক্ত টিউশনটি কনফার্ম হওয়ার পর এবং প্রথম ক্লাস শুরু করার পরবর্তী ৭ থেকে ১৫ কার্যদিবসের মধ্যে আমি মিডিয়া ফি বাবদ বেতনের ৬০% অর্থ (<strong>৳{mediaFee.toLocaleString()} টাকা</strong>) অফিশিয়াল মাধ্যমে পরিশোধ করতে আইনত বাধ্য থাকিব। প্রথম মাসের বেতন পাওয়ার অজুহাত দেখিয়ে এই টাকা পরিশোধে বিলম্ব করা যাবে না।
                  </p>

                  <p>
                    <strong className="text-slate-900">২. ফিডব্যাক ও বিশ্বাসভঙ্গ:</strong> টিউশন শুরু করার পর অভিভাবকের মতামত বা টিউশন সংক্রান্ত সঠিক আপডেট ২৪ ঘণ্টার মধ্যে মিডিয়া কর্তৃপক্ষকে দিতে হবে। মিডিয়া ফি না দিয়ে যোগাযোগ বন্ধ করা, ফোন না ধরা, হোয়াটসঅ্যাপে ব্লক করা বা অভিভাবকের সাথে গোপনে ব্যক্তিগত চুক্তি করা <strong>বাংলাদেশ দণ্ডবিধি ১৮৬০ এর ৪০৬ ধারা (অপরাধমূলক বিশ্বাসভঙ্গ)</strong> ও <strong>৪২০ ধারা (প্রতারণা)</strong> অনুযায়ী সরাসরি এজাহারযোগ্য ফৌজদারি অপরাধ হিসেবে গণ্য হবে।
                  </p>

                  <p>
                    <strong className="text-slate-900">৩. থানায় সরাসরি মামলা ও গ্রেফতারের অধিকার:</strong> আমি যদি মিডিয়া ফি পরিশোধ না করিয়া আত্মগোপন করি বা প্রতারণার আশ্রয় নেই; তবে এই চুক্তিপত্রটি একটি অকাট্য আইনি দলিল (Factual Legal Contract) হিসেবে গণ্য হবে এবং মিডিয়া কর্তৃপক্ষের আমার বিরুদ্ধে নিকটস্থ থানায় সরাসরি ফৌজদারি মামলা (FIR) দায়ের করার এবং পুলিশের মাধ্যমে আমাকে আইনি হেফাজতে (গ্রেফতার) নেওয়ার পূর্ণ আইনি অধিকার (Right to Sue) থাকিবে।
                  </p>

                  <p>
                    <strong className="text-slate-900">৪. ডিজিটাল ফুটপ্রিন্ট ও সাইবার ট্র্যাকিং:</strong> এই সাবমিট বাটনে ক্লিক ও স্বাক্ষরের সাথে সাথে আমার ডিভাইসের <strong>IP Address</strong>, <strong>ব্রাউজার ফুটপ্রিন্ট</strong> এবং সাবমিটের নিখুঁত <strong>টাইমস্ট্যাম্প</strong> ডিজিটাল স্বাক্ষর ও ক্রিপ্টোগ্রাফিক হ্যাশ (SHA256) হিসেবে সিস্টেমে লক হয়ে যাবে, যা আদালতে সাইবার প্রমাণ হিসেবে গ্রহণযোগ্য হবে।
                  </p>

                  <p>
                    <strong className="text-slate-900">৫. প্রাতিষ্ঠানিক ও সামাজিক শাস্তি:</strong> টাকা অনাদায়ী রাখিলে মিডিয়া কর্তৃপক্ষ আমার বকেয়া টাকা ও ক্ষতিপূরণ আদায়ের লক্ষ্যে আমার শিক্ষা প্রতিষ্ঠানের প্রক্টর (Proctor), বিভাগীয় প্রধান এবং অভিভাবকের নিকট এই আইনি চুক্তির কপিসহ লিখিত অভিযোগ পাঠাতে পারবে এবং পাবলিক ব্ল্যাকলিস্টে প্রতারক হিসেবে তথ্য প্রকাশ করা হবে।
                  </p>
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

            {/* Application Details Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Expected Salary */}
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
                      className="w-full pl-8 pr-3.5 py-3 bg-slate-50 border border-ink/10 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* 2. Available Time Slots */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center gap-1">
                    <span>পড়ানোর সুবিধাজনক সময় (Time Slots)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {TIME_SLOTS.map((slot) => {
                      const selected = availableTime.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => toggleTime(slot.id)}
                          className={cn(
                            "px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs",
                            selected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-black'
                              : 'bg-slate-50 text-ink-muted border-ink/10 hover:border-ink/20 hover:text-ink'
                          )}
                        >
                          {selected && <Check size={12} className="stroke-[3]" />}
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Cover Letter */}
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-ink/10 rounded-2xl text-xs font-medium focus:outline-none focus:border-primary focus:bg-white transition-all shadow-xs resize-none"
                />
              </div>

              {/* 4. Digital Signature Canvas */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool size={13} className="text-primary" />
                    <span>শিক্ষকের ডিজিটাল স্বাক্ষর (E-Signature Canvas)</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>

                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 hover:text-rose-700 cursor-pointer bg-rose-50 px-2 py-1 rounded-lg transition-all"
                    >
                      <RotateCcw size={11} /> মুছে পুনরায় সাইন করুন
                    </button>
                  )}
                </div>

                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white overflow-hidden shadow-inner group hover:border-primary transition-colors">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-32 block cursor-crosshair touch-none bg-white"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 space-y-1">
                      <PenTool size={20} className="animate-pulse text-slate-300" />
                      <span className="text-xs font-bold">এখানে মাউস বা আঙুল দিয়ে আপনার স্বাক্ষর প্রদান করুন</span>
                      <span className="text-[10px] text-slate-400 font-medium">Touch or Draw your signature here</span>
                    </div>
                  )}
                  {hasSignature && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
                      <Check size={11} /> Digitally Signed
                    </div>
                  )}
                </div>
              </div>

              {/* 5. Mandatory Agreement Checkbox */}
              <label className={cn(
                "flex items-start gap-3.5 cursor-pointer p-4 rounded-2xl border transition-all mt-2",
                agreed 
                  ? "bg-emerald-50/90 border-emerald-300 shadow-xs" 
                  : "bg-slate-50 border-ink/10 hover:bg-slate-100"
              )}>
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    if (validationError) setValidationError(null);
                  }}
                  className="mt-0.5 w-5 h-5 text-emerald-600 rounded-md border-ink/20 focus:ring-emerald-500 cursor-pointer shrink-0 accent-emerald-600"
                />
                <span className="text-xs font-bold text-ink leading-relaxed">
                  আমি সজ্ঞানে ও সুস্থ মস্তিষ্কে উপরোক্ত সকল পুলিশি ও আইনি শর্তাবলীতে সম্পূর্ণ একমত ও সম্মত। <span className="text-rose-500 font-bold">*</span>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !agreed || !hasSignature || availableTime.length === 0 || !coverLetter.trim() || !expectedSalary}
                className={cn(
                  "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
                  loading || !agreed || !hasSignature || availableTime.length === 0 || !coverLetter.trim() || !expectedSalary
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-70 shadow-none"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25 active:scale-[0.98]"
                )}
              >
                <ShieldCheck size={18} /> {loading ? 'চুক্তিপত্র ভেরিফাই ও সাবমিট হচ্ছে...' : 'Confirm & Apply With E-Signature'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={42} />
            </div>
            
            <div className="space-y-2">
              <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-200">
                E-Signed Legal Contract Verified
              </span>
              <h3 className="text-2xl font-display font-black text-[#001F3F]">
                আবেদন ও আইনি চুক্তিপত্র সফলভাবে জমা হয়েছে!
              </h3>
              <p className="text-xs text-ink-muted max-w-md mx-auto leading-relaxed">
                আপনার ডিজিটাল স্বাক্ষর, আইপি অ্যাড্রেস এবং অঙ্গীকারনামা সিস্টেমে সফলভাবে সংরক্ষিত হয়েছে। অভিভাবক ও আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {createdAppId && (
                <button
                  type="button"
                  onClick={() => {
                    const baseUrl = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api/v1').replace(/\/$/, '');
                    window.open(`${baseUrl}/applications/${createdAppId}/contract-deed`, '_blank');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#001F3F] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-primary transition-all cursor-pointer"
                >
                  <FileText size={16} />
                  <span>আইনি দলিলটি দেখুন (View Signed Deed)</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-ink rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                সম্পন্ন (Close)
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
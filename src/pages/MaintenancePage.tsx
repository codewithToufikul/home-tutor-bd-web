import React from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Phone, 
  Mail, 
  RefreshCw, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow & Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Header / Brand */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B1528] rounded-[14px] flex items-center justify-center">
              <span className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">HT</span>
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Home Tutor Provider <span className="text-emerald-400">BD</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">#1 Verified Tutor Platform in Bangladesh</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>সিস্টেম আপগ্রেড চলমান</span>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-6 w-full flex flex-col items-center text-center">
        
        {/* Animated Maintenance Icon Badge */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/60 shadow-2xl shadow-emerald-500/10 flex items-center justify-center backdrop-blur-xl relative">
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 animate-pulse" />
            <Wrench className="w-12 h-12 text-emerald-400 animate-bounce transition-transform duration-1000" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 p-2 rounded-xl shadow-lg font-black">
            <ShieldCheck className="w-5 h-5 text-slate-950" />
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs sm:text-sm font-medium mb-6 shadow-inner backdrop-blur-md">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>পরিকল্পিত সিস্টেম ও সিকিউরিটি রক্ষণাবেক্ষণ</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.25] mb-5">
          আমরা ওয়েবসাইটটিকে <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            আরো উন্নত ও সুরক্ষিত করছি
          </span>
        </h2>

        {/* Description */}
        <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-normal">
          আমাদের সম্মানিত শিক্ষক, শিক্ষার্থী ও অভিভাবকদের নিরবচ্ছিন্ন এবং সর্বোচ্চ সুরক্ষিত সেবা প্রদানের লক্ষ্যে ডাটাবেজ অপ্টিমাইজেশন ও সিকিউরিটি আপগ্রেড কার্যক্রম চলছে। খুব দ্রুতই ওয়েবসাইটটি পূর্ণাঙ্গভাবে সচল হবে।
        </p>

        {/* Feature status grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-8">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3 text-left">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">ব্যবহারকারীর তথ্য</p>
              <p className="text-sm text-white font-semibold">১০০% সম্পূর্ণ নিরাপদ</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3 text-left">
            <Sparkles className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">সার্ভার স্পিড</p>
              <p className="text-sm text-white font-semibold">আল্ট্রা-ফাস্ট অপ্টিমাইজড</p>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex items-center gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400 font-medium">সিকিউরিটি শিল্ড</p>
              <p className="text-sm text-white font-semibold">অ্যাডভান্সড বট গার্ড</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>পেজ রিফ্রেশ করুন</span>
          </button>

          <a
            href="tel:+8801928325460"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all active:scale-95 shadow-md"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>জরুরি হেল্পলাইন</span>
          </a>
        </div>
      </main>

      {/* Footer Support Info */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 border-t border-slate-800/60 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Home Tutor Provider BD. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-6">
            <a 
              href="mailto:hello@hometutorproviderbd.com" 
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>hello@hometutorproviderbd.com</span>
            </a>
            <a 
              href="tel:+8801928325460" 
              className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+880 1928-325460</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

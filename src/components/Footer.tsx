import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Facebook, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  Youtube, 
  MessageCircle,
  Briefcase,
  Users,
  Grid,
  FileText,
  HelpCircle,
  Lock,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import logoImage from '@/src/lib/Home.png';

export default function Footer() {
  return (
    <footer className="relative bg-[#E2E8F0] text-ink overflow-hidden border-t-4 border-primary pt-10 sm:pt-12 pb-6">
      {/* Original Background Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rotate-45" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0b1329] rotate-45" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 mb-8">
          
          {/* Brand & Social Links (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center bg-white shrink-0">
                <img 
                  src={logoImage} 
                  alt="Home Tutor Provider BD" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-display font-bold text-ink">
                Home Tutor Provider <span className="text-primary">BD</span>
              </span>
            </Link>

            <p className="text-xs text-ink-muted font-semibold leading-relaxed max-w-sm">
              Bangladesh's most trusted platform finding expert home tutors. We bridge the gap between quality education and accessibility.
            </p>
            
            {/* Minimalist Unified Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              {/* Facebook Group */}
              <a
                href="https://www.facebook.com/groups/1562516141006044"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/90 border border-ink/10 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-white flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Facebook Group"
              >
                <Users size={15} />
              </a>

              {/* Facebook Page */}
              <a
                href="https://www.facebook.com/hometutorporoviderbd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/90 border border-ink/10 text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:bg-white flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Facebook Page"
              >
                <Facebook size={15} />
              </a>

              {/* WhatsApp Channel */}
              <a
                href="https://whatsapp.com/channel/0029VajPB27JJhzfwAyYWA3R"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/90 border border-ink/10 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:bg-white flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="WhatsApp Channel"
              >
                <MessageCircle size={15} />
              </a>

              {/* WhatsApp Direct Chat */}
              <a
                href="https://wa.me/8801928325460"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/90 border border-ink/10 text-slate-700 hover:text-teal-600 hover:border-teal-300 hover:bg-white flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="WhatsApp Direct Number"
              >
                <Phone size={15} />
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@HomeTutorProviderBD24"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/90 border border-ink/10 text-slate-700 hover:text-rose-600 hover:border-rose-300 hover:bg-white flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="YouTube Channel"
              >
                <Youtube size={15} />
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/hometutorprovider.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-xl bg-white/90 border border-ink/10 text-slate-700 hover:text-pink-600 hover:border-pink-300 hover:bg-white flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Instagram"
              >
                <Instagram size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display font-black text-ink text-xs uppercase tracking-wider border-l-2 border-primary pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link to="/jobs" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <Briefcase size={13} className="text-primary" />
                  <span>Tuition Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <GraduationCap size={13} className="text-primary" />
                  <span>Find Tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <Grid size={13} className="text-primary" />
                  <span>Categories</span>
                </Link>
              </li>
              <li>
                <Link to="/request-tutor" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <FileText size={13} className="text-primary" />
                  <span>Request a Tutor</span>
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <FileText size={13} className="text-primary" />
                  <span>Blogs & Articles</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-display font-black text-ink text-xs uppercase tracking-wider border-l-2 border-primary pl-2.5">
              Support
            </h3>
            <ul className="space-y-2 text-xs font-bold">
              <li>
                <Link to="/help-center" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-primary" />
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <FileText size={13} className="text-primary" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <Lock size={13} className="text-primary" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ink-muted hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <Phone size={13} className="text-primary" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us & BTPA Badge (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-display font-black text-ink text-xs uppercase tracking-wider border-l-2 border-primary pl-2.5">
              Contact Us
            </h3>
            <ul className="space-y-2 text-xs font-bold text-ink-muted">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>Mirpur 10, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" />
                <a href="tel:01928325460" className="hover:text-primary transition-colors text-ink">
                  01928325460 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Wallet size={14} className="text-pink-600 shrink-0" />
                <span>bKash Personal: <strong className="text-pink-600">01936456602</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-primary shrink-0" />
                <a href="mailto:hometutorproviderbd@gmail.com" className="hover:text-primary transition-colors truncate">
                  hometutorproviderbd@gmail.com
                </a>
              </li>
            </ul>

            {/* Compact BTPA Membership Badge */}
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/80 border border-primary/30 shadow-xs backdrop-blur-md mt-2">
              <ShieldCheck size={18} className="text-primary shrink-0" />
              <div className="flex flex-col text-[11px] leading-tight font-black">
                <span className="text-ink">Bangladesh Tutor Providers' Association - BTPA</span>
                <span className="text-[9px] text-primary uppercase font-mono mt-0.5">অনুমোদিত প্ল্যাটফর্ম • ID: 125</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright & Bottom Bar */}
        <div className="pt-4 border-t border-ink/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center text-xs text-ink font-bold">
          <p>© {new Date().getFullYear()} Home Tutor Provider BD. All rights reserved.</p>
          <p className="text-[11px] text-ink-muted">Committed to Quality Education & Verified Tutoring</p>
        </div>
      </div>
    </footer>
  );
}
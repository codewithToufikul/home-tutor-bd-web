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
  Info,
  UserCheck,
  FileText,
  UserPlus,
  PhoneCall,
  HelpCircle,
  FileCode,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  Send
} from 'lucide-react';
import logoImage from '@/src/lib/Home.png';

export default function Footer() {
  return (
    <footer className="relative bg-[#E2E8F0] text-ink overflow-hidden border-t-4 border-primary pt-16 pb-8">
      {/* Background Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rotate-45" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0b1329] rotate-45" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & All Social Links */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform flex items-center justify-center bg-white shrink-0">
                <img 
                  src={logoImage} 
                  alt="Home Tutor Provider BD" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-display font-bold text-ink">
                Home Tutor Provider <span className="text-primary">BD</span>
              </span>
            </Link>
            <p className="text-ink-muted text-sm leading-relaxed max-w-xs font-semibold">
              Bangladesh's most trusted platform for finding expert home tutors. We bridge the gap between quality education and accessibility.
            </p>
            
            {/* All Social Icons & Links (FB Group, FB Page, WhatsApp Channel, WhatsApp Direct, YouTube, Instagram) */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {/* Facebook Group */}
              <a
                href="https://www.facebook.com/groups/1562516141006044"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer"
                title="Facebook Group"
              >
                <Users size={18} />
              </a>
              {/* Facebook Page */}
              <a
                href="https://www.facebook.com/hometutorporoviderbd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer"
                title="Facebook Page"
              >
                <Facebook size={18} />
              </a>
              {/* WhatsApp Channel */}
              <a
                href="https://whatsapp.com/channel/0029VajPB27JJhzfwAyYWA3R"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer"
                title="WhatsApp Channel"
              >
                <MessageCircle size={18} />
              </a>
              {/* WhatsApp Number / Chat */}
              <a
                href="https://wa.me/8801928325460"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer"
                title="WhatsApp Direct Number"
              >
                <Phone size={18} />
              </a>
              {/* YouTube Channel */}
              <a
                href="https://www.youtube.com/@HomeTutorProviderBD24"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer"
                title="YouTube Channel"
              >
                <Youtube size={18} />
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/hometutorprovider.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center hover:scale-110 transition-all shadow-md cursor-pointer"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-black text-ink text-base mb-6 border-l-4 border-primary pl-3">Quick Links</h3>
            <ul className="space-y-3 font-bold">
              <li>
                <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <Briefcase size={14} className="text-primary" />
                  <span>Tuition Jobs</span>
                </Link>
              </li>
              <li>
                <Link to="/tutors" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <UserCheck size={14} className="text-primary" />
                  <span>Find Tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <Grid size={14} className="text-primary" />
                  <span>Categories</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <Info size={14} className="text-primary" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link to="/for-tutors" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <GraduationCap size={14} className="text-primary" />
                  <span>For Tutors</span>
                </Link>
              </li>
              <li>
                <Link to="/request-tutor" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <FileText size={14} className="text-primary" />
                  <span>Request a Tutor</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <UserPlus size={14} className="text-primary" />
                  <span>Tutor Registration</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <PhoneCall size={14} className="text-primary" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-display font-black text-ink text-base mb-6 border-l-4 border-primary pl-3">Support</h3>
            <ul className="space-y-3 font-bold">
              <li>
                <Link to="/help-center" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <HelpCircle size={14} className="text-primary" />
                  <span>Help Center</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <FileCode size={14} className="text-primary" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <Lock size={14} className="text-primary" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/safety-tips" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary transition-colors">
                  <ShieldAlert size={14} className="text-primary" />
                  <span>Safety Tips</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us & bKash / BTPA Membership Badge */}
          <div className="space-y-6">
            <div>
              <h3 className="font-display font-black text-ink text-base mb-6 border-l-4 border-primary pl-3">Contact Us</h3>
              <ul className="space-y-4 font-bold">
                <li className="flex items-start gap-3 text-sm text-ink-muted">
                  <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                  <span>Mirpur 10, Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-ink-muted">
                  <Phone size={18} className="text-primary shrink-0" />
                  <a href="tel:01928325460" className="hover:text-primary transition-colors text-ink">
                    01928325460 (WhatsApp)
                  </a>
                </li>
                {/* bKash Personal Number */}
                <li className="flex items-center gap-3 text-sm text-ink-muted">
                  <Wallet size={18} className="text-pink-600 shrink-0" />
                  <span>bKash Personal: <strong className="text-pink-600">01936456602</strong></span>
                </li>
                <li className="flex items-center gap-3 text-sm text-ink-muted">
                  <Mail size={18} className="text-primary shrink-0" />
                  <a href="mailto:hometutorproviderbd@gmail.com" className="hover:text-primary transition-colors">
                    hometutorproviderbd@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* BTPA Membership Badge */}
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white/80 border border-primary/30 shadow-sm backdrop-blur-md">
              <ShieldCheck size={22} className="text-primary shrink-0" />
              <div className="flex flex-col text-xs font-black">
                <span className="text-ink">Bangladesh Tutor Providers' Association - BTPA</span>
                <span className="text-[10px] text-primary uppercase font-mono mt-0.5">অনুমোদিত প্ল্যাটফর্ম • Membership ID: 125</span>
              </div>
            </div>

          </div>
        </div>

        {/* Copyright Text centered and bold */}
        <div className="pt-8 border-t border-ink/10 flex justify-center items-center text-center">
          <p className="text-ink text-xs font-black tracking-wide">
            © {new Date().getFullYear()} Home Tutor Provider BD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
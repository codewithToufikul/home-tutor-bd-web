import { Star, CheckCircle, MapPin, GraduationCap } from 'lucide-react';
import { TutorProfile } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface TutorCardProps {
  tutor: TutorProfile;
  className?: string;
}

export default function TutorCard({ tutor, className }: TutorCardProps) {
  return (
    <Link to={`/tutor/${tutor.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -8 }}
        className={cn(
          "bg-surface rounded-xl border border-ink/10 overflow-hidden shadow-sm hover:shadow-2xl transition-all group h-full flex flex-col relative",
          className
        )}
      >
        {/* Top-Right Brand Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-primary via-purple-600 to-pink-500 shadow-md">
            Home Tutor Provider BD
          </span>
        </div>

        {/* Premium Ribbon */}
        {tutor.isPremium && (
          <div className="absolute top-0 left-0 z-10 overflow-hidden w-24 h-24 pointer-events-none">
            <div className="absolute top-4 -left-8 w-32 py-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-[10px] font-black uppercase text-center -rotate-45 shadow-lg">
              PREMIUM
            </div>
          </div>
        )}
        
        {tutor.verified && !tutor.isPremium && (
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-primary/20">
              <CheckCircle size={16} className="text-primary" fill="currentColor" />
            </div>
          </div>
        )}
        
        {/* Image Section with Circular Animated Rainbow Ring */}
        <div className="relative pt-12 pb-6 px-6 flex justify-center bg-background/30">
          <div className="relative w-44 h-44 rounded-full p-1.5 bg-[linear-gradient(45deg,#ff0000,#ff7300,#fffb00,#48ff00,#00ffd5,#002bff,#7a00ff,#ff00c8,#ff0000)] bg-[length:400%_400%] animate-rainbow-ring shadow-xl">
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
              <img
                src={tutor.photoUrl || `https://picsum.photos/seed/${tutor.id}/400/400`}
                alt={tutor.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex-grow flex flex-col items-center text-center space-y-1">
          <h3 className="text-lg font-display font-bold text-[#001F3F] group-hover:text-primary transition-colors leading-tight">
            {tutor.name}
          </h3>
          
          <p className="text-xs text-ink-muted font-medium leading-tight">
            {tutor.university}
          </p>

          <p className="text-sm font-bold text-[#001F3F] leading-tight">
            {tutor.department || tutor.subjects[0]} ({tutor.department ? 'Dept' : tutor.subjects[0]})
          </p>

          {/* Location Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F0FE] border border-[#C2D7FF] rounded-md text-[#4285F4] font-bold text-[10px]">
            <MapPin size={12} className="text-[#EA4335]" fill="#EA4335" />
            <span className="text-ink-muted">{tutor.preferredAreas[0] || 'Dhaka'}</span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-auto">
          <div className="w-full py-4 bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white font-bold text-sm text-center group-hover:brightness-110 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-black/5 group-hover:bg-transparent transition-colors" />
            <span className="relative z-10">View Details</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
// src/components/CoachingCard.tsx
import { Star, MapPin, Users, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface CoachingCardProps {
  coaching: {
    id: string;
    name: string;
    location: string;
    logo?: string;
    rating?: number;
    isVerified?: boolean;
    totalStudents?: number;
  };
  className?: string;
}

export default function CoachingCard({ coaching, className }: CoachingCardProps) {
  return (
    <Link to={`/coaching/${coaching.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm hover:shadow-xl transition-all group h-full flex flex-col relative",
          className
        )}
      >
        {coaching.isVerified && (
          <div className="absolute top-3 right-3 z-20">
            <div className="bg-white/90 backdrop-blur-sm p-1 rounded-full shadow-sm border border-primary/20">
              <ShieldCheck size={16} className="text-primary" fill="currentColor" />
            </div>
          </div>
        )}

        <div className="relative pt-8 pb-4 px-4 flex justify-center bg-background/30">
          <div className="relative w-20 h-20 rounded-xl p-1 border-2 border-primary/20 shadow-md overflow-hidden bg-white">
            <img
              src={coaching.logo || `https://ui-avatars.com/api/?name=${coaching.name}&background=0D9488&color=fff&size=80`}
              alt={coaching.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="px-4 pb-4 flex-grow flex flex-col items-center text-center space-y-1">
          <h3 className="text-base font-display font-bold text-[#001F3F] group-hover:text-primary transition-colors leading-tight line-clamp-1">
            {coaching.name}
          </h3>
          <div className="flex items-center gap-1 text-amber-500 text-sm">
            <Star size={14} className="fill-amber-500" />
            <span className="font-bold">{coaching.rating || 4.0}</span>
          </div>
          <div className="flex items-center gap-1 text-ink-muted text-sm">
            <MapPin size={14} className="text-primary" />
            <span className="font-medium">{coaching.location}</span>
          </div>
          <div className="flex items-center gap-1 text-ink-muted text-sm">
            <Users size={14} className="text-primary" />
            <span className="font-medium">{coaching.totalStudents || 50}+ Students</span>
          </div>
        </div>

        <div className="mt-auto px-4 pb-4">
          <div className="w-full py-2.5 bg-purple-500/10 text-purple-600 text-xs font-bold rounded-lg text-center group-hover:bg-purple-500 group-hover:text-white transition-all">
            View Center
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
// src/components/StudentCard.tsx
import { MapPin, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { DEFAULT_PROFILE_IMAGE } from '@/src/constants';

interface StudentCardProps {
  student: {
    id: string;
    name: string;
    class: string;
    location: string;
    photoUrl?: string;
  };
  className?: string;
}

export default function StudentCard({ student, className }: StudentCardProps) {
  return (
    <Link to={`/student/${student.id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          "bg-white rounded-xl border border-ink/10 overflow-hidden shadow-sm hover:shadow-xl transition-all group h-full flex flex-col",
          className
        )}
      >
        <div className="relative pt-8 pb-4 px-4 flex justify-center bg-background/30">
          <div className="relative w-24 h-24 rounded-full p-1 border-2 border-primary/20 shadow-md">
            <div className="w-full h-full rounded-full overflow-hidden bg-white border-2 border-white">
              <img
                src={(student.photoUrl ?? '').trim() || DEFAULT_PROFILE_IMAGE}
                alt={student.name || 'Student'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex-grow flex flex-col items-center text-center space-y-1">
          <h3 className="text-base font-display font-bold text-[#001F3F] group-hover:text-primary transition-colors leading-tight">
            {student.name}
          </h3>
          <div className="flex items-center gap-1 text-ink-muted text-sm">
            <BookOpen size={14} className="text-primary" />
            <span className="font-medium">{student.class}</span>
          </div>
          <div className="flex items-center gap-1 text-ink-muted text-sm">
            <MapPin size={14} className="text-primary" />
            <span className="font-medium">{student.location}</span>
          </div>
        </div>

        <div className="mt-auto px-4 pb-4">
          <div className="w-full py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-lg text-center group-hover:bg-primary group-hover:text-white transition-all">
            View Profile
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
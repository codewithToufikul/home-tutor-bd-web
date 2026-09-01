import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import AIChatBot from '@/src/components/AIChatBot.tsx';

export default function FloatingActions() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Scroll Up Button */}
      <div className="fixed bottom-44 md:bottom-24 right-6 z-40">
        <AnimatePresence>
          {isVisible && (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="w-12 h-12 bg-slate-900/90 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-xl border border-white/20 hover:bg-primary transition-all cursor-pointer"
              title="Scroll to Top"
            >
              <ChevronUp size={22} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Smart AI Support Chatbot */}
      <AIChatBot />
    </>
  );
}


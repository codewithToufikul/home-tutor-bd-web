import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, ChevronUp } from 'lucide-react';
import { cn } from '@/src/lib/utils';

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

 const whatsappNumber = "8801928325460";

// \n ব্যবহার করা হয়েছে যাতে হোয়াটসঅ্যাপে মেসেজটি দুই লাইনে দেখায়
const textMessage = "Home Tutor Provider BD-তে স্বাগতম!\nআপনার কি টিউটর লাগবে নাকি টিউটোরিয়াল/টিউশন লাগবে?";

const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textMessage)}`;

  return (
    <div className="fixed bottom-28 md:bottom-8 right-6 flex flex-col gap-4 z-50">
      {/* WhatsApp Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 transition-all"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={28} fill="currentColor" />
      </motion.a>

      {/* Scroll Up Button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="w-14 h-14 bg-ink text-white rounded-full flex items-center justify-center shadow-2xl shadow-ink/20 border border-white/10 transition-all"
            title="Scroll to Top"
          >
            <ChevronUp size={28} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  // আপনার অফিশিয়াল হোয়াটসঅ্যাপ নম্বর: 8801928325460
  const whatsappUrl = "https://api.whatsapp.com/send?phone=8801928325460&text=Hello%20Home%20Tutor%20Provider%20BD,%20I%20need%20a%20tutor.";

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-2xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
    >
      <MessageCircle size={28} className="fill-current" />
    </a>
  );
}
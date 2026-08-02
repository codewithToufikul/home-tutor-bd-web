import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  User, 
  GraduationCap, 
  ShieldCheck, 
  CreditCard, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronRight,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Learn how to create an account and start using our platform.',
    color: 'bg-blue-500'
  },
  {
    id: 'for-parents',
    title: 'For Parents',
    icon: User,
    description: 'How to find, interview, and hire the perfect tutor for your child.',
    color: 'bg-emerald-500'
  },
  {
    id: 'for-tutors',
    title: 'For Tutors',
    icon: GraduationCap,
    description: 'Tips on building a great profile and finding high-paying jobs.',
    color: 'bg-primary'
  },
  {
    id: 'safety',
    title: 'Safety & Trust',
    icon: ShieldCheck,
    description: 'Our verification process and tips for staying safe.',
    color: 'bg-red-500'
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: CreditCard,
    description: 'Understanding our zero-commission model and payment methods.',
    color: 'bg-purple-500'
  },
  {
    id: 'policies',
    title: 'Policies',
    icon: FileText,
    description: 'Read our terms of service and privacy guidelines.',
    color: 'bg-zinc-600'
  }
];

const FAQS = [
  {
    question: 'How do I request a tutor?',
    answer: 'You can request a tutor by clicking the "Request a Tutor" button on the navigation bar. Fill out the form with your requirements, and our team will match you with the best tutors.'
  },
  {
    question: 'Is there any registration fee for tutors?',
    answer: 'Registration is completely free for tutors. However, we have premium verification options to help you stand out.'
  },
  {
    question: 'How does the payment system work?',
    answer: 'We operate on a zero-commission model. Parents pay tutors directly. We do not take any cut from the monthly tuition fee.'
  },
  {
    question: 'What if I am not satisfied with the tutor?',
    answer: 'We offer a trial class for every tutor. If you are not satisfied after the trial, you can request another tutor at no extra cost.'
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-ink text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold tracking-tight">
                How can we <span className="text-primary">help?</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Search our knowledge base or browse categories below to find answers to your questions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto relative"
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" size={24} />
              <input
                type="text"
                placeholder="Search for help topics (e.g. 'payments', 'verification')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-6 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-lg shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HELP_CATEGORIES.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -8 }}
              onClick={() => navigate('/contact')}
              className="group cursor-pointer"
            >
              <div className="bg-surface p-8 rounded-[2.5rem] border border-ink/5 shadow-xl shadow-ink/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 h-full">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", category.color)}>
                  <category.icon size={28} />
                </div>
                <h3 className="text-xl font-display font-bold text-ink mb-3 group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
                <p className="text-ink-muted text-sm leading-relaxed mb-6">
                  {category.description}
                </p>
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  View Articles
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Popular FAQs */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-display font-bold text-ink">Popular Questions</h2>
          <p className="text-ink-muted">Quick answers to the most common questions.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface rounded-3xl border border-ink/5 overflow-hidden"
            >
              <details className="group">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-bold text-ink flex items-center gap-3">
                    <HelpCircle size={20} className="text-primary" />
                    {faq.question}
                  </span>
                  <ChevronRight size={20} className="text-ink-muted group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 pt-2 text-ink-muted text-sm leading-relaxed border-t border-ink/5 bg-ink/[0.02]">
                  {faq.answer}
                </div>
              </details>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink rounded-[3rem] p-12 lg:p-20 text-center space-y-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 blur-[120px] translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-white">
              Still need help?
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Our support team is available to assist you with any issues or questions you might have.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* WhatsApp Channel */}
            <a 
              href="https://whatsapp.com/channel/0029VajPB27JJhzfwAyYWA3R" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-all cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto bg-emerald-500">
                <MessageCircle size={24} />
              </div>
              <h4 className="text-white font-bold">WhatsApp Channel</h4>
              <p className="text-white/60 text-sm">Join our channel</p>
            </a>

            {/* Direct Call Link */}
            <a 
              href="tel:+8801928325460" 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-all cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto bg-primary">
                <Phone size={24} />
              </div>
              <h4 className="text-white font-bold">Call Us (Guardians)</h4>
              <p className="text-white/60 text-sm">+880 1928-325460</p>
            </a>

            {/* Direct Mail Link */}
            <a 
              href="mailto:hometutorproviderbd@gmail.com" 
              className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-[2rem] space-y-4 hover:bg-white/10 transition-all cursor-pointer block"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto bg-blue-500">
                <Mail size={24} />
              </div>
              <h4 className="text-white font-bold">Email Us</h4>
              <p className="text-white/60 text-sm">hometutorproviderbd@gmail.com</p>
            </a>
          </div>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <AlertCircle size={24} />
          </div>
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-bold text-amber-900">Important Safety Notice</h4>
            <p className="text-sm text-amber-700">
              Always verify the identity of tutors and never pay in advance before a trial class. Report any suspicious activity immediately.
            </p>
          </div>
          <Link to="/contact" className="md:ml-auto bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-amber-700 transition-all cursor-pointer text-center">
            Safety Guidelines
          </Link>
        </div>
      </section>
    </div>
  );
}
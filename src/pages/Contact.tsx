import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe } from 'lucide-react';
import { useState } from 'react';
import { ContactService } from '@/src/services/contactService.ts';

export default function Contact() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await ContactService.create({
        name: formState.name,
        email: formState.email,
        subject: formState.subject,
        message: formState.message,
        isRead: false,
      });

      alert('ধন্যবাদ! আপনার মেসেজটি সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই যোগাযোগ করব।');
      setFormState({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send contact message:', error);
      alert('মেসেজ পাঠাতে সমস্যার সম্মুখীন হচ্ছি। দয়া করে পরে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: '+880 1928-325460',
      subDetails: 'Sat-Thu, 9am-8pm',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: 'hometutorproviderbd@gmail.com',
      subDetails: 'Online support 24/7',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: 'Mirpur 10, Dhaka',
      subDetails: 'Dhaka, Bangladesh',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-[#001F3F] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl lg:text-6xl font-display font-bold text-white tracking-tight">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactInfo.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface p-8 rounded-3xl border border-ink/5 shadow-xl shadow-ink/5 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${item.bgColor} ${item.color}`}>
                <item.icon size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-[#001F3F] mb-2">{item.title}</h3>
              <p className="text-ink font-semibold mb-1">{item.details}</p>
              <p className="text-ink-muted text-sm">{item.subDetails}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main Contact Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-surface p-8 lg:p-12 rounded-[2.5rem] border border-ink/5 shadow-sm"
          >
            <div className="space-y-2 mb-8">
              <h2 className="text-3xl font-display font-bold text-ink">Send us a Message</h2>
              <p className="text-ink-muted">Fill out the form below and our team will get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-ink uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink uppercase tracking-wider">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="How can we help?"
                  className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink uppercase tracking-wider">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Your message here..."
                  className="w-full px-4 py-4 rounded-2xl border border-ink/5 bg-background text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Send Message
              </button>
            </form>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-ink tracking-tight">Why Contact Us?</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: MessageSquare,
                    title: 'Expert Guidance',
                    desc: 'Our education consultants are ready to help you find the perfect tutor match.'
                  },
                  {
                    icon: Clock,
                    title: 'Quick Response',
                    desc: 'We pride ourselves on our rapid response time, usually within a few hours.'
                  },
                  {
                    icon: Globe,
                    title: 'Wide Coverage',
                    desc: 'Serving all major areas in Dhaka and expanding to other cities soon.'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                      <item.icon size={24} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-ink">{item.title}</h4>
                      <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative rounded-[2.5rem] overflow-hidden border border-ink/5 shadow-sm h-64 bg-ink/5">
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <MapPin size={48} className="text-primary/20 mb-4" />
                <p className="text-ink-muted font-medium">Home Tutor Provider BD Office</p>
                <p className="text-xs text-ink-muted/60 mt-1">Mirpur 10, Dhaka, Bangladesh</p>
              </div>
            </div>

            {/* Real Social Links */}
            <div className="space-y-4">
              <h3 className="font-bold text-ink">Follow our journey</h3>
              <div className="flex gap-4">
                <a
                  href="https://www.facebook.com/hometutorporoviderbd"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-surface border border-ink/5 text-sm font-medium text-ink-muted hover:text-primary hover:border-primary/30 transition-all"
                >
                  Facebook
                </a>
                <a
                  href="https://www.youtube.com/@HomeTutorProviderBD24"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-surface border border-ink/5 text-sm font-medium text-ink-muted hover:text-rose-600 hover:border-rose-600/30 transition-all"
                >
                  YouTube
                </a>
                <a
                  href="https://wa.me/8801928325460"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-surface border border-ink/5 text-sm font-medium text-ink-muted hover:text-emerald-600 hover:border-emerald-600/30 transition-all"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
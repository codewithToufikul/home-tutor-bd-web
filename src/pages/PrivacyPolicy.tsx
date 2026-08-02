import { motion } from 'motion/react';
import { Shield, Lock, Eye, Database, UserCheck, Bell, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: "We collect information you provide directly to us when you create an account, such as your name, email address, phone number, and educational background. For tutors, we also collect verification documents like NID/Passport and academic certificates."
    },
    {
      title: "2. How We Use Your Information",
      icon: Eye,
      content: "Your information is used to facilitate the matching process between tutors and students. We use your contact details to send important notifications, verify your identity, and improve our platform's services."
    },
    {
      title: "3. Data Sharing and Disclosure",
      icon: UserCheck,
      content: "We do not sell your personal information to third parties. Your profile information (excluding private contact details) is visible to other users on the platform to help them make informed decisions. Contact details are only shared when a match is confirmed."
    },
    {
      title: "4. Data Security",
      icon: Shield,
      content: "We implement a variety of security measures to maintain the safety of your personal information. Your data is stored on secure servers and is only accessible by a limited number of persons who have special access rights to such systems."
    },
    {
      title: "5. Your Rights and Choices",
      icon: Lock,
      content: "You have the right to access, update, or delete your personal information at any time through your account settings. You can also opt-out of receiving promotional communications from us."
    },
    {
      title: "6. Changes to This Policy",
      icon: Bell,
      content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last updated' date at the top."
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-ink text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold tracking-tight">
                Privacy <span className="text-primary">Policy</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Last updated: April 6, 2026. Your privacy is our top priority at Home Tutor Provider BD.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-surface p-8 md:p-16 rounded-[3rem] border border-ink/5 shadow-2xl shadow-ink/5 space-y-12">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <section.icon size={20} />
                </div>
                <h2 className="text-2xl font-display font-bold text-ink">{section.title}</h2>
              </div>
              <p className="text-ink-muted leading-relaxed pl-14">
                {section.content}
              </p>
            </motion.div>
          ))}

          <div className="pt-12 border-t border-ink/5">
            <div className="bg-primary/5 p-8 rounded-3xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-ink">Contact Our Privacy Officer</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  If you have any questions or concerns about our Privacy Policy or data practices, please reach out to our dedicated privacy team.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-ink/5">
                  <Mail size={18} className="text-primary" />
                  <span className="text-sm font-bold text-ink">privacy@hometutorproviderbd.com</span>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

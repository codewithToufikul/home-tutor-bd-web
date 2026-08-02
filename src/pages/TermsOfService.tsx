import { motion } from 'motion/react';
import { Shield, Scale, UserCheck, AlertCircle, FileText, Lock } from 'lucide-react';

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: "By accessing and using Home Tutor Provider BD, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of such changes."
    },
    {
      title: "2. User Eligibility",
      icon: UserCheck,
      content: "Users must be at least 18 years of age to create an account. Parents or legal guardians may create accounts on behalf of minors. Tutors must provide accurate information regarding their educational background and identity during the registration process."
    },
    {
      title: "3. Platform Role",
      icon: Scale,
      content: "Home Tutor Provider BD acts as a matching platform between students/parents and tutors. We do not employ tutors, nor are we responsible for the quality of tutoring provided. All tutoring arrangements, including schedules and payments, are made directly between the tutor and the parent/student."
    },
    {
      title: "4. Zero-Commission Policy",
      icon: Shield,
      content: "We operate on a zero-commission model. We do not take any percentage of the monthly tuition fees. However, we may offer premium services or verification badges for a fee to help users enhance their profiles."
    },
    {
      title: "5. Safety and Conduct",
      icon: AlertCircle,
      content: "Users are responsible for their own safety. We strongly recommend meeting in safe, public locations for the first time and verifying all credentials. Any form of harassment, fraud, or illegal activity on the platform will result in immediate account termination."
    },
    {
      title: "6. Privacy and Data",
      icon: Lock,
      content: "Your privacy is important to us. Please refer to our Privacy Policy to understand how we collect, use, and protect your personal information. By using our platform, you consent to our data practices as described in the Privacy Policy."
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
                Terms of <span className="text-primary">Service</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Last updated: April 6, 2026. Please read these terms carefully before using our platform.
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
            <div className="bg-primary/5 p-8 rounded-3xl space-y-4">
              <h3 className="text-xl font-display font-bold text-ink">Questions about our terms?</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                If you have any questions regarding these Terms of Service, please contact our legal team at legal@hometutorproviderbd.com or visit our Help Center.
              </p>
              <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

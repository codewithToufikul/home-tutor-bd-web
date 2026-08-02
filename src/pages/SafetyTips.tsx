import { Shield, UserCheck, Eye, PhoneCall, Home, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function SafetyTips() {
  const parentTips = [
    {
      icon: UserCheck,
      title: "Verify Identity",
      description: "Always ask for and verify the tutor's national ID card, educational certificates, and university ID before the first session."
    },
    {
      icon: Eye,
      title: "Supervise Sessions",
      description: "For the first few sessions, ensure an adult is present in the house. Keep the tutoring area in a common space if possible."
    },
    {
      icon: PhoneCall,
      title: "Emergency Contacts",
      description: "Keep emergency contact numbers handy and ensure your child knows who to call if they feel uncomfortable."
    },
    {
      icon: Home,
      title: "Public First Meeting",
      description: "Consider meeting the tutor in a public place (like a cafe or library) for the initial interview before inviting them home."
    }
  ];

  const tutorTips = [
    {
      icon: Lock,
      title: "Protect Personal Info",
      description: "Don't share sensitive personal information like bank details or home address until a formal agreement is reached."
    },
    {
      icon: Shield,
      title: "Verify the Family",
      description: "Before going to a new home, try to verify the family's background. Ask for their official contact number and address."
    },
    {
      icon: AlertTriangle,
      title: "Trust Your Instincts",
      description: "If a situation feels unsafe or uncomfortable at any point, leave immediately and report the incident to us."
    },
    {
      icon: CheckCircle2,
      title: "Clear Communication",
      description: "Clearly define the subjects, timing, and payment terms in writing before starting the tuition."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background pb-24"
    >
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6"
            >
              <Shield size={16} />
              Your Safety is Our Priority
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-6 leading-tight">
              Safety Tips for a <span className="text-primary">Secure Learning</span> Experience
            </h1>
            <p className="text-lg text-ink-muted leading-relaxed">
              At Home Tutor Provider BD, we are committed to providing a safe environment for both students and tutors. Please follow these guidelines to ensure a secure and productive experience.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* For Parents & Students */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-ink mb-4">For Parents & Students</h2>
            <p className="text-ink-muted">Essential steps to take when hiring a tutor to ensure your child's safety and academic success.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {parentTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-ink/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <tip.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">{tip.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* For Tutors */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-display font-bold text-ink mb-4">For Tutors</h2>
            <p className="text-ink-muted">Guidelines to help tutors maintain professional boundaries and ensure their own safety while working.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tutorTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-ink/5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                  <tip.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-ink mb-3">{tip.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{tip.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reporting Section */}
        <section className="bg-ink text-white rounded-[2rem] p-8 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
                See Something suspicious? <span className="text-primary">Report it immediately.</span>
              </h2>
              <p className="text-ink-muted leading-relaxed">
                We take all safety concerns seriously. If you encounter any suspicious activity, harassment, or unprofessional behavior, please let us know right away.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="tel:+8801700000000" 
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
                >
                  <PhoneCall size={20} />
                  Call Support
                </a>
                <a 
                  href="mailto:safety@hometutorproviderbd.com" 
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <Mail size={20} />
                  Email Safety Team
                </a>
              </div>
            </div>
            <div className="w-full md:w-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">24/7 Monitoring</p>
                    <p className="text-xs text-ink-muted">Our team is always here to help.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
                    <Lock size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Privacy Protected</p>
                    <p className="text-xs text-ink-muted">Your reports are confidential.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

function Mail({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

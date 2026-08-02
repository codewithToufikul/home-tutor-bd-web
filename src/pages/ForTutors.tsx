import { motion } from 'motion/react';
import { GraduationCap, ShieldCheck, Briefcase, Award, CheckCircle2, ChevronRight, Star, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

const TakaIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <span className={cn("inline-flex items-center justify-center font-bold", className)} style={{ fontSize: size }}>
    ৳
  </span>
);

export default function ForTutors() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-12 lg:pt-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <GraduationCap size={14} />
                  Join Our Tutor Community
                </div>
                <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-ink leading-[1.1] tracking-tight">
                  Turn Your Knowledge <br />
                  Into <span className="text-primary">Income.</span>
                </h1>
                <p className="text-lg text-ink-muted max-w-lg leading-relaxed">
                  Join Bangladesh's fastest-growing home tutor platform. Build your digital CV, find high-paying tuition jobs, and grow your teaching career.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2"
                >
                  Register as a Tutor
                  <ChevronRight size={20} />
                </Link>
                <Link
                  to="/jobs"
                  className="bg-surface border border-ink/5 text-ink px-8 py-4 rounded-2xl font-bold shadow-sm hover:bg-ink/5 transition-all active:scale-95"
                >
                  Browse Jobs
                </Link>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-ink">৳50k+</span>
                  <span className="text-xs text-ink-muted font-bold uppercase tracking-wider">Avg. Monthly Income</span>
                </div>
                <div className="h-10 w-px bg-ink/10" />
                <div className="flex flex-col">
                  <span className="text-2xl font-display font-bold text-ink">500+</span>
                  <span className="text-xs text-ink-muted font-bold uppercase tracking-wider">New Jobs Daily</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/5 rounded-[2.5rem] blur-3xl" />
              <div className="relative bg-surface p-8 rounded-[2.5rem] border border-ink/5 shadow-2xl shadow-primary/10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-ink/5">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink">Verified Badge</h4>
                      <p className="text-xs text-ink-muted">Get 3x more job offers with a verified profile.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-ink/5">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                      <Star size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink">Premium Profile</h4>
                      <p className="text-xs text-ink-muted">Appear at the top of search results for students.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-2xl border border-ink/5">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink">Direct Matching</h4>
                      <p className="text-xs text-ink-muted">Our AI matches you with the best-fit students.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-4xl font-display font-bold text-ink">Why Tutors Love Us</h2>
          <p className="text-ink-muted">We provide the tools and support you need to succeed as a professional educator.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              title: 'Zero Commission',
              desc: 'Keep 100% of your earnings. We don\'t take a cut from your monthly salary.',
              icon: TakaIcon
            },
            {
              title: 'Flexible Schedule',
              desc: 'Choose your own hours and preferred locations. Teach when and where you want.',
              icon: Briefcase
            },
            {
              title: 'Professional Growth',
              desc: 'Build your reputation with verified reviews and ratings from parents.',
              icon: Award
            }
          ].map((benefit, i) => (
            <div key={i} className="bg-surface p-10 rounded-[2.5rem] border border-ink/5 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <benefit.icon size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-ink mb-4">{benefit.title}</h3>
              <p className="text-ink-muted leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-primary/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <h2 className="text-4xl font-display font-bold text-ink leading-tight">How to Get Started?</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Create Profile', desc: 'Sign up and build your digital CV with your education and experience.' },
                  { step: '02', title: 'Get Verified', desc: 'Upload your NID and certificates for our team to verify your identity.' },
                  { step: '03', title: 'Apply for Jobs', desc: 'Browse the job board and apply to tuitions that match your criteria.' },
                  { step: '04', title: 'Start Teaching', desc: 'Connect with parents, take a trial class, and start your journey.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-display font-black text-primary/20">{item.step}</span>
                    <div className="space-y-2">
                      <h4 className="text-xl font-display font-bold text-ink">{item.title}</h4>
                      <p className="text-ink-muted leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://picsum.photos/seed/tutor-teaching/800/1000"
                alt="Tutor teaching"
                className="rounded-[3rem] shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -left-10 bg-surface p-8 rounded-3xl shadow-2xl border border-ink/5 max-w-xs space-y-4">
                <div className="flex items-center gap-2 text-secondary font-bold">
                  <CheckCircle2 size={20} />
                  Verified Success
                </div>
                <p className="text-sm text-ink-muted italic">
                  "Home Tutor Provider BD helped me find 3 high-paying tuitions within my first week of joining. The verification process is very professional."
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/100?img=12" className="w-10 h-10 rounded-full" alt="" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-sm font-bold text-ink">Rakibul Hasan</p>
                    <p className="text-xs text-ink-muted">Tutor since 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink rounded-[3rem] p-12 lg:p-24 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 blur-[120px] translate-x-1/2 translate-y-1/2" />
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-6xl font-display font-bold text-white leading-tight">
              Ready to start your <br /> teaching career?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto text-lg">
              Join thousands of expert tutors and start making an impact today. Registration is free and takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link
                to="/register"
                className="bg-primary text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 text-lg"
              >
                Create Your Profile
              </Link>
              <Link
                to="/jobs"
                className="bg-white/10 text-white px-10 py-5 rounded-2xl font-bold backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 text-lg"
              >
                Browse Available Jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

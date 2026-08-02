import { motion } from 'motion/react';
import { Target, Users, Award, ShieldCheck, Heart, Zap, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const stats = [
    { label: 'Active Tutors', value: '10,000+' },
    { label: 'Happy Students', value: '25,000+' },
    { label: 'Cities Covered', value: '15+' },
    { label: 'Success Rate', value: '98%' }
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      desc: 'To bridge the gap between quality education and accessibility by connecting students with the best tutors across Bangladesh.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Heart,
      title: 'Our Vision',
      desc: 'To become the most trusted and innovative platform for personalized learning, empowering every student to reach their full potential.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Zap,
      title: 'Our Impact',
      desc: 'Transforming the traditional tutoring landscape through technology, making it easier for parents to find verified experts.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  const team = [
    {
      name: 'Sarah Ahmed',
      role: 'Founder & CEO',
      image: 'https://picsum.photos/seed/sarah/400/400',
      socials: [
        { icon: Facebook, href: 'https://www.facebook.com/groups/1562516141006044' },
        { icon: MessageCircle, href: 'https://whatsapp.com/channel/0029VajPB27JJhzfwAyYWA3R' },
        { icon: Youtube, href: 'https://www.youtube.com/@HomeTutorProviderBD24' }
      ]
    },
    {
      name: 'Tanvir Hossain',
      role: 'Head of Operations',
      image: 'https://picsum.photos/seed/tanvir/400/400',
      socials: [
        { icon: Facebook, href: 'https://www.facebook.com/groups/1562516141006044' },
        { icon: Instagram, href: 'https://www.instagram.com/hometutorprovider.bd/' },
        { icon: Youtube, href: 'https://www.youtube.com/@HomeTutorProviderBD24' }
      ]
    },
    {
      name: 'Nabila Islam',
      role: 'Tutor Relations Manager',
      image: 'https://picsum.photos/seed/nabila/400/400',
      socials: [
        { icon: MessageCircle, href: 'https://whatsapp.com/channel/0029VajPB27JJhzfwAyYWA3R' },
        { icon: Instagram, href: 'https://www.instagram.com/hometutorprovider.bd/' },
        { icon: Youtube, href: 'https://www.youtube.com/@HomeTutorProviderBD24' }
      ]
    },
    {
      name: 'Arifur Rahman',
      role: 'Lead Developer',
      image: 'https://picsum.photos/seed/arif/400/400',
      socials: [
        { icon: Facebook, href: 'https://www.facebook.com/groups/1562516141006044' },
        { icon: MessageCircle, href: 'https://whatsapp.com/channel/0029VajPB27JJhzfwAyYWA3R' },
        { icon: Instagram, href: 'https://www.instagram.com/hometutorprovider.bd/' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 bg-[#001F3F] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-white tracking-tight leading-tight">
                Empowering the Next Generation of <span className="text-primary">Learners</span>
              </h1>
              <p className="text-xl text-white/70 leading-relaxed">
                Home Tutor Provider BD is Bangladesh's leading platform dedicated to connecting students with expert home tutors. We believe that every student deserves personalized attention to excel in their academic journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-surface p-6 md:p-8 rounded-3xl border border-ink/5 shadow-xl shadow-ink/5 text-center"
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-bold text-ink-muted uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink tracking-tight">Our Story</h2>
            <div className="space-y-4 text-ink-muted leading-relaxed">
              <p>
                Founded in 2020, Home Tutor Provider BD started with a simple observation: parents were struggling to find reliable, verified, and qualified tutors for their children, while talented educators lacked a professional platform to showcase their skills.
              </p>
              <p>
                We set out to build a bridge. A bridge that uses technology to ensure safety, quality, and convenience. Today, we are proud to be the most trusted name in home tutoring across Bangladesh, serving thousands of families every month.
              </p>
              <p>
                Our platform isn't just about matching; it's about fostering meaningful educational relationships that lead to real academic growth and confidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold">
                <ShieldCheck size={18} />
                Verified Tutors
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold">
                <Award size={18} />
                Quality Education
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold">
                <Users size={18} />
                Trusted by Parents
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <img 
                src="https://picsum.photos/seed/education/800/800" 
                alt="Education" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl border border-ink/5 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <Award size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-ink">#1 Platform</div>
                  <div className="text-sm text-ink-muted">In Bangladesh</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-ink/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink tracking-tight">Our Core Values</h2>
            <p className="text-ink-muted max-w-2xl mx-auto">The principles that guide everything we do at Home Tutor Provider BD.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-surface p-8 rounded-[2.5rem] border border-ink/5 shadow-sm transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500 ${value.bgColor} ${value.color}`}>
                  <value.icon size={32} />
                </div>
                <h3 className="text-2xl font-display font-bold text-ink mb-4">{value.title}</h3>
                <p className="text-ink-muted text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-ink tracking-tight">Meet Our Team</h2>
          <p className="text-ink-muted max-w-2xl mx-auto">The passionate individuals working behind the scenes to revolutionize education in Bangladesh.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <div className="relative mb-6 overflow-hidden rounded-[2rem] aspect-[4/5]">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8">
                  <div className="flex gap-3">
                    {member.socials.map((social, j) => {
                      const IconComponent = social.icon;
                      return (
                        <a 
                          key={j} 
                          href={social.href} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:scale-110 transition-all cursor-pointer"
                        >
                          <IconComponent size={18} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-display font-bold text-ink group-hover:text-primary transition-colors">{member.name}</h3>
                <p className="text-sm font-medium text-ink-muted">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-primary rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl lg:text-5xl font-display font-bold text-white tracking-tight">Ready to start your learning journey?</h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">Join thousands of students who have already found their perfect tutor match with us.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/tutors"
                className="bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-xl hover:bg-ink hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                Find a Tutor
              </Link>
              <Link 
                to="/register"
                className="bg-white/10 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95 cursor-pointer"
              >
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, CheckCircle2, MessageSquare, Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetServicesQuery, ITServiceItem } from '@/src/services/itServiceApi';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';

const DEFAULT_SERVICES: Partial<ITServiceItem>[] = [
  {
    _id: 'web-dev-preset',
    title: 'Custom Web Application Development',
    slug: 'custom-web-development',
    category: 'web_development',
    shortDescription: 'Modern, blazing-fast web applications built with React, Next.js, Node.js, and scalable cloud databases.',
    deliveryTime: '5–10 Days',
    features: ['Responsive UI & UX', 'Fullstack API Integration', 'SEO & Fast Performance', 'Admin Dashboard Included'],
    technologies: ['React', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'app-dev-preset',
    title: 'Mobile App Development (iOS & Android)',
    slug: 'mobile-app-development',
    category: 'app_development',
    shortDescription: 'Cross-platform native-performance mobile applications using Flutter & React Native with push notifications.',
    deliveryTime: '10–20 Days',
    features: ['Cross-Platform iOS & Android', 'Firebase & API Sync', 'Play Store & App Store Publish', 'Real-time Messaging'],
    technologies: ['Flutter', 'React Native', 'Firebase', 'REST API'],
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'ui-ux-preset',
    title: 'UI/UX Design & Brand Prototyping',
    slug: 'ui-ux-design',
    category: 'ui_ux_design',
    shortDescription: 'World-class, high-converting Figma UI/UX designs, wireframes, and design systems for web and mobile.',
    deliveryTime: '3–7 Days',
    features: ['Interactive Figma Prototypes', 'Modern Design Systems', 'User Journey & Wireframing', 'Developer-Ready Assets'],
    technologies: ['Figma', 'Adobe XD', 'Prototyping', 'Design Systems'],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
  },
  {
    _id: 'custom-software-preset',
    title: 'School & Tuition Management ERP',
    slug: 'school-tuition-management-software',
    category: 'custom_software',
    shortDescription: 'Complete automation software for schools, coaching centers, and tuition academies with billing and SMS.',
    deliveryTime: '15–30 Days',
    features: ['Student & Staff Portal', 'Automated Fee & Invoicing', 'SMS & Attendance System', 'Analytics & Reports'],
    technologies: ['React', 'Express', 'PostgreSQL', 'Cloud Backup'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
  },
];

const CATEGORY_NAMES: Record<string, string> = {
  web_development: 'Web Development',
  app_development: 'Mobile Apps',
  ui_ux_design: 'UI/UX Design',
  custom_software: 'Custom Software',
  digital_marketing: 'Digital Marketing',
  cloud_devops: 'Cloud & DevOps',
  ai_data_solutions: 'AI & Data',
  other: 'IT Solutions',
};

export default function ITServicesSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: servicesData } = useGetServicesQuery({ isActive: true });

  const displayedServices = useMemo(() => {
    const rawList = servicesData?.data && servicesData.data.length > 0 ? servicesData.data : DEFAULT_SERVICES;
    if (selectedCategory === 'all') return rawList;
    return rawList.filter((s) => s.category === selectedCategory);
  }, [servicesData, selectedCategory]);

  const handleConsultChat = () => {
    const targetUrl = !user
      ? '/login'
      : ['admin', 'super_admin', 'moderator'].includes(user.role)
      ? '/admin/inbox'
      : user.role === 'guardian'
      ? '/guardian/messages'
      : user.role === 'tutor'
      ? '/tutor/messages'
      : '/student/messages';
    navigate(targetUrl);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/70 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
              <Zap size={14} />
              <span>Home Tutor BD Tech Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-ink tracking-tight">
              Premium <span className="text-primary">IT & Software</span> Services
            </h2>
            <p className="text-sm sm:text-base text-ink-muted font-medium leading-relaxed">
              Beyond tutoring — our expert development team builds world-class websites, mobile apps, and custom software for your business, school, or startup.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink hover:bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95 shrink-0 self-start md:self-auto"
          >
            <span>Browse All IT Services</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'web_development', label: 'Web Development' },
            { id: 'app_development', label: 'Mobile Apps' },
            { id: 'ui_ux_design', label: 'UI/UX Design' },
            { id: 'custom_software', label: 'Custom Software' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer",
                selectedCategory === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                  : "bg-white text-ink-muted hover:text-ink hover:bg-slate-100 border border-slate-200/70 shadow-2xs"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedServices.slice(0, 4).map((service, index) => {
            const serviceId = service._id || service.slug || String(index);
            const detailUrl = `/services/${service.slug || service._id}`;

            return (
              <motion.div
                key={serviceId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group bg-white rounded-[32px] border border-slate-200/80 hover:border-primary/40 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={service.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-primary tracking-wider shadow-sm">
                      {CATEGORY_NAMES[service.category || 'web_development'] || 'IT Service'}
                    </span>
                    {service.deliveryTime && (
                      <span className="absolute bottom-3 left-3 text-white text-[11px] font-bold">
                        ⏱ {service.deliveryTime}
                      </span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black text-ink group-hover:text-primary transition-colors line-clamp-2">
                        {service.title}
                      </h3>
                      <p className="text-xs text-ink-muted leading-relaxed line-clamp-2 font-medium">
                        {service.shortDescription}
                      </p>
                    </div>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        {service.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tech Pills */}
                    {service.technologies && service.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {service.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-auto flex items-center justify-end gap-2">
                  <Link
                    to={detailUrl}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={handleConsultChat}
                    className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Consult</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-primary to-teal-800 rounded-[36px] p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="space-y-3 max-w-xl z-10">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider">
              🚀 Custom Requirement?
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-black leading-tight">
              Need a custom website, mobile app, or school management system?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              Chat directly with our senior software architects to get a free project estimate and quotation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 z-10">
            <Link
              to="/services"
              className="px-6 py-3.5 bg-white text-primary hover:bg-slate-100 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl transition-all active:scale-95"
            >
              Browse All Services
            </Link>
            <button
              onClick={handleConsultChat}
              className="px-6 py-3.5 bg-ink/30 hover:bg-ink/50 text-white rounded-2xl text-xs font-black uppercase tracking-wider border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageSquare size={15} />
              <span>Chat with Admin</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

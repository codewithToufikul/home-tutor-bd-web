import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Code, Smartphone, Layout, Cpu, Globe, Rocket, 
  ArrowRight, CheckCircle2, Sparkles, MessageSquare, 
  Filter, ShieldCheck, Zap, Phone, Star, RefreshCw, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGetServicesQuery, ITServiceItem } from '@/src/services/itServiceApi';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Services', icon: Sparkles },
  { id: 'web_development', label: 'Web Apps', icon: Globe },
  { id: 'app_development', label: 'Mobile Apps', icon: Smartphone },
  { id: 'ui_ux_design', label: 'UI/UX Design', icon: Layout },
  { id: 'custom_software', label: 'Custom Software', icon: Code },
  { id: 'digital_marketing', label: 'Digital Marketing', icon: Rocket },
  { id: 'cloud_devops', label: 'Cloud & DevOps', icon: Cpu },
  { id: 'ai_data_solutions', label: 'AI & Data', icon: Zap },
];

const CATEGORY_NAMES: Record<string, string> = {
  web_development: 'Web Development',
  app_development: 'Mobile Apps',
  ui_ux_design: 'UI/UX Design',
  custom_software: 'Custom ERP & Software',
  digital_marketing: 'Digital Marketing & SEO',
  cloud_devops: 'Cloud & DevOps',
  ai_data_solutions: 'AI & Data Solutions',
  other: 'IT Solutions',
};

export default function ITServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: servicesData, isLoading, refetch } = useGetServicesQuery({ isActive: true });

  const services = useMemo(() => servicesData?.data || [], [servicesData]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.shortDescription.toLowerCase().includes(q) ||
        s.features.some((f) => f.toLowerCase().includes(q)) ||
        s.technologies.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  const handleConsultChat = (service: Partial<ITServiceItem>) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const targetUrl = ['admin', 'super_admin', 'moderator'].includes(user.role)
      ? '/admin/inbox'
      : user.role === 'guardian'
      ? '/guardian/messages'
      : user.role === 'tutor'
      ? '/tutor/messages'
      : '/student/messages';
    navigate(targetUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 pb-24">
      {/* 🌟 Hero Header */}
      <section className="relative pt-12 pb-16 bg-gradient-to-r from-primary via-teal-800 to-ink text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest text-emerald-300 border border-white/10"
          >
            <Zap size={14} />
            <span>Home Tutor BD • IT & Tech Studio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight max-w-4xl mx-auto leading-tight"
          >
            Enterprise-Grade <span className="text-emerald-400">IT & Software</span> Solutions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Our expert engineers and designers build modern websites, mobile apps, and custom ERP solutions for your business, school, or startup.
          </motion.p>
        </div>
      </section>

      {/* 🔍 Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-20">
        <div className="bg-white rounded-[32px] p-4 sm:p-6 shadow-2xl border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by service name, technology (e.g. React, Flutter, Python)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 focus:bg-white border border-slate-200 focus:border-primary/40 rounded-2xl text-xs sm:text-sm font-medium text-ink focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-bold text-slate-500">
              <span>{filteredServices.length} Services Available</span>
              <button
                onClick={() => refetch()}
                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 cursor-pointer transition-all"
                title="Refresh Services"
              >
                <RefreshCw size={15} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-2 border-t border-slate-100">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer",
                  selectedCategory === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-102"
                    : "bg-slate-50 text-slate-600 hover:text-ink hover:bg-slate-100 border border-slate-200/60"
                )}
              >
                <tab.icon size={13} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📦 Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 size={36} className="animate-spin text-primary mx-auto" />
            <p className="text-xs font-bold text-ink-muted">Loading IT Services...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => {
              const detailUrl = `/services/${service.slug || service._id}`;

              return (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white rounded-[32px] border border-slate-200/80 hover:border-primary/40 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={service.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-primary tracking-wider shadow-sm">
                        {CATEGORY_NAMES[service.category] || 'IT Service'}
                      </span>
                      {service.deliveryTime && (
                        <span className="absolute bottom-3 left-3 text-white text-[11px] font-bold">
                          ⏱️ {service.deliveryTime}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1.5">
                        <Link to={detailUrl}>
                          <h3 className="text-lg font-black text-ink group-hover:text-primary transition-colors line-clamp-2">
                            {service.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-medium">
                          {service.shortDescription}
                        </p>
                      </div>

                      {/* Features */}
                      {service.features && service.features.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-black uppercase text-ink-muted">Included Deliverables:</p>
                          {service.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Technologies */}
                      {service.technologies && service.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {service.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0 border-t border-slate-100 mt-auto flex items-center justify-end gap-2">
                    <Link
                      to={detailUrl}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-ink rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleConsultChat(service)}
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
        ) : (
          <div className="bg-white rounded-[32px] p-16 text-center space-y-4 border border-slate-200 shadow-xl max-w-lg mx-auto">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Code size={32} />
            </div>
            <h3 className="text-lg font-black text-ink">No services found</h3>
            <p className="text-xs text-slate-500 font-medium">
              Try adjusting your filters, or contact our support team directly.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

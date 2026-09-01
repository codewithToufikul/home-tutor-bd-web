import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Clock, MessageSquare, 
  Phone, Sparkles, ChevronRight, Zap, Code, Star, Check, 
  ExternalLink, Share2, DollarSign, Calendar, Cpu, Layers, Loader2
} from 'lucide-react';
import { useGetServiceByIdQuery, ITServiceItem } from '@/src/services/itServiceApi';
import { useAuth } from '@/src/context/AuthContext';
import { useStartConversationMutation } from '@/src/services/chatApi';
import { cn } from '@/src/lib/utils';

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

export default function ITServiceDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [startConversationMutation, { isLoading: isStartingChat }] = useStartConversationMutation();

  const { data: serviceData, isLoading, isError } = useGetServiceByIdQuery(id || '', {
    skip: !id,
  });

  const service = serviceData?.data;

  const handleStartChatWithAdmin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const messagesUrl = ['admin', 'super_admin', 'moderator'].includes(user.role)
      ? '/admin/inbox'
      : user.role === 'guardian'
      ? '/guardian/messages'
      : user.role === 'tutor'
      ? '/tutor/messages'
      : '/student/messages';

    navigate(messagesUrl);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <p className="text-xs font-bold text-ink-muted">Loading service details...</p>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="max-w-xl mx-auto my-20 bg-white rounded-[32px] p-12 text-center space-y-4 border border-slate-200 shadow-2xl">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <Code size={32} />
        </div>
        <h2 className="text-xl font-black text-ink">Service Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">
          This service may have been removed or is currently inactive.
        </p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-primary/20"
        >
          <ArrowLeft size={16} />
          <span>Browse All Services</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 pb-24">
      {/* 🌟 Top Breadcrumbs & Header */}
      <section className="pt-8 pb-12 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link to="/services" className="hover:text-primary transition-colors">IT Services</Link>
            <ChevronRight size={14} />
            <span className="text-ink truncate">{service.title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <span className="px-3.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-wider">
                {CATEGORY_NAMES[service.category] || 'IT Service'}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-ink tracking-tight">
                {service.title}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                {service.shortDescription}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleShare}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
              >
                <Share2 size={15} />
                <span>{copied ? 'Link Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📐 Main Content & Sidebar Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Full Details & Specifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Banner Image */}
            {service.thumbnail && (
              <div className="rounded-[36px] overflow-hidden border border-slate-200 shadow-2xl h-80 sm:h-96 relative bg-slate-900">
                <img
                  src={service.thumbnail}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Service Overview & Full Description */}
            <div className="bg-white rounded-[36px] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
              <div className="space-y-1">
                <h3 className="text-xl font-display font-black text-ink">Service Overview & Specifications</h3>
                <p className="text-xs text-slate-500 font-medium">Detailed breakdown of the service and technical information.</p>
              </div>

              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                {service.fullDescription}
              </div>
            </div>

            {/* Included Features & Deliverables */}
            {service.features && service.features.length > 0 && (
              <div className="bg-white rounded-[36px] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-ink">Features & What's Included</h3>
                  <p className="text-xs text-slate-500 font-medium">Everything you get with this service.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50/80 hover:bg-primary/5 rounded-2xl border border-slate-200/60 flex items-start gap-3 transition-all"
                    >
                      <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={14} className="stroke-[3]" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack & Tools */}
            {service.technologies && service.technologies.length > 0 && (
              <div className="bg-white rounded-[36px] p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-ink">Technologies & Frameworks</h3>
                  <p className="text-xs text-slate-500 font-medium">Modern tools and technologies used in this service.</p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {service.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order & Consultation Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[36px] p-6 sm:p-8 border-2 border-primary/20 shadow-2xl space-y-6 sticky top-24">
              
              {/* CTA Header */}
              <div className="space-y-1 pb-6 border-b border-slate-100">
                <h4 className="text-lg font-display font-black text-ink">Get a Free Consultation</h4>
                <p className="text-[11px] text-slate-500 font-medium">Chat with our team to discuss your project requirements and get a custom quote.</p>
              </div>

              {/* Quick Info Specs */}
              <div className="space-y-3 text-xs">
                {service.deliveryTime && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <span className="font-bold text-slate-500 flex items-center gap-2">
                      <Clock size={15} className="text-primary" /> Delivery Time:
                    </span>
                    <span className="font-black text-ink">{service.deliveryTime}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-500 flex items-center gap-2">
                    <ShieldCheck size={15} className="text-emerald-600" /> Support Guarantee:
                  </span>
                  <span className="font-black text-emerald-700">3 Months Free Support</span>
                </div>
              </div>

              {/* 💬 Primary CTA: Direct Chat with Admin */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleStartChatWithAdmin}
                  disabled={isStartingChat}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare size={16} />
                  <span>💬 Chat Directly with Admin</span>
                </button>

                <a
                  href="https://wa.me/8801700000000"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-black text-xs uppercase tracking-wider border border-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={15} className="text-emerald-600" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a
                  href="tel:+8801700000000"
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  <span>Call our Hotline</span>
                </a>
              </div>

              {/* Trust Badge */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <span>100% professional coding standards. Full source code and documentation delivered.</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

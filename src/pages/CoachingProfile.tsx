import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  CheckCircle2 
} from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';

export default function CoachingProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Home Tutor Provider BD Coaching',
    email: user?.email || 'coaching@hometutorproviderbd.com',
    phone: '01700000000',
    district: 'Dhaka',
    location: 'Dhanmondi, Dhaka',
    tradeLicense: 'TRAD/DHAKA/123456/2026',
    about: 'Leading coaching and educational center providing specialized training and qualified tutors.'
  });

  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "block w-full pl-11 pr-4 py-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium";
  const labelClasses = "text-xs font-bold text-ink uppercase tracking-wider ml-1 mb-1 block";

  return (
    <CoachingLayout title="Institute Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold"
          >
            <CheckCircle2 size={18} />
            Profile updated successfully!
          </motion.div>
        )}

        <div className="bg-white rounded-3xl border border-ink/5 shadow-sm p-6 sm:p-10">
          <div className="flex items-center gap-4 border-b border-ink/5 pb-6 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shadow-lg shadow-primary/25">
              <Building2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-ink">{formData.name}</h3>
              <p className="text-xs text-ink-muted">Manage your institute details and verification info.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Institute Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="text"
                    required
                    className={inputClasses}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    className={inputClasses}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="tel"
                    required
                    className={inputClasses}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>District *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="text"
                    required
                    className={inputClasses}
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Detailed Location *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-ink-muted" />
                  </div>
                  <input
                    type="text"
                    required
                    className={inputClasses}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>Trade License (Verified by Admin)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <input
                    type="text"
                    disabled
                    className={cn(inputClasses, "bg-ink/5 cursor-not-allowed")}
                    value={formData.tradeLicense}
                  />
                </div>
                <p className="text-[11px] text-ink-muted mt-1 ml-1 font-medium">Trade license cannot be changed directly. Contact support for updates.</p>
              </div>

              <div className="md:col-span-2">
                <label className={labelClasses}>About Institute</label>
                <textarea
                  rows={4}
                  className="block w-full p-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 py-4 px-8 rounded-2xl bg-primary text-white font-bold text-sm shadow-xl shadow-primary/25 hover:bg-primary-dark transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CoachingLayout>
  );
}
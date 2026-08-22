import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save, 
  CheckCircle2,
  Globe
} from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import { CoachingService } from '@/src/services/coachingService.ts';

export default function CoachingProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    instituteName: user?.name || '',
    email: user?.email || '',
    phone: '',
    district: 'Dhaka',
    location: '',
    tradeLicense: '',
    about: '',
  });

  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const prof = await CoachingService.getProfile();
        if (prof) {
          setFormData({
            instituteName: prof.instituteName || user?.name || '',
            email: prof.email || user?.email || '',
            phone: prof.phone || '',
            district: prof.district || 'Dhaka',
            location: prof.location || '',
            tradeLicense: prof.tradeLicense || '',
            about: prof.about || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      await CoachingService.updateProfile({
        instituteName: formData.instituteName,
        phone: formData.phone,
        district: formData.district,
        location: formData.location,
        tradeLicense: formData.tradeLicense,
        about: formData.about,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
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
            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold shadow-sm"
          >
            <CheckCircle2 size={18} />
            ইনস্টিটিউটের প্রোফাইল সফলভাবে আপডেট করা হয়েছে!
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-ink/5 shadow-sm space-y-8">
          <div className="border-b border-ink/5 pb-6">
            <h3 className="text-xl font-display font-black text-ink">Institute Information</h3>
            <p className="text-xs text-ink-muted mt-1">Update your coaching center credentials, license, and public details.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institute Name */}
            <div className="md:col-span-2">
              <label className={labelClasses}>Institute Name *</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input 
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="e.g. Excellence Academic Coaching"
                  value={formData.instituteName}
                  onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div>
              <label className={labelClasses}>Official Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input 
                  type="email"
                  disabled
                  className={cn(inputClasses, "bg-gray-100 cursor-not-allowed")}
                  value={formData.email}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className={labelClasses}>Contact Phone *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input 
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Trade License */}
            <div>
              <label className={labelClasses}>Trade License Number *</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600" size={18} />
                <input 
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="TRAD/DHAKA/XXXXXX/2026"
                  value={formData.tradeLicense}
                  onChange={(e) => setFormData({ ...formData, tradeLicense: e.target.value })}
                />
              </div>
            </div>

            {/* District */}
            <div>
              <label className={labelClasses}>District *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" size={18} />
                <input 
                  type="text"
                  required
                  className={inputClasses}
                  placeholder="Dhaka / Chattogram"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                />
              </div>
            </div>

            {/* Full Address */}
            <div className="md:col-span-2">
              <label className={labelClasses}>Full Address / Location *</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-ink-muted" size={18} />
                <textarea 
                  required
                  rows={2}
                  className="block w-full pl-11 pr-4 py-3.5 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                  placeholder="e.g. House 42, Road 7, Dhanmondi, Dhaka"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            {/* About */}
            <div className="md:col-span-2">
              <label className={labelClasses}>About Coaching Center</label>
              <textarea 
                rows={4}
                className="block w-full p-4 bg-background border border-ink/5 rounded-2xl text-ink placeholder:text-ink-muted/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                placeholder="Write a brief overview of your academic coaching center and faculty..."
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-ink/5 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </CoachingLayout>
  );
}

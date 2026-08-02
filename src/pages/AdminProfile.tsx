import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Settings, Shield, Bell, Camera, 
  Mail, Phone, MapPin, Lock, Eye, 
  EyeOff, CheckCircle2, Save, LogOut,
  Smartphone, Globe, ShieldCheck
} from 'lucide-react';
import AdminLayout from '@/src/components/AdminLayout.tsx';
import { cn } from '@/src/lib/utils';

type TabType = 'general' | 'security' | 'notifications';

export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  const inputClasses = "w-full bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl py-3.5 px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm placeholder:text-ink-muted/40";
  const labelClasses = "block text-[11px] font-black text-ink-muted uppercase mb-2 ml-1 tracking-wider";

  const tabs = [
    { id: 'general', label: 'General Info', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        {/* Profile Header Card */}
        <div className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white/40 shadow-2xl shadow-ink/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] border-4 border-white p-1 shadow-2xl shadow-ink/10 overflow-hidden">
                <img 
                  src="https://i.pravatar.cc/300?img=12" 
                  alt="Admin" 
                  className="w-full h-full object-cover rounded-[34px]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button className="absolute bottom-2 right-2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                <Camera size={18} />
              </button>
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h2 className="text-3xl font-display font-black text-ink tracking-tight">Sen Watson</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-lg border border-primary/10">
                  Super Admin
                </span>
              </div>
              <p className="text-sm font-medium text-ink-muted flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} className="text-primary" /> sen.watson@hometutor.com
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-ink-muted uppercase">Member Since</p>
                  <p className="text-xs font-bold text-ink">April 2024</p>
                </div>
                <div className="w-px h-8 bg-ink/5" />
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-ink-muted uppercase">Last Login</p>
                  <p className="text-xs font-bold text-ink">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-center md:justify-start gap-2 p-2 bg-white/40 backdrop-blur-xl border border-white/40 rounded-[24px] shadow-lg shadow-ink/5 w-fit mx-auto md:mx-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all relative overflow-hidden",
                activeTab === tab.id ? "text-white" : "text-ink-muted hover:text-primary hover:bg-white/50"
              )}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl p-8 md:p-12 rounded-[48px] border border-white/40 shadow-2xl shadow-ink/5">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={labelClasses}>Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                          <User size={18} />
                        </div>
                        <input type="text" defaultValue="Sen Watson" className={cn(inputClasses, "pl-14")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                          <Mail size={18} />
                        </div>
                        <input type="email" defaultValue="sen.watson@hometutor.com" className={cn(inputClasses, "pl-14")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                          <Phone size={18} />
                        </div>
                        <input type="text" defaultValue="+880 1712 345678" className={cn(inputClasses, "pl-14")} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                          <MapPin size={18} />
                        </div>
                        <input type="text" defaultValue="Dhaka, Bangladesh" className={cn(inputClasses, "pl-14")} />
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className={labelClasses}>Bio / Description</label>
                      <textarea 
                        defaultValue="Senior Administrator at Home Tutor Provider BD. Managing platform operations and tutor relations since 2024."
                        className={cn(inputClasses, "min-h-[120px] py-4 resize-none")}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2 space-y-2">
                      <label className={labelClasses}>Current Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-ink-muted/50">
                          <Lock size={18} />
                        </div>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className={cn(inputClasses, "pl-14 pr-14")} 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-5 flex items-center text-ink-muted/50 hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>New Password</label>
                      <input type="password" placeholder="New password" className={inputClasses} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClasses}>Confirm New Password</label>
                      <input type="password" placeholder="Confirm new password" className={inputClasses} />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-ink/5 space-y-6">
                    <div className="flex items-center justify-between p-6 bg-primary/5 rounded-[24px] border border-primary/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-ink">Two-Factor Authentication</h4>
                          <p className="text-xs font-medium text-ink-muted">Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-ink/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-ink-muted uppercase tracking-widest ml-1">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { label: "New User Registration", desc: "Get notified when a new tutor or guardian signs up." },
                        { label: "Payment Success", desc: "Receive alerts for successful tuition fee payments." },
                        { label: "System Updates", desc: "Important news about platform maintenance and features." }
                      ].map((item, i) => (
                        <label key={i} className="flex items-center justify-between p-5 bg-white/60 rounded-2xl border border-white/40 cursor-pointer hover:bg-white transition-all group">
                          <div className="space-y-0.5">
                            <p className="text-sm font-black text-ink group-hover:text-primary transition-colors">{item.label}</p>
                            <p className="text-xs font-medium text-ink-muted">{item.desc}</p>
                          </div>
                          <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-ink/10 text-primary focus:ring-primary/20" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-ink/5 mt-10">
                <button 
                  type="button"
                  className="text-rose-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-rose-600 transition-all"
                >
                  <LogOut size={14} /> Deactivate Account
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl",
                    isSuccess 
                      ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                      : "bg-primary text-white shadow-primary/30 hover:bg-primary-dark"
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSuccess ? (
                    <><CheckCircle2 size={18} /> Saved Successfully</>
                  ) : (
                    <><Save size={18} /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>

        {/* Security Tip */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 flex items-start gap-5">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/5 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-emerald-600 uppercase tracking-wider">Security Recommendation</h4>
            <p className="text-xs font-medium text-emerald-600/80 leading-relaxed">
              We recommend changing your password every 90 days to keep your administrator account secure. Your last password change was 45 days ago.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

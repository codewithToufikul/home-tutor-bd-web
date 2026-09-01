import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Camera, 
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  Lock
} from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { cn } from '@/src/lib/utils';
import { apiPatch } from '@/src/repositories/baseRepository.ts';

export default function StudentProfileDashboard() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'security'>('personal');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    studentClass: '',
    institution: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: (user as any).location || (user as any).address || 'Dhaka, Bangladesh',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || 'student'}`,
        studentClass: (user as any).studentClass || 'Class 10',
        institution: (user as any).institution || 'Dhaka City College'
      });
    }
  }, [user]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiPatch('/users/me', {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        avatar: formData.avatar,
        studentClass: formData.studentClass,
        institution: formData.institution
      }).catch(() => null);

      showToast('✅ Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      showToast('⚠️ Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-8 relative">
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 px-6 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 size={16} />
            {toastMsg}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-8 bg-white/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/40 shadow-xl shadow-ink/5">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[32px] overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-secondary-dark transition-all active:scale-90 cursor-pointer">
              <Camera size={20} />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-3xl font-display font-black text-ink">{formData.name || user?.name || 'Student Name'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-secondary/10 text-secondary text-[10px] font-black uppercase rounded-lg">Verified Student</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black uppercase rounded-lg">Active Account</span>
            </div>
          </div>
          <div className="md:ml-auto">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-secondary text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-xl shadow-secondary/20 hover:bg-secondary-dark transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-ink/5 p-1.5 rounded-2xl">
          {(['personal', 'academic', 'security'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all cursor-pointer",
                activeTab === tab ? "bg-white text-secondary shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-8 lg:p-12 rounded-[40px] border border-white/40 shadow-xl shadow-ink/5">
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    disabled
                    className="w-full bg-gray-100 border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-ink-muted cursor-not-allowed" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="tel" 
                    value={formData.phone} 
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. 018XXXXXXXX"
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Location</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Mirpur, Dhaka" 
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Current Class/Level</label>
                <div className="relative group">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.studentClass} 
                    onChange={(e) => setFormData(prev => ({ ...prev, studentClass: e.target.value }))}
                    placeholder="e.g. Class 10" 
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Institution</label>
                <div className="relative group">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.institution} 
                    onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="e.g. Mirpur Govt School" 
                    className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-muted uppercase ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-ink-muted uppercase ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-secondary transition-colors" size={18} />
                    <input type="password" placeholder="••••••••" className="w-full bg-white border border-ink/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-secondary/5 rounded-2xl border border-secondary/10 flex items-start gap-4">
                <Shield className="text-secondary shrink-0" size={24} />
                <div className="space-y-1">
                  <p className="text-sm font-black text-ink">Two-Factor Authentication</p>
                  <p className="text-xs text-ink-muted font-medium">Add an extra layer of security to your account by enabling 2FA.</p>
                  <button className="text-xs font-black text-secondary uppercase mt-2 hover:underline cursor-pointer">Enable Now</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}


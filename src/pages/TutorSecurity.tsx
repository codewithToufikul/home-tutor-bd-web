import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Shield, KeyRound, CheckCircle2 } from 'lucide-react';
import TutorLayout from '@/src/components/TutorLayout.tsx';

export default function TutorSecurity() {
  const [successMsg, setSuccessMsg] = useState(false);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <TutorLayout>
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">Account Security</h1>
          <p className="text-xs text-ink-muted">Manage your account password and security settings.</p>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-8 rounded-3xl border border-ink/10 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-ink/5 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#001F3F]">Change Password</h3>
              <p className="text-[11px] text-ink-muted">Ensure your account is using a strong password.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Current Password*</label>
              <input 
                type="password" 
                required 
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">New Password*</label>
              <input 
                type="password" 
                required 
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Confirm New Password*</label>
              <input 
                type="password" 
                required 
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              {successMsg ? <><CheckCircle2 size={16} /> Password Updated</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </TutorLayout>
  );
}
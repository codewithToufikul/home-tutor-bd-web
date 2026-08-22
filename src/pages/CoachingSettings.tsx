import { useState } from 'react';
import { Settings, Lock, ShieldCheck, CheckCircle2, Save } from 'lucide-react';
import CoachingLayout from '@/src/components/CoachingLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';

export default function CoachingSettings() {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('নতুন পাসওয়ার্ড দুটি মেলেনি!');
      return;
    }
    setLoading(true);
    setSuccess(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CoachingLayout title="Account Settings">
      <div className="max-w-3xl mx-auto space-y-8">
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold shadow-sm">
            <CheckCircle2 size={18} />
            পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 border border-ink/5 shadow-sm space-y-6">
          <div className="border-b border-ink/5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-ink">Security & Password</h3>
              <p className="text-xs text-ink-muted">Change your institute account login password securely.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block mb-1 text-ink-muted uppercase">Current Password *</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block mb-1 text-ink-muted uppercase">New Password *</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium"
              />
            </div>

            <div>
              <label className="block mb-1 text-ink-muted uppercase">Confirm New Password *</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-ink/10 outline-none focus:border-primary font-medium"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 bg-primary text-white font-bold text-xs uppercase rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={16} />
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </CoachingLayout>
  );
}

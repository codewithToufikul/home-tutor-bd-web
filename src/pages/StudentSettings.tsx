import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';
import { useAuth } from '@/src/context/AuthContext.tsx';
import { apiPatch } from '@/src/repositories/baseRepository.ts';

export default function StudentSettings() {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPatch('/users/me', { name, phone, address }).catch(() => null);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      alert('সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-2xl space-y-8 pb-12">
        <div>
          <h1 className="text-2xl font-black text-[#001F3F]">Account Settings</h1>
          <p className="text-xs text-ink-muted">Update your contact information and location details.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-ink/10 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Guardian / Student Name*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Phone Number*</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Detailed Address*</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 min-h-[80px]"
              />
            </div>
          </div>

          <button type="submit" className="w-full py-4 rounded-2xl bg-secondary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-secondary/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
            {isSaved ? <><CheckCircle2 size={16} /> Changes Saved</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </StudentLayout>
  );
}
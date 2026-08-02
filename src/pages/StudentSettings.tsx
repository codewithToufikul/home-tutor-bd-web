import { useState } from 'react';
import { User, Lock, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import StudentLayout from '@/src/components/StudentLayout.tsx';

export default function StudentSettings() {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
              <input type="text" defaultValue="Mrs. Rahima" required className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Phone Number*</label>
              <input type="text" defaultValue="8801700000000" required className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#001F3F] uppercase mb-2">Detailed Address*</label>
              <textarea defaultValue="House 12, Road 5, Dhanmondi, Dhaka" required className="w-full bg-gray-50 border border-ink/10 rounded-2xl p-3.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 min-h-[80px]" />
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